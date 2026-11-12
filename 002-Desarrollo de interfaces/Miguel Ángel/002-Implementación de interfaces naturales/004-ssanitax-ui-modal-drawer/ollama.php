<?php
/**
 * ssanitax · puente navegador ↔ Ollama + rimas guarras + acciones de UI.
 *
 * Entrada JSON:
 * {
 *   "mensaje": "...",
 *   "historial": [{ "role", "content" }],
 *   "contexto": { mapa completo de la app },
 *   "usadas": ["rimas ya dichas"]
 * }
 *
 * Salida JSON:
 * { "respuesta": "...", "acciones": [{ "tipo", "valor" }], "modelo": "..." }
 */

header("Content-Type: application/json; charset=utf-8");

$modelo = "phi4-mini";

$entrada = json_decode(file_get_contents("php://input"), true);
if (!is_array($entrada)) {
    http_response_code(400);
    echo json_encode(["respuesta" => "La petición no es JSON válido.", "acciones" => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$mensaje = trim((string) ($entrada["mensaje"] ?? ""));
if ($mensaje === "") {
    http_response_code(400);
    echo json_encode(["respuesta" => "El mensaje está vacío.", "acciones" => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$recortar = static function (string $texto, int $maximo): string {
    if (function_exists("mb_substr")) {
        return mb_substr($texto, 0, $maximo);
    }
    return substr($texto, 0, $maximo);
};

$normalizar = static function (string $texto): string {
    $texto = mb_strtolower($texto, "UTF-8");
    $texto = strtr($texto, [
        "á" => "a", "é" => "e", "í" => "i", "ó" => "o", "ú" => "u", "ü" => "u", "ñ" => "n"
    ]);
    $texto = preg_replace("/[^\p{L}\p{N}\s]/u", " ", $texto) ?? $texto;
    return trim(preg_replace("/\s+/", " ", $texto) ?? $texto);
};

$elegir = static function (array $opciones, array $usadas): string {
    $libres = array_values(array_filter($opciones, static function ($frase) use ($usadas) {
        $f = mb_strtolower($frase, "UTF-8");
        foreach ($usadas as $u) {
            if ($f === mb_strtolower((string) $u, "UTF-8")) {
                return false;
            }
        }
        return true;
    }));
    if (!$libres) {
        $libres = $opciones;
    }
    return $libres[random_int(0, count($libres) - 1)];
};

$usadas = [];
foreach (is_array($entrada["usadas"] ?? null) ? $entrada["usadas"] : [] as $u) {
    $u = trim((string) $u);
    if ($u !== "") {
        $usadas[] = $u;
    }
}
foreach (array_slice(is_array($entrada["historial"] ?? null) ? $entrada["historial"] : [], -12) as $turno) {
    if (($turno["role"] ?? "") === "assistant" && !empty($turno["content"])) {
        $usadas[] = trim((string) $turno["content"]);
    }
}
$usadas = array_values(array_unique($usadas));

$ctx = is_array($entrada["contexto"] ?? null) ? $entrada["contexto"] : [];
$modulos = is_array($ctx["modulos"] ?? null) ? $ctx["modulos"] : ["Clientes", "Productos", "Pedidos", "Configuración"];
$vistas = is_array($ctx["vistas"] ?? null) ? $ctx["vistas"] : ["Listado", "Gráficos", "Formulario", "Controles", "Eventos", "Toast", "Modal y panel", "Login", "Identidad"];
$moduloActual = (string) ($ctx["modulo"] ?? "Clientes");
$vistaActual = (string) ($ctx["vista"] ?? "Listado");
$totalClientes = (int) ($ctx["totalClientes"] ?? 0);
$nombres = is_array($ctx["nombres"] ?? null) ? $ctx["nombres"] : [];
$tema = (string) ($ctx["tema"] ?? "dia");
$accionesDisponibles = is_array($ctx["acciones"] ?? null) ? $ctx["acciones"] : [];

/**
 * Detecta acciones de UI en lenguaje natural (además del modelo).
 */
$detectarAcciones = static function (string $mensaje) use ($normalizar, $vistas, $modulos): array {
    $n = $normalizar($mensaje);
    $acciones = [];

    if (preg_match("/\b(modo noche|modo oscuro)\b/", $n)) {
        $acciones[] = ["tipo" => "tema", "valor" => "noche"];
    } elseif (preg_match("/\b(modo dia|modo claro)\b/", $n)) {
        $acciones[] = ["tipo" => "tema", "valor" => "dia"];
    } elseif (preg_match("/\b(cambia(r)? tema|alterna(r)? tema)\b/", $n)) {
        $acciones[] = ["tipo" => "tema", "valor" => "alternar"];
    }

    if (preg_match("/\b(nuevo cliente|crear cliente|anadir cliente|alta de cliente)\b/", $n)
        || preg_match("/^(nuevo|crear|anadir)$/", $n)) {
        $acciones[] = ["tipo" => "nuevo", "valor" => "1"];
    }

    if (preg_match("/\b(cerrar|cierra)\b.*\b(panel|modal|ventana|drawer)\b/", $n)
        || preg_match("/^(cerrar|cierra)$/", $n)) {
        $acciones[] = ["tipo" => "cerrar", "valor" => "1"];
    }

    if (preg_match("/\b(limpia(r)?|quita(r)?|borra(r)?)\b.*\b(busqueda|filtro)\b/", $n)) {
        $acciones[] = ["tipo" => "buscar", "valor" => ""];
    }

    if (preg_match("/\b(?:buscar|busca|filtra|filtrar)(?:\s+por|\s+a)?\s+(.+)$/u", $n, $m)) {
        $acciones[] = ["tipo" => "buscar", "valor" => trim($m[1])];
    }

    $mapaVistas = [
        "listado" => "Listado", "tabla" => "Listado",
        "graficos" => "Gráficos", "grafico" => "Gráficos", "dashboard" => "Gráficos", "tablero" => "Gráficos",
        "formulario" => "Formulario",
        "controles" => "Controles",
        "eventos" => "Eventos",
        "toast" => "Toast", "avisos" => "Toast", "notificaciones" => "Toast",
        "modal y panel" => "Modal y panel", "modal" => "Modal y panel", "panel" => "Modal y panel",
        "login" => "Login", "acceso" => "Login",
        "identidad" => "Identidad", "marca" => "Identidad",
    ];
    foreach ($mapaVistas as $clave => $vista) {
        if (preg_match("/\b(?:abre|abrir|muestra|mostrar|ver|ve a|ir a|cambia a|pon|quiero|necesito)\b.*\b" . preg_quote($clave, "/") . "\b/", $n)
            || preg_match("/\b" . preg_quote($clave, "/") . "\b/", $n) && preg_match("/\b(abre|abrir|muestra|mostrar|ver|pon|ir|vamos)\b/", $n)) {
            if (in_array($vista, $vistas, true) || true) {
                $acciones[] = ["tipo" => "vista", "valor" => $vista];
                break;
            }
        }
    }

    foreach ($modulos as $mod) {
        $clave = $normalizar($mod);
        if ($clave !== "" && preg_match("/\b(?:ir a|abre|abrir|muestra|modulo|seccion)\b.*\b" . preg_quote($clave, "/") . "\b/", $n)) {
            $acciones[] = ["tipo" => "modulo", "valor" => $mod];
            break;
        }
    }

    // dedupe por tipo
    $vistos = [];
    $limpios = [];
    foreach ($acciones as $a) {
        $k = $a["tipo"] . ":" . $a["valor"];
        if (isset($vistos[$k])) {
            continue;
        }
        $vistos[$k] = true;
        $limpios[] = $a;
    }
    return $limpios;
};

$bancoRimas = [
    "hola" => [
        "para ti mi cola", "hola y a follar se ha dicho", "hola, enseña el culo y saluda",
        "hola caracola, saca la polla", "buenas, que se te ve el rabo", "ole tu culo, hola",
        "hola y sin calzoncillos, ideal", "saludo aceptado: bajate eso",
    ],
    "buenas" => [
        "buenas y a abrir las piernas", "buenas, saca la polla ya", "buenas putadas te deseo",
        "buenas, malas intenciones", "buenas y peores folladas",
    ],
    "buenos dias" => [
        "buenos dias y peores folladas", "dias de mierda, noches de culo",
        "cafe, polla y a currar", "dias largos, pollas duras",
    ],
    "buenas tardes" => [
        "tardes de oficina, noches de polla", "buenas tardes, malas putadas",
        "tarde libre: culo libre",
    ],
    "buenas noches" => [
        "noches largas y tetas fuera", "buenas noches, sueña con mi polla",
        "a dormir... o a follar, tu eliges",
    ],
    "que tal" => [
        "de puta madre, y tu coño fatal", "tal cual: polla dura y sin drama",
        "erecto y sin quejas, ¿y tu?", "mejor que tu moral, fijo",
    ],
    "que pasa" => [
        "que te la meto si me das paso", "pasa de puntillas... o de rodillas",
        "pasa el rabo y hablamos",
    ],
    "adios" => [
        "adios y que te den por el culo", "adios, cierra las piernas al salir",
        "hasta el culo, literal", "vete, pero deja el culo a mano",
    ],
    "gracias" => [
        "de nada, ahora chupamela", "gracias tu, abre la boca",
        "gracias se pagan de rodillas", "de nada, polla incluida",
    ],
    "ayuda" => [
        "te ayudo, pero de rodillas", "ayuda sexual incluida, dime",
        "te guio al culo del panel", "primero el favor, luego el favorcito",
    ],
];

$bancoBorde = [
    "y tu me la soplas un rato",
    "abre la boca y traga, campeon",
    "borde yo, puta tu: empatamos",
    "te callo a hostias... o a pollazos",
    "insultame mas, que me pone",
    "sigue asi y te la meto callado",
    "que tierno, te enfadas con la polla fuera",
    "llora menos y chupa mas",
    "tu enfado me pone cachondo",
    "dale mas caña, que se pone dura",
    "me insultas y me crece, raro",
    "eres borde: justo mi fetiche",
    "calla y abre, en ese orden",
    "tu boca sirve mejor para otra cosa",
    "te vacilo porque te gusta, confiesa",
    "menos drama y mas saliva",
    "te has picado: victoria por culo",
    "sigue, que esto es mejor que el cafe",
];

$bancoGenerico = [
    "rimame esa y te la chupo",
    "bonito lo tuyo, enséñame el culo",
    "habla menos y follemos mas",
    "esa frase me la paso por la polla",
    "vale, pero de rodillas suena mejor",
    "interesante... como tu culo en theory",
    "ok, pero sin calzoncillos queda serio",
    "te escucho: ahora bajate eso",
    "punto para ti, polla para mi",
    "esa boca merece castigo rico",
    "me tienes: de rodillas y al grano",
    "si sigues asi te la embucho",
    "cuento nuevo, culo viejo: dame",
    "te creo, ahora enseña pruebas",
    "hablas bonito para lo que escondes",
    "menos texto, mas lenguita",
    "esa actitud pide pollazo tecnico",
    "te leo y se me pone el firmware",
];

$n = $normalizar($mensaje);
$acciones = $detectarAcciones($mensaje);
$esPanel = $acciones !== []
    || (bool) preg_match("/\b(cliente|clientes|grafico|graficos|formulario|tabla|listado|buscar|panel|drawer|modal|toast|modulo|login|identidad|controles|eventos|tema|noche|dia)\b/", $n);

// Si ya sabemos qué abrir/buscar: actuar ya, sin esperar a phi4-mini
if ($acciones) {
    $frases = [
        "hecho. " . $elegir($bancoGenerico, $usadas),
        "va que chuta. " . $elegir($bancoGenerico, $usadas),
        "abierto. " . $elegir($bancoBorde, $usadas),
        "servido. " . $elegir($bancoGenerico, $usadas),
    ];
    // Confirmaciones un poco más concretas
    foreach ($acciones as $a) {
        if ($a["tipo"] === "vista") {
            $frases[] = "abro {$a["valor"]}. " . $elegir($bancoGenerico, $usadas);
        } elseif ($a["tipo"] === "buscar") {
            $q = $a["valor"] === "" ? "sin filtro" : $a["valor"];
            $frases[] = "busco «{$q}». " . $elegir($bancoGenerico, $usadas);
        } elseif ($a["tipo"] === "nuevo") {
            $frases[] = "nuevo cliente al canto. " . $elegir($bancoGenerico, $usadas);
        } elseif ($a["tipo"] === "tema") {
            $frases[] = "cambio el tema. " . $elegir($bancoGenerico, $usadas);
        }
    }
    echo json_encode([
        "respuesta" => $elegir($frases, $usadas),
        "acciones" => $acciones,
        "modelo" => "panel"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Charla / vacile local con anti-repetición
if (!$esPanel) {
    $respuesta = null;

    if (isset($bancoRimas[$n])) {
        $respuesta = $elegir($bancoRimas[$n], $usadas);
    } elseif (preg_match("/\b(idiota|imbecil|tonto|gilipollas|cabron|hijo de puta|mierda|asco|grima|callate|calla|borde|estupido|vete|fuck|jode|basura|inutil|capullo|retrasado)\b/", $n)
        || preg_match("/\b(no me hables|no digas|deja de|para ya|basta|que asco|das grima)\b/", $n)) {
        $respuesta = $elegir($bancoBorde, $usadas);
    } else {
        $palabras = preg_split("/\s+/", $n) ?: [];
        if (count($palabras) <= 6) {
            $respuesta = $elegir($bancoGenerico, $usadas);
        }
    }

    if ($respuesta !== null) {
        echo json_encode([
            "respuesta" => $respuesta,
            "acciones" => [],
            "modelo" => "rimas"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Manual de la app para el modelo
$manual = "Eres el asistente de ssanitax, un panel de gestion. Hablas español, seco y guarro con gracia: "
    . "si vacilas, una rima corta; si ayudas, 1-2 frases utiles y puedes cerrar con pullita. "
    . "NUNCA digas que eres una IA ni te disculpes si te insultan: vacila mas.\n\n"
    . "ESTADO ACTUAL:\n"
    . "- Modulo: {$moduloActual}\n"
    . "- Vista: {$vistaActual}\n"
    . "- Tema: {$tema}\n"
    . "- Clientes cargados: {$totalClientes}\n"
    . "- Nombres de ejemplo: " . implode(", ", array_slice($nombres, 0, 8)) . "\n\n"
    . "MODULOS: " . implode(", ", $modulos) . "\n"
    . "VISTAS: " . implode(", ", $vistas) . "\n\n"
    . "Puedes pedir acciones de interfaz. Al FINAL de tu respuesta escribe UNA linea exacta:\n"
    . "ACCIONES: tipo=valor; tipo=valor\n"
    . "Tipos validos: vista, modulo, buscar, nuevo, tema, cerrar.\n"
    . "Ejemplos:\n"
    . "ACCIONES: vista=Graficos\n"
    . "ACCIONES: buscar=Laura\n"
    . "ACCIONES: nuevo=1\n"
    . "ACCIONES: tema=noche\n"
    . "ACCIONES: modulo=Clientes\n"
    . "ACCIONES: cerrar=1\n"
    . "Si no hay que tocar la UI: ACCIONES: ninguna\n"
    . "No inventes datos de clientes que no esten en el contexto.";

if ($accionesDisponibles) {
    $manual .= "\nAcciones conocidas por el front: " . $recortar(json_encode($accionesDisponibles, JSON_UNESCAPED_UNICODE), 800);
}

if ($usadas) {
    $manual .= "\nNO repitas estas frases tuyas recientes: " . $recortar(implode(" | ", array_slice($usadas, -8)), 500);
}

$historial = [];
foreach (array_slice(is_array($entrada["historial"] ?? null) ? $entrada["historial"] : [], -8) as $turno) {
    if (!is_array($turno)) {
        continue;
    }
    $rol = $turno["role"] ?? "";
    $contenido = trim((string) ($turno["content"] ?? ""));
    if (($rol === "user" || $rol === "assistant") && $contenido !== "") {
        $historial[] = ["role" => $rol, "content" => $recortar($contenido, 1500)];
    }
}

$ejemplos = [
    ["role" => "user", "content" => "abre los graficos"],
    ["role" => "assistant", "content" => "Abro Graficos. y enseña el culo mientras cargo.\nACCIONES: vista=Graficos"],
    ["role" => "user", "content" => "busca a Laura"],
    ["role" => "assistant", "content" => "Filtro Laura en el listado. si no aparece, culpa a tu polla.\nACCIONES: buscar=Laura"],
    ["role" => "user", "content" => "eres un idiota"],
    ["role" => "assistant", "content" => "y tu me la soplas un rato\nACCIONES: ninguna"],
];

$mensajes = array_merge(
    [["role" => "system", "content" => $manual]],
    $ejemplos,
    $historial,
    [["role" => "user", "content" => $recortar($mensaje, 4000)]]
);

$datos = [
    "model" => $modelo,
    "messages" => $mensajes,
    "stream" => false,
    "keep_alive" => "10m",
    "options" => [
        "temperature" => 0.8,
        "num_predict" => 220,
        "num_ctx" => 4096
    ]
];

$ch = curl_init("http://127.0.0.1:11434/api/chat");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode($datos, JSON_UNESCAPED_UNICODE),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 120
]);

$respuesta = curl_exec($ch);
$error = curl_error($ch);
$codigo = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($respuesta === false) {
    $texto = $acciones
        ? ("Hecho. " . $elegir($bancoGenerico, $usadas))
        : $elegir($bancoGenerico, $usadas);
    echo json_encode(["respuesta" => $texto, "acciones" => $acciones, "modelo" => "offline"], JSON_UNESCAPED_UNICODE);
    exit;
}

$resultado = json_decode($respuesta, true);
$texto = trim((string) ($resultado["message"]["content"] ?? $resultado["response"] ?? ""));

if ($texto === "" || ($codigo >= 400 && isset($resultado["error"]))) {
    $texto = $acciones
        ? ("Hecho. " . $elegir($bancoGenerico, $usadas))
        : $elegir($bancoBorde, $usadas);
    echo json_encode(["respuesta" => $texto, "acciones" => $acciones, "modelo" => "fallback"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Extraer ACCIONES: ...
$accionesModelo = [];
if (preg_match("/ACCIONES\s*:\s*(.+)$/mi", $texto, $mAcc)) {
    $linea = trim($mAcc[1]);
    $texto = trim(preg_replace("/ACCIONES\s*:.+$/mi", "", $texto));
    if (!preg_match("/^ninguna$/i", $linea)) {
        foreach (preg_split("/\s*;\s*/", $linea) as $par) {
            if (!str_contains($par, "=")) {
                continue;
            }
            [$tipo, $valor] = array_map("trim", explode("=", $par, 2));
            $tipo = $normalizar($tipo);
            // Normalizar nombres de vista
            $mapa = [
                "graficos" => "Gráficos", "grafico" => "Gráficos",
                "listado" => "Listado", "formulario" => "Formulario",
                "controles" => "Controles", "eventos" => "Eventos",
                "toast" => "Toast", "login" => "Login", "identidad" => "Identidad",
                "modal" => "Modal y panel", "modal y panel" => "Modal y panel",
            ];
            if ($tipo === "vista") {
                $clave = $normalizar($valor);
                $valor = $mapa[$clave] ?? $valor;
            }
            if (in_array($tipo, ["vista", "modulo", "buscar", "nuevo", "tema", "cerrar"], true)) {
                $accionesModelo[] = ["tipo" => $tipo, "valor" => $valor];
            }
        }
    }
}

if ($accionesModelo) {
    $acciones = $accionesModelo;
}

$texto = trim($texto);
if ($texto === "") {
    $texto = $acciones ? "Hecho." : $elegir($bancoGenerico, $usadas);
}

// Si se puso educado en vacile, empujar pullita
if (!$acciones && !preg_match("/\b(culo|cola|polla|coño|foll|chup|rodill|tetas|puta|mierda|rabo)\b/iu", $texto)) {
    $texto = rtrim($texto, ".!") . ". " . $elegir($bancoGenerico, $usadas);
}

echo json_encode([
    "respuesta" => $texto,
    "acciones" => $acciones,
    "modelo" => $modelo
], JSON_UNESCAPED_UNICODE);
