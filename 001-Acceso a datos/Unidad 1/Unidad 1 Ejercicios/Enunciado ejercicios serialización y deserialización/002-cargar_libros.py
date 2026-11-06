import json

def leer_fichero():
    archivo = open("biblioteca.dat", "r")
    lineas = archivo.readlines()
    linea = lineas[0]
    archivo.close()
    return linea

def deserializar_libros(linea):
    libros = json.loads(linea)
    return libros

def main():
    linea = leer_fichero()
    print(linea)
    print(type(linea))
    libros = deserializar_libros(linea)
    print(libros)
    print(type(libros))

if __name__ == "__main__":
    main()