# Proyecto final de unidad — Personas por franjas

**Módulo:** 0490 — Programación de servicios y procesos  
**Unidad:** Programación multiproceso  
**RA1:** Desarrolla aplicaciones compuestas por varios procesos reconociendo y aplicando principios de programación paralela.

## Enunciado (literal)

> Programa una aplicación que use de alguna forma que tenga sentido y utilidad multinúcleo (workers, OpenMP, etc).

---

## 1. Qué he desarrollado

Una simulación de **personas caminando** en un mapa dividido en **franjas horizontales**.

- Cada punto = una persona (sano / infectado / recuperado).
- Cada franja la calcula un **Web Worker** distinto (**varios procesos/hilos de trabajo**).
- Si una persona cruza la línea amarilla, el **maestro** (página) se la pasa al worker vecino.

No es el demo de los “bichitos” de clase (miles de puntos para saturar CPU). Aquí hay pocas personas visibles para demostrar **programación paralela**: reparto de trabajo + sincronización + valor devuelto por cada subproceso.

## 2. Sentido y utilidad multinúcleo (lo que pide el enunciado)

| Sin workers (1 hilo) | Con N workers (multinúcleo) |
|----------------------|-----------------------------|
| Movimiento + contagio en el hilo de la UI | Cada franja en **paralelo** en otro worker |
| La página puede ir a tirones | La UI sigue respondiendo (concurrencia) |
| Un solo bloque de trabajo | El SO puede usar **varios núcleos** |
| No hay frontera que sincronizar | Migrantes + barrera → criterios f, g, h |

El contagio no es decoración: es la **carga de CPU útil** que justifica partir el mapa. El cruce de franja obliga a **compartir información** entre subprocesos (si no, la persona “desaparecería” del sistema).

## 3. Arquitectura

```
[Navegador — hilo principal / MAESTRO]
   |  new Worker × N
   |  postMessage (tick, entrantes, clic)
   |  barrera: espera N respuestas
   v
[Worker 0: franja superior] ... [Worker N-1: franja inferior]
   |  mueven personas, contagio por radio
   |  si y sale de la franja → migrante
   v
[Maestro reparte migrantes y pinta]
```

**Código:** carpeta `aplicacion/`

| Archivo | Rol |
|---------|-----|
| `index.html` | Maestro: UI, pool, barrera, pintura, monitor |
| `worker-franja.js` | Esclavo: una franja (mover, contagiar, migrar) |

## 4. Cómo ejecutarlo

```bash
cd "2.-Proyecto final de unidad/aplicacion"
python3 -m http.server 8765
```

Abrir http://localhost:8765/

(Los Workers no cargan de forma fiable con `file://`.)

## 5. Prueba recomendada (evidencia)

1. **4 workers** + Play → líneas amarillas, contador de migraciones > 0.
2. **1 worker** → una sola franja; mismo modelo, sin traspaso entre procesos.
3. Clic cerca de una persona o “Infectar 1 al azar” → contagio si otro entra en el radio (círculo rojo).
4. Monitor: tiempos distintos por worker; HUD con “Barrera sync”.

## 6. Decisiones técnicas

| Decisión | Motivo |
|----------|--------|
| Web Workers (no OpenMP) | Encaja con el hilo del módulo en JS/HTML y con las prácticas 001–005 |
| Franjas horizontales | Partición espacial clara; el borde es el punto de sync |
| Personas (agentes), no rejilla llena | Se ve quién cruza y quién contagia; el alumno entiende el RA |
| Barrera por tick | Obtener el valor devuelto por todos los subprocesos antes de seguir |
| Paralelo en un PC (no red) | Cumple “multinúcleo”; lo distribuido ya se vio aparte en clase |
