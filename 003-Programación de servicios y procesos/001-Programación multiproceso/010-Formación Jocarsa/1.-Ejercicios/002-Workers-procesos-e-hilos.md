# Workers, procesos e hilos

## Proceso

Programa en ejecución gestionado por el sistema operativo (memoria propia, PID, estados).

## Hilo

Unidad de ejecución dentro de un proceso. Varios hilos pueden compartir memoria del proceso.

## Web Worker (en el navegador)

- Se crea con `new Worker("archivo.js")`.
- Corre en paralelo al hilo de la página (el que pinta el DOM).
- **No** tiene acceso al DOM; se comunica con `postMessage` / `onmessage`.
- En la práctica del RA1 cada Worker es un “esclavo” que calcula **una franja** del mapa.

## Qué se comparte y cómo se sincroniza

| Mecanismo | Uso en el proyecto |
|-----------|--------------------|
| `postMessage` | Enviar personas, parámetros, clics, migrantes |
| Barrera en el maestro | Esperar a que contesten los N workers antes del siguiente tick |
| Cola de migrantes | Persona que cruza de franja → pasa al worker vecino |

## Monitorización

El panel lateral muestra **ms por worker** y el HUD muestra tiempo de barrera y migraciones, en la línea de la unidad de gestión / monitorización de procesos.
