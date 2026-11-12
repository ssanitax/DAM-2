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

  /**
   * UD2 · interfaces naturales dentro del panel.
   * Voz a texto y texto a voz (Web Speech API) más lenguaje natural
   * contra el modelo local phi4-mini, a través de ollama.php.
   */
  class MarkdownIU {
    static escapar(texto) {
      return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    static inline(texto) {
      return MarkdownIU.escapar(texto)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>");
    }

    static normalizar(texto) {
      return String(texto || "")
        .replace(/\r/g, "")
        .replace(/[｜¦│]/g, "|")
        .replace(/[‐‑‒–—−]/g, "-")
        .replace(/\u00a0/g, " ");
    }

    static celdas(linea) {
      return linea.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((celda) => celda.trim());
    }

    static esFila(linea) {
      return linea.includes("|") && MarkdownIU.celdas(linea).length >= 2;
    }

    static esSeparador(linea) {
      return MarkdownIU.esFila(linea) && MarkdownIU.celdas(linea).every((celda) => /^:?-{2,}:?$/.test(celda.replace(/\s+/g, "")));
    }

    static convertir(markdown) {
      let md = MarkdownIU.normalizar(markdown).trim();
      md = md.replace(/```(?:markdown|md)\s*\n([\s\S]*?)```/gi, (_, cuerpo) => cuerpo.trim());
      md = md.replace(/```(?:text|txt)?\s*\n([\s\S]*?)```/gi, (todo, _idioma, cuerpo) => {
        const lineas = cuerpo.split("\n").filter((linea) => linea.trim());
        return lineas.length >= 2 && MarkdownIU.esFila(lineas[0]) && MarkdownIU.esSeparador(lineas[1]) ? cuerpo : todo;
      });

      const bloques = [];
      md = md.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, cuerpo) => `@@CODIGO${bloques.push(cuerpo) - 1}@@`);

      const lineas = md.split("\n");
      const html = [];
      let i = 0;

      while (i < lineas.length) {
        const linea = lineas[i];
        let coincidencia;

        if (MarkdownIU.esFila(linea) && MarkdownIU.esSeparador(lineas[i + 1] || "")) {
          const cabecera = MarkdownIU.celdas(linea);
          const filas = [];
          i += 2;
          while (i < lineas.length && lineas[i].trim() && MarkdownIU.esFila(lineas[i])) {
            filas.push(MarkdownIU.celdas(lineas[i]));
            i += 1;
          }
          html.push(`<div class="sx-ia-tabla"><table><thead><tr>${cabecera.map((celda) => `<th>${MarkdownIU.inline(celda)}</th>`).join("")}</tr></thead><tbody>${filas.map((fila) => `<tr>${cabecera.map((_, indice) => `<td>${MarkdownIU.inline(fila[indice] || "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
          continue;
        }

        if (/^\s*[-*]\s+/.test(linea) || /^\s*\d+\.\s+/.test(linea)) {
          const ordenada = /^\s*\d+\.\s+/.test(linea);
          const patron = ordenada ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
          const elementos = [];
          while (i < lineas.length && patron.test(lineas[i])) {
            elementos.push(`<li>${MarkdownIU.inline(lineas[i].replace(patron, ""))}</li>`);
            i += 1;
          }
          html.push(ordenada ? `<ol>${elementos.join("")}</ol>` : `<ul>${elementos.join("")}</ul>`);
          continue;
        }

        if ((coincidencia = linea.match(/^(#{1,3})\s+(.+)/))) {
          const nivel = coincidencia[1].length + 1;
          html.push(`<h${nivel}>${MarkdownIU.inline(coincidencia[2])}</h${nivel}>`);
        } else if ((coincidencia = linea.match(/^>\s?(.*)/))) {
          html.push(`<blockquote>${MarkdownIU.inline(coincidencia[1])}</blockquote>`);
        } else if ((coincidencia = linea.trim().match(/^@@CODIGO(\d+)@@$/))) {
          html.push(`<pre><code>${MarkdownIU.escapar(bloques[coincidencia[1]])}</code></pre>`);
        } else if (linea.trim()) {
          html.push(`<p>${MarkdownIU.inline(linea)}</p>`);
        }
        i += 1;
      }

      return html.join("\n");
    }

    static aTextoPlano(markdown) {
      return String(markdown || "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/[#*_>`~|-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  class VozIU {
    constructor(idioma = "es-ES") {
      this.idioma = idioma;
      this.Reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.reconocimiento = null;
      this.sesion = 0;
      if (this.puedeHablar) speechSynthesis.getVoices();
    }

    get puedeEscuchar() {
      return Boolean(this.Reconocimiento);
    }

    get puedeHablar() {
      return "speechSynthesis" in window;
    }

    detener() {
      this.sesion += 1;
      try {
        this.reconocimiento?.stop();
      } catch (error) {
        /* el reconocimiento ya estaba parado */
      }
    }

    escuchar({ continuo = false, alEmpezar, alResultado, alParcial, alError, alTerminar }) {
      if (!this.puedeEscuchar) {
        alError?.("not-supported");
        return;
      }

      this.detener();
      const sesion = this.sesion;
      const reconocimiento = new this.Reconocimiento();
      this.reconocimiento = reconocimiento;
      reconocimiento.lang = this.idioma;
      reconocimiento.continuous = continuo;
      reconocimiento.interimResults = Boolean(continuo);

      const arrancar = () => {
        if (sesion !== this.sesion) return;
        try {
          reconocimiento.start();
        } catch (error) {
          setTimeout(() => {
            if (sesion !== this.sesion) return;
            try {
              reconocimiento.start();
            } catch (reintento) {
              alError?.("aborted");
            }
          }, 300);
        }
      };

      let procesado = 0;
      reconocimiento.addEventListener("start", () => alEmpezar?.());
      reconocimiento.addEventListener("result", (evento) => {
        let parcial = "";
        for (let indice = 0; indice < evento.results.length; indice += 1) {
          const resultado = evento.results[indice];
          const texto = resultado[0].transcript;
          if (resultado.isFinal) {
            if (indice >= procesado) {
              procesado = indice + 1;
              if (texto.trim()) alResultado?.(texto.trim());
            }
          } else {
            parcial += texto;
          }
        }
        if (parcial.trim()) alParcial?.(parcial.trim());
      });
      reconocimiento.addEventListener("error", (evento) => {
        if (evento.error === "aborted" || evento.error === "no-speech") return;
        this.sesion += 1;
        alError?.(evento.error);
      });
      reconocimiento.addEventListener("end", () => {
        if (sesion !== this.sesion) return;
        if (continuo) {
          arrancar();
          return;
        }
        alTerminar?.();
      });

      arrancar();
    }

    hablar(texto) {
      if (!this.puedeHablar || !texto) return;
      const lanzar = () => {
        speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(String(texto).slice(0, 800));
        mensaje.lang = this.idioma;
        const voces = speechSynthesis.getVoices();
        const voz = voces.find((item) => item.lang === this.idioma)
          || voces.find((item) => item.lang?.toLowerCase().startsWith("es"));
        if (voz) mensaje.voice = voz;
        speechSynthesis.speak(mensaje);
      };
      if (speechSynthesis.getVoices().length) lanzar();
      else speechSynthesis.addEventListener("voiceschanged", lanzar, { once: true });
    }

    callar() {
      if (this.puedeHablar) speechSynthesis.cancel();
    }
  }

  /**
   * Comandos por voz y dictado. Si la frase encaja, actúa sobre el panel
   * y devuelve la confirmación para el chat. Si no, devuelve null y el
   * asistente se la pasa al modelo local.
   */
  class ComandosVozIU {
    constructor(aplicacion, voz) {
      this.app = aplicacion;
      this.voz = voz;
    }

    parar() {
      this.voz.detener();
    }

    insertar(campo, texto) {
      const inicio = campo.selectionStart ?? campo.value.length;
      const fin = campo.selectionEnd ?? campo.value.length;
      const antes = campo.value.slice(0, inicio);
      const despues = campo.value.slice(fin);
      const separador = antes && !/\s$/.test(antes) ? " " : "";
      const pieza = separador + texto;
      campo.value = antes + pieza + despues;
      const cursor = (antes + pieza).length;
      campo.setSelectionRange?.(cursor, cursor);
      campo.dispatchEvent(new Event("input", { bubbles: true }));
      campo.focus();
    }

    normalizar(texto) {
      return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[¿?¡!.,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    interpretar(frase) {
      const texto = this.normalizar(frase);
      if (!texto) return null;

      if (/^(ayuda|comandos|que puedo decir)$/.test(texto)) {
        return "Puedes decir: abrir gráficos, formulario, listado, controles, eventos, toast, modal, login o identidad. Ir a clientes, productos, pedidos o configuración. Nuevo cliente. Buscar y un nombre. Limpiar búsqueda. Modo noche o modo día. Cerrar. Si un campo del formulario tiene el foco, el micrófono dicta ahí.";
      }
      if (/^(modo noche|modo oscuro|pon la noche|activa la noche)$/.test(texto)) {
        this.app.ponerTema(true);
        return "Modo noche activado.";
      }
      if (/^(modo dia|modo claro|pon el dia|activa el dia)$/.test(texto)) {
        this.app.ponerTema(false);
        return "Modo día activado.";
      }
      if (/^(cambiar tema|alternar tema|cambia el tema)$/.test(texto)) {
        DOM.uno("#tema")?.click();
        return "He cambiado el tema.";
      }
      if (/^(cerrar|cierra|cerrar panel|cerrar modal|cierra el panel|cierra la ventana)$/.test(texto)) {
        this.app.drawer?.cerrar();
        this.app.modal?.cerrar();
        this.voz.callar();
        return "Cierro lo que estaba abierto.";
      }
      if (/^(nuevo|crear|nuevo cliente|crear cliente|anadir cliente|anadir)$/.test(texto)) {
        this.app.drawer.abrirCrear();
        return "Abro el formulario de un cliente nuevo.";
      }
      if (/^(limpiar busqueda|quitar filtro|borrar busqueda|limpia la busqueda)$/.test(texto)) {
        this.app.buscar("");
        return "He quitado el filtro.";
      }

      let coincidencia = texto.match(/^(?:buscar|busca|filtra|filtrar)(?: por| a)?\s+(.+)$/);
      if (coincidencia) {
        const cola = frase.trim().replace(/^(?:buscar|busca|filtra|filtrar)(?:\s+por|\s+a)?\s+/i, "");
        this.app.buscar(cola);
        return `Busco «${cola}».`;
      }

      const destino = texto.replace(/^(?:ir a|abre|abrir|muestra|mostrar|ver|ve a|cambia a)\s+/, "");
      const vistas = [
        ["listado", "Listado"],
        ["tabla", "Listado"],
        ["graficos", "Gráficos"],
        ["grafico", "Gráficos"],
        ["dashboard", "Gráficos"],
        ["tablero", "Gráficos"],
        ["formulario", "Formulario"],
        ["controles", "Controles"],
        ["eventos", "Eventos"],
        ["toast", "Toast"],
        ["avisos", "Toast"],
        ["notificaciones", "Toast"],
        ["modal y panel", "Modal y panel"],
        ["modal", "Modal y panel"],
        ["panel", "Modal y panel"],
        ["login", "Login"],
        ["acceso", "Login"],
        ["identidad", "Identidad"],
        ["marca", "Identidad"]
      ];
      const vista = vistas.find(([clave]) => destino === clave);
      if (vista) {
        this.app.irAVista(vista[1]);
        return `Abro ${vista[1]}.`;
      }

      const modulo = this.app.estado.menu.find((item) => this.normalizar(item.texto) === destino);
      if (modulo) {
        this.app.seleccionarModulo(modulo.texto);
        return `Estás en ${modulo.texto}.`;
      }

      return null;
    }
  }

  class AsistenteIU {
    constructor(aplicacion, voz) {
      this.app = aplicacion;
      this.voz = voz;
      this.enviando = false;
      this.historial = [];
      this.ventana = DOM.uno("#sxAsistente");
      this.cabeza = DOM.uno("#sxAsistenteBarra");
      this.chat = DOM.uno("#sxAsistenteChat");
      this.formulario = DOM.uno("#sxAsistenteForm");
      this.entrada = DOM.uno("#sxAsistenteEntrada");
      this.microfono = DOM.uno("#sxAsistenteMicro");
      this.enviar = DOM.uno("#sxAsistenteEnviar");
      this.hablar = DOM.uno("#sxAsistenteHablar");
      this.estado = DOM.uno("#sxAsistenteEstado");
      this.minimizar = DOM.uno("#sxAsistenteMinimizar");
    }

    activar() {
      this.formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        this.preguntar();
      });
      this.entrada.addEventListener("input", () => this.ajustarAltura());
      this.entrada.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter" && !evento.shiftKey) {
          evento.preventDefault();
          this.preguntar();
        }
      });
      this.hablar.addEventListener("click", () => this.alternarVoz());
      this.minimizar.addEventListener("click", (evento) => {
        evento.stopPropagation();
        this.alternarMinimizado();
      });
      this.cabeza.addEventListener("click", () => {
        if (this.ventana.classList.contains("minimizado")) this.alternarMinimizado();
      });

      if (this.voz.puedeEscuchar) {
        this.microfono.addEventListener("click", () => this.dictar());
      } else {
        this.microfono.disabled = true;
        this.microfono.title = "Este navegador no reconoce voz. Usa Chrome o Edge.";
        this.avisar("Sin reconocimiento de voz");
      }
      if (!this.voz.puedeHablar) {
        this.hablar.disabled = true;
        this.hablar.classList.remove("activo");
        this.hablar.setAttribute("aria-pressed", "false");
      }
    }

    get vozActiva() {
      return this.hablar.classList.contains("activo");
    }

    alternarVoz() {
      const activa = this.hablar.classList.toggle("activo");
      this.hablar.setAttribute("aria-pressed", String(activa));
      this.hablar.title = activa ? "Responde en voz alta" : "Respuesta en silencio";
      if (!activa) this.voz.callar();
    }

    dictar() {
      if (this.enviando) return;
      this.voz.escuchar({
        continuo: false,
        alEmpezar: () => {
          this.microfono.classList.add("escuchando");
          this.avisar("Escuchando…");
          this.entrada.value = "";
        },
        alParcial: (texto) => {
          this.entrada.value = texto;
          this.ajustarAltura();
        },
        alResultado: (texto) => this.alOir(texto),
        alError: (error) => {
          this.avisar(error === "not-allowed" ? "Permiso de micrófono denegado" : "No se ha podido oír");
          this.app.toast.mostrar("warning", "Asistente", this.estado.textContent);
        },
        alTerminar: () => {
          this.microfono.classList.remove("escuchando");
          if (this.estado.textContent === "Escuchando…") this.avisar("phi4-mini · en línea");
        }
      });
    }

    alOir(texto) {
      const campo = this.campoAjeno();
      if (campo) {
        this.app.comandos.insertar(campo, texto);
        this.entrada.value = "";
        this.ajustarAltura();
        this.decir(texto, `He dictado «${texto}» en el campo activo.`);
        return;
      }
      const local = this.app.comandos.interpretar(texto);
      if (local) {
        this.entrada.value = "";
        this.ajustarAltura();
        this.decir(texto, local);
        return;
      }
      this.preguntar(texto);
    }

    campoAjeno() {
      const activo = document.activeElement;
      if (!activo || activo === this.entrada || activo.closest("#sxAsistente")) return null;
      const editable = activo.matches("input, textarea")
        && !activo.disabled
        && !activo.readOnly
        && !activo.matches("[type=checkbox], [type=radio], [type=button], [type=submit], [type=file], [type=range], [type=color]");
      return editable ? activo : null;
    }

    decir(usuario, respuesta) {
      this.pintarTurno(usuario, true);
      this.pintarTurno(`<p>${MarkdownIU.escapar(respuesta)}</p>`, false);
      this.historial.push({ role: "user", content: usuario }, { role: "assistant", content: respuesta });
      if (this.historial.length > 16) this.historial = this.historial.slice(-16);
      if (this.vozActiva) this.voz.hablar(respuesta);
    }

    async preguntar(textoForzado) {
      const texto = (textoForzado ?? this.entrada.value).trim();
      if (!texto || this.enviando) return;

      if (this.ventana.classList.contains("minimizado")) this.alternarMinimizado();
      this.entrada.value = "";
      this.ajustarAltura();

      // Los comandos locales siguen abriendo el panel; el tono guarro lo pone el servidor si va por IA.
      const local = this.app.comandos.interpretar(texto);
      if (local) {
        this.decir(texto, `${local} Y para ti mi cola.`);
        return;
      }

      this.ocupado(true);
      this.pintarTurno(texto, true);
      const espera = this.pintarEspera();

      try {
        const respuesta = await fetch("ollama.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensaje: texto,
            historial: this.historial,
            contexto: this.contexto(),
            usadas: this.historial.filter((t) => t.role === "assistant").map((t) => t.content).slice(-12)
          })
        });
        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) throw new Error(datos.respuesta || `HTTP ${respuesta.status}`);
        const contenido = datos.respuesta || "No he podido responder.";
        this.aplicarAcciones(datos.acciones || []);
        this.historial.push({ role: "user", content: texto }, { role: "assistant", content: contenido });
        if (this.historial.length > 16) this.historial = this.historial.slice(-16);
        espera.remove();
        this.pintarTurno(MarkdownIU.convertir(contenido), false);
        if (this.vozActiva) this.voz.hablar(MarkdownIU.aTextoPlano(contenido));
        this.avisar(`${datos.modelo || "phi4-mini"} · en línea`);
      } catch (error) {
        console.error(error);
        espera.remove();
        this.pintarTurno("<p>No llego a Ollama. Comprueba que el servicio está en marcha y que abres el panel con PHP.</p>", false);
        this.avisar("Sin conexión con Ollama");
      } finally {
        this.ocupado(false);
        this.entrada.focus();
      }
    }

    contexto() {
      const registros = this.app.estado.clientes?.registros || [];
      const modulo = DOM.uno("#navegacion a.activo .etiqueta")?.textContent || "Clientes";
      return {
        modulo,
        vista: this.app.estado.seleccion,
        tema: document.documentElement.classList.contains("modo-noche") ? "noche" : "dia",
        totalClientes: registros.length,
        nombres: registros.map((r) => `${r.nombre || ""} ${r.apellidos || ""}`.trim()).filter(Boolean),
        empresas: [...new Set(registros.map((r) => r.empresa).filter(Boolean))],
        modulos: (this.app.estado.menu || []).map((m) => m.texto),
        vistas: (this.app.estado.entidades || []).map((e) => e.texto),
        columnas: (this.app.estado.clientes?.columnas || []).map((c) => c.etiqueta || c.campo),
        acciones: [
          "vista=Listado|Gráficos|Formulario|Controles|Eventos|Toast|Modal y panel|Login|Identidad",
          "modulo=Clientes|Productos|Pedidos|Configuración",
          "buscar=texto",
          "nuevo=1",
          "tema=noche|dia|alternar",
          "cerrar=1"
        ],
        comoUsar: "El usuario puede pedirte abrir vistas, buscar clientes, crear uno nuevo, cambiar tema o cerrar paneles. Tu respuesta puede ejecutar eso."
      };
    }

    aplicarAcciones(acciones) {
      if (!Array.isArray(acciones)) return;
      acciones.forEach((accion) => {
        const tipo = String(accion?.tipo || "").toLowerCase();
        const valor = accion?.valor ?? "";
        if (tipo === "vista") this.app.irAVista(String(valor));
        else if (tipo === "modulo") this.app.seleccionarModulo(String(valor));
        else if (tipo === "buscar") this.app.buscar(String(valor));
        else if (tipo === "nuevo") this.app.drawer?.abrirCrear();
        else if (tipo === "cerrar") {
          this.app.drawer?.cerrar();
          this.app.modal?.cerrar();
        } else if (tipo === "tema") {
          if (valor === "noche") this.app.ponerTema(true);
          else if (valor === "dia") this.app.ponerTema(false);
          else DOM.uno("#tema")?.click();
        }
      });
    }

    pintarTurno(contenido, esUsuario) {
      const fila = document.createElement("div");
      fila.className = `sx-msg ${esUsuario ? "sx-msg-usuario" : "sx-msg-bot"}`;
      fila.innerHTML = `<div class="sx-msg-burbuja">${esUsuario ? `<p>${MarkdownIU.escapar(contenido)}</p>` : contenido}</div>`;
      this.chat.appendChild(fila);
      this.chat.scrollTop = this.chat.scrollHeight;
      return fila;
    }

    pintarEspera() {
      const fila = this.pintarTurno("<p>…</p>", false);
      fila.classList.add("sx-msg-escribiendo");
      return fila;
    }

    ocupado(valor) {
      this.enviando = valor;
      this.enviar.disabled = valor;
      this.microfono.disabled = valor || !this.voz.puedeEscuchar;
      this.ventana.classList.toggle("ocupado", valor);
      if (valor) this.avisar("Escribiendo…");
    }

    avisar(texto) {
      this.estado.textContent = texto;
    }

    ajustarAltura() {
      this.entrada.style.height = "auto";
      this.entrada.style.height = `${Math.min(this.entrada.scrollHeight, 110)}px`;
    }

    alternarMinimizado() {
      const cerrada = this.ventana.classList.toggle("minimizado");
      this.minimizar.title = cerrada ? "Abrir chat" : "Cerrar chat";
      this.minimizar.setAttribute("aria-label", cerrada ? "Abrir chat" : "Cerrar chat");
      if (!cerrada) this.entrada.focus();
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
        this.voz = new VozIU("es-ES");
        this.comandos = new ComandosVozIU(this, this.voz);
        this.asistente = new AsistenteIU(this, this.voz);
        this.renderMenu();
        this.renderEntidades();
        this.mostrarTabla();
        this.columnas.activar();
        this.activarEventos();
        this.asistente.activar();
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
          this.voz?.detener();
          this.voz?.callar();
          this.asistente?.microfono.classList.remove("escuchando");
          if (this.asistente && !this.asistente.enviando) {
            this.asistente.avisar("phi4-mini · en línea");
          }
        }
      });
    }

    irAVista(vista) {
      const existe = this.estado.entidades.some((item) => item.texto === vista);
      if (!existe) return false;
      this.estado.seleccion = vista;
      this.renderEntidades();
      this.mostrarVista(vista);
      return true;
    }

    seleccionarModulo(texto) {
      const indice = this.estado.menu.findIndex((item) => item.texto === texto);
      if (indice < 0) return false;
      DOM.todos("#navegacion a").forEach((item) => {
        item.classList.toggle("activo", Number(item.dataset.indice) === indice);
      });
      DOM.uno("#buscador").placeholder = `Buscar en ${texto.toLowerCase()}…`;
      this.estado.seleccion = "Listado";
      this.renderEntidades();
      this.mostrarTabla(DOM.uno("#buscador").value);
      return true;
    }

    buscar(texto) {
      this.estado.seleccion = "Listado";
      this.renderEntidades();
      const buscador = DOM.uno("#buscador");
      buscador.value = texto;
      this.mostrarTabla(texto);
    }

    ponerTema(noche) {
      const actual = document.documentElement.classList.contains("modo-noche");
      if (actual !== noche) DOM.uno("#tema")?.click();
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
  window.jocarsa.iu.MarkdownIU = MarkdownIU;
  window.jocarsa.iu.VozIU = VozIU;
  window.jocarsa.iu.ComandosVozIU = ComandosVozIU;
  window.jocarsa.iu.AsistenteIU = AsistenteIU;
  window.jocarsa.iu.AplicacionIU = AplicacionIU;

  document.addEventListener("DOMContentLoaded", () => {
    window.jocarsa.iu.aplicacion = new AplicacionIU();
    window.jocarsa.iu.aplicacion.iniciar();
  });
})();
