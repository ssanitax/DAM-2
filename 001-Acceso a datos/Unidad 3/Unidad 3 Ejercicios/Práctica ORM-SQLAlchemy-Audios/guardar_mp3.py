from pydub import AudioSegment
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

sonido = AudioSegment.from_mp3("0802.mp3")
with Session(engine) as sesion:
    nuevo = Audio(
        nombre="0802.mp3",
        frecuencia=sonido.frame_rate,
        bits=sonido.sample_width * 8,
        duracion=len(sonido) / 1000,
    )
    sesion.add(nuevo)
    sesion.commit()

with Session(engine) as sesion:
    for audio in sesion.query(Audio).all():
        print(audio.id, audio.nombre, audio.frecuencia, audio.bits, audio.duracion)
