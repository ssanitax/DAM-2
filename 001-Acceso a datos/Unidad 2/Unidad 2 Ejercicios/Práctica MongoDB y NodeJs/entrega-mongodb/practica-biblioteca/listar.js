const { MongoClient } = require("mongodb");

const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== AQUÍ VA EL CÓDIGO DE CADA EJERCICIO =====
    const lista = await libros.find().sort({ anio: 1 }).toArray();

    for (const libro of lista) {
      console.log(libro.titulo + " - " + libro.autor + " (" + libro.anio + ")");
    }

  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();