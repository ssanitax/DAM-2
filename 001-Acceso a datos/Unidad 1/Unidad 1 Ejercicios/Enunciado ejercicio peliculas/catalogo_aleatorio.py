# Archivo 2 — acceso aleatorio: cada película ocupa siempre el mismo
# número de bytes, para calcular su posición y saltar directamente a ella.
# Python no tiene una clase de acceso aleatorio: se usa open() + seek() + tell().
NOMBRE_FICHERO = "peliculas_aleatorio.txt"
TAMANO_REGISTRO = 15  # cada línea mide siempre 15 bytes (14 + "\n")

def escribir_registros_tamano_fijo():
    # Recorre la lista y rellena cada título con ljust para que mida lo mismo.
    peliculas = [
        "Matrix",
        "Titanic",
        "Avatar",
        "Gladiator"
    ]
    fichero = open(NOMBRE_FICHERO, "w")
    for titulo in peliculas:
        # ljust(n) rellena con espacios a la derecha; el "\n" es el byte 15.
        linea = titulo.ljust(TAMANO_REGISTRO - 1) + "\n"
        fichero.write(linea)
    fichero.close()

def leer_registro_directo(numero_registro):
    # Salta al registro pedido con seek() y lee solo esa película.
    fichero = open(NOMBRE_FICHERO, "rb")
    fichero.seek(numero_registro * TAMANO_REGISTRO)  # posición exacta en bytes
    registro = fichero.read(TAMANO_REGISTRO)
    fichero.close()
    return registro.decode("utf-8").strip()  # sin espacios sobrantes

def modificar_registro_directo(numero_registro, titulo_nuevo):
    # "r+" lee y escribe sin borrar el fichero; sobrescribe solo ese registro.
    fichero = open(NOMBRE_FICHERO, "rb+")
    fichero.seek(numero_registro * TAMANO_REGISTRO)
    linea = titulo_nuevo.ljust(TAMANO_REGISTRO - 1) + "\n"
    fichero.write(linea.encode("utf-8"))
    fichero.close()

def main():
    # Escribe, lee un registro directo, modifica el primero y comprueba el resto.
    escribir_registros_tamano_fijo()
    print(leer_registro_directo(0))
    print(leer_registro_directo(1))
    print(leer_registro_directo(2))
    modificar_registro_directo(0, "The Matrix")
    print(leer_registro_directo(0))

if __name__ == "__main__":
    main()
