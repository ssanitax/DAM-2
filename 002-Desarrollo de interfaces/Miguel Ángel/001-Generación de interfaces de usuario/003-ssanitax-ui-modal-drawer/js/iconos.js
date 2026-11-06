/**
 * Iconos de las casillas. Cada dibujo corresponde al texto de la etiqueta.
 */
window.jocarsa = window.jocarsa || {};
window.jocarsa.iu = window.jocarsa.iu || {};

(() => {
  "use strict";

  const trazo = (contenido) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${contenido}</svg>`;

  const iconos = {
    listado: trazo(`
      <path d="M8.4 6.2h11M8.4 12h11M8.4 17.8h11"/>
      <circle cx="4.8" cy="6.2" r="1.05" fill="currentColor" stroke="none"/>
      <circle cx="4.8" cy="12" r="1.05" fill="currentColor" stroke="none"/>
      <circle cx="4.8" cy="17.8" r="1.05" fill="currentColor" stroke="none"/>
    `),
    clientes: trazo(`
      <circle cx="9" cy="8" r="2.2"/>
      <circle cx="15.2" cy="9.1" r="1.7"/>
      <path d="M4.6 17.6c.5-2.5 2.3-3.8 4.4-3.8s3.9 1.3 4.4 3.8"/>
      <path d="M13.2 14.4c1.2-.6 2.5-.5 3.6.4.8 1 1.2 2.1 1.4 2.8"/>
    `),
    productos: trazo(`
      <path d="M3.8 8.2 12 4.4l8.2 3.8L12 12.2 3.8 8.2z"/>
      <path d="M3.8 8.2V15.6L12 19.6l8.2-4V8.2"/>
      <path d="M12 12.2v7.4"/>
    `),
    pedidos: trazo(`
      <path d="M7 3.6h10.2v16.2l-1.8-1.1-1.7 1.1-1.7-1.1-1.7 1.1-1.7-1.1-1.6 1.1V3.6z"/>
      <path d="M9.2 8h5.6M9.2 11.4h5.6M9.2 14.8h3.2"/>
    `),
    configuracion: trazo(`
      <circle cx="12" cy="12" r="2.4"/>
      <path d="M12 4.2v2.1M12 17.7v2.1M4.2 12h2.1M17.7 12h2.1M6.5 6.5l1.5 1.5M16 16l1.5 1.5M17.5 6.5 16 8M8 16l-1.5 1.5"/>
    `),
    empresas: trazo(`
      <path d="M4 20.2h16"/>
      <path d="M6.2 20.2V5.2h7.6v15"/>
      <path d="M13.8 9.4h4v10.8"/>
      <path d="M8.4 8.2h2.2M8.4 11.6h2.2M8.4 15h2.2"/>
    `),
    contactos: trazo(`
      <rect x="3.8" y="5.2" width="16.4" height="13.2" rx="1.4"/>
      <circle cx="8.8" cy="10.4" r="1.6"/>
      <path d="M6.6 14.8c.4-1.4 1.2-2.1 2.2-2.1s1.8.7 2.2 2.1"/>
      <path d="M13 9.6h4.2M13 12.6h3"/>
    `),
    seguimiento: trazo(`
      <path d="M9 6.2h10.2M9 12h10.2M9 17.8h10.2"/>
      <path d="M4.4 6.4 5.7 7.7 8 5.2M4.4 12.2 5.7 13.5 8 11M4.4 18l1.3 1.3L8 16.8"/>
    `),
    formulario: trazo(`
      <path d="M7 3.6h7.2L18.2 7.6V20.4H7z"/>
      <path d="M14.2 3.6v4.2H18.2"/>
      <path d="M10 12h5M10 15.4h5"/>
    `),
    formularios: trazo(`
      <path d="M8 6.2h7.2L19 10v10.4H8z"/>
      <path d="M15.2 6.2V10H19"/>
      <path d="M5 3.6h7.2v2.2"/>
      <path d="M5 3.6v13h3"/>
      <path d="M11 13.2h4.4M11 16h4.4"/>
    `),
    "formulario completo": trazo(`
      <path d="M7 3.6h7.2L18.2 7.6V20.4H7z"/>
      <path d="M14.2 3.6v4.2H18.2"/>
      <path d="M9.6 13.2 11.2 14.8 14.8 11"/>
      <path d="M10 17h5"/>
    `),
    controles: trazo(`
      <path d="M4 7.2h16"/>
      <circle cx="9" cy="7.2" r="2"/>
      <path d="M4 12h16"/>
      <circle cx="15" cy="12" r="2"/>
      <path d="M4 16.8h16"/>
      <circle cx="11" cy="16.8" r="2"/>
    `),
    eventos: trazo(`
      <rect x="4.8" y="5.4" width="14.4" height="14.2" rx="1.4"/>
      <path d="M4.8 9.6h14.4M8.4 3.8v3.2M15.6 3.8v3.2"/>
      <path d="M12 12.2v3.4M10.3 13.9h3.4"/>
    `),
    login: trazo(`
      <circle cx="8.6" cy="12" r="3"/>
      <path d="M11.4 12H19"/>
      <path d="M16.4 9.6 19 12l-2.6 2.4"/>
    `),
    toast: trazo(`
      <path d="M5 6.2h14v8.6H9.2L6 17.6v-2.8H5z"/>
      <path d="M8.4 9.6h7.2M8.4 12.2h4.2"/>
    `),
    toasts: trazo(`
      <path d="M5 6.2h14v8.6H9.2L6 17.6v-2.8H5z"/>
      <path d="M8.4 9.6h7.2M8.4 12.2h4.2"/>
    `),
    "mensajes toast": trazo(`
      <path d="M5 6.2h14v8.6H9.2L6 17.6v-2.8H5z"/>
      <path d="M8.4 9.6h7.2M8.4 12.2h4.2"/>
    `),
    exito: trazo(`
      <circle cx="12" cy="12" r="8"/>
      <path d="M8.2 12.2 10.8 14.8 15.8 9.4"/>
    `),
    informacion: trazo(`
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 11v5"/>
      <circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>
    `),
    aviso: trazo(`
      <path d="M12 4.2 20.4 19.2H3.6z"/>
      <path d="M12 10v4"/>
      <circle cx="12" cy="16.3" r=".8" fill="currentColor" stroke="none"/>
    `),
    error: trazo(`
      <circle cx="12" cy="12" r="8"/>
      <path d="M9 9l6 6M15 9l-6 6"/>
    `),
    "modal / paneles": trazo(`
      <rect x="3.8" y="4.8" width="16.4" height="14.4" rx="1.2"/>
      <path d="M13.2 4.8v14.4M3.8 8.8h9.4"/>
    `),
    "modal y panel": trazo(`
      <rect x="3.8" y="4.8" width="16.4" height="14.4" rx="1.2"/>
      <path d="M13.2 4.8v14.4M3.8 8.8h9.4"/>
    `),
    graficos: trazo(`
      <path d="M4.2 19.2h15.6"/>
      <path d="M7.2 16.2V11"/>
      <path d="M12 16.2V7.4"/>
      <path d="M16.8 16.2V9.2"/>
    `),
    identidad: trazo(`
      <path d="M12 3.6 19.2 8v8L12 20.4 4.8 16V8z"/>
      <path d="M12 8.2v7.6M8.4 10.2 12 12l3.6-1.8"/>
    `)
  };

  window.jocarsa.iu.iconoDe = (texto) => {
    const clave = String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    return iconos[clave] || "";
  };
})();
