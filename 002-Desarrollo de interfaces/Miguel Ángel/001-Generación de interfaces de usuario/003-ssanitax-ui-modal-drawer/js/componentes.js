/**
 * jocarsa | iu
 * Control principal de la interfaz mediante programación orientada a objetos.
 *
 * Nota sobre el namespace:
 * JavaScript no admite "|" dentro de un identificador. Por ello el namespace
 * técnico equivalente es `jocarsa.iu`.
 */
window.jocarsa = window.jocarsa || {};
window.jocarsa.iu = window.jocarsa.iu || {};

(() => {
  "use strict";

  class DOM {
    static uno(selector, contexto = document) {
      return contexto.querySelector(selector);
    }

    static todos(selector, contexto = document) {
      return [...contexto.querySelectorAll(selector)];
    }
  }

  class Utilidades {
    static hashTexto(texto) {
      let hash = 0;

      for (const caracter of texto) {
        hash = caracter.charCodeAt(0) + ((hash << 5) - hash);
      }

      return Math.abs(hash);
    }

    static colorTexto(texto) {
      const mezcla = Utilidades.hashTexto(texto);
      const tono = 258 + (mezcla % 32);
      const luz = 40 + (mezcla % 12);
      return `hsl(${tono},46%,${luz}%)`;
    }
  }

  class OrigenDatos {
    static async cargarJSON(url) {
      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error(url);
      }

      return respuesta.json();
    }
  }

  class EstadoIU {
    constructor() {
      this.menu = [];
      this.entidades = [];
      this.clientes = null;
      this.formulario = null;
      this.graficos = null;
      this.seleccion = "Listado";
    }
  }

  class FichaIU {
    static completar(elemento, texto) {
      const ficha = DOM.uno(".ficha", elemento);
      const etiqueta = DOM.uno(".etiqueta", elemento);

      const icono = window.jocarsa.iu.iconoDe(texto);
      if (icono) ficha.innerHTML = icono;
      else ficha.textContent = texto.charAt(0).toUpperCase();
      ficha.style.background = Utilidades.colorTexto(texto);
      etiqueta.textContent = texto;
    }
  }

  class ToastIU {
    constructor(selectorPila = "#toastStack") {
      this.selectorPila = selectorPila;
      this.iconos = {
        success: "✓",
        info: "i",
        warning: "!",
        danger: "×"
      };
    }

    obtenerPila() {
      let pila = DOM.uno(this.selectorPila);

      if (!pila) {
        pila = document.createElement("div");
        pila.id = this.selectorPila.replace(/^#/, "");
        pila.className = "ju-toast-stack";
        document.body.appendChild(pila);
      }

      return pila;
    }

    mostrar(tipo = "info", titulo = "Información", texto = "Operación realizada") {
      const pila = this.obtenerPila();
      const toast = document.createElement("article");

      toast.className = `ju-toast is-${tipo}`;
      toast.innerHTML = `
        <div class="ju-toast-icon">${this.iconos[tipo] || "i"}</div>
        <div>
          <p class="ju-toast-title">${titulo}</p>
          <p class="ju-toast-text">${texto}</p>
        </div>
        <button class="ju-toast-close" type="button">×</button>
      `;

      const cerrar = () => {
        toast.classList.add("is-leaving");
        setTimeout(() => toast.remove(), 240);
      };

      DOM.uno("button", toast).addEventListener("click", cerrar);
      pila.appendChild(toast);
      setTimeout(cerrar, 5000);
    }
  }

  class ModalIU {
    constructor() {
      this.capa = DOM.uno("#juModal");
      this.titulo = DOM.uno("#juModalTitle");
      this.cuerpo = DOM.uno("#juModalBody");
      DOM.todos("[data-modal-close]", this.capa).forEach((nodo) => nodo.addEventListener("click", () => this.cerrar()));
    }
    abrir(titulo, contenido) {
      this.titulo.textContent = titulo;
      this.cuerpo.innerHTML = contenido;
      this.capa.classList.add("abierto");
      this.capa.setAttribute("aria-hidden", "false");
    }
    cerrar() {
      this.capa.classList.remove("abierto");
      this.capa.setAttribute("aria-hidden", "true");
    }
  }

  class DrawerIU {
    constructor(aplicacion) {
      this.aplicacion = aplicacion;
      this.panel = DOM.uno("#juDrawer");
      this.overlay = DOM.uno("#juDrawerOverlay");
      this.cuerpo = DOM.uno("#juDrawerBody");
      this.modo = DOM.uno("#juDrawerMode");
      this.titulo = DOM.uno("#juDrawerTitle");
      this.resizer = DOM.uno("#juDrawerResizer");
      this.anchoMinimo = 300;
      // El máximo real se calcula siempre como el 50% del viewport.
      this.anchoMaximo = () => Math.max(this.anchoMinimo, window.innerWidth * 0.5);
      DOM.uno("#juDrawerClose").addEventListener("click", () => this.cerrar());
      this.overlay.addEventListener("click", () => this.cerrar());
      this.resizer.addEventListener("pointerdown", (e) => this.iniciarRedimension(e));
      window.addEventListener("resize", () => this.ajustarAlViewport());
      this.actualizarColumnasFormulario();
    }
    abrirCrear() { this.renderFormulario("create", null); }
    abrirActualizar(registro) { this.renderFormulario("update", registro); }
    renderFormulario(modo, registro) {
      const esCrear = modo === "create";
      this.modo.textContent = esCrear ? "CREAR" : "ACTUALIZAR";
      this.titulo.textContent = esCrear ? "Nuevo cliente" : `Editar ${registro.nombre || "registro"}`;
      const campos = this.aplicacion.estado.formulario.campos;
      this.cuerpo.innerHTML = `<article class="ju-card"><form id="juDrawerForm" class="ju-form-grid">${campos.map(c => this.campoHTML(c, registro)).join("")}<div class="ju-form-full ju-button-row"><button class="ju-btn" type="submit">${esCrear ? "Crear" : "Guardar cambios"}</button><button class="ju-btn secondary" type="button" id="juDrawerCancel">Cancelar</button></div></form></article>`;
      DOM.uno("#juDrawerCancel").addEventListener("click", () => this.cerrar());
      DOM.uno("#juDrawerForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const nuevo = {};
        campos.forEach(c => {
          if (c.tipo === "checkbox") nuevo[c.nombre] = fd.has(c.nombre);
          else if (c.tipo === "number") nuevo[c.nombre] = fd.get(c.nombre) === "" ? "" : Number(fd.get(c.nombre));
          else nuevo[c.nombre] = fd.get(c.nombre) ?? "";
        });
        if (esCrear) {
          const ids = this.aplicacion.estado.clientes.registros.map(r => Number(r.id) || 0);
          if (!nuevo.id) nuevo.id = Math.max(0, ...ids) + 1;
          this.aplicacion.estado.clientes.registros.push(nuevo);
          this.aplicacion.toast.mostrar("success", "Cliente creado", "El nuevo registro se ha añadido a la tabla.");
        } else {
          Object.assign(registro, nuevo);
          this.aplicacion.toast.mostrar("success", "Cliente actualizado", "Los cambios se muestran inmediatamente en la tabla.");
        }
        this.aplicacion.mostrarTabla(DOM.uno("#buscador").value);
        this.cerrar();
      });
      this.ajustarAlViewport();
      this.actualizarColumnasFormulario();
      this.panel.classList.add("abierto"); this.overlay.classList.add("abierto");
      this.panel.setAttribute("aria-hidden", "false"); this.overlay.setAttribute("aria-hidden", "false");
      setTimeout(() => DOM.uno("input,select,textarea", this.cuerpo)?.focus(), 320);
    }
    campoHTML(c, registro) {
      const valor = registro?.[c.nombre] ?? "";
      const esc = (v) => String(v).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
      if (c.tipo === "textarea") return `<label class="ju-form-full"><span>${c.etiqueta}</span><textarea name="${c.nombre}">${esc(valor)}</textarea></label>`;
      if (c.tipo === "select") return `<label><span>${c.etiqueta}</span><select name="${c.nombre}">${(c.opciones||[]).map(o=>`<option${o===valor?' selected':''}>${o}</option>`).join("")}</select></label>`;
      if (c.tipo === "checkbox") return `<label class="ju-check ju-form-full"><input type="checkbox" name="${c.nombre}"${valor?' checked':''}><span>${c.etiqueta}</span></label>`;
      return `<label><span>${c.etiqueta}</span><input name="${c.nombre}" type="${c.tipo || 'text'}" value="${esc(valor)}"${c.nombre==='id'?' min="1"':''}></label>`;
    }
    cerrar() { this.panel.classList.remove("abierto"); this.overlay.classList.remove("abierto"); this.panel.setAttribute("aria-hidden","true"); this.overlay.setAttribute("aria-hidden","true"); }
    iniciarRedimension(e) {
      e.preventDefault(); const inicio=e.clientX, anchoInicial=this.panel.getBoundingClientRect().width;
      this.resizer.setPointerCapture(e.pointerId); document.body.classList.add("redimensionando-drawer"); this.panel.style.transition="none";
      const mover=(ev)=>{
        const ancho=Math.min(this.anchoMaximo(),Math.max(this.anchoMinimo,anchoInicial+(inicio-ev.clientX)));
        this.panel.style.setProperty("--drawer-width",`${ancho}px`);
        this.actualizarColumnasFormulario(ancho);
      };
      const fin=()=>{ this.resizer.removeEventListener("pointermove",mover); this.panel.style.transition=""; document.body.classList.remove("redimensionando-drawer"); };
      this.resizer.addEventListener("pointermove",mover); this.resizer.addEventListener("pointerup",fin,{once:true}); this.resizer.addEventListener("pointercancel",fin,{once:true});
    }
    actualizarColumnasFormulario(ancho = this.panel.getBoundingClientRect().width) {
      // <= 25% del navegador: una columna. > 25% y hasta 50%: dos columnas.
      this.panel.classList.toggle("ju-drawer-dos-columnas", ancho > window.innerWidth * 0.25);
    }
    ajustarAlViewport() {
      const actual = this.panel.getBoundingClientRect().width;
      const maximo = this.anchoMaximo();
      if (actual > maximo) {
        this.panel.style.setProperty("--drawer-width", `${maximo}px`);
        this.actualizarColumnasFormulario(maximo);
      } else {
        this.actualizarColumnasFormulario(actual);
      }
    }
  }

  class GestorColumnas {
    constructor() {
      this.anchoMinimo = 64;
      this.anchoMaximo = 600;
    }

    activar() {
      this.activarMinimizacion();
      this.activarSeparadores();
    }

    activarMinimizacion() {
      DOM.todos(".minimizar").forEach((boton) => {
        const columna = boton.closest("nav,section");
        columna.dataset.ancho = columna.getBoundingClientRect().width;
        this.prepararUmbral(columna);

        boton.addEventListener("click", () => {
          this.alternarColumna(columna, boton);
        });
      });
    }

    alternarColumna(columna, boton) {
      if (columna.classList.contains("compacto")) {
        const ancho = parseFloat(columna.dataset.ancho) || 250;

        columna.classList.remove("compacto");
        columna.style.flexBasis = `${ancho}px`;
        columna.style.width = `${ancho}px`;
        this.aplicarIcono(columna, ancho);
        boton.textContent = "◀";
        return;
      }

      columna.dataset.ancho = columna.getBoundingClientRect().width;
      columna.style.flexBasis = `${columna.dataset.ancho}px`;
      columna.style.width = `${columna.dataset.ancho}px`;

      void columna.offsetWidth;

      columna.classList.add("compacto");
      boton.textContent = "▶";
    }

    activarSeparadores() {
      DOM.todos(".separador").forEach((separador) => {
        separador.addEventListener("pointerdown", (evento) => {
          this.iniciarRedimension(separador, evento);
        });
      });
    }

    iniciarRedimension(separador, evento) {
      evento.preventDefault();

      const columna = separador.previousElementSibling;

      if (!columna || columna.classList.contains("compacto")) {
        return;
      }

      const inicio = evento.clientX;
      const anchoInicial = columna.getBoundingClientRect().width;

      this.prepararUmbral(columna);
      columna.style.transition = "none";
      document.body.classList.add("redimensionando");
      separador.setPointerCapture(evento.pointerId);

      const mover = (eventoMovimiento) => {
        const ancho = Math.min(
          this.anchoMaximo,
          Math.max(this.anchoMinimo, anchoInicial + eventoMovimiento.clientX - inicio)
        );

        columna.style.width = `${ancho}px`;
        columna.style.flexBasis = `${ancho}px`;
        columna.dataset.ancho = ancho;
        this.aplicarIcono(columna, ancho);
      };

      const terminar = () => {
        separador.removeEventListener("pointermove", mover);
        columna.style.transition = "";
        document.body.classList.remove("redimensionando");
      };

      separador.addEventListener("pointermove", mover);
      separador.addEventListener("pointerup", terminar, { once: true });
      separador.addEventListener("pointercancel", terminar, { once: true });
    }

    prepararUmbral(columna) {
      if (columna.classList.contains("solo-icono")) return;

      const item = columna.querySelector(".contenido-columna > a, .contenido-columna > article");
      if (!item) return;

      const estiloItem = getComputedStyle(item);
      const estiloColumna = getComputedStyle(columna);
      const texto = Math.max(...[...columna.querySelectorAll(".etiqueta")].map((nodo) => nodo.scrollWidth), 0);
      const icono = item.querySelector(".ficha")?.getBoundingClientRect().width || 0;
      const separacion = parseFloat(estiloItem.columnGap || estiloItem.gap) || 0;
      const rellenoItem = parseFloat(estiloItem.paddingLeft) + parseFloat(estiloItem.paddingRight);
      const rellenoColumna = parseFloat(estiloColumna.paddingLeft) + parseFloat(estiloColumna.paddingRight);
      const borde = parseFloat(estiloItem.borderLeftWidth) + parseFloat(estiloItem.borderRightWidth);

      columna.dataset.umbral = String(Math.ceil(texto + icono + separacion + rellenoItem + rellenoColumna + borde + 6));
    }

    aplicarIcono(columna, ancho) {
      const umbral = parseFloat(columna.dataset.umbral) || 180;
      columna.classList.toggle("solo-icono", ancho <= umbral);
    }
  }

  class AplicacionIU {
    constructor() {
      this.estado = new EstadoIU();
      this.toast = new ToastIU();
      this.columnas = new GestorColumnas();
      this.modal = null;
      this.drawer = null;
    }

    async iniciar() {
      try {
        [
          this.estado.menu,
          this.estado.entidades,
          this.estado.clientes,
          this.estado.formulario,
          this.estado.graficos
        ] = await Promise.all([
          OrigenDatos.cargarJSON("data/menu.json"),
          OrigenDatos.cargarJSON("data/entidades.json"),
          OrigenDatos.cargarJSON("data/clientes.json"),
          OrigenDatos.cargarJSON("data/datos.json"),
          OrigenDatos.cargarJSON("data/graficos.json")
        ]);

        this.modal = new ModalIU();
        this.drawer = new DrawerIU(this);
        this.renderMenu();
        this.renderEntidades();
        this.mostrarTabla();
        this.columnas.activar();
        this.activarEventos();
      } catch (error) {
        DOM.uno("#escenario").innerHTML = `
          <div class="panel">
            <h2>No se pudieron cargar los orígenes de datos</h2>
            <p>Sirve esta carpeta mediante HTTP, por ejemplo: <code>python3 -m http.server 8000</code></p>
            <pre>${error}</pre>
          </div>
        `;
      }
    }

    renderMenu() {
      const contenedor = DOM.uno("#navegacion .contenido-columna");
      contenedor.innerHTML = "";

      this.estado.menu.forEach((elemento, indice) => {
        const nodo = DOM.uno("#tpl-nav").content.cloneNode(true);
        const enlace = DOM.uno("a", nodo);

        FichaIU.completar(enlace, elemento.texto);
        enlace.classList.toggle("activo", Boolean(elemento.activo));
        enlace.dataset.indice = indice;

        enlace.addEventListener("click", (evento) => {
          evento.preventDefault();
          DOM.todos("#navegacion a").forEach((item) => item.classList.remove("activo"));
          enlace.classList.add("activo");
          this.mostrarTabla();
        });

        contenedor.appendChild(nodo);
      });
    }

    renderEntidades() {
      const contenedor = DOM.uno("#entidades .contenido-columna");
      contenedor.innerHTML = "";

      this.estado.entidades.forEach((elemento, indice) => {
        const nodo = DOM.uno("#tpl-card").content.cloneNode(true);
        const articulo = DOM.uno("article", nodo);

        FichaIU.completar(articulo, elemento.texto);
        articulo.classList.toggle("activo", elemento.texto === this.estado.seleccion);
        articulo.dataset.indice = indice;

        articulo.addEventListener("click", () => {
          this.estado.seleccion = elemento.texto;
          this.renderEntidades();
          this.mostrarVista(elemento.texto);
        });

        articulo.addEventListener("dragstart", (evento) => {
          evento.dataTransfer.setData("text/plain", elemento.texto);
        });

        contenedor.appendChild(nodo);
      });
    }

    mostrarVista(vista) {
      if (this.alTecla) {
        document.removeEventListener("keydown", this.alTecla);
        this.alTecla = null;
      }

      if (vista === "Formulario") {
        this.mostrarFormularioUI();
      } else if (vista === "Controles") {
        this.mostrarControles();
      } else if (vista === "Eventos") {
        this.mostrarEventos();
      } else if (vista === "Login") {
        this.mostrarLoginDemo();
      } else if (vista === "Toast") {
        this.mostrarToastsDemo();
      } else if (vista === "Modal y panel") {
        this.mostrarModalPanelesDemo();
      } else if (vista === "Identidad") {
        this.mostrarIdentidad();
      } else if (vista === "Gráficos") {
        this.mostrarGraficos();
      } else {
        this.mostrarTabla();
      }
    }

    mostrarGraficos() {
      const registros = this.estado.clientes.registros;
      const serie = this.estado.graficos;
      const escenario = DOM.uno("#escenario");
      const escapar = (valor) => String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
      const icono = (dibujo) => `<span class="sx-kpi-icono" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${dibujo}</svg></span>`;
      const empresas = new Map();

      registros.forEach((registro) => {
        const nombre = registro.empresa || "Sin empresa";
        empresas.set(nombre, (empresas.get(nombre) || 0) + 1);
      });

      const total = registros.length;
      const colores = ["#5b3cc4", "#6d4adf", "#8b6cf0", "#c4b5fd"];
      const filas = [...empresas.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad], indice) => ({
          nombre,
          cantidad,
          porcentaje: total ? Math.round((cantidad / total) * 100) : 0,
          color: colores[indice % colores.length]
        }));
      const objetivo = Number(serie.objetivo) || 10;
      const cobertura = Math.max(0, Math.min(100, Math.round((total / objetivo) * 100)));
      const conTelefono = registros.filter((registro) => String(registro.telefono || "").trim()).length;
      const maxAltas = Math.max(...serie.altas, 1);
      const consultas = serie.consultas;
      const maxConsultas = Math.max(...consultas, 1);
      const ancho = 560;
      const alto = 180;
      const margen = 28;
      const paso = (ancho - margen * 2) / Math.max(1, consultas.length - 1);
      const puntos = consultas.map((valor, indice) => {
        const x = margen + indice * paso;
        const y = alto - (valor / maxConsultas) * (alto - 16) - 8;
        return [x, y];
      });
      const linea = puntos.map(([x, y]) => `${x},${y}`).join(" ");
      const area = `${margen},${alto} ${linea} ${ancho - margen},${alto}`;
      const pico = puntos.reduce((mejor, punto) => punto[1] < mejor[1] ? punto : mejor, puntos[0]);
      const giro = 2 * Math.PI * 46;
      const arco = (cobertura / 100) * giro;

      escenario.innerHTML = `
        <div class="sx-tablero">
          <section class="sx-card sx-resumen">
            <header>
              <h2>Clientes</h2>
              <p>Resumen del listado</p>
            </header>
            <div class="sx-kpis">
              <article>
                ${icono('<circle cx="9" cy="9" r="2.1"/><circle cx="15.2" cy="9.8" r="1.7"/><path d="M4.6 18.2c.5-2.4 2.2-3.6 4.4-3.6s3.9 1.2 4.4 3.6"/><path d="M13.4 15.2c1.1-.5 2.2-.4 3.2.6.6.8.9 1.6 1 2.4"/>')}
                <strong>${total}</strong>
                <span>En el listado</span>
                <em>Fichas cargadas</em>
              </article>
              <article>
                ${icono('<path d="M4.5 19.5h15"/><path d="M6.5 19.5V8h7v11.5"/><path d="M13.5 11.5h4.5V19.5"/><path d="M8.4 11h2.2M8.4 14h2.2M8.4 17h2.2"/>')}
                <strong>${empresas.size}</strong>
                <span>Empresas</span>
                <em>Distintas en la tabla</em>
              </article>
              <article>
                ${icono('<path d="M7.5 4.5h6.2l4.3 4.3V19.5h-10.5z"/><path d="M13.5 4.5v4.3H18"/><path d="M10 12.4h5.2M10 15.4h3.4"/>')}
                <strong>${conTelefono}</strong>
                <span>Con teléfono</span>
                <em>Listas para contacto</em>
              </article>
              <article>
                ${icono('<circle cx="12" cy="12" r="7"/><path d="M12 8.2V12l2.6 1.6"/>')}
                <strong>${cobertura}%</strong>
                <span>Del objetivo</span>
                <em>${total} de ${objetivo} fichas</em>
              </article>
            </div>
          </section>

          <section class="sx-card">
            <header>
              <h2>Altas</h2>
              <p>Fichas nuevas por mes</p>
            </header>
            <div class="sx-barras" aria-hidden="true">
              ${serie.altas.map((valor, indice) => `
                <div class="sx-col" title="${escapar(serie.meses[indice])}: ${valor}">
                  <span class="sx-hueco"><i style="height:${Math.max(8, Math.round((valor / maxAltas) * 100))}%"></i></span>
                  <small>${escapar(serie.meses[indice])}</small>
                </div>
              `).join("")}
            </div>
            <p class="sx-leyenda"><i></i> Altas</p>
          </section>

          <section class="sx-card">
            <header>
              <h2>Empresas</h2>
              <p>Peso dentro del listado</p>
            </header>
            <div class="sx-rank">
              ${filas.map((fila, indice) => `
                <div class="sx-fila">
                  <span>${String(indice + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>${escapar(fila.nombre)}</strong>
                    <div class="sx-pista"><b style="width:${fila.porcentaje}%;background:${fila.color}"></b></div>
                  </div>
                  <em>${fila.porcentaje}%</em>
                </div>
              `).join("") || `<p class="sx-vacio">Todavía no hay empresas.</p>`}
            </div>
          </section>

          <section class="sx-card sx-cobertura">
            <header>
              <h2>Cobertura</h2>
              <p>Sobre el objetivo de fichas</p>
            </header>
            <svg viewBox="0 0 120 120" role="img" aria-label="${cobertura} por ciento">
              <circle cx="60" cy="60" r="46" fill="none" stroke="var(--pista)" stroke-width="12"/>
              <circle cx="60" cy="60" r="46" fill="none" stroke="var(--trazo)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${arco} ${giro}" transform="rotate(-90 60 60)"/>
              <text x="60" y="66" text-anchor="middle">${cobertura}%</text>
            </svg>
          </section>

          <section class="sx-card sx-consultas">
            <header>
              <h2>Consultas</h2>
              <p>Visitas al listado durante el año</p>
            </header>
            <svg viewBox="0 0 ${ancho} ${alto + 28}" role="img" aria-label="Consultas por mes">
              <defs>
                <linearGradient id="sxArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="var(--trazo)" stop-opacity="0.45"/>
                  <stop offset="1" stop-color="var(--trazo)" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <polygon points="${area}" fill="url(#sxArea)"/>
              <polyline points="${linea}" fill="none" stroke="var(--trazo)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
              <line x1="${pico[0]}" y1="8" x2="${pico[0]}" y2="${alto}" stroke="var(--acento-2)" stroke-dasharray="3 4"/>
              <circle cx="${pico[0]}" cy="${pico[1]}" r="4" fill="var(--acento-2)"/>
              ${serie.meses.map((mes, indice) => `<text x="${margen + indice * paso}" y="${alto + 18}" text-anchor="middle">${escapar(mes)}</text>`).join("")}
            </svg>
          </section>
        </div>
      `;
    }

    mostrarTabla(filtro = "") {
      const datos = this.estado.clientes;
      const registros = datos.registros.filter((registro) =>
        Object.values(registro)
          .join(" ")
          .toLowerCase()
          .includes(filtro.toLowerCase())
      );
      const escenario = DOM.uno("#escenario");
      const tabla = document.createElement("table");

      escenario.innerHTML = "";
      tabla.innerHTML = `
        <caption>${datos.titulo}</caption>
        <thead>
          <tr>${datos.columnas.map((columna) => `<th>${columna.etiqueta}</th>`).join("")}</tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr>
            <th colspan="${Math.max(1, datos.columnas.length - 1)}">Total</th>
            <td>${registros.length}</td>
          </tr>
        </tfoot>
      `;

      const cuerpo = DOM.uno("tbody", tabla);

      registros.forEach((registro) => {
        const fila = DOM.uno("#tpl-fila").content.cloneNode(true).querySelector("tr");

        datos.columnas.forEach((columna) => {
          const celda = document.createElement("td");
          celda.textContent = registro[columna.campo] ?? "";
          if (columna.campo === "id") celda.classList.add("ju-num");
          fila.appendChild(celda);
        });

        fila.classList.add("ju-row-editable");
        fila.title = "Clic para editar en el panel lateral";
        fila.addEventListener("click", () => {
          DOM.todos(".ju-fila-abierta", escenario).forEach((abierta) => abierta.classList.remove("ju-fila-abierta"));
          fila.classList.add("ju-fila-abierta");
          this.drawer.abrirActualizar(registro);
        });
        cuerpo.appendChild(fila);
      });

      if (!registros.length) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = datos.columnas.length;
        celda.className = "ju-vacio";
        celda.textContent = filtro
          ? "Ningún cliente coincide con la búsqueda."
          : "Todavía no hay clientes.";
        fila.appendChild(celda);
        cuerpo.appendChild(fila);
      }

      escenario.appendChild(tabla);
    }

    mostrarFormularioUI() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <article class="ju-card">
          <h2>Formulario</h2>
          <p>Ficha completa, con los mismos campos y el mismo trazo del panel.</p>
          <form id="demoForm" class="ju-form-grid">
            <label>
              <span>Nombre</span>
              <input name="nombre" required>
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" required>
            </label>
            <label>
              <span>Tipo</span>
              <select name="tipo">
                <option>Cliente</option>
                <option>Proveedor</option>
                <option>Alumno</option>
              </select>
            </label>
            <label>
              <span>Fecha</span>
              <input name="fecha" type="date">
            </label>
            <label>
              <span>Teléfono</span>
              <input name="telefono" type="tel">
            </label>
            <label>
              <span>Web</span>
              <input name="web" type="url" placeholder="https://">
            </label>
            <label class="ju-form-full">
              <span>Descripción</span>
              <textarea name="descripcion"></textarea>
            </label>
            <fieldset class="ju-fieldset ju-form-full">
              <strong>Preferencias</strong>
              <div class="ju-check-group">
                <label class="ju-check">
                  <input type="checkbox" name="activo">
                  <span>Activo</span>
                </label>
                <label class="ju-check">
                  <input type="radio" name="nivel" value="normal" checked>
                  <span>Normal</span>
                </label>
                <label class="ju-check">
                  <input type="radio" name="nivel" value="prioritario">
                  <span>Prioritario</span>
                </label>
              </div>
            </fieldset>
            <div class="ju-form-full ju-button-row">
              <button class="ju-btn" type="submit">Guardar</button>
              <button class="ju-btn secondary" type="reset">Limpiar</button>
            </div>
          </form>
        </article>
      `;

      DOM.uno("#demoForm").addEventListener("submit", (evento) => {
        evento.preventDefault();
        this.toast.mostrar(
          "success",
          "Formulario guardado",
          "El evento submit se ha capturado correctamente."
        );
      });
    }

    mostrarLoginDemo() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <iframe class="ju-login-frame" src="login.html" title="Opciones de acceso"></iframe>
      `;
    }

    mostrarControles() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <article class="ju-card">
          <h2>Controles</h2>
          <p>Cada pieza del formulario, aislada, con el mismo borde y el mismo foco violeta.</p>
          <form id="controlesDemo" class="ju-form-grid">
            <label>
              <span>Texto</span>
              <input name="texto" placeholder="Nombre visible">
            </label>
            <label>
              <span>Correo</span>
              <input name="correo" type="email" placeholder="nombre@ejemplo.com">
            </label>
            <label>
              <span>Número</span>
              <input name="numero" type="number" min="0" value="1">
            </label>
            <label>
              <span>Fecha</span>
              <input name="fecha" type="date">
            </label>
            <label>
              <span>Lista</span>
              <select name="lista">
                <option>Cliente</option>
                <option>Proveedor</option>
                <option>Alumno</option>
              </select>
            </label>
            <label>
              <span>Teléfono</span>
              <input name="telefono" type="tel" placeholder="600 000 000">
            </label>
            <label class="ju-form-full">
              <span>Área de texto</span>
              <textarea name="nota" placeholder="Nota interna"></textarea>
            </label>
            <fieldset class="ju-fieldset ju-form-full">
              <strong>Elección</strong>
              <div class="ju-check-group">
                <label class="ju-check">
                  <input type="checkbox" name="avisos">
                  <span>Casilla</span>
                </label>
                <label class="ju-check">
                  <input type="radio" name="estado" value="abierto" checked>
                  <span>Abierto</span>
                </label>
                <label class="ju-check">
                  <input type="radio" name="estado" value="cerrado">
                  <span>Cerrado</span>
                </label>
              </div>
            </fieldset>
          </form>
        </article>
      `;
    }

    mostrarEventos() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <article class="ju-card">
          <h2>Eventos</h2>
          <p>El escenario responde a clic, escritura, cambio y teclado sin salir del panel.</p>
          <div class="ju-showcase-grid">
            <div class="ju-showcase-box">
              <h3>Clic</h3>
              <button class="ju-btn" id="evtClic" type="button">Pulsar</button>
              <p class="ju-eco" id="evtClicCuenta">0 pulsaciones</p>
            </div>
            <div class="ju-showcase-box">
              <h3>Escritura</h3>
              <label class="ju-evento-campo">
                <span>Texto en vivo</span>
                <input id="evtTexto" placeholder="Escribe aquí">
              </label>
              <p class="ju-eco" id="evtEco">Todavía vacío</p>
            </div>
            <div class="ju-showcase-box">
              <h3>Cambio</h3>
              <label class="ju-evento-campo">
                <span>Estado</span>
                <select id="evtSelect">
                  <option value="">Elige un estado</option>
                  <option>Pendiente</option>
                  <option>En curso</option>
                  <option>Cerrado</option>
                </select>
              </label>
              <p class="ju-eco" id="evtCambio">Sin cambio</p>
            </div>
            <div class="ju-showcase-box">
              <h3>Teclado</h3>
              <p>Pulsa una tecla con esta vista abierta.</p>
              <p class="ju-eco" id="evtTecla">Ninguna tecla</p>
            </div>
          </div>
        </article>
      `;

      let pulsaciones = 0;

      DOM.uno("#evtClic", escenario).addEventListener("click", () => {
        pulsaciones += 1;
        DOM.uno("#evtClicCuenta", escenario).textContent =
          pulsaciones === 1 ? "1 pulsación" : `${pulsaciones} pulsaciones`;
      });

      DOM.uno("#evtTexto", escenario).addEventListener("input", (evento) => {
        const valor = evento.target.value.trim();
        DOM.uno("#evtEco", escenario).textContent = valor || "Todavía vacío";
      });

      DOM.uno("#evtSelect", escenario).addEventListener("change", (evento) => {
        DOM.uno("#evtCambio", escenario).textContent = evento.target.value || "Sin cambio";
      });

      this.alTecla = (evento) => {
        if (!DOM.uno("#evtTecla")) {
          document.removeEventListener("keydown", this.alTecla);
          return;
        }

        if (evento.key === "Escape" || evento.target.matches("input, textarea, select")) {
          return;
        }

        DOM.uno("#evtTecla").textContent = evento.key === " " ? "Espacio" : evento.key;
      };

      document.addEventListener("keydown", this.alTecla);
    }

    mostrarIdentidad() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <article class="ju-card">
          <h2>Identidad</h2>
          <p>Marca, tipo y color que recorren el panel ssanitax.</p>
          <div class="ju-identidad-marca">
            <span class="marca-signo" aria-hidden="true"></span>
            <div>
              <strong>ssanitax</strong>
              <span>panel</span>
            </div>
          </div>
          <p class="ju-identidad-tipo">Unbounded · 500 y 700 · carbón, papel y violeta</p>
          <div class="ju-paleta">
            <span class="tono-carbon">Carbón</span>
            <span class="tono-carbon-2">Carbón 2</span>
            <span class="tono-columna">Columna</span>
            <span class="tono-papel">Papel</span>
            <span class="tono-violeta">Violeta</span>
            <span class="tono-lavanda">Lavanda</span>
            <span class="tono-acento">Acento</span>
            <span class="tono-tinta">Tinta</span>
          </div>
        </article>
      `;
    }

    mostrarToastsDemo() {
      const escenario = DOM.uno("#escenario");

      escenario.innerHTML = `
        <article class="ju-card">
          <h2>Toast</h2>
          <p>Mensajes emergentes con autocierre y cierre manual.</p>
          <div class="ju-button-row">
            <button class="ju-btn" data-t="success">Éxito</button>
            <button class="ju-btn secondary" data-t="info">Información</button>
            <button class="ju-btn secondary" data-t="warning">Aviso</button>
            <button class="ju-btn secondary" data-t="danger">Error</button>
          </div>
        </article>
      `;

      const titulos = {
        success: "Correcto",
        info: "Información",
        warning: "Revisar",
        danger: "Error"
      };

      DOM.todos("[data-t]", escenario).forEach((boton) => {
        boton.addEventListener("click", () => {
          this.toast.mostrar(
            boton.dataset.t,
            titulos[boton.dataset.t],
            "Ejemplo de mensaje emergente de la librería."
          );
        });
      });
    }

    mostrarModalPanelesDemo() {
      const escenario = DOM.uno("#escenario");
      escenario.innerHTML = `<article class="ju-card"><h2>Modal y panel</h2><p>Dos patrones para acciones que no sustituyen el contenido del escenario.</p><div class="ju-showcase-grid"><div class="ju-showcase-box"><h3>Ventana modal</h3><p>Bloquea temporalmente la interfaz para confirmaciones, avisos o contenido focal.</p><button class="ju-btn" id="demoModal">Abrir modal</button></div><div class="ju-showcase-box"><h3>Panel lateral</h3><p>Entra desde la derecha, mantiene visible el contexto y puede redimensionarse arrastrando su borde izquierdo.</p><button class="ju-btn" id="demoDrawer">Abrir panel de creación</button></div></div></article>`;
      DOM.uno("#demoModal").addEventListener("click", () => {
        this.modal.abrir("Ejemplo de ventana modal", `<p>Esta es la ventana modal reutilizable de <strong>ssanitax</strong>.</p><p>Se puede cerrar con el botón ×, haciendo clic fuera o pulsando Escape.</p><div class="ju-button-row"><button class="ju-btn" id="modalAceptar">Aceptar</button></div>`);
        DOM.uno("#modalAceptar").addEventListener("click", () => this.modal.cerrar());
      });
      DOM.uno("#demoDrawer").addEventListener("click", () => this.drawer.abrirCrear());
    }

    activarEventos() {
      DOM.uno("#buscador").addEventListener("input", (evento) => {
        if (this.estado.seleccion !== "Listado") {
          this.estado.seleccion = "Listado";
          this.renderEntidades();
        }

        this.mostrarTabla(evento.target.value);
      });

      DOM.uno("#nuevo").addEventListener("click", () => {
        this.drawer.abrirCrear();
      });

      const escenario = DOM.uno("#escenario");

      escenario.addEventListener("dragover", (evento) => {
        evento.preventDefault();
        escenario.classList.add("drag-over");
      });

      escenario.addEventListener("dragleave", () => {
        escenario.classList.remove("drag-over");
      });

      escenario.addEventListener("drop", (evento) => {
        evento.preventDefault();
        escenario.classList.remove("drag-over");

        const vista = evento.dataTransfer.getData("text/plain");
        this.estado.seleccion = vista;
        this.renderEntidades();
        this.mostrarVista(vista);
      });

      document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
          this.drawer?.cerrar();
          this.modal?.cerrar();
        }
      });
    }
  }

  window.jocarsa.iu.DOM = DOM;
  window.jocarsa.iu.Utilidades = Utilidades;
  window.jocarsa.iu.OrigenDatos = OrigenDatos;
  window.jocarsa.iu.EstadoIU = EstadoIU;
  window.jocarsa.iu.FichaIU = FichaIU;
  window.jocarsa.iu.ToastIU = ToastIU;
  window.jocarsa.iu.ModalIU = ModalIU;
  window.jocarsa.iu.DrawerIU = DrawerIU;
  window.jocarsa.iu.GestorColumnas = GestorColumnas;
  window.jocarsa.iu.AplicacionIU = AplicacionIU;

  document.addEventListener("DOMContentLoaded", () => {
    window.jocarsa.iu.aplicacion = new AplicacionIU();
    window.jocarsa.iu.aplicacion.iniciar();
  });
})();
