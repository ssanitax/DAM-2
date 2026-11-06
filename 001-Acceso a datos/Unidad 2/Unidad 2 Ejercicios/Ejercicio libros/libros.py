# libros.py
# Guardar los libros de una biblioteca en MySQL y recuperarlos.

import mysql.connector

# --- Paso 1. Datos ---
libros = [
    {"titulo": "Don Quijote", "paginas": 863,
     "generos": ["novela", "aventuras", "humor"]},
    {"titulo": "Platero y yo", "paginas": 144,
     "generos": ["poesía", "infantil"]},
    {"titulo": "Marianela", "paginas": 256,
     "generos": ["novela"]}
]

# --- Paso 2. Tipo de cada dato del primer libro ---
print("--- Paso 2: tipos ---")
muestra = libros[0]
for clave in muestra.keys():
    print(clave, type(muestra[clave]))

# --- Paso 3. Conexión a MySQL ---
conn = mysql.connector.connect(
    host="localhost",
    user="desfase",
    password="desfase",
    database="desfase"
)
cursor = conn.cursor()

# --- Paso 4. Borrar tablas (hija → madre) ---
cursor.execute("DROP TABLE IF EXISTS libros_generos")
cursor.execute("DROP TABLE IF EXISTS libros")

# --- Paso 5. Crear tabla libros ---
cursor.execute("""
    CREATE TABLE libros (
        Identificador INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255),
        paginas INT
    )
""")

# --- Paso 6. Crear tabla libros_generos ---
cursor.execute("""
    CREATE TABLE libros_generos (
        Identificador INT AUTO_INCREMENT PRIMARY KEY,
        libros_id INT,
        valor VARCHAR(255),
        FOREIGN KEY (libros_id) REFERENCES libros(Identificador)
    )
""")

# --- Paso 7. Guardar libros y géneros ---
for libro in libros:
    cursor.execute(
        "INSERT INTO libros (titulo, paginas) VALUES (%s, %s)",
        (libro["titulo"], libro["paginas"])
    )
    id_libro = cursor.lastrowid
    for genero in libro["generos"]:
        cursor.execute(
            "INSERT INTO libros_generos (libros_id, valor) VALUES (%s, %s)",
            (id_libro, genero)
        )
conn.commit()

# --- Paso 8. Recuperar los datos ---
recuperados = []
cursor.execute("SELECT Identificador, titulo, paginas FROM libros")
filas_libros = cursor.fetchall()

for fila in filas_libros:
    id_libro = fila[0]
    titulo = fila[1]
    paginas = fila[2]

    cursor.execute(
        "SELECT valor FROM libros_generos WHERE libros_id = %s",
        (id_libro,)
    )
    filas_generos = cursor.fetchall()
    generos = []
    for fila_genero in filas_generos:
        generos.append(fila_genero[0])

    recuperados.append({
        "titulo": titulo,
        "paginas": paginas,
        "generos": generos
    })

print("\n--- Paso 8: recuperados ---")
print(recuperados)
print("¿Iguales a la lista original?", recuperados == libros)

# --- Reto extra: libros con género novela ---
print("\n--- Reto: novelas ---")
cursor.execute("""
    SELECT libros.titulo
    FROM libros
    JOIN libros_generos ON libros.Identificador = libros_generos.libros_id
    WHERE libros_generos.valor = %s
""", ("novela",))
for fila in cursor.fetchall():
    print(fila[0])

conn.close()
