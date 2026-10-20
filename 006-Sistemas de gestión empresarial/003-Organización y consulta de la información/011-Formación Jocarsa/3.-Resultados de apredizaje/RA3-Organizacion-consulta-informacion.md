# Resultados de aprendizaje 3

**Módulo:** 0491 — Sistemas de gestión empresarial  
**Unidad:** Organización y consulta de la información  

## Resultado de aprendizaje

Realiza operaciones de gestión, consulta y análisis de la información siguiendo las especificaciones de diseño y utilizando las herramientas proporcionadas por los sistemas ERP-CRM.

## Enunciado

Programar y avanzar el ERP propio con características similares a las trabajadas en clase. Debe incluir lo visto en la unidad y, como siempre:

1. Extensiones visuales  
2. Extensiones funcionales  

(Si en clase hay tres tipos de gráfica, aquí hay más. Si el ejemplo de exportación es CSV, aquí también HTML y Markdown.)

Entrega en `2.-Proyecto final de unidad/Xystus`.

---

## Criterios de evaluación

### a) Se han utilizado herramientas y lenguajes de consulta y manipulación de datos proporcionados por los sistemas ERP-CRM.

En **ssanitax | Xystus** la manipulación va por la API PHP (`api/superapi.php`) contra SQLite (`data/xystus.db`). El cliente pide entidades, lee tablas, crea, actualiza y elimina con JSON. Los listados se pueden filtrar en pantalla.

### b) Se han generado formularios.

`nucleo/formulario.js` monta el alta y la edición a partir de las columnas de cada tabla. Omite la clave primaria, usa tipos razonables (fecha, número, correo, desplegables de estado, abono, deporte, etc.) y guarda por `fetch` a la API.

### c) Se han generado informes.

El botón Reporting abre un informe general tipo A4 con todas las tablas, filtros por columna, ordenación, sumas y promedios en campos numéricos, e impresión / PDF del navegador.

### d) Se han exportado datos e informes.

En cada listado y en cada bloque del reporting se puede exportar a **CSV**, **HTML** y **Markdown** (solo las filas visibles cuando hay filtros). El CSV usa punto y coma, UTF-8 con BOM.

### e) Se han automatizado las extracciones de datos mediante procesos.

En Reporting, **Exportar todo CSV** recorre todas las entidades y descarga un CSV por tabla en secuencia. Es el proceso de extracción masiva sin hacerlo tabla a tabla a mano.

### f) Se ha verificado el rendimiento del sistema ERP-CRM.

En el Dashboard se mide el tiempo de carga de las entidades (en ms) y se muestra junto al total de registros. Sirve para comprobar que la consulta masiva responde en tiempos aceptables en el entorno de laboratorio.

### g) Se han documentado las operaciones realizadas y las incidencias observadas.

Las operaciones quedan descritas en este RA3 y en la evolución de `1.-Ejercicios` (interfaces, informes, gráficos, extracción). Incidencias que sí vi al avanzar:

- Si los módulos del menú se llaman igual que las tablas, las dos columnas se ven duplicadas. Por eso el menú lleva áreas (`actividad`, `socios`, `personal`, `almacen`) y el otro, entidades reales.
- En reporting hay que exportar solo las filas filtradas, no el conjunto completo sin mirar.
- La base demo hay que regenerarla tras cambiar `schema.sql` / `demo.sql`, si no la interfaz habla de tablas o filas que no existen.

### h) Se ha obtenido información relevante a partir de los datos procesados.

El Dashboard resume ingresos de reservas, socios, ocupación de pistas y varias gráficas (anillo, tarta, barras y línea) con datos reales: reservas por estado, socios por deporte, ingresos por día, abonos, etc. Eso es la parte de análisis sobre la información ya cargada.

### Extensiones respecto a clase

| Tipo | Qué añadí |
|------|-----------|
| Visual | Cuatro tipos de gráfica SVG (anillo, tarta, barras, línea) y dashboard con KPIs |
| Funcional | Exportación CSV + HTML + MD, y proceso de exportación de todas las tablas |

### Conclusión

El proyecto final de la unidad deja gestionar, consultar, informar, exportar y analizar la información del polideportivo con las herramientas del propio SGE, que es lo que pide este RA3.
