import csv

# Primero escribo datos

datos = [
    ['nombre','apellidos','telefono'],
    ['Juan','Lopez','5325345'],
    ['Jorge','Garcia','5124535'],
    ['Jaime','Martinez','52345435'],
    ['Jose','Sancho','52345345'],
]

archivo = open("datos.csv",'w')
escritor = csv.writer(archivo)
escritor.writerows(datos)
archivo.close()

# Ahora leo los datos

archivo = open("datos.csv",'r')
lector = csv.reader(archivo)
for linea in lector:
    print(linea)
