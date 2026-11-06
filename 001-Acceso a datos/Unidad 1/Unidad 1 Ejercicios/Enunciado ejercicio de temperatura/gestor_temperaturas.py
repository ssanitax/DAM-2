import os

CARPETA = os.path.dirname(os.path.abspath(__file__))
NOMBRE_FICHERO_TEMPERATURAS = os.path.join(CARPETA, "temperaturas.txt")
NOMBRE_FICHERO_CONTADOR = os.path.join(CARPETA, "contador.bin")

def escribir_temperaturas():
    # tu código aquí
    print("\n--- 1. Flujo de salida: escribiendo en el fichero ---")
    flujo = open(NOMBRE_FICHERO_TEMPERATURAS, "w")
    flujo.write("18.5\n21.0\n19.2\n")
    flujo.close()
    print(f"Se ha escrito '{NOMBRE_FICHERO_TEMPERATURAS}' correctamente.")

def leer_temperaturas():
    # tu código aquí
    print("\n--- 2. Flujo de entrada: leyendo todo el fichero ---")
    flujo = open(NOMBRE_FICHERO_TEMPERATURAS, "r")
    contenido = flujo.read()
    flujo.close()
    print(contenido)

def saltar_primera_temperatura():
    # tu código aquí
    print("--- 3. Moviendo el puntero con seek() ---")
    flujo = open(NOMBRE_FICHERO_TEMPERATURAS, "r")
    flujo.readline()             # leemos la primera línea, el puntero avanza
    posicion = flujo.tell()      # guardamos dónde ha quedado el puntero
    flujo.seek(0)                # volvemos al principio del fichero
    flujo.seek(posicion)         # y saltamos otra vez a esa posición guardada
    resto = flujo.read()         # leemos desde ahí hasta el final
    flujo.close()
    print("Nos saltamos la primera línea y leemos el resto:")
    print(resto)

def comprobar_fichero_configuracion():
    # tu código aquí
    """Manejo de excepciones: qué pasa si el fichero no existe."""
    print("--- 4. Manejo de excepciones ---")
    try:
        flujo = open("fichero_que_no_existe.txt", "r")
        flujo.close()
    except FileNotFoundError:
        print("Error controlado: el fichero no existe, pero el programa no se cae.")

def guardar_numero_registros():
    # tu código aquí
    """Ficheros binarios: útiles para datos que no son texto plano."""
    print("\n--- 5. Trabajando con un fichero binario ---")
    datos = bytes([3])  # el 3 (total de temperaturas) convertido a 1 byte

    flujo_salida = open(NOMBRE_FICHERO_CONTADOR, "wb")  # wb = write binary
    flujo_salida.write(datos)
    flujo_salida.close()

    flujo_entrada = open(NOMBRE_FICHERO_CONTADOR, "rb")  # rb = read binary
    leido = flujo_entrada.read()
    flujo_entrada.close()

    print(f"Número de registros guardado: {leido[0]}")

def main():
    # llama aquí a las cinco funciones, en orden
    escribir_temperaturas()
    leer_temperaturas()
    saltar_primera_temperatura()
    comprobar_fichero_configuracion()
    guardar_numero_registros()

if __name__ == "__main__":
    main()
