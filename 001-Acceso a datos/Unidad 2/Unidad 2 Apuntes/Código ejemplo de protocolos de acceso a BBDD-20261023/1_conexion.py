import mysql.connector

conexion = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="alumno",
    password="alumno123",
    database="tienda"
)

print("¿Conectado?", conexion.is_connected())

cursor = conexion.cursor()
cursor.execute("SELECT VERSION(), CURRENT_USER()")
fila = cursor.fetchone()
print("Versión del servidor:", fila[0])
print("Usuario conectado:", fila[1])

cursor.close()
conexion.close()
print("¿Conectado?", conexion.is_connected())
