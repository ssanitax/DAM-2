function escapar(valor){
  let d = document.createElement('div')
  d.textContent = String(valor ?? '')
  return d.innerHTML
}

// Vamos a cargar la configuración
fetch("data/config.php")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
  document.querySelector("h1").textContent = datos.nombre
  let eslogan = document.querySelector("#eslogan")
  if(eslogan) eslogan.textContent = datos.eslogan || ""
  document.documentElement.style.setProperty('--color_corporativo', datos.color)
  if(datos.color_acento) document.documentElement.style.setProperty('--color_acento', datos.color_acento)
  if(datos.margen) document.documentElement.style.setProperty('--margen_interior', datos.margen)
})

fetch("api/superapi.php?ruta=modulos")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
  let menu = document.querySelector("#modulos")
  datos.forEach(function(dato){
    menu.innerHTML += '<a href="#">'+escapar(dato)+'</a>'
  })
})

fetch("api/superapi.php?ruta=entidades")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
  let menu = document.querySelector("#entidades")
  datos.forEach(function(dato){
    let enlace = document.createElement("a")
    enlace.href = "#"
    enlace.textContent = dato
    enlace.onclick = function(evento){
      evento.preventDefault()
      document.querySelectorAll("#entidades a").forEach(function(a){ a.classList.remove("activo") })
      enlace.classList.add("activo")
      cargarTabla(dato)
    }
    menu.appendChild(enlace)
  })
  if(datos.length > 0){
    menu.querySelector("a").classList.add("activo")
    cargarTabla(datos[0])
  }
})

function cargarTabla(tabla){
  fetch("api/superapi.php?ruta=tabla&tabla="+encodeURIComponent(tabla))
  .then(function(respuesta){return respuesta.json()})
  .then(function(datos){
    if(datos.error){
      document.querySelector("section").innerHTML = '<p class="vacio">'+escapar(datos.error)+'</p>'
      return
    }
    pintarTabla(datos)
  })
}

function pintarTabla(datos){
  let seccion = document.querySelector("section")
  let html = '<div class="barra"><div><small>ENTIDAD</small><h2>'+escapar(datos.tabla)+'</h2></div>'
  html += '<span class="contador">'+escapar(datos.total)+' registros</span></div>'

  if(!datos.registros || datos.registros.length === 0){
    seccion.innerHTML = html + '<p class="vacio">Todavía no hay registros en esta entidad.</p>'
    return
  }

  let columnas = Object.keys(datos.registros[0])
  html += '<div class="tabla-contenedor"><table><thead><tr>'
  columnas.forEach(function(clave){ html += '<th>'+escapar(clave)+'</th>' })
  html += '</tr></thead><tbody>'

  datos.registros.forEach(function(registro){
    html += '<tr>'
    columnas.forEach(function(clave){ html += '<td>'+escapar(registro[clave])+'</td>' })
    html += '</tr>'
  })
  html += '</tbody></table></div>'
  seccion.innerHTML = html
}
