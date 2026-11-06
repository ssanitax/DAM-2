import mysql.connector

try:
    conexion = mysql.connector.connect(
        host="localhost", user="alumno", password="mal", database="tienda"
    )
except mysql.connector.Error as error:
    print("Error al conectar:", error.errno, error.msg)

conexion = mysql.connector.connect(
    host="localhost", user="alumno", password="alumno123", database="tienda"
)
cursor = conexion.cursor()

try:
    cursor.execute("SELECT * FROM tabla_que_no_existe")
except mysql.connector.ProgrammingError as error:
    print("Error en la sentencia:", error.errno, error.msg)

cursor.close()
conexion.close()
