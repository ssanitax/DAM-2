-- =============================================================================
-- PRÁCTICA: Biblioteca con procedimientos almacenados y Python
-- Archivo SQL completo (pasos 1, 2, 3, 5, 6 y 7 del enunciado)
-- Ejecutar en MySQL Workbench o: mysql -u root -p < biblioteca.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASO 1. Crear la base de datos y la tabla
-- Objetivo: tener la base de datos con la que trabajaremos en toda la práctica.
-- -----------------------------------------------------------------------------

-- Si la base ya existía de una prueba anterior, la eliminamos para empezar limpio
DROP DATABASE IF EXISTS biblioteca;

CREATE DATABASE biblioteca;
USE biblioteca;

CREATE TABLE libros (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    titulo     VARCHAR(100),
    autor      VARCHAR(100),
    ejemplares INT
);

-- Datos iniciales: ejemplares = copias disponibles para prestar
INSERT INTO libros (titulo, autor, ejemplares) VALUES
    ('Don Quijote de la Mancha', 'Miguel de Cervantes',   3),
    ('Novelas ejemplares',       'Miguel de Cervantes',   1),
    ('La casa de Bernarda Alba', 'Federico García Lorca', 2),
    ('Romancero gitano',         'Federico García Lorca', 0);

-- Comprobación: deben aparecer los 4 libros
SELECT * FROM libros;


-- -----------------------------------------------------------------------------
-- PASO 2. Crear el usuario del programa
-- Objetivo: usuario para Python que solo pueda ejecutar procedimientos.
-- -----------------------------------------------------------------------------

-- Si el usuario ya existía, lo eliminamos para poder recrearlo sin errores
DROP USER IF EXISTS 'app_biblioteca'@'localhost';

CREATE USER 'app_biblioteca'@'localhost' IDENTIFIED BY 'Biblio_2026';

-- Solo permiso EXECUTE: no podrá hacer SELECT/INSERT/UPDATE directos sobre las tablas
GRANT EXECUTE ON biblioteca.* TO 'app_biblioteca'@'localhost';

FLUSH PRIVILEGES;


-- -----------------------------------------------------------------------------
-- PASO 3. Primer procedimiento: listar todos los libros (sin parámetros)
-- -----------------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE listar_libros()
BEGIN
    -- Devuelve todos los libros ordenados por id
    SELECT id, titulo, autor, ejemplares
    FROM libros
    ORDER BY id;
END //

DELIMITER ;

-- Prueba en Workbench: CALL listar_libros();


-- -----------------------------------------------------------------------------
-- PASO 5. Procedimiento con parámetro de entrada (IN)
-- -----------------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE buscar_por_autor(IN p_autor VARCHAR(100))
BEGIN
    -- Solo título y ejemplares de los libros de ese autor
    SELECT titulo, ejemplares
    FROM libros
    WHERE autor = p_autor;
END //

DELIMITER ;

-- Prueba: CALL buscar_por_autor('Federico García Lorca');


-- -----------------------------------------------------------------------------
-- PASO 6. Procedimiento con parámetro de salida (OUT)
-- -----------------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE contar_libros(OUT p_total INT)
BEGIN
    -- Cuenta las filas y guarda el resultado en el parámetro de salida
    SELECT COUNT(*) INTO p_total FROM libros;
END //

DELIMITER ;

-- Prueba:
-- CALL contar_libros(@total);
-- SELECT @total;


-- -----------------------------------------------------------------------------
-- PASO 7. Procedimiento que modifica datos (préstamo)
-- -----------------------------------------------------------------------------

DELIMITER //

CREATE PROCEDURE prestar_libro(IN p_id INT)
BEGIN
    DECLARE v_ejemplares INT;

    -- Leemos cuántos ejemplares quedan del libro indicado
    SELECT ejemplares INTO v_ejemplares
    FROM libros
    WHERE id = p_id;

    -- Si no quedan copias, lanzamos un error controlado
    IF v_ejemplares = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No quedan ejemplares';
    END IF;

    -- Si hay ejemplares, restamos 1 (registramos el préstamo)
    UPDATE libros
    SET ejemplares = ejemplares - 1
    WHERE id = p_id;
END //

DELIMITER ;

-- Prueba (debe fallar porque el libro 4 tiene 0 ejemplares):
-- CALL prestar_libro(4);


-- -----------------------------------------------------------------------------
-- PASO 10 (opcional). Restaurar ejemplares del libro 1 al valor inicial
-- Útil antes de ejecutar practica.py para que la salida coincida con el enunciado.
-- -----------------------------------------------------------------------------
-- UPDATE libros SET ejemplares = 3 WHERE id = 1;
