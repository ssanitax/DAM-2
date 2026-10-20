# Resultados de aprendizaje 1

**Módulo:** 0491 — Sistemas de gestión empresarial  
**Unidad:** Identificación de sistemas ERP-CRM  

## Resultado de aprendizaje

Identifica sistemas de planificación de recursos empresariales y de gestión de relaciones con clientes (ERP-CRM) reconociendo sus características y verificando la configuración del sistema informático.

## Enunciado

Explica las decisiones que has tomado con respecto al SSGG que vas a desarrollar y por qué.

---

## Criterios de evaluación

### a) Se han reconocido los diferentes sistemas ERP-CRM que existen en el mercado.

Se han reconocido ERP del mercado (SAP S/4HANA, Microsoft Dynamics 365, Oracle Fusion, NetSuite, Odoo, Sage, Infor, Workday, IFS, Acumatica, Epicor, SAP Business One, Business Central, ERPNext, Dolibarr) y verticales de reserva tipo PMS (Oracle OPERA, Mews, Cloudbeds, Amenitiz, Avirato, dataHotel, etc.).

Ese mercado se usa para situar el SSGG propio: un ERP-CRM vertical de **polideportivo** (reservas de pistas, profesores, usuarios y stock de material), no un ERP genérico ni un producto premium cerrado.

### b) Se han identificado los diferentes tipos de licencia de los sistemas ERP-CRM.

Se identifican licencias **GPL**, **Apache**, **propietaria** (binarios o suscripción) y el modelo **híbrido tipo Odoo** (community + servicios).

Para el SSGG del polideportivo se elige **GPL**, con posibilidad de community + soporte. La propietaria se descarta porque no permite estudiar ni modificar el código en el módulo.

### c) Se han comparado sistemas ERP-CRM en función de sus características y requisitos.

| Aspecto | SAP / Dynamics / Oracle | Odoo / ERPNext / Dolibarr | PMS (hoteles) | SSGG polideportivo |
|---------|-------------------------|---------------------------|---------------|--------------------|
| Coste | Alto | Bajo / freemium | SaaS variable | Desarrollo propio |
| Código | Cerrado | Abierto | Suele cerrado | Abierto (GPL) |
| Requisitos | Elevados | Linux / web / SQL | Cloud del proveedor | LAMP / laboratorio |
| Dominio | Genérico | Modular genérico | Habitación + huésped | Pista + profesor + usuario + stock |

La comparación justifica no implantar SAP/Oracle y sí un sistema propio, tomando de Odoo/Dolibarr la arquitectura abierta y del PMS el patrón reserva + cliente.

### d) Se ha identificado el sistema operativo adecuado a cada sistema ERP-CRM.

Los ERP cloud propietarios corren en el SO del proveedor; el puesto de trabajo usa navegador. Odoo, ERPNext y Dolibarr se despliegan de forma habitual en **Linux**.

En el SSGG del polideportivo: **Linux en servidor** (LAMP) y **cualquier SO con navegador** en el cliente (socios y recepción).

### e) Se ha identificado el sistema gestor de datos adecuado a cada sistema ERP-CRM.

Prioridad relacional: **SQLite** para prototipo, **MySQL/MariaDB** para despliegue y **PostgreSQL** como alternativa. MongoDB no es el núcleo, porque reservas, usuarios y stock necesitan relaciones y transacciones.

### f) Se han verificado las configuraciones del sistema operativo y del gestor de datos para garantizar la funcionalidad del ERP-CRM.

El entorno se da por válido solo si se comprueba:

- Linux actualizado, usuario de servicio, firewall y hora (NTP), necesaria para los horarios de reserva.
- Apache y PHP en marcha, con extensiones (PDO) y logs.
- Conexión a SQLite/MySQL, UTF-8, backup y transacciones.
- Prueba mínima: login, alta de pista, reserva sin solape, movimiento de stock y persistencia tras reinicio.

### g) Se han documentado las operaciones realizadas.

Quedan registradas la revisión de ERP y de PMS, la definición del dominio (polideportivo), la elección de licencia GPL, de Linux y de SQLite → MySQL, el checklist de verificación y este informe. Los apuntes del trabajo continuo están en `1.-Ejercicios`. Las decisiones del producto están en `2.-Proyecto final de unidad`.

### h) Se han documentado las incidencias producidas durante el proceso.

| Incidencia | Solución |
|------------|----------|
| No conecta a la BD | Revisar servicio y credenciales |
| Página en blanco | Revisar el log de PHP |
| Caracteres rotos | Forzar UTF-8 |
| Permiso denegado en uploads | Ajustar owner y permisos |
| Horarios de reserva desfasados | NTP y timezone de PHP |
