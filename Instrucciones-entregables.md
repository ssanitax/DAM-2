# Instrucciones de entregables

## Instrucciones generales de entrega

Al finalizar cada una de las unidades didácticas, el alumno debe realizar un **proyecto práctico** en el que demuestre el conocimiento adquirido durante la unidad y sus subunidades.

El proyecto presentado debe cumplir las siguientes condiciones:

1. Debe respetar el enunciado del **Resultado de Aprendizaje**, y debe estar alineado con los **criterios de evaluación** que se contienen en ese resultado de aprendizaje, en aquellos criterios que hayan sido cubiertos en las clases mediante ejercicios prácticos.
2. Debe estar en consonancia con los desarrollos/proyectos/ejercicios desarrollados en las clases.
3. Lo que se entrega es un **informe markdown** del proyecto, generado con la herramienta **jocarsa | documentación** — el informe debe excluir carpetas como librerías de Python o modules de Node.js.
4. La extensión del proyecto debe estar también en consonancia con el proyecto/ejercicios desarrollados durante la unidad.

### Uso responsable de la Inteligencia Artificial

Por otra parte, las entregas deben hacer un **uso responsable de la Inteligencia Artificial**:

- Cualquier proyecto en el que se aprecie que se ha usado la IA para **potenciar el trabajo intelectual del humano**, será premiado.
- Cualquier proyecto en el que se aprecie que el alumno ha usado la IA para **realizar el proyecto en lugar del propio alumno**, se considerará como uso fraudulento, conduciendo a suspender la asignatura y concurrir a las convocatorias ordinaria/extraordinaria.

---

Hola a todos:

Recordatorio de cómo entregar las actividades:

## 1.- Trabajo continuo

Se supone que en las clases, o en casa, o cuando vayáis pudiendo (GitHub, apuntes) vais trabajando poco a poco en las unidades y subunidades. Vais haciendo vuestro proyecto. Vais practicando.

Importante: guardáis incrementales. Hacéis lo mismo que yo. Lo tenéis todo en carpetas, numerado, ordenado, organizado.

Eso es la **parte 1: Ejercicios**.

## 2.- Vuestro proyecto final de unidad

Se supone que con todo lo que habéis aprendido durante una unidad hacéis un proyecto personal vuestro para ponerlo en práctica. Guardáis incrementales.

Si usáis IA, primero vosotros trabajáis a mano, y luego usáis la IA para aumentar vuestro trabajo. Dejáis constancia: guardáis tanto los incrementales de vuestro trabajo como los incrementales de la IA.

Eso es la **parte 2: Ejercicio final de unidad**.

## 3.- Resultados de aprendizaje

Yo os proporciono el enunciado de las preguntas. Está en [formacion.jocarsa.com](https://formacion.jocarsa.com). Copiáis las preguntas (criterios de evaluación). Respondéis a las preguntas. Guardáis preguntas y respuestas en un archivo markdown.

Eso es la **parte 3: Resultados de aprendizaje**.

## 4.- Estructura de la carpeta de entrega

Lo metéis todo en una carpeta:

```
Carpeta entrega unidad X
├── 1.-Ejercicios
├── 2.-Proyecto final de unidad
└── 3.-Resultados de aprendizaje
```

## Prompt para entregas y documentación

Plantilla reutilizable (adaptar `{contexto_apuntes}` y `{enunciado_usuario}`):

```
SISTEMA: Tutor de DAM-1 de élite. Alumno con media de 9,7.

[CONTEXTO Y ESTILO]:
{contexto_apuntes}

[ENUNCIADO A RESOLVER]:
{enunciado_usuario}

ESTRUCTURA DE SALIDA:

1. INTRODUCCIÓN TÉCNICA:
   - Definición del concepto (Herencia/Composición) y su importancia en POO.

2. DESARROLLO Y EXPLICACIÓN DEL CÓDIGO (PROCESADO POR OLLAMA):
   - Explica paso a paso la estructura del código que se muestra en la siguiente sección.
   - Describe por qué Ollama ha decidido crear cada clase (ej. Persona como superclase) y qué función cumple cada método solicitado (ej. dameDatos).
   - Justifica la lógica de las instancias y el flujo de la información.

3. IMPLEMENTACIÓN PRÁCTICA:
   - Bloque de código Python completo, funcional y riguroso.
   - Usa obligatoriamente los nombres del enunciado: Persona, Profesor, Alumno, dameDatos().
   - Sin librerías externas, variables en español y comentarios limpios.

4. CONCLUSIÓN:
   - Resumen de beneficios y conexión con otros módulos.
```
