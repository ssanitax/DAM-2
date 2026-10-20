class XystusReporting {
  constructor({contenedor="section", api="api/superapi.php", titulo="Xystus"} = {}) {
    this.contenedor = typeof contenedor === "string" ? document.querySelector(contenedor) : contenedor;
    this.api = api;
    this.titulo = titulo;
  }

  esNumerica(columna) {
    const tipo = (columna.type || "").toUpperCase();
    return ["INT","REAL","NUM","DECIMAL","FLOAT","DOUBLE"].some(t => tipo.includes(t));
  }

  formatoNumero(valor) {
    return new Intl.NumberFormat("es-ES", {maximumFractionDigits:2}).format(valor);
  }

  async cargarTodo() {
    const tablas = await fetch(this.api + "?ruta=entidades").then(r => r.json());
    return Promise.all(tablas.map(tabla =>
      fetch(this.api + "?ruta=tabla&tabla=" + encodeURIComponent(tabla)).then(r => r.json())
    ));
  }

  async render() {
    this.contenedor.innerHTML = '<div class="vacio">Generando informe completo…</div>';
    const entidades = await this.cargarTodo();
    const totalRegistros = entidades.reduce((s,e) => s + (e.registros ? e.registros.length : 0), 0);
    const fecha = new Intl.DateTimeFormat("es-ES", {dateStyle:"long", timeStyle:"short"}).format(new Date());

    this.contenedor.innerHTML = `
      <div class="reporting-toolbar">
        <div><strong>Reporting</strong><small> ${entidades.length} tablas · ${totalRegistros} registros</small></div>
        <div class="export-grupo">
          <button type="button" id="reporting-exportar-todo" class="secundario">Exportar todo CSV</button>
          <button type="button" id="reporting-imprimir">Imprimir / PDF</button>
        </div>
      </div>
      <div class="reporting-documento">
        <article class="reporting-a4">
          <header class="reporting-cabecera">
            <div><small>${this.esc(this.titulo).toUpperCase()}</small><h1>Reporte general</h1></div>
            <div class="reporting-fecha">${fecha}</div>
          </header>
          <div class="reporting-resumen">
            <div><strong>${entidades.length}</strong><span>tablas</span></div>
            <div><strong>${totalRegistros}</strong><span>registros</span></div>
          </div>
          <div id="reporting-tablas"></div>
        </article>
      </div>`;

    const zona = this.contenedor.querySelector("#reporting-tablas");
    entidades.forEach(entidad => zona.appendChild(this.crearTabla(entidad)));
    this.contenedor.querySelector("#reporting-imprimir").onclick = () => window.print();
    this.contenedor.querySelector("#reporting-exportar-todo").onclick = async () => {
      if (typeof XystusExportacion === "undefined") return;
      await XystusExportacion.exportarTodo("csv");
    };
  }

  crearTabla(datos) {
    const bloque = document.createElement("section");
    bloque.className = "reporting-bloque";
    const columnas = datos.columnas || [];
    const registros = datos.registros || [];
    const numericas = columnas.map((c,i) => this.esNumerica(c) ? i : -1).filter(i => i >= 0);

    bloque.innerHTML = `
      <div class="reporting-titulo-tabla">
        <div><small>TABLA</small><h2>${this.esc(datos.tabla || "")}</h2></div>
        <span class="reporting-contador">${registros.length} filas</span>
      </div>
      <div class="reporting-tabla-scroll"><table><thead></thead><tbody></tbody><tfoot></tfoot></table></div>`;

    const grupo = document.createElement("div");
    grupo.className = "export-grupo reporting-exportar-csv";
    [["csv","CSV"],["html","HTML"],["md","MD"]].forEach(([formato, etiqueta]) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.textContent = etiqueta;
      boton.onclick = () => {
        if (typeof XystusExportacion === "undefined") return;
        const filas = [...bloque.querySelector("tbody").rows]
          .filter(fila => fila.style.display !== "none")
          .map(fila => Object.fromEntries(columnas.map((c, i) => [c.name, fila.cells[i].textContent])));
        XystusExportacion.descargar(datos.tabla, columnas, filas, formato);
      };
      grupo.appendChild(boton);
    });
    bloque.querySelector(".reporting-titulo-tabla").appendChild(grupo);

    const thead = bloque.querySelector("thead");
    const filtros = document.createElement("tr");
    filtros.className = "reporting-filtros";
    const nombres = document.createElement("tr");
    columnas.forEach((columna, indice) => {
      const thf = document.createElement("th");
      const input = document.createElement("input");
      input.type = "search"; input.placeholder = "Filtrar"; input.dataset.indice = indice;
      thf.appendChild(input); filtros.appendChild(thf);

      const th = document.createElement("th");
      th.textContent = columna.name; th.dataset.indice = indice; th.dataset.asc = "1";
      nombres.appendChild(th);
    });
    thead.append(filtros, nombres);

    const tbody = bloque.querySelector("tbody");
    registros.forEach(registro => {
      const tr = document.createElement("tr");
      columnas.forEach(c => { const td=document.createElement("td"); td.textContent=registro[c.name] ?? ""; tr.appendChild(td); });
      tbody.appendChild(tr);
    });

    const actualizar = () => {
      const inputs = [...bloque.querySelectorAll("thead input")];
      const visibles = [...tbody.rows].filter(fila => {
        const ok = inputs.every((input,i) => fila.cells[i].textContent.toLowerCase().includes(input.value.toLowerCase().trim()));
        fila.style.display = ok ? "" : "none"; return ok;
      });
      bloque.querySelector(".reporting-contador").textContent = visibles.length + " filas";
      this.resumen(bloque, columnas, visibles, numericas);
    };

    bloque.querySelectorAll("thead input").forEach(i => i.oninput = actualizar);
    nombres.querySelectorAll("th").forEach(th => th.onclick = () => {
      const i = +th.dataset.indice, asc = th.dataset.asc === "1";
      [...tbody.rows].sort((a,b) => {
        let A=a.cells[i].textContent.trim(), B=b.cells[i].textContent.trim();
        if (numericas.includes(i)) { A=parseFloat(A)||0; B=parseFloat(B)||0; return asc ? A-B : B-A; }
        return asc ? A.localeCompare(B,"es",{numeric:true}) : B.localeCompare(A,"es",{numeric:true});
      }).forEach(f => tbody.appendChild(f));
      th.dataset.asc = asc ? "0" : "1";
    });
    actualizar();
    const campo = typeof XystusGraficas !== 'undefined' ? XystusGraficas.campo(registros, columnas) : null;
    if (campo && registros.length) {
      const grafica = document.createElement('div');
      grafica.className = 'grafica-card reporting-grafica';
      bloque.querySelector('.reporting-titulo-tabla').after(grafica);
      const actualizarGrafica = () => {
        const visibles = [...tbody.rows].filter(f => f.style.display !== 'none');
        const regs = visibles.map(f => Object.fromEntries(columnas.map((c,i) => [c.name, f.cells[i].textContent])));
        const freq = XystusGraficas.frecuencia(regs, campo.name);
        XystusGraficas.crear(grafica, 'anillo', freq.map(x => x[0]), freq.map(x => x[1]), 'Frecuencia de ' + campo.name);
      };
      bloque.querySelectorAll('thead input').forEach(i => i.addEventListener('input', actualizarGrafica));
      actualizarGrafica();
    }
    return bloque;
  }

  resumen(bloque, columnas, filas, numericas) {
    const tfoot = bloque.querySelector("tfoot"); tfoot.innerHTML = "";
    if (!numericas.length) return;
    for (const [etiqueta, promedio] of [["Suma",false],["Promedio",true]]) {
      const tr=document.createElement("tr");
      columnas.forEach((c,i) => {
        const td=document.createElement("td");
        if (i===0) { td.textContent=etiqueta; td.className="reporting-resumen-label"; }
        if (numericas.includes(i)) {
          const valores=filas.map(f=>parseFloat(f.cells[i].textContent)).filter(Number.isFinite);
          const suma=valores.reduce((a,b)=>a+b,0);
          td.textContent=this.formatoNumero(promedio ? (valores.length ? suma/valores.length : 0) : suma);
          td.classList.add("numero");
        }
        tr.appendChild(td);
      }); tfoot.appendChild(tr);
    }
  }

  esc(v) { const d=document.createElement("div"); d.textContent=v; return d.innerHTML; }
}
