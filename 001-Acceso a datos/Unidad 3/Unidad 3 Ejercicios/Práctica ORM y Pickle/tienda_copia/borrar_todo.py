from sqlalchemy.orm import Session
from modelos import Cliente, engine

with Session(engine) as session:
    for cliente in session.query(Cliente).all():
        session.delete(cliente)
    session.commit()
    print("Se han borrado todos los clientes")
