# Resultados de aprendizaje 1

**Módulo:** 0490 — Programación de servicios y procesos  
**Unidad:** Programación multiproceso  
**Publicación / plazo:** 17/11/2026 – 24/11/2026  

## Resultado de aprendizaje

Desarrolla aplicaciones compuestas por varios procesos reconociendo y aplicando principios de programación paralela.

## Enunciado (literal)

> Programa una aplicación que use de alguna forma que tenga sentido y utilidad multinúcleo (workers, OpenMP, etc).

### Cómo se cumple el enunciado

| Exigencia del enunciado | Respuesta en la entrega |
|-------------------------|-------------------------|
| Una **aplicación** | Simulador web en `2.-Proyecto final de unidad/aplicacion/` |
| Uso **multinúcleo** | Varios **Web Workers** (uno por franja del mapa) |
| Que tenga **sentido y utilidad** | El trabajo (mover personas + contagio) se **parte** entre núcleos; la UI no se bloquea; hay que **sincronizar** cuando alguien cruza de franja |
| Workers / OpenMP / etc. | Se eligen **Workers** (línea del módulo en HTML/JS; misma familia que las prácticas 001–005). OpenMP se usó en clase (ud. 007) como alternativa C++ |

No es “crear workers por crearlos”: sin partición en franjas el contagio y el movimiento serían un solo hilo; con N workers el SO puede ejecutar esas tareas en paralelo y el maestro coordina el resultado.

---

## Criterios de evaluación

### a) Se han reconocido las características de la programación concurrente y sus ámbitos de aplicación.

**Reconocido en teoría:** la programación concurrente permite que varias tareas estén *en progreso* a la vez (pueden intercalarse en un núcleo o ejecutarse en varios). Características: independencia relativa de tareas, necesidad de coordinación, riesgo de condiciones de carrera si se comparte estado sin control.

**Ámbitos de aplicación** (relacionados con lo visto en clase y con este proyecto):

- Interfaces interactivas que no deben congelarse (navegador, juegos, simulaciones).
- Procesado de imagen / datos por trozos.
- Servidores que atienden varias peticiones.

**En la aplicación:** el hilo de la página (eventos, canvas, botones) corre **a la vez** que los workers calculan. Play/Pausa/clic siguen respondiendo → ámbito *simulación interactiva concurrente*.

### b) Se han identificado las diferencias entre programación paralela y programación distribuida, sus ventajas e inconvenientes.

| | **Paralela** | **Distribuida** |
|--|--------------|-----------------|
| Definición | Varias tareas a la vez en **un mismo equipo** (varios núcleos) | Varias tareas en **varios equipos** unidos por red |
| Ejemplo en clase | Web Workers, OpenMP (Saturno) | Maestro/esclavos PHP + navegadores (ud. 005) |
| Ventajas | Baja latencia, sin red, más simple de desplegar | Escala añadiendo máquinas |
| Inconvenientes | Límite = CPU/RAM de ese PC; hay que sincronizar memoria/mensajes locales | Latencia de red, fallos parciales, despliegue y seguridad más complejos |

**Decisión del proyecto:** se aplica **programación paralela multinúcleo** (Workers en un PC), que es exactamente lo que pide el enunciado. Lo distribuido se identifica y se diferencia (apunte `1.-Ejercicios/001-Paralelo-vs-distribuido.md`), pero no sustituye al multinúcleo.

### c) Se han analizado las características de los procesos y de su ejecución por el sistema operativo.

**Analizado:**

- Un **proceso** es un programa en ejecución con su espacio de memoria y ciclo de vida (listo, en ejecución, bloqueado, terminado), planificado por el SO.
- El navegador es un proceso (o conjunto de procesos); dentro, el motor crea **workers** que el SO puede asignar a distintos núcleos.
- Características relevantes aquí: aislamiento (el worker no toca el DOM), comunicación explícita por mensajes, finalización con `terminate()` al reiniciar el pool.

**En la aplicación:** al cambiar el nº de workers se destruyen y recrean subprocesos (`terminate` + `new Worker`); el monitor refleja el tiempo que el SO les dedica por tick.

### d) Se han caracterizado los hilos de ejecución y descrito su relación con los procesos.

**Caracterización:**

| Elemento | Rol |
|----------|-----|
| Proceso del navegador | Contenedor de la aplicación |
| Hilo principal | UI, pintura, **maestro** que crea y sincroniza workers |
| Hilos Worker | Cálculo de una franja; **sin** acceso al DOM |

**Relación hilo–proceso:** los hilos viven dentro del proceso; comparten el proceso pero en Workers el estado compartido útil se transmite por mensajes (no variables globales del DOM). Documentado en `1.-Ejercicios/002-Workers-procesos-e-hilos.md`.

### e) Se han utilizado clases para programar aplicaciones que crean subprocesos.

Se utiliza la **clase / API `Worker`** del navegador para crear subprocesos de trabajo:

```js
const worker = new Worker("worker-franja.js");
```

- Creación del pool en `reiniciar()` (`aplicacion/index.html`).
- Número configurable (1–8).
- Destrucción ordenada con `worker.terminate()` al reiniciar.

(Equivalente pedagógico a usar clases de creación de procesos/hilos en otros lenguajes del módulo; en este hilo de prácticas el mecanismo visto es Worker.)

### f) Se han utilizado mecanismos para compartir información con los subprocesos iniciados.

Mecanismo: **`postMessage` / `onmessage`** (y `self.postMessage` en el worker).

| Dirección | Información compartida |
|-----------|------------------------|
| Maestro → worker | `init`: personas de la franja, `yMin`/`yMax`, tamaño del mundo, parámetros |
| Maestro → worker | `tick`: migrantes entrantes, punto de infección por clic |
| Maestro → worker | `params`: radio, probabilidad, días enfermo, velocidad |
| Worker → maestro | Personas actualizadas, migrantes, estadísticas, `tiempoMs` |

Así se cumple “compartir información con los subprocesos iniciados” sin memoria compartida del DOM.

### g) Se han utilizado mecanismos para sincronizar y obtener el valor devuelto por los subprocesos iniciados.

1. **Sincronización (barrera):** el maestro pone `pendientes = N`, decrementa con cada `tickResultado` y solo continúa cuando `pendientes === 0`.
2. **Valor devuelto:** cada worker responde con personas, `migrantesArriba` / `migrantesAbajo`, `stats` y `tiempoMs`.
3. **Sincronización de dominio:** tras la barrera, el maestro **reparte migrantes** al worker de la franja vecina (quien cruza la línea amarilla cambia de subproceso).

Sin esa barrera, se pintarían franjas de ticks distintos (estado incoherente).

### h) Se han desarrollado aplicaciones que gestionen y utilicen procesos para la ejecución de varias tareas en paralelo.

Aplicación entregada: **Personas por franjas**.

- **Gestión:** crear, parametrizar, reiniciar y terminar el pool de workers.
- **Uso en paralelo:** en cada tick, las N franjas ejecutan movimiento + contagio **a la vez**.
- **Utilidad multinúcleo:** más workers = más trozos de mapa calculados en paralelo; el HUD/monitor permiten observar CPU por worker y tiempo de sync.

Archivos: `aplicacion/index.html`, `aplicacion/worker-franja.js`.  
Descripción: `2.-Proyecto final de unidad/001-Descripcion-del-proyecto.md`.

### i) Se han depurado y documentado las aplicaciones desarrolladas.

**Documentación**

| Ubicación | Contenido |
|-----------|-----------|
| `1.-Ejercicios/` | Concurrente / paralelo / distribuido; procesos e hilos |
| `2.-Proyecto final de unidad/001-Descripcion-del-proyecto.md` | Enunciado, arquitectura, prueba |
| `3.-Resultados de aprendizaje/RA1-Programacion-multiproceso.md` | Este informe (criterios a–i) |
| Comentarios en el código | Rol maestro/esclavo, barrera, migraciones |
| `README.md` | Índice de la entrega y cómo ejecutar |

**Depuración (incidencias)**

| Incidencia | Causa | Solución |
|------------|-------|----------|
| Rejilla llena: “todo se toca”, no se veía el RA | Modelo poco didáctico | Personas visibles + franjas |
| “¿Los workers son otros PCs?” | Confundir paralelo y distribuido | Criterio b + apunte en ejercicios |
| Clic/brote se perdía | Mensaje durante un tick en curso | Aplicar infección en el mensaje del tick |
| Workers no cargan | Abrir como `file://` | `python3 -m http.server` |
| Contagio imperceptible | Ticks demasiado rápidos | Control “Retraso tick (ms)” |

---

## Evidencia rápida de prueba

1. Abrir `aplicacion/` con servidor local.  
2. 4 workers + Play → migraciones > 0, monitor con N líneas.  
3. 1 worker → una franja, mismo modelo.  
4. Infectar por clic → contagio solo a distancia (radio).  
5. Revisar este documento frente a los criterios a–i.
