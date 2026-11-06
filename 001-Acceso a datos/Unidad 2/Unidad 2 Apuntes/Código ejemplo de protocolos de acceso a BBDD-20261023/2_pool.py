from mysql.connector import pooling

pool = pooling.MySQLConnectionPool(
    pool_name="mi_pool",
    pool_size=2,
    host="localhost",
    user="alumno",
    password="alumno123",
    database="tienda"
)

for i in range(4):
    conexion = pool.get_connection()
    cursor = conexion.cursor()
    cursor.execute("SELECT CONNECTION_ID()")
    print("Petición", i + 1, "-> sesión", cursor.fetchone()[0])
    cursor.close()
    conexion.close()
