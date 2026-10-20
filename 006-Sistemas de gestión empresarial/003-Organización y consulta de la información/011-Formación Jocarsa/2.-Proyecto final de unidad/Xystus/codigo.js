let tablaActual = "";
let clavePrimaria = "";
let columnasActuales = [];
let registrosActuales = [];

const opcionesCampo = {
  estado: ["Confirmada","Pendiente","Cancelada"],
  abono: ["Mensual","Anual","Trimestral","Bono 10"],
  deporte: ["Pádel","Tenis","Natación","Fútbol sala","Baloncesto"],
  especialidad: ["Pádel","Tenis","Natación","Fútbol sala","Baloncesto","Material deportivo","Mantenimiento pistas"],
  tipo: ["Material","Consumible"],
  cubierta: [["1","Sí"],["0","No"]]
};

fetch("data/config.php")
.then(r => r.json())
.then(datos => {
  document.title = datos.nombre;
  document.querySelector("h1").textContent = datos.nombre;
  let eslogan = document.querySelector("#eslogan");
  if (eslogan) eslogan.textContent = datos.eslogan || "";
  document.documentElement.style.setProperty("--color_corporativo", datos.color);
  if (datos.color_acento) document.documentElement.style.setProperty("--color_acento", datos.color_acento);
  if (datos.margen) document.documentElement.style.setProperty("--margen_interior", datos.margen);
});

fetch("api/superapi.php?ruta=modulos")
.then(r => r.json())
.then(datos => {
  const menu = document.querySelector("#modulos");
  datos.forEach(dato => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = dato;
    menu.appendChild(a);
  });
});

fetch("api/superapi.php?ruta=entidades")
.then(r => r.json())
.then(datos => {
  const menu = document.querySelector("#entidades");
  const enlaceDashboard = document.createElement("a");
  enlaceDashboard.href = "#";
  enlaceDashboard.textContent = "Dashboard";
  enlaceDashboard.classList.add("activo");
  enlaceDashboard.onclick = evento => {
    evento.preventDefault();
    document.querySelectorAll("#entidades a").forEach(x => x.classList.remove("activo"));
    enlaceDashboard.classList.add("activo");
    new XystusDashboard().render();
  };
  menu.appendChild(enlaceDashboard);

  datos.forEach(tabla => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = tabla;
    a.onclick = evento => {
      evento.preventDefault();
      document.querySelectorAll("#entidades a").forEach(x => x.classList.remove("activo"));
      a.classList.add("activo");
      cargarEntidad(tabla);
    };
    menu.appendChild(a);
  });
  new XystusDashboard().render();
});

async function cargarEntidad(tabla, registroEditar=null) {
  tablaActual = tabla;
  const respuesta = await fetch("api/superapi.php?ruta=tabla&tabla=" + encodeURIComponent(tabla));
  const datos = await respuesta.json();
  if (datos.error) { avisar(datos.error); return; }

  clavePrimaria = datos.clavePrimaria;
  columnasActuales = datos.columnas;
  registrosActuales = datos.registros;

  const seccion = document.querySelector("section");
  seccion.innerHTML = `
    <div class="barra">
      <div><small>ENTIDAD</small><h2></h2></div>
      <div class="barra-acciones">
        <input class="buscador" id="filtro" placeholder="Filtrar registros…">
        <span class="contador" id="contador"></span>
      </div>
    </div>
    <div id="zona-formulario"></div>
    <div id="zona-tabla"></div>
  `;
  seccion.querySelector("h2").textContent = tabla;
  seccion.querySelector("#contador").textContent = datos.registros.length + " registros";

  const filtro = seccion.querySelector("#filtro");
  filtro.oninput = () => pintarListado(filtro.value);

  montarFormulario(registroEditar);
  pintarListado("");
}

function montarFormulario(registro) {
  new XystusFormulario({
    contenedor: "#zona-formulario",
    tabla: tablaActual,
    columnas: columnasActuales,
    registro,
    clavePrimaria,
    opcionesCampo,
    alGuardar: async () => {
      avisar(registro ? "Cambios guardados" : "Registro creado");
      await cargarEntidad(tablaActual);
    }
  }).render();
}

function pintarListado(texto) {
  const q = String(texto || "").toLowerCase().trim();
  const filtrados = !q ? registrosActuales : registrosActuales.filter(registro =>
    Object.values(registro).some(valor => String(valor ?? "").toLowerCase().includes(q))
  );
  const contador = document.querySelector("#contador");
  if (contador) contador.textContent = filtrados.length + " registros";

  new XystusTabla({
    contenedor: "#zona-tabla",
    tabla: tablaActual,
    columnas: columnasActuales,
    registros: filtrados,
    clavePrimaria,
    alEditar: registro => montarFormulario(registro),
    alEliminar: id => eliminarRegistro(id)
  }).render();
}

async function eliminarRegistro(id) {
  if (!confirm("¿Eliminar este registro?")) return;
  const respuesta = await fetch("api/superapi.php?ruta=eliminar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({tabla: tablaActual, id})
  });
  const resultado = await respuesta.json();
  if (!respuesta.ok || resultado.ok === false) {
    avisar(resultado.error || "Error");
    return;
  }
  avisar("Registro eliminado");
  await cargarEntidad(tablaActual);
}

function avisar(mensaje) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(avisar._t);
  avisar._t = setTimeout(() => toast.classList.remove("visible"), 2200);
}

document.querySelector("#boton-reporting").onclick = function(){
  document.querySelectorAll("#entidades a").forEach(x => x.classList.remove("activo"));
  const nombre = document.querySelector("h1").textContent || "ssanitax | Xystus";
  new XystusReporting({contenedor:"section", titulo:nombre}).render();
};
