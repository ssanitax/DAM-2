# Paralelo vs distribuido (apuntes para el RA1)

## Programación concurrente

Varias tareas **en progreso a la vez** (aunque a veces compartan un solo núcleo por turnos). Ejemplo: la interfaz del navegador sigue respondiendo mientras un Worker calcula.

## Programación paralela (multinúcleo)

Varias tareas se ejecutan **a la vez de verdad** en varios núcleos **del mismo ordenador**.  
Ejemplos de clase: Web Workers, OpenMP (Saturno).  
**Esto es lo que pide el enunciado del RA1** (“utilidad multinúcleo”).

## Programación distribuida

El trabajo se reparte entre **varios ordenadores** unidos por red.  
Ejemplo de clase: maestro / esclavos con PHP + navegadores (`005-…/009-maestro_esclavos_pesado`).

## Relación con el proyecto

| Pregunta | Respuesta en este RA1 |
|----------|------------------------|
| ¿Los Workers son otros PCs? | **No.** Son hilos/procesos en el mismo PC. |
| ¿Para qué sirven? | Usar varios núcleos y no bloquear la UI. |
| ¿Dónde entra la red? | No es obligatoria aquí; sería la versión distribuida. |
