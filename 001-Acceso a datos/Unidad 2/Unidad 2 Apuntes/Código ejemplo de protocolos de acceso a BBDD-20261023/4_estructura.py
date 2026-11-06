import mysql.connector

conexion = mysql.connector.connect(
    host="localhost", user="alumno", password="alumno123", database="tienda"
)
cursor = conexion.cursor()

cursor.execute("DROP TABLE IF EXISTS clientes")
cursor.execute("CREATE TABLE clientes (id INT PRIMARY KEY, nombre VARCHAR(50))")
cursor.execute("ALTER TABLE clientes ADD email VARCHAR(100)")
print("Tabla clientes creada y modificada")

cursor.execute("SHOW TABLES")
for fila in cursor.fetchall():
    print("Tabla:", fila[0])

cursor.execute("DESCRIBE clientes")
for columna in cursor.fetchall():
    print("Columna:", columna[0], "| Tipo:", columna[1])

cursor.execute("DROP TABLE clientes")
print("Tabla clientes borrada")

cursor.close()
conexion.close()
