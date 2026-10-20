class XystusFormulario {
  constructor({contenedor, tabla, columnas, api="api/superapi.php", registro=null, clavePrimaria=null, alGuardar=null, opcionesCampo={}}) {
    this.contenedor = typeof contenedor === "string" ? document.querySelector(contenedor) : contenedor;
    this.tabla = tabla;
    this.columnas = columnas || [];
    this.api = api;
    this.registro = registro;
    this.clavePrimaria = clavePrimaria;
    this.alGuardar = alGuardar;
    this.opcionesCampo = opcionesCampo;
    this.formulario = null;
  }

  tipoInput(columna) {
    const nombre = (columna.name || "").toLowerCase();
    const tipo = (columna.type || "").toUpperCase();
    if (this.opcionesCampo[nombre]) return "select";
    if (nombre.includes("email")) return "email";
    if (nombre.includes("telefono") || nombre.includes("teléfono")) return "tel";
    if (nombre.includes("url") || nombre.includes("web")) return "url";
    if (nombre.startsWith("fecha") || nombre.endsWith("_fecha") || nombre === "fecha" || tipo.includes("DATE")) return "date";
    if (nombre.includes("hora")) return "time";
    if (nombre.includes("password") || nombre.includes("clave")) return "password";
    if (tipo.includes("INT") || tipo.includes("REAL") || tipo.includes("NUM") ||
        tipo.includes("DECIMAL") || tipo.includes("FLOAT") || tipo.includes("DOUBLE") ||
        nombre.includes("precio") || nombre.includes("cantidad") || nombre.includes("tarifa") ||
        nombre.includes("total") || nombre.endsWith("_id")) return "number";
    if (nombre.includes("notas") || nombre.includes("descripcion") || nombre.includes("observ")) return "textarea";
    return "text";
  }

  crearControl(columna, valor) {
    const control = document.createElement("div");
    control.className = "control";

    const label = document.createElement("label");
    label.textContent = columna.name;
    label.htmlFor = "campo_" + columna.name;

    const tipo = this.tipoInput(columna);
    let input;

    if (tipo === "select") {
      input = document.createElement("select");
      input.appendChild(new Option("— elegir —", ""));
      this.opcionesCampo[columna.name.toLowerCase()].forEach(op => {
        if (Array.isArray(op)) input.appendChild(new Option(op[1], op[0]));
        else input.appendChild(new Option(op, op));
      });
      if (valor !== undefined && valor !== null && valor !== "") input.value = String(valor);
    } else if (tipo === "textarea") {
      input = document.createElement("textarea");
      input.value = valor ?? "";
    } else {
      input = document.createElement("input");
      input.type = tipo;
      if (tipo === "number") input.step = "any";
      input.value = valor ?? "";
      input.placeholder = columna.name;
    }

    input.name = columna.name;
    input.id = "campo_" + columna.name;
    if (columna.notnull) input.required = true;

    control.append(label, input);
    return control;
  }

  render() {
    this.contenedor.innerHTML = "";
    const editando = this.registro !== null;

    const titulo = document.createElement("h3");
    titulo.textContent = editando ? "Editar registro" : "Nuevo registro";
    this.contenedor.appendChild(titulo);

    const form = document.createElement("form");
    form.className = "componente-formulario";

    this.columnas.forEach(columna => {
      if (columna.pk || columna.name === "id") return;
      const valor = editando ? (this.registro[columna.name] ?? "") : "";
      form.appendChild(this.crearControl(columna, valor));
    });

    const boton = document.createElement("button");
    boton.type = "submit";
    boton.textContent = editando ? "Guardar cambios" : "Guardar";
    form.appendChild(boton);

    form.addEventListener("submit", async evento => {
      try {
        await this.guardar(evento);
      } catch (error) {
        if (typeof avisar === "function") avisar(error.message);
        else alert(error.message);
      }
    });
    this.contenedor.appendChild(form);
    this.formulario = form;

    const primero = form.querySelector("input,select,textarea");
    if (primero) primero.focus();
    return form;
  }

  async guardar(evento) {
    evento.preventDefault();
    if (!this.formulario.checkValidity()) {
      this.formulario.reportValidity();
      throw new Error("Revisa los campos del formulario");
    }

    const datos = Object.fromEntries(new FormData(this.formulario).entries());
    const editando = this.registro !== null;
    const cuerpo = editando
      ? {tabla: this.tabla, id: this.registro[this.clavePrimaria], datos}
      : {tabla: this.tabla, datos};

    const respuesta = await fetch(this.api + "?ruta=" + (editando ? "actualizar" : "crear"), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(cuerpo)
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok || resultado.ok === false) {
      throw new Error(resultado.error || "No se pudo guardar el registro");
    }

    this.formulario.reset();
    if (this.alGuardar) await this.alGuardar(resultado);
  }
}
