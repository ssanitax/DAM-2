const { MongoClient } = require("mongodb");

const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== AQUÍ VA EL CÓDIGO DE CADA EJERCICIO =====
    const resultado = await libros.insertOne({
      titulo: "Nada",
      autor: "Carmen Laforet",
      anio: 1945,
      genero: "novela",
      paginas: 288,
      disponible: true,
      ejemplares: 1
    });

    console.log("Libro insertado con id: " + resultado.insertedId);

  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();