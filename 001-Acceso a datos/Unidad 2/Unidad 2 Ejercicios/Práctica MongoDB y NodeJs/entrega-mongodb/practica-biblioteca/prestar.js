const { MongoClient } = require("mongodb");

const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== AQUÍ VA EL CÓDIGO DE CADA EJERCICIO =====
    const resultado = await libros.updateOne(
      { titulo: "La sombra del viento" },
      { $set: { disponible: false } }
    );

    console.log("Documentos modificados: " + resultado.modifiedCount);

    console.log("\nLibros que siguen disponibles:");
    const disponibles = await libros.find({ disponible: true }).toArray();
    for (const libro of disponibles) {
      console.log("- " + libro.titulo);
    }

  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();