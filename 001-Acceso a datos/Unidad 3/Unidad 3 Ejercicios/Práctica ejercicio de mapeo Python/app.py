# app.py

from flask import Flask, render_template
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
import mapeo
from modelos import Cliente

app = Flask(__name__)
motor = create_engine("sqlite:///tienda.db")


@app.route("/")
def inicio():
    with Session(motor) as sesion:
        clientes = sesion.scalars(select(Cliente)).all()
        return render_template("index.html", clientes=clientes)


if __name__ == "__main__":
    app.run(debug=True)
