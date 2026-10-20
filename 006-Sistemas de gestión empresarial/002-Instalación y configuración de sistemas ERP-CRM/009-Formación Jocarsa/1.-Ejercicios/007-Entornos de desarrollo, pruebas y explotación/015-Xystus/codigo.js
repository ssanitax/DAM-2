// Vamos a cargar la configuración
fetch("data/config.php")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
  console.log("Los datos son")
	console.log(datos)
  let titulo = document.querySelector("h1")
  titulo.textContent = datos.nombre
  let eslogan = document.querySelector("#eslogan")
  eslogan.textContent = datos.eslogan
  // Esto le cambia el color a la variable css
  document.documentElement.style.setProperty('--color_corporativo', datos.color);
  document.documentElement.style.setProperty('--color_acento', datos.color_acento);
  document.documentElement.style.setProperty('--margen_interior', datos.margen);
})

fetch("api/superapi.php?ruta=modulos")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
	console.log(datos)
  let menu = document.querySelector("#modulos")
  datos.forEach(function(dato){
  	menu.innerHTML += '<a href="">'+dato+'</a>'
  })
})

fetch("api/superapi.php?ruta=entidades")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
	console.log(datos)
  let menu = document.querySelector("#entidades")
  datos.forEach(function(dato){
  	menu.innerHTML += '<a href="">'+dato+'</a>'
  })
})

fetch("api/superapi.php?ruta=tabla")
.then(function(respuesta){return respuesta.json()})
.then(function(datos){
	console.log(datos)
  
 	let seccion = document.querySelector("section")
  let cadenatabla = ""
  cadenatabla += "<table>";
  // Primero pinto las cabeceras de columna
  cadenatabla += "<tr>";
  Object.keys(datos[0]).forEach(function(clave){
  	cadenatabla += "<th>"+clave+"</th>";
  })
  cadenatabla += "</tr>";
  // Primero pinto las cabeceras de columna
  // Ahora pinto el cuerpo de la tabla
  
  datos.forEach(function(usuario){
    cadenatabla += "<tr>";
  	Object.keys(usuario).forEach(function(clave){
      cadenatabla += "<td>"+usuario[clave]+"</td>";
    });
    cadenatabla += "</tr>";
  })
  
  // Ahora pinto el cuerpo de la tabla
  cadenatabla += "</table>";
  seccion.innerHTML = cadenatabla
  
})
