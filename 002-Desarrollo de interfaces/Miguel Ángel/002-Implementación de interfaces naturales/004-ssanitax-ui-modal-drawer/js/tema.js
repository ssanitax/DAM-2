/**
 * Modo día / noche. La clase va en <html> para que pinte antes del primer render.
 */
(() => {
  "use strict";

  const clave = "ssanitax-tema";
  const raiz = document.documentElement;

  const pintar = (noche) => {
    raiz.classList.toggle("modo-noche", noche);
    const boton = document.getElementById("tema");
    if (!boton) return;
    boton.setAttribute("aria-pressed", String(noche));
    boton.textContent = noche ? "Día" : "Noche";
    boton.title = noche ? "Pasar a modo día" : "Pasar a modo noche";
  };

  pintar(raiz.classList.contains("modo-noche"));

  document.getElementById("tema")?.addEventListener("click", () => {
    const noche = !raiz.classList.contains("modo-noche");
    pintar(noche);
    try {
      localStorage.setItem(clave, noche ? "noche" : "dia");
    } catch (error) {
      /* sin almacenamiento, el modo dura solo esta visita */
    }
  });

  window.addEventListener("storage", (evento) => {
    if (evento.key === clave) pintar(evento.newValue === "noche");
  });
})();
