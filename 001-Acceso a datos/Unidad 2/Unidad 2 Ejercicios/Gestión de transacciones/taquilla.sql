-- =============================================================================
-- REGISTRO SQL — Gestión de transacciones (venta de entradas con saldo)
-- Base de datos: taquilla
--
-- Este archivo deja constancia de TODO el SQL que se ejecuta en el ejercicio:
--   1) Creación de la BD y tablas (paso 1 del .docx / phpMyAdmin)
--   2) Consultas de comprobación
--   3) Simulación del fallo SIN transacción (paso 4)
--   4) Reparación del saldo de Laura tras el fallo
--   5) Equivalente SQL de las compras CON transacción (paso 6)
--
-- Cómo usarlo:
--   - En phpMyAdmin: pestaña SQL → pegar y ejecutar por bloques
--   - O desde consola: mysql -u root < taquilla.sql
--
-- Nota: el programa real en Python es taquilla.py; aquí está el mismo SQL
--       escrito a mano para poder repetir y dejar registro.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- PASO 1. Crear la base de datos y las tablas (InnoDB = admite transacciones)
-- -----------------------------------------------------------------------------

DROP DATABASE IF EXISTS taquilla;

CREATE DATABASE taquilla;
USE taquilla;

CREATE TABLE clientes (
  id     INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50),
  saldo  INT
) ENGINE = InnoDB;

CREATE TABLE entradas (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT,
  evento     VARCHAR(50)
) ENGINE = InnoDB;

INSERT INTO clientes (nombre, saldo) VALUES
  ('Laura', 50),
  ('Marcos', 15);

-- Comprobación inicial
SELECT * FROM clientes;
SELECT * FROM entradas;


-- -----------------------------------------------------------------------------
-- PASO 4. Compra SIN transacción (demostración del problema)
-- Laura compra entrada de 20 €. El INSERT falla a propósito (tabla mal escrita).
-- Con autocommit, el UPDATE se guarda y el dinero se pierde.
-- -----------------------------------------------------------------------------

-- Restar el precio (esto SÍ se guarda si hay autocommit)
UPDATE clientes SET saldo = saldo - 20 WHERE id = 1;

-- Fallo a propósito: la tabla se llama "entradas", no "entrada"
-- (descomenta la siguiente línea solo si quieres ver el error 1146)
-- INSERT INTO entrada (cliente_id, evento) VALUES (1, 'Concierto');

-- Estado tras el fallo: Laura con 30 € y sin entrada
SELECT * FROM clientes;
SELECT * FROM entradas;

-- Reparación: devolver el dinero a Laura para continuar el ejercicio limpio
UPDATE clientes SET saldo = saldo + 20 WHERE id = 1;

SELECT * FROM clientes;  -- Laura otra vez con 50 €


-- -----------------------------------------------------------------------------
-- PASO 6a. Compra CON transacción — caso OK (Laura, 20 €, Concierto)
-- Equivalente a: comprar(1, "Concierto", 20)
-- -----------------------------------------------------------------------------

START TRANSACTION;

UPDATE clientes SET saldo = saldo - 20 WHERE id = 1;

-- Comprobación de la norma: el saldo no puede quedar negativo
SELECT saldo FROM clientes WHERE id = 1;
-- saldo = 30 → válido, seguimos

INSERT INTO entradas (cliente_id, evento) VALUES (1, 'Concierto');

COMMIT;

SELECT * FROM clientes;   -- Laura 30, Marcos 15
SELECT * FROM entradas;   -- (1, 1, 'Concierto')


-- -----------------------------------------------------------------------------
-- PASO 6b. Compra CON transacción — caso CANCELADO (Marcos, 40 €, Festival)
-- Equivalente a: comprar(2, "Festival", 40)
-- Marcos solo tiene 15 € → saldo insuficiente → ROLLBACK
-- -----------------------------------------------------------------------------

START TRANSACTION;

UPDATE clientes SET saldo = saldo - 40 WHERE id = 2;

-- Comprobación: saldo = -25 → inválido → cancelamos
SELECT saldo FROM clientes WHERE id = 2;

-- No hacemos el INSERT; deshacemos todo
ROLLBACK;

SELECT * FROM clientes;   -- Marcos sigue con 15 €
SELECT * FROM entradas;   -- solo la entrada de Laura


-- -----------------------------------------------------------------------------
-- ESTADO FINAL ESPERADO (registro de resultado)
-- -----------------------------------------------------------------------------
-- clientes:
--   1 | Laura  | 30
--   2 | Marcos | 15
--
-- entradas:
--   1 | 1 | Concierto
--
-- Para repetir el ejercicio desde cero, vuelve a ejecutar el PASO 1.
-- =============================================================================
