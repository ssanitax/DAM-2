import pickle
from sqlalchemy.orm import Session
from modelos import Cliente, engine

archivo = open("copia.bin", "rb")
datos = pickle.load(archivo)
archivo.close()

with Session(engine) as session:
    for d in datos:
        session.add(Cliente(nombre=d["nombre"], ciudad=d["ciudad"]))
    session.commit()
    print("Restaurados", len(datos), "clientes")
