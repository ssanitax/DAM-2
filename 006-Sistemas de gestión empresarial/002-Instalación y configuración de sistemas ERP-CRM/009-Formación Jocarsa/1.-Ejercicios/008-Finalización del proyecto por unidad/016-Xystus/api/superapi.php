<?php
header('Content-Type: application/json; charset=utf-8');

$db = new SQLite3('../data/xystus.db');
$db->enableExceptions(true);

function tablasPermitidas($db){
  $resultado = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  $tablas = [];
  while($fila = $resultado->fetchArray(SQLITE3_ASSOC)){
    $tablas[] = $fila['name'];
  }
  return $tablas;
}

function validarTabla($db, $tabla){
  if(!in_array($tabla, tablasPermitidas($db), true)){
    throw new Exception('Tabla no válida');
  }
  return '"'.str_replace('"','""',$tabla).'"';
}

try{
  $ruta = $_GET['ruta'] ?? '';
  switch($ruta){
    case 'modulos':
      echo json_encode(['actividad','socios','personal','almacen'], JSON_UNESCAPED_UNICODE);
      break;

    case 'entidades':
      echo json_encode(tablasPermitidas($db), JSON_UNESCAPED_UNICODE);
      break;

    case 'tabla':
      // La tabla llega por parámetro
      $tabla = $_GET['tabla'] ?? 'usuarios';
      $segura = validarTabla($db, $tabla);
      $result = $db->query("SELECT * FROM $segura");
      $registros = [];
      while($fila = $result->fetchArray(SQLITE3_ASSOC)){
        $registros[] = $fila;
      }
      echo json_encode([
        'tabla' => $tabla,
        'total' => count($registros),
        'registros' => $registros
      ], JSON_UNESCAPED_UNICODE);
      break;

    default:
      throw new Exception('Ruta no válida');
  }
}catch(Throwable $e){
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}

$db->close();
?>
