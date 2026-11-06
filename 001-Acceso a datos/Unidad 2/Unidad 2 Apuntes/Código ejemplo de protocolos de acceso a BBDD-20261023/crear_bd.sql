SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS tienda;
CREATE USER IF NOT EXISTS 'alumno'@'localhost' IDENTIFIED BY 'alumno123';
GRANT ALL PRIVILEGES ON tienda.* TO 'alumno'@'localhost';
USE tienda;
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    precio DECIMAL(6,2)
);
INSERT INTO productos (nombre, precio) VALUES ('Ratón', 15.90), ('Teclado', 29.99);
