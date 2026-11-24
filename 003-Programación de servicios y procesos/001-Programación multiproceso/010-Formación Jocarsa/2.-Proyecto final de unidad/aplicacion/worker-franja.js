/*
  Worker de UNA franja (una franja = un subproceso).

  IDEA DEL EJERCICIO (no son los "bichitos" de clase):
  - Hay PERSONAS (pocas, visibles) que caminan.
  - El mapa se parte en franjas horizontales.
  - Cada worker solo mueve/contagia a la gente de SU franja.
  - Si alguien cruza el borde → se lo mandamos al maestro → al worker vecino
    (eso es la SINCRONIZACIÓN / compartir info entre procesos).

  Estados de cada persona:
    0 = sano
    1 = infectado
    2 = recuperado
*/

const SANO = 0;
const INFECTADO = 1;
const RECUPERADO = 2;

let id = -1;
let yMin = 0;      // borde superior de esta franja (mundo)
let yMax = 0;      // borde inferior (excluido)
let mundoW = 0;
let mundoH = 0;
let personas = []; // { id, x, y, vx, vy, estado, dias }
let params = {
  radioContagio: 14,
  probContagio: 0.35,
  diasEnfermo: 40,
  velocidad: 1.2
};

function aleatorio(a, b) {
  return a + Math.random() * (b - a);
}

function simularTick() {
  const t0 = performance.now();
  const radio = params.radioContagio;
  const radio2 = radio * radio;
  const migrantesArriba = [];
  const migrantesAbajo = [];
  const siguen = [];

  // 1) Mover
  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    p.x += p.vx * params.velocidad;
    p.y += p.vy * params.velocidad;

    // Rebote en paredes izquierda/derecha
    if (p.x < 4) { p.x = 4; p.vx = Math.abs(p.vx); }
    if (p.x > mundoW - 4) { p.x = mundoW - 4; p.vx = -Math.abs(p.vx); }

    // Pequeño cambio de dirección (paseo)
    if (Math.random() < 0.02) {
      const ang = Math.random() * Math.PI * 2;
      const vel = aleatorio(0.4, 1.0);
      p.vx = Math.cos(ang) * vel;
      p.vy = Math.sin(ang) * vel;
    }
  }

  // 2) Contagio solo entre personas de ESTA franja
  //    (las del borde se contagian cuando el vecino las recibe / en ticks siguientes)
  for (let i = 0; i < personas.length; i++) {
    const a = personas[i];
    if (a.estado !== INFECTADO) continue;
    a.dias++;
    if (a.dias >= params.diasEnfermo) {
      a.estado = RECUPERADO;
      continue;
    }
    for (let j = 0; j < personas.length; j++) {
      if (i === j) continue;
      const b = personas[j];
      if (b.estado !== SANO) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (dx * dx + dy * dy <= radio2) {
        if (Math.random() < params.probContagio) {
          b.estado = INFECTADO;
          b.dias = 0;
        }
      }
    }
  }

  // 3) ¿Se salió de la franja? → migrante (el maestro lo pasa al worker vecino)
  let sanos = 0, infectados = 0, recuperados = 0;
  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    if (p.estado === SANO) sanos++;
    else if (p.estado === INFECTADO) infectados++;
    else recuperados++;

    if (p.y < yMin) {
      migrantesArriba.push(p);
    } else if (p.y >= yMax) {
      migrantesAbajo.push(p);
    } else {
      siguen.push(p);
    }
  }
  personas = siguen;

  return {
    id,
    personas: personas,
    migrantesArriba,
    migrantesAbajo,
    stats: { sanos, infectados, recuperados, total: sanos + infectados + recuperados },
    tiempoMs: performance.now() - t0
  };
}

self.onmessage = function (ev) {
  const msg = ev.data;

  if (msg.tipo === "init") {
    id = msg.id;
    yMin = msg.yMin;
    yMax = msg.yMax;
    mundoW = msg.mundoW;
    mundoH = msg.mundoH;
    params = Object.assign(params, msg.params || {});
    personas = msg.personas || [];
    self.postMessage({ tipo: "listo", id, cuantas: personas.length });
    return;
  }

  if (msg.tipo === "params") {
    params = Object.assign(params, msg.params || {});
    return;
  }

  if (msg.tipo === "tick") {
    // Personas que el maestro nos manda desde la franja vecina
    if (msg.entrantes && msg.entrantes.length) {
      for (let i = 0; i < msg.entrantes.length; i++) {
        const p = msg.entrantes[i];
        // Clampear dentro de la franja al entrar
        if (p.y < yMin) p.y = yMin + 1;
        if (p.y >= yMax) p.y = yMax - 1;
        personas.push(p);
      }
    }
    // Infectar a la persona más cercana a un clic
    if (msg.infectarEn) {
      const { x, y } = msg.infectarEn;
      let mejor = -1;
      let mejorD = 1e12;
      for (let i = 0; i < personas.length; i++) {
        const p = personas[i];
        const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < mejorD) { mejorD = d; mejor = i; }
      }
      if (mejor >= 0 && mejorD < 40 * 40) {
        personas[mejor].estado = INFECTADO;
        personas[mejor].dias = 0;
      }
    }

    const r = simularTick();
    self.postMessage({ tipo: "tickResultado", ...r });
  }
};
