-- Base de datos del ejercicio "Guardar los libros de una biblioteca".
-- Recrea el usuario, las tablas y los datos que guarda libros.py.
-- No borra las tablas del ejercicio de mascotas.
--
-- Cómo aplicarlo (como administrador de MySQL):
--   sudo mysql < libros.sql

CREATE DATABASE IF NOT EXISTS desfase
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'desfase'@'localhost' IDENTIFIED BY 'desfase';
ALTER USER 'desfase'@'localhost' IDENTIFIED BY 'desfase';

GRANT ALL PRIVILEGES ON desfase.* TO 'desfase'@'localhost';

FLUSH PRIVILEGES;

USE desfase;

-- La tabla hija se borra antes que la madre.
DROP TABLE IF EXISTS libros_generos;
DROP TABLE IF EXISTS libros;

CREATE TABLE libros (
    Identificador INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    paginas INT
);

CREATE TABLE libros_generos (
    Identificador INT AUTO_INCREMENT PRIMARY KEY,
    libros_id INT,
    valor VARCHAR(255),
    FOREIGN KEY (libros_id) REFERENCES libros(Identificador)
);

INSERT INTO libros (titulo, paginas) VALUES
    ('Don Quijote', 863),
    ('Platero y yo', 144),
    ('Marianela', 256);

INSERT INTO libros_generos (libros_id, valor) VALUES
    (1, 'novela'),
    (1, 'aventuras'),
    (1, 'humor'),
    (2, 'poesía'),
    (2, 'infantil'),
    (3, 'novela');

-- Reto extra: títulos cuyo género es novela.
SELECT libros.titulo
FROM libros
JOIN libros_generos ON libros.Identificador = libros_generos.libros_id
WHERE libros_generos.valor = 'novela';
