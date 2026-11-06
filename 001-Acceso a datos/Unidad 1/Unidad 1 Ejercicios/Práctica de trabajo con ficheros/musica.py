import os

def mostrar(carpeta, espacios):
    # Recorre los nombres ordenados (lista, pop, rock...)
    for nombre in sorted(os.listdir(carpeta)):
        print(espacios + nombre)
        ruta = os.path.join(carpeta, nombre)
        # Si es carpeta, se llama a sí misma con 4 espacios más
        if os.path.isdir(ruta):
            mostrar(ruta, espacios + "    ")


print("--- MI MUSICA ---")
os.makedirs("mi_musica/rock/clasicos", exist_ok=True)
os.makedirs("mi_musica/pop", exist_ok=True)

# Crea los tres archivos vacíos
open("mi_musica/lista.txt", "w").close()
open("mi_musica/rock/clasicos/queen.mp3", "w").close()
open("mi_musica/pop/abba.mp3", "w").close()

mostrar("mi_musica", "")
