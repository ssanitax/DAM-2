# =============================================================================
# PRÁCTICA: Biblioteca con procedimientos almacenados y Python
# Archivo: practica.py (pasos 4, 5, 6, 8 y 9 del enunciado)
# =============================================================================
# Antes de ejecutar este programa:
#   1. Instala el conector:  pip install mysql-connector-python
#   2. Ejecuta biblioteca.sql en MySQL (Workbench o consola) con el usuario root
#   3. Ejecuta:  python practica.py
# =============================================================================

# Paso 4 — Importamos el conector oficial de MySQL para Python
import warnings
import mysql.connector

# El enunciado pide usar stored_results(); en versiones nuevas del conector
# avisa de deprecación, pero el método sigue siendo el correcto para la práctica.
warnings.filterwarnings("ignore", category=DeprecationWarning)

# ---------------------------------------------------------------------------
# Conexión y cursor (Paso 4)
# Usamos el usuario app_biblioteca, que SOLO tiene permiso EXECUTE.
# Así solo podrá llamar a procedimientos, no tocar la tabla directamente.
# ---------------------------------------------------------------------------
conexion = mysql.connector.connect(
    host="localhost",
    user="app_biblioteca",
    password="Biblio_2026",
    database="biblioteca",
)
cursor = conexion.cursor()


# ---------------------------------------------------------------------------
# PASO 4. Llamar a listar_libros (procedimiento sin parámetros)
# ---------------------------------------------------------------------------
print("=== Listado de libros ===")

# callproc ejecuta el procedimiento; () = sin parámetros
cursor.callproc("listar_libros", ())

# stored_results() permite recorrer los conjuntos de resultados del CALL
for resultado in cursor.stored_results():
    for id_libro, titulo, autor, ejemplares in resultado.fetchall():
        print(f"{id_libro} - {titulo} ({autor}) - {ejemplares} ejemplares")


# ---------------------------------------------------------------------------
# PASO 5. Llamar a buscar_por_autor (parámetro IN)
# ---------------------------------------------------------------------------
print()
print("=== Libros de Federico García Lorca ===")

# Tupla de un solo elemento: hace falta la coma final
cursor.callproc("buscar_por_autor", ("Federico García Lorca",))

for resultado in cursor.stored_results():
    for titulo, ejemplares in resultado.fetchall():
        print(f"{titulo} - {ejemplares} ejemplares")


# ---------------------------------------------------------------------------
# PASO 6. Llamar a contar_libros (parámetro OUT)
# ---------------------------------------------------------------------------
print()
print("=== Total de libros ===")

# Pasamos un 0 como "hueco" para el parámetro de salida
resultado = cursor.callproc("contar_libros", (0,))

# callproc devuelve una tupla; la posición 0 tiene el valor OUT rellenado
print(f"Hay {resultado[0]} libros en la biblioteca")


# ---------------------------------------------------------------------------
# PASO 8. Prestar un libro (éxito) — commit si todo va bien
# ---------------------------------------------------------------------------
print()
print("=== Préstamo del libro 1 ===")

try:
    # Prestamos Don Quijote (id = 1), que tiene ejemplares disponibles
    cursor.callproc("prestar_libro", (1,))
    # En Python los cambios NO se guardan solos: hay que hacer commit
    conexion.commit()
    print("Préstamo registrado")
except mysql.connector.Error as e:
    # Si algo falla, deshacemos los cambios de esta transacción
    conexion.rollback()
    print(f"Error: {e.msg}")


# ---------------------------------------------------------------------------
# PASO 8 (continuación). Prestar un libro sin ejemplares — provoca el error
# ---------------------------------------------------------------------------
print()
print("=== Préstamo del libro 4 ===")

try:
    # Romancero gitano (id = 4) tiene 0 ejemplares → el procedimiento lanza error
    cursor.callproc("prestar_libro", (4,))
    conexion.commit()
    print("Préstamo registrado")
except mysql.connector.Error as e:
    # Capturamos el error, lo mostramos y el programa continúa
    conexion.rollback()
    print(f"Error: {e.msg}")


# ---------------------------------------------------------------------------
# PASO 9. Comprobar permisos: SELECT directo debe fallar
# ---------------------------------------------------------------------------
print()
print("=== Prueba de permisos ===")

try:
    # Intentamos leer la tabla sin usar un procedimiento
    cursor.execute("SELECT * FROM libros")
    cursor.fetchall()
except mysql.connector.Error as e:
    # app_biblioteca no tiene SELECT → MySQL deniega el acceso
    print(f"Acceso denegado: {e.msg}")


# ---------------------------------------------------------------------------
# Cierre (siempre al final del archivo, según el enunciado)
# ---------------------------------------------------------------------------
cursor.close()
conexion.close()
