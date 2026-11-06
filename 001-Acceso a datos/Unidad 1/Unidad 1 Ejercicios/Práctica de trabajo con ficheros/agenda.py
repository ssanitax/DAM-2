class Agenda:
    def __init__(self, archivo):
        # Guarda el nombre del CSV y lo vacía para que cada ejecución empiece de cero
        self.archivo = archivo
        fichero = open(self.archivo, "w")
        fichero.close()

    def guardar(self, nombre, telefono):
        # Modo "a": añade al final sin borrar los amigos que ya hay
        fichero = open(self.archivo, "a")
        fichero.write(nombre + "," + telefono + "\n")
        fichero.close()

    def leer(self):
        fichero = open(self.archivo, "r")
        for linea in fichero:
            # "Marta,611222333\n" -> ["Marta", "611222333"]
            datos = linea.strip().split(",")
            print("Nombre:", datos[0], "- Telefono:", datos[1])
        fichero.close()

    def contar(self):
        # Cuenta cuántas líneas (amigos) hay en el archivo
        fichero = open(self.archivo, "r")
        total = len(fichero.readlines())
        fichero.close()
        return total


print("--- MI AGENDA ---")
agenda = Agenda("agenda.csv")
agenda.guardar("Marta", "611222333")
agenda.guardar("Pablo", "622333444")
agenda.guardar("Lucia", "633444555")
print("Hay", agenda.contar(), "contactos en la agenda")
agenda.leer()
