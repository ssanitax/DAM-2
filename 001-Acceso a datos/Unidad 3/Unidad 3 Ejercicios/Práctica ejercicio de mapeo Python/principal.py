# principal.py

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from mapeo import registro
from modelos import Cliente, Pedido

# Conectar y crear las tablas
motor = create_engine("sqlite:///tienda.db")
registro.metadata.drop_all(motor)
registro.metadata.create_all(motor)

with Session(motor) as sesion:

    # 1. Crear objetos
    ana = Cliente("Ana")
    ana.pedidos.append(Pedido("Libro"))
    ana.pedidos.append(Pedido("Lápiz"))
    ana.pedidos.append(Pedido("Mochila"))

    luis = Cliente("Luis")
    luis.pedidos.append(Pedido("Cuaderno"))
    luis.pedidos.append(Pedido("Goma"))

    # 2. Guardar
    sesion.add(ana)
    sesion.add(luis)
    sesion.commit()

    # 3. Buscar
    consulta = select(Cliente).where(Cliente.nombre == "Luis")
    cliente = sesion.scalars(consulta).first()

    # 4. Leer
    for pedido in cliente.pedidos:
        print(pedido.producto, "es de", pedido.cliente.nombre)
