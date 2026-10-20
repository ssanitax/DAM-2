# Decisiones del SSGG
 
**Unidad:** Identificación de sistemas ERP-CRM  
**Enunciado:** Explica las decisiones que has tomado con respecto al SSGG que vas a desarrollar y por qué.

---

## 1. Qué SSGG voy a desarrollar

El SSGG será un sistema de gestión para un **polideportivo**. No es un ERP genérico vacío: es un **ERP-CRM vertical** de instalaciones deportivas.

**Módulos del producto:**

| Módulo | Función | Encaje ERP / CRM |
|--------|---------|------------------|
| Reservas de pistas | Disponibilidad, horarios, solapes | Planificación de recursos (ERP) |
| Profesores | Asignación a clases / reservas con monitor | Recursos / personal (ERP) |
| Usuarios que reservan | Socios/clientes, historial de uso | Relación con el cliente (CRM) |
| Stock de material | Raquetas, balones, redes, etc. | Inventario (ERP) |

El nombre comercial del producto **aún no está decidido**; lo importante en esta unidad es identificar el dominio, el mercado, la licencia, el SO, la BD y cómo se verifica y documenta el entorno.

Cliente objetivo: polideportivos municipales o privados (instalación única o pocas sedes), alcance realista para la asignatura (producto + web corporativa/comercial).

---

## 2. Reconocimiento del mercado

A partir de los ejercicios de clase se han reconocido sistemas ERP-CRM existentes:

**ERP revisados:** SAP S/4HANA, Microsoft Dynamics 365, Oracle Fusion Cloud ERP, Oracle NetSuite, Odoo, Sage, Infor CloudSuite, Workday, IFS Cloud, Acumatica, Epicor Kinetic, SAP Business One, Dynamics 365 Business Central, ERPNext, Dolibarr.

**CRM / verticales de reserva (PMS):** Oracle OPERA Cloud, Mews, Cloudbeds, Amenitiz, RoomRaccoon, Avirato, dataHotel y el resto del listado de la subunidad 004.

Ese reconocimiento alimenta la decisión. Los ERP generales muestran el mercado; los PMS muestran el patrón **reserva de un recurso + gestión del usuario**, que en el polideportivo se traduce en **pista + socio** (y además profesores y stock).

---

## 3. Comparación por características y requisitos

| Aspecto | SAP / Dynamics / Oracle | Odoo / ERPNext / Dolibarr | Vertical PMS (hoteles) | SSGG polideportivo (decisión) |
|---------|-------------------------|---------------------------|------------------------|-------------------------------|
| Coste | Alto | Bajo / freemium | Variable (SaaS) | Desarrollo propio académico |
| Código | Cerrado | Abierto | Suele cerrado | Abierto (ver licencia) |
| Requisitos | Elevados | Medios (Linux/web/SQL) | Cloud del proveedor | Bajos: LAMP / laboratorio |
| Dominio | Genérico o vertical caro | Modular genérico | Habitaciones + huésped | **Pistas + profesores + usuarios + stock** |
| Personalización | Limitada / cara | Alta | Según API/contrato | Total en el dominio |

**Decisión:** no implantar un ERP propietario premium como producto del alumno. Sí usar open source (Odoo, ERPNext, Dolibarr) como referencia de arquitectura/licencia, y el PMS como analogía funcional de reservas. El SSGG propio acota el dominio al polideportivo.

---

## 4. Licencia del SSGG

Tipos de licencia identificados en clase: **GPL**, **Apache**, **propietaria** e **híbrida tipo Odoo** (community + servicios/enterprise).

| Opción | Qué implica para este proyecto |
|--------|--------------------------------|
| Propietaria | Binarios o SaaS; no se estudia el código → descartada para el producto propio |
| Apache | Permisiva; válida para componentes |
| GPL | Software libre; derivados suelen heredar GPL |
| Modelo Odoo | Community abierta + monetización por servicios |

**Decisión:** licencia **GPL** para el SSGG, con un modelo posible de community + soporte/servicios (inspirado en Odoo). Motivo: transparencia en clase, posibilidad de modificar y demostrar el sistema, y coherencia con una futura web comercial.

---

## 5. Sistema operativo

| Sistema / capa | SO adecuado | Motivo |
|----------------|-------------|--------|
| ERP cloud propietarios | SO del proveedor (cloud) | El cliente solo usa navegador |
| Odoo / ERPNext / Dolibarr | Linux en servidor | Despliegue habitual documentado |
| Cliente de cualquier ERP-CRM web | Windows / macOS / Linux | Basta un navegador moderno |
| **SSGG polideportivo (servidor)** | **Linux** | Stack LAMP de clase, estable y gratuito |
| **SSGG polideportivo (cliente)** | Cualquier SO + navegador | Socios y recepción sin instalable |

**Decisión:** servidor Linux; puestos de trabajo multiplataforma vía interfaz web (HTML/CSS/JS).

---

## 6. Sistema gestor de datos

| Prioridad (apuntes) | SGBD | Uso en el SSGG |
|---------------------|------|----------------|
| 1 — Relacional | SQLite | Prototipo en laboratorio |
| 1 — Relacional | MySQL / MariaDB | Despliegue / demo (LAMP) |
| 1 — Relacional | PostgreSQL | Alternativa si se prioriza integridad |
| 2 — Documental | MongoDB | No como núcleo (reservas/stock son relacionales) |
| 3 — A medida | Capas propias | Solo si hiciera falta abstraer más |

**Decisión:** prototipar con **SQLite** y pasar a **MySQL/MariaDB** cuando el entorno lo permita. Una reserva enlaza usuario, pista, profesor (opcional) y material: necesita claves foráneas y transacciones.

---

## 7. Arquitectura y configuración a verificar

Arquitectura alineada con las subunidades 006–007:

```
[Navegador: HTML + CSS + JS]
            |
         HTTP/HTTPS
            |
[Servidor Linux: Apache + PHP]
            |
   [SQLite / MySQL-MariaDB]
```

**Verificación** (sin ella el entorno no se da por válido):

| Área | Comprobaciones |
|------|----------------|
| SO | Linux actualizado, usuario de servicio, firewall, NTP (horarios de reserva) |
| Web / runtime | Apache arranca, PHP responde, extensiones (PDO…), logs |
| BD | Conexión, UTF-8, backup restaurable, transacciones básicas |
| Funcionalidad mínima | Login por rol, alta de pista, reserva sin solape, movimiento de stock, persistencia tras reinicio |

Cada comprobación deja evidencia (fecha, OK/KO, captura o salida).

---

## 8. Operaciones documentadas

Operaciones del proceso de identificación (plantilla: fecha, entorno, pasos, resultado esperado/obtenido, evidencias):

| Operación | Resultado |
|-----------|-----------|
| Revisar ERP del mercado | Catálogo y clasificación (subunidad 002) |
| Revisar verticales CRM/PMS | Analogía habitación→pista, huésped→socio (004) |
| Definir dominio del SSGG | Polideportivo: pistas, profesores, usuarios, stock |
| Elegir licencia | GPL + enfoque community/servicios |
| Elegir SO y SGBD | Linux; SQLite → MySQL/MariaDB |
| Definir checklist de verificación | Comprobaciones de SO, web, BD y humo |
| Redactar este informe | Decisiones del SSGG |

---

## 9. Incidencias documentadas

Incidencias de laboratorio registradas durante la preparación del entorno:

| Incidencia | Causa habitual | Solución | Prevención |
|------------|----------------|----------|------------|
| No conecta a la BD | Servicio parado / credenciales | Revisar servicio y config | Checklist pre-arranque |
| Página en blanco | Error PHP no mostrado | Revisar `error.log` | Logs activos en lab |
| Caracteres rotos (ñ) | Charset incorrecto | Forzar UTF-8 | Plantilla de creación de BD |
| Permiso denegado en uploads | Owner/grupo | Ajustar permisos | Usuario de servicio documentado |
| Horarios de reserva desfasados | Zona horaria / reloj | NTP + timezone PHP | Incluir timezone en verificación |

---

## 10. Uso responsable de IA

- Trabajo continuo (`001`–`009`): apuntes y decisiones de clase / a mano.  
- Este informe: ordenación y ampliación del trabajo en clase.  
- En este caso ha reforzado la redacción del informe.

---

## 11. Conclusión

El SSGG a desarrollar es la **gestión de un polideportivo** (reservas de pistas, profesores, usuarios y stock de material): un ERP-CRM vertical. Se elige tras reconocer y comparar el mercado, con licencia **GPL**, servidor **Linux** y cliente web, datos **SQL** (SQLite → MySQL), verificación del stack y documentación de operaciones e incidencias.
