SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS biblioteca;
CREATE USER IF NOT EXISTS 'lector'@'localhost' IDENTIFIED BY 'lector123';
GRANT ALL PRIVILEGES ON biblioteca.* TO 'lector'@'localhost';
USE biblioteca;
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(50)
);
INSERT INTO libros (titulo, autor) VALUES
    ('El Quijote', 'Cervantes'),
    ('La Regenta', 'Clarín'),
    ('Niebla', 'Unamuno');
