const { MongoClient } = require("mongodb");

const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== AQUÍ VA EL CÓDIGO DE CADA EJERCICIO =====
    console.log("Conexión correcta");
    const total = await libros.countDocuments();
    console.log("Número de libros: " + total);

  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();