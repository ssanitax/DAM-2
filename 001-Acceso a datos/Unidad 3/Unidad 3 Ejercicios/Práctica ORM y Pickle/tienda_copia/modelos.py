from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base

engine = create_engine("sqlite:///tienda.db")
Base = declarative_base()


class Cliente(Base):
    __tablename__ = "clientes"
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    ciudad = Column(String)


Base.metadata.create_all(engine)
