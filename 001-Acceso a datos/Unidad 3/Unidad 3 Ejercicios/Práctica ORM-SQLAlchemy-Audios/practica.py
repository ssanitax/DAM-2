from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, Session

engine = create_engine("sqlite:///audios.db")
Base = declarative_base()

class Audio(Base):
    __tablename__ = "audios"
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    frecuencia = Column(Integer)
    bits = Column(Integer)
    duracion = Column(Float)

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)

with Session(engine) as sesion:
    a1 = Audio(nombre="llamada.mp3", frecuencia=8000, bits=8, duracion=30.5)
    a2 = Audio(nombre="cancion_cd.mp3", frecuencia=44100, bits=16, duracion=210.0)
    sesion.add(a1)
    sesion.add(a2)
    sesion.commit()

with Session(engine) as sesion:
    audios = sesion.query(Audio).all()
    for audio in audios:
        print(audio.id, audio.nombre, audio.frecuencia, audio.bits, audio.duracion)

with Session(engine) as sesion:
    audio = sesion.query(Audio).filter_by(nombre="llamada.mp3").first()
    audio.duracion = 45.0
    sesion.commit()

with Session(engine) as sesion:
    audio = sesion.query(Audio).filter_by(nombre="cancion_cd.mp3").first()
    sesion.delete(audio)
    sesion.commit()

with Session(engine) as sesion:
    for audio in sesion.query(Audio).all():
        print(audio.id, audio.nombre, audio.duracion)
