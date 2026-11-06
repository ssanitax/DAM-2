const { MongoClient } = require("mongodb");

const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== AQUÍ VA EL CÓDIGO DE CADA EJERCICIO =====
    // 1. Total de libros
    const totalLibros = await libros.countDocuments();

    // 2. Disponibles y prestados
    const disponibles = await libros.countDocuments({ disponible: true });
    const prestados = await libros.countDocuments({ disponible: false });

    // 3. Libro con más páginas (orden descendente y tomar el primero)
    const libroMasLargo = await libros.findOne({}, { sort: { paginas: -1 } });

    console.log("=== ESTADÍSTICAS DE LA BIBLIOTECA ===");
    console.log("Número total de libros: " + totalLibros);
    console.log("Libros disponibles: " + disponibles);
    console.log("Libros prestados: " + prestados);
    console.log("Libro con más páginas: " + libroMasLargo.titulo + " (" + libroMasLargo.paginas + " páginas)");

  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();