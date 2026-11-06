# mapeo.py

from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import registry, relationship
from modelos import Cliente, Pedido

# 1. El registro
registro = registry()

# 2. Las tablas
tabla_clientes = Table(
    "clientes", registro.metadata,
    Column("id", Integer, primary_key=True),
    Column("nombre", String(100), nullable=False),
)

tabla_pedidos = Table(
    "pedidos", registro.metadata,
    Column("id", Integer, primary_key=True),
    Column("producto", String(100)),
    Column("cliente_id", Integer, ForeignKey("clientes.id")),
)

# 3. Unir cada clase con su tabla
registro.map_imperatively(Cliente, tabla_clientes, properties={
    "pedidos": relationship(Pedido, back_populates="cliente", cascade="all"),
})

registro.map_imperatively(Pedido, tabla_pedidos, properties={
    "cliente": relationship(Cliente, back_populates="pedidos"),
})
