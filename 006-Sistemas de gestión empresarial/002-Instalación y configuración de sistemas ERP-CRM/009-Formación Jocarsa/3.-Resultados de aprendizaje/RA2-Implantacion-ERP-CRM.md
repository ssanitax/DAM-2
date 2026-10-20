# Resultados de aprendizaje 2

**Módulo:** 0491 — Sistemas de gestión empresarial  
**Unidad:** Instalación y configuración de sistemas ERP-CRM  

## Resultado de aprendizaje

Implanta sistemas ERP-CRM interpretando la documentación técnica e identificando las diferentes opciones y módulos.

## Enunciado

Entregar un SGE propio con la misma extensión que hemos llegado al final de la unidad, incluyendo lo trabajado en las subunidades. Explicar instalación, configuración, módulos y porqués.

---

## Criterios de evaluación

### a) Se han identificado los módulos que componen el ERP-CRM.

El SSGG de esta unidad se llama **Xystus** (el pórtico cubierto de los gimnasios grecorromanos). En el tema 1 dejé el dominio en polideportivo y aquí el nombre ya está cerrado.

Separo núcleo, módulos y utilidades. El cliente (HTML/CSS/JS) habla con PHP por `fetch`. La API está en `api/`, los datos en `data/xystus.db` y los servicios de acceso en `servicios/`.

Módulos del menú (áreas funcionales, no son las tablas):

| Módulo | Para qué |
|--------|----------|
| actividad | Reservas y uso de pistas |
| socios | Usuarios / CRM |
| personal | Profesores |
| almacen | Stock y proveedores |

Las entidades salen de SQLite: `usuarios`, `pistas`, `profesores`, `stock`, `reservas`, `lineasreserva`, `proveedores`.

Al principio puse módulos con los mismos nombres que las tablas y se veía todo duplicado en las dos columnas. Por eso el menú de módulos lleva nombres de área y el de entidades, los de la BD.

### b) Se han realizado diferentes tipos de instalaciones.

Los incrementales van en `1.-Ejercicios` (`001-Xystus` … `017-Xystus`):

- Interfaz cliente sola.
- API con JSON y luego paso a SQLite.
- Instalador (`instalador.html` + `api/instalar.php`) a partir de un modelo de datos en texto.
- Configuración con `data/config.php`.
- Servicios de entrada/salida.
- Al final, lectura de tablas y CRUD.

El entorno de lab es Linux + Apache + PHP con SQLite3, con el proyecto bajo `/var/www/html`.

### c) Se han configurado los módulos instalados.

La config está en `data/config.php`. No solo nombre y color: también eslogan, color de acento y margen, porque si no hay que tocar el CSS a mano cada vez.

En Xystus uso pórfido `#4B2E4F`, oro viejo `#E6C36A` y fondo mármol `#F3EEE4`. El `codigo.js` lee el JSON y aplica las variables CSS.

### d) Se han realizado instalaciones adaptadas a las necesidades planteadas en diferentes supuestos.

El supuesto es el polideportivo del tema 1. El esquema y el demo SQL van de pistas, socios, monitores y material.

El instalador permite recrear tablas si cambia el modelo. En el proyecto final (`2.-Proyecto final de unidad/Xystus`) dejo el estado CRUD, que es hasta donde he llegado en esta unidad.

Decisiones que he tomado: arquitectura cliente/servidor con PHP y SQLite para prototipar, módulos con nombres del dominio, más parámetros en la config, y al pinchar una entidad se carga esa tabla (no una sola tabla fija).

### e) Se ha verificado el funcionamiento del ERP-CRM.

Compruebo:

- Que carga el `index` y salen módulos y entidades.
- Que al elegir una entidad se listan filas del demo.
- Que el CRUD crea, edita y borra y se queda guardado en `xystus.db`.
- Que `servicios/salida.php` saca el JSON de la base.
- Que el instalador genera tablas desde el modelo.

Si la tabla sale vacía, casi siempre es caché del navegador (Ctrl+F5) o la `.db` sin haber cargado el `demo.sql`.

### f) Se han documentado las operaciones realizadas y las incidencias.

Operaciones: los incrementales de `1.-Ejercicios`, el SGE en `2.-Proyecto final de unidad/Xystus` y este archivo. El informe markdown de entrega se genera con la herramienta de documentación al empaquetar la entrega (no hace falta dejarlo dentro del proyecto).

| Incidencia | Qué hice |
|------------|----------|
| PHP sin SQLite | Instalar `php-sqlite3` y reiniciar Apache |
| Página en blanco | Mirar el `error.log` de PHP |
| En CLI no abre la BD | La ruta `../data/` está pensada para Apache. Probar en el navegador |
| Dos columnas con lo mismo | Separar nombres de módulos y de tablas |
| Una versión intermedia con tablas que no eran del polideportivo | Dejar el esquema de Xystus y regenerar la `.db` |

---

## Conclusión

En esta unidad he implantado **Xystus** como SGE del polideportivo: cliente y servidor separados, API en PHP, SQLite para prototipar e instalador a partir de un modelo de datos.

He dejado incrementales de cada parte (interfaz, módulos, instalación, configuración, servicios y CRUD) y un proyecto final usable. Los módulos del menú son áreas de negocio y las entidades son las tablas de la base. Con `config.php` puedo cambiar nombre, colores y márgenes sin tocar el CSS a mano.

Al cerrar la unidad el sistema se puede instalar, configurar, consultar y editar (alta, modificación y baja), que es el alcance que pedía este RA2.
