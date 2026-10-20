class XystusTabla {
  constructor({contenedor, tabla, columnas, registros, clavePrimaria=null, alEditar=null, alEliminar=null}) {
    this.contenedor = typeof contenedor === "string" ? document.querySelector(contenedor) : contenedor;
    this.tabla = tabla;
    this.columnas = columnas || [];
    this.registros = registros || [];
    this.clavePrimaria = clavePrimaria;
    this.alEditar = alEditar;
    this.alEliminar = alEliminar;
  }

  render() {
    this.contenedor.innerHTML = "";

    const titulo = document.createElement("h3");
    titulo.textContent = "Listado de " + this.tabla;
    const cabecera = document.createElement("div");
    cabecera.className = "barra";
    const botonCSV = document.createElement("button");
    botonCSV.type = "button";
    botonCSV.textContent = "Exportar CSV";
    botonCSV.onclick = () => {
      if (typeof XystusCSV !== "undefined") {
        XystusCSV.descargar(this.tabla, this.columnas, this.registros);
      }
    };
    cabecera.append(titulo, botonCSV);
    this.contenedor.appendChild(cabecera);

    if (!this.columnas.length) {
      const vacio = document.createElement("p");
      vacio.className = "vacio";
      vacio.textContent = "No hay columnas.";
      this.contenedor.appendChild(vacio);
      return;
    }

    const envoltorio = document.createElement("div");
    envoltorio.className = "tabla-contenedor";
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const trh = document.createElement("tr");
    this.columnas.forEach(columna => {
      const th = document.createElement("th");
      th.textContent = columna.name;
      trh.appendChild(th);
    });
    if (this.alEditar || this.alEliminar) {
      const th = document.createElement("th");
      th.className = "acciones";
      th.textContent = "Acciones";
      trh.appendChild(th);
    }
    thead.appendChild(trh);

    this.registros.forEach(registro => {
      const tr = document.createElement("tr");
      this.columnas.forEach(columna => {
        const td = document.createElement("td");
        td.textContent = registro[columna.name] ?? "";
        tr.appendChild(td);
      });

      if (this.alEditar || this.alEliminar) {
        const td = document.createElement("td");
        td.className = "acciones";
        if (this.alEditar) {
          const b = document.createElement("button");
          b.className = "editar";
          b.type = "button";
          b.textContent = "Editar";
          b.onclick = () => this.alEditar(registro);
          td.appendChild(b);
        }
        if (this.alEliminar) {
          const b = document.createElement("button");
          b.className = "eliminar";
          b.type = "button";
          b.textContent = "Eliminar";
          b.onclick = () => this.alEliminar(registro[this.clavePrimaria]);
          td.appendChild(b);
        }
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    envoltorio.appendChild(table);
    this.contenedor.appendChild(envoltorio);

    if (!this.registros.length) {
      const vacio = document.createElement("p");
      vacio.className = "vacio";
      vacio.textContent = "Todavía no hay registros.";
      this.contenedor.appendChild(vacio);
    }

    if (typeof XystusGraficas !== "undefined") {
      const campo = XystusGraficas.campo(this.registros, this.columnas);
      if (campo && this.registros.length) {
        const panel = document.createElement("div");
        panel.className = "grafica-card grafica-tabla";
        this.contenedor.prepend(panel);
        const frec = XystusGraficas.frecuencia(this.registros, campo.name);
        XystusGraficas.crear(
          panel,
          "barras",
          frec.map(x => x[0]),
          frec.map(x => x[1]),
          "Frecuencia de " + campo.name
        );
      }
    }
    return table;
  }
}
