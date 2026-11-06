# Archivo 1 — acceso secuencial: guarda las películas en orden
# y las recorre de principio a fin, sin poder saltar a una en concreto.
NOMBRE_FICHERO = "peliculas_secuencial.txt"

def escribir_varias_peliculas():
    # Crea la lista y la escribe de golpe con writelines() (modo "w").
    peliculas = [
        "The Shawshank Redemption,148\n",
        "The Godfather,175\n",
        "The Dark Knight,152\n",
        "Pulp Fiction,154\n",
        "The Lord of the Rings: The Return of the King,100\n"
    ]
    fichero = open(NOMBRE_FICHERO, "w")  # "w" borra el contenido anterior
    fichero.writelines(peliculas)        # escribe toda la lista de una vez
    fichero.close()

def anadir_una_pelicula():
    # Abre en modo añadir ("a") y agrega una sola línea con write().
    fichero = open(NOMBRE_FICHERO, "a")  # "a" añade al final sin borrar nada
    fichero.write("Inception,148\n")
    fichero.close()

def leer_todo_de_golpe():
    # Lee TODO el fichero de una vez con read() y lo muestra por pantalla.
    fichero = open(NOMBRE_FICHERO, "r")
    contenido = fichero.read()
    fichero.close()
    print(contenido)

def leer_linea_a_linea():
    # Bucle while + readline() hasta que devuelva "" (no quedan más líneas).
    fichero = open(NOMBRE_FICHERO, "r")
    linea = fichero.readline()
    while linea != "":
        print(linea.strip())             # .strip() quita el salto de línea
        linea = fichero.readline()
    fichero.close()

def main():
    # Llama a las cuatro funciones en el orden del enunciado.
    escribir_varias_peliculas()
    anadir_una_pelicula()
    leer_todo_de_golpe()
    leer_linea_a_linea()

if __name__ == "__main__":
    main()
