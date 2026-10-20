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
    this.contenedor.appendChild(titulo);

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
    return table;
  }
}
