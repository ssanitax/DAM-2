from sqlalchemy.orm import Session
from modelos import Cliente, engine

with Session(engine) as session:
    clientes = session.query(Cliente).all()
    print("Clientes en la base de datos:", len(clientes))
    for cliente in clientes:
        print(cliente.id, cliente.nombre, cliente.ciudad)
