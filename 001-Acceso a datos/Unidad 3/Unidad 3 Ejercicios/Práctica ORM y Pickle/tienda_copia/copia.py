import pickle
from sqlalchemy.orm import Session
from modelos import Cliente, engine

with Session(engine) as session:
    clientes = session.query(Cliente).all()
    datos = []
    for cliente in clientes:
        datos.append({"nombre": cliente.nombre, "ciudad": cliente.ciudad})
    archivo = open("copia.bin", "wb")
    pickle.dump(datos, archivo)
    archivo.close()
    print("Copia guardada con", len(datos), "clientes")
