from typing import Optional

from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

# PASO 1 — Conectar con la base de datos
engine = create_engine("sqlite:///biblioteca.db")


# PASO 2 — Crear la clase Base
class Base(DeclarativeBase):
    pass


# PASO 3 — Definir la clase Libro con sus anotaciones
class Libro(Base):
    __tablename__ = "libros"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str]
    autor: Mapped[str]
    paginas: Mapped[Optional[int]]


# PASO 4 — Crear la tabla
Base.metadata.create_all(engine)

# PASOS 5 a 9 — Dentro de la misma sesión
with Session(engine) as session:
    # PASO 5 — Guardar los tres libros
    session.add(
        Libro(
            titulo="Don Quijote de la Mancha",
            autor="Miguel de Cervantes",
            paginas=1250,
        )
    )
    session.add(
        Libro(
            titulo="La casa de los espíritus",
            autor="Isabel Allende",
            paginas=480,
        )
    )
    session.add(
        Libro(
            titulo="Platero y yo",
            autor="Juan Ramón Jiménez",
        )
    )
    session.commit()

    # PASO 6 — Consultar los libros
    libro1 = session.get(Libro, 1)
    print(f"{libro1.titulo} - {libro1.autor}")

    for libro in session.scalars(select(Libro).where(Libro.paginas > 400)):
        print(f"{libro.titulo} {libro.paginas}")

    # PASO 7 — Actualizar un libro
    platero = session.get(Libro, 3)
    platero.paginas = 150
    session.commit()

    # PASO 8 — Eliminar un libro
    casa = session.get(Libro, 2)
    session.delete(casa)
    session.commit()

    # PASO 9 — Mostrar el estado final
    for libro in session.scalars(select(Libro)):
        print(f"{libro.id} {libro.titulo} {libro.paginas}")
