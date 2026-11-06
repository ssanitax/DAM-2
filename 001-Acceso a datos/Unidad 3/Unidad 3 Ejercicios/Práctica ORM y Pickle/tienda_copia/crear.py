from sqlalchemy.orm import Session
from modelos import Cliente, engine

with Session(engine) as session:
    ana = Cliente(nombre="Ana", ciudad="Valencia")
    luis = Cliente(nombre="Luis", ciudad="Madrid")
    marta = Cliente(nombre="Marta", ciudad="Valencia")
    session.add_all([ana, luis, marta])
    session.commit()
    print("Clientes guardados")
