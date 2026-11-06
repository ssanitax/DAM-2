# Programa sencillo para practicar las excepciones al trabajar con ficheros.
# Contiene todo lo visto: try, except, finally, las excepciones
# FileNotFoundError, PermissionError e IOError, y no ignorar los errores.


# 1. LEER UN FICHERO DETECTANDO Y TRATANDO EXCEPCIONES
def leer_fichero(nombre):
    fichero = None
    try:
        # Aquí va la operación que puede fallar
        fichero = open(nombre, "r")
        contenido = fichero.read()
        print("Contenido del fichero:")
        print(contenido)
    except FileNotFoundError:
        # El fichero no existe
        print("Error: el fichero", nombre, "no existe.")
    except PermissionError:
        # No tenemos permiso para leerlo
        print("Error: no tienes permiso para leer", nombre)
    except IOError:
        # Cualquier otro problema al leer
        print("Error: hubo un problema al leer", nombre)
    finally:
        # Esto se ejecuta SIEMPRE, haya error o no
        if fichero is not None:
            fichero.close()
            print("Fichero cerrado.")
        print("Fin de la lectura de", nombre)


# 2. ESCRIBIR EN UN FICHERO
def escribir_fichero(nombre, texto):
    try:
        fichero = open(nombre, "w")
        fichero.write(texto)
        fichero.close()
        print("Se ha escrito correctamente en", nombre)
    except PermissionError:
        print("Error: no tienes permiso para escribir en", nombre)
    except IOError:
        print("Error: hubo un problema al escribir en", nombre)


# 3. RECUPERARSE DE UN ERROR
def leer_o_crear(nombre):
    try:
        fichero = open(nombre, "r")
        print("El fichero ya existía. Contenido:", fichero.read())
        fichero.close()
    except FileNotFoundError:
        # En vez de rendirnos, creamos el fichero y seguimos
        print("El fichero no existía, así que lo creamos.")
        escribir_fichero(nombre, "Fichero creado automáticamente.")


# 4. LO QUE NO SE DEBE HACER: IGNORAR LA EXCEPCIÓN
def ejemplo_mal_hecho(nombre):
    try:
        fichero = open(nombre, "r")
        fichero.close()
    except:
        pass  # MAL: el error desaparece y nadie se entera


# PROGRAMA PRINCIPAL
print("--- Prueba 1: escribir y leer un fichero que existe ---")
escribir_fichero("datos.txt", "Hola, esto es una prueba.")
leer_fichero("datos.txt")

print()
print("--- Prueba 2: leer un fichero que no existe ---")
leer_fichero("no_existe.txt")

print()
print("--- Prueba 3: recuperarse creando el fichero ---")
leer_o_crear("nuevo.txt")

print()
print("--- Prueba 4: ejemplo de lo que NO hay que hacer ---")
ejemplo_mal_hecho("no_existe.txt")
print("No aparece ningún mensaje: el error se ha ignorado.")
