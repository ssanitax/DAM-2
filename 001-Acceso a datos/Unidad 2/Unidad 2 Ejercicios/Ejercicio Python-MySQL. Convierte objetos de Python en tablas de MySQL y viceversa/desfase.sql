-- Base de datos del ejercicio "Guardar las mascotas de una clínica".
-- Recrea el entorno para poder ejecutar mascotas.py.
--
-- Cómo aplicarlo (como administrador de MySQL):
--   sudo mysql < desfase.sql
--
-- Incluye el usuario, las tablas y los datos que guarda mascotas.py.

CREATE DATABASE IF NOT EXISTS desfase
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'desfase'@'localhost' IDENTIFIED BY 'desfase';
ALTER USER 'desfase'@'localhost' IDENTIFIED BY 'desfase';

GRANT ALL PRIVILEGES ON desfase.* TO 'desfase'@'localhost';

FLUSH PRIVILEGES;

USE desfase;

-- La tabla hija se borra antes que la madre.
DROP TABLE IF EXISTS mascotas_vacunas;
DROP TABLE IF EXISTS mascotas;

CREATE TABLE mascotas (
    Identificador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    edad INT
);

CREATE TABLE mascotas_vacunas (
    Identificador INT AUTO_INCREMENT PRIMARY KEY,
    mascotas_id INT,
    valor VARCHAR(255),
    FOREIGN KEY (mascotas_id) REFERENCES mascotas(Identificador)
);

INSERT INTO mascotas (nombre, edad) VALUES
    ('Toby', 3),
    ('Luna', 5);

INSERT INTO mascotas_vacunas (mascotas_id, valor) VALUES
    (1, 'rabia'),
    (1, 'moquillo'),
    (2, 'rabia');
