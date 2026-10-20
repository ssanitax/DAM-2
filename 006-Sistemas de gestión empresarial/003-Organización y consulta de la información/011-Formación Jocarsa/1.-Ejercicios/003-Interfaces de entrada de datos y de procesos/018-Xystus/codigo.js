let tablaActual = "";
let clavePrimaria = "";
let registrosActuales = [];
let columnasActuales = [];

const opcionesCampo = {
  estado: ["Confirmada","Pendiente","Cancelada"],
  abono: ["Mensual","Anual","Trimestral","Bono 10"],
  deporte: ["Pádel","Tenis","Natación","Fútbol sala","Baloncesto"],
  especialidad: ["Pádel","Tenis","Natación","Fútbol sala","Baloncesto","Material deportivo","Mantenimiento pistas"],
  tipo: ["Material","Consumible"],
  cubierta: [["1","Sí"],["0","No"]]
};

fetch("data/config.php")
.then(respuesta => respuesta.json())
.then(datos => {
  document.querySelector("h1").textContent = datos.nombre;
  let eslogan = document.querySelector("#eslogan");
  if(eslogan) eslogan.textContent = datos.eslogan || "";
  document.documentElement.style.setProperty('--color_corporativo', datos.color);
  if(datos.color_acento) document.documentElement.style.setProperty('--color_acento', datos.color_acento);
  if(datos.margen) document.documentElement.style.setProperty('--margen_interior', datos.margen);
});

fetch("api/superapi.php?ruta=modulos")
.then(respuesta => respuesta.json())
.then(datos => {
  let menu = document.querySelector("#modulos");
  datos.forEach(dato => menu.innerHTML += '<a href="#">'+escapar(dato)+'</a>');
});

fetch("api/superapi.php?ruta=entidades")
.then(respuesta => respuesta.json())
.then(datos => {
  let menu = document.querySelector("#entidades");
  datos.forEach(dato => {
    let enlace = document.createElement("a");
    enlace.href = "#";
    enlace.textContent = dato;
    enlace.onclick = function(evento){
      evento.preventDefault();
      document.querySelectorAll("#entidades a").forEach(a => a.classList.remove("activo"));
      enlace.classList.add("activo");
      cargarTabla(dato);
    };
    menu.appendChild(enlace);
  });
  if(datos.length > 0){
    menu.querySelector("a").classList.add("activo");
    cargarTabla(datos[0]);
  }
});

document.addEventListener("keydown", function(evento){
  if(evento.key === "Escape" && tablaActual) cargarTabla(tablaActual);
});

function cargarTabla(tabla){
  tablaActual = tabla;
  fetch("api/superapi.php?ruta=tabla&tabla="+encodeURIComponent(tabla))
  .then(respuesta => respuesta.json())
  .then(datos => {
    if(datos.error){ avisar(datos.error); return; }
    clavePrimaria = datos.clavePrimaria;
    columnasActuales = datos.columnas;
    registrosActuales = datos.registros;
    pintarTabla(datos.registros);
  });
}

function pintarTabla(registros){
  let seccion = document.querySelector("section");
  let html = '<div class="barra"><div><small>ENTIDAD</small><h2>'+escapar(tablaActual)+'</h2></div>';
  html += '<div class="barra-acciones">';
  html += '<input class="buscador" id="filtro" placeholder="Filtrar registros…" oninput="filtrarRegistros(this.value)">';
  html += '<span class="contador" id="contador">'+escapar(registros.length)+' registros</span>';
  html += '<button onclick="nuevoRegistro()">+ Nuevo registro</button></div></div>';

  if(columnasActuales.length == 0){ seccion.innerHTML = html + '<p>No hay columnas.</p>'; return; }

  html += '<div class="tabla-contenedor"><table><thead><tr>';
  columnasActuales.forEach(columna => html += '<th>'+escapar(columna.name)+'</th>');
  html += '<th class="acciones">Acciones</th></tr></thead><tbody>';

  registros.forEach(registro => {
    html += '<tr>';
    columnasActuales.forEach(columna => html += '<td>'+escapar(registro[columna.name] ?? '')+'</td>');
    let id = registro[clavePrimaria];
    html += '<td class="acciones"><button class="editar" onclick=\'editarRegistro('+JSON.stringify(JSON.stringify(registro))+')\'>Editar</button> ';
    html += '<button class="eliminar" onclick=\'eliminarRegistro('+JSON.stringify(id)+')\'>Eliminar</button></td></tr>';
  });
  html += '</tbody></table></div>';
  if(registros.length == 0) html += '<p class="vacio">Todavía no hay registros.</p>';
  seccion.innerHTML = html;
}

function filtrarRegistros(texto){
  let q = String(texto || '').toLowerCase().trim();
  let filtrados = !q ? registrosActuales : registrosActuales.filter(registro =>
    Object.values(registro).some(valor => String(valor ?? '').toLowerCase().includes(q))
  );
  let valorFiltro = texto;
  pintarTabla(filtrados);
  let filtro = document.querySelector("#filtro");
  let contador = document.querySelector("#contador");
  if(filtro) filtro.value = valorFiltro;
  if(contador) contador.textContent = filtrados.length + " registros";
}

function nuevoRegistro(){ cargarFormulario(null); }
function editarRegistro(registroJSON){ cargarFormulario(JSON.parse(registroJSON)); }

function tipoDeControl(columna){
  let nombre = (columna.name || "").toLowerCase();
  let tipo = (columna.type || "").toUpperCase();
  if(opcionesCampo[nombre]) return "select";
  if(nombre.includes("email")) return "email";
  if(nombre.includes("telefono") || nombre.includes("teléfono")) return "tel";
  if(nombre.includes("url") || nombre.includes("web")) return "url";
  if(nombre.startsWith("fecha") || nombre.endsWith("_fecha") || nombre === "fecha") return "date";
  if(nombre.includes("hora")) return "time";
  if(nombre.includes("password") || nombre.includes("clave")) return "password";
  if(tipo.includes("INT") || tipo.includes("REAL") || tipo.includes("NUM") ||
     nombre.includes("precio") || nombre.includes("cantidad") || nombre.includes("tarifa") ||
     nombre.includes("total") || nombre.endsWith("_id")) return "number";
  if(nombre.includes("notas") || nombre.includes("descripcion") || nombre.includes("observ")) return "textarea";
  return "text";
}

function crearControl(columna, valor){
  let plantilla = document.querySelector("#controlformulario");
  let instancia = plantilla.content.cloneNode(true);
  let label = instancia.querySelector("label");
  let campo = instancia.querySelector(".campo");
  let id = "campo_"+columna.name;
  label.textContent = columna.name;
  label.setAttribute("for", id);

  let tipo = tipoDeControl(columna);
  let control;

  if(tipo === "select"){
    control = document.createElement("select");
    control.appendChild(new Option("— elegir —", ""));
    opcionesCampo[columna.name.toLowerCase()].forEach(op => {
      if(Array.isArray(op)) control.appendChild(new Option(op[1], op[0]));
      else control.appendChild(new Option(op, op));
    });
    if(valor !== undefined && valor !== null && valor !== "") control.value = String(valor);
  }else if(tipo === "textarea"){
    control = document.createElement("textarea");
    control.value = valor ?? "";
  }else{
    control = document.createElement("input");
    control.type = tipo;
    if(tipo === "number") control.step = "any";
    control.value = valor ?? "";
    control.placeholder = columna.name;
  }

  control.id = id;
  control.name = columna.name;
  if(columna.notnull) control.required = true;

  let ayuda = document.createElement("span");
  ayuda.className = "ayuda";
  ayuda.textContent = (columna.type || "TEXT") + (columna.notnull ? " · obligatorio" : "");

  campo.appendChild(control);
  campo.appendChild(ayuda);
  return instancia;
}

function cargarFormulario(registro){
  fetch("api/superapi.php?ruta=estructura&tabla="+encodeURIComponent(tablaActual))
  .then(respuesta => respuesta.json())
  .then(datos => {
    let editando = registro !== null;
    let seccion = document.querySelector("section");
    seccion.innerHTML = "";

    let barra = document.createElement("div");
    barra.className = "barra";
    barra.innerHTML = '<div><small>'+(editando?'EDITAR':'CREAR')+'</small><h2>'+escapar(tablaActual)+'</h2></div>';
    let volver = document.createElement("button");
    volver.className = "secundario";
    volver.textContent = "← Volver";
    volver.onclick = function(){ cargarTabla(tablaActual); };
    barra.appendChild(volver);
    seccion.appendChild(barra);

    let form = document.createElement("form");
    form.id = "formulario";
    form.noValidate = false;

    datos.columnas.forEach(columna => {
      if(columna.pk) return;
      let valor = editando ? (registro[columna.name] ?? "") : "";
      form.appendChild(crearControl(columna, valor));
    });

    let acciones = document.createElement("div");
    acciones.className = "acciones-form";
    let enviar = document.createElement("button");
    enviar.type = "submit";
    enviar.textContent = editando ? "Guardar cambios" : "Crear registro";
    acciones.appendChild(enviar);
    form.appendChild(acciones);

    form.onsubmit = function(evento){
      evento.preventDefault();
      if(!form.checkValidity()){
        form.reportValidity();
        avisar("Revisa los campos del formulario");
        return;
      }
      guardarRegistro(new FormData(form), editando ? registro[datos.clavePrimaria] : null);
    };

    seccion.appendChild(form);
    let primero = form.querySelector("input,select,textarea");
    if(primero) primero.focus();
  });
}

function guardarRegistro(formData,id){
  let datos = Object.fromEntries(formData.entries());
  fetch("api/superapi.php?ruta="+(id===null?'crear':'actualizar'),{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({tabla:tablaActual,id:id,datos:datos})
  }).then(r => r.json()).then(respuesta => {
    if(!respuesta.ok) return avisar(respuesta.error || "Error");
    avisar(id===null ? "Registro creado" : "Cambios guardados");
    cargarTabla(tablaActual);
  });
}

function eliminarRegistro(id){
  if(!confirm("¿Eliminar este registro?")) return;
  fetch("api/superapi.php?ruta=eliminar",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({tabla:tablaActual,id:id})
  }).then(r => r.json()).then(respuesta => {
    if(!respuesta.ok) return avisar(respuesta.error || "Error");
    avisar("Registro eliminado");
    cargarTabla(tablaActual);
  });
}

function avisar(mensaje){
  let toast = document.querySelector(".toast");
  if(!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("visible");
  clearTimeout(avisar._t);
  avisar._t = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function escapar(valor){ let d=document.createElement('div'); d.textContent=String(valor); return d.innerHTML; }
function escaparAtributo(valor){ return escapar(valor).replaceAll('"','&quot;'); }
