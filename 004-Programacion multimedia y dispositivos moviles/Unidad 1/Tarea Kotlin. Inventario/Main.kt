/**
 * Tarea Kotlin: Revisión de stock de una tienda.
 *
 * Recorre una lista de unidades, clasifica cada producto,
 * ignora datos erróneos (negativos) y decide si hace falta pedido.
 */

fun main() {
    // listOf crea una lista INMUTABLE: no se puede añadir, quitar ni cambiar elementos.
    val stock = listOf(25, 0, 8, -3, 50, 3)

    // Valor por defecto: si no hay proveedor real, usamos "Sin proveedor".
    // Puedes cambiar el argumento al llamar a main o asignar otro String aquí.
    val proveedor: String = "Sin proveedor"

    println("Proveedor: $proveedor")

    // Contadores y acumuladores para el resumen final.
    var agotados = 0
    var stockBajo = 0
    var totalUnidades = 0
    var productosValidos = 0 // solo los que NO son negativos (sirven para la media)

    // withIndex() nos da el índice (0, 1, 2...) y el valor a la vez.
    // Numeramos productos desde 1 → usamos index + 1.
    for ((index, unidades) in stock.withIndex()) {
        val numeroProducto = index + 1

        // Unidades negativas = dato inválido: se informa y se salta al siguiente.
        if (unidades < 0) {
            println("Producto $numeroProducto: Dato erróneo")
            continue // pasa a la siguiente iteración del bucle
        }

        // Solo contamos unidades válidas para el total y la media.
        totalUnidades += unidades
        productosValidos++

        // Clasificación del estado según el enunciado.
        val estado = when {
            unidades == 0 -> {
                agotados++
                "Agotado"
            }
            unidades in 1..9 -> {
                stockBajo++
                "Stock bajo"
            }
            unidades in 10..29 -> "Stock normal"
            else -> "Stock alto" // 30 o más
        }

        println("Producto $numeroProducto: $unidades uds ($estado)")
    }

    // Media con división entera (como en el ejemplo: 86 / 5 = 17).
    // Si no hubiera productos válidos, evitamos dividir entre 0.
    val media = if (productosValidos > 0) totalUnidades / productosValidos else 0

    // Hace falta pedido si hay al menos un agotado o con stock bajo.
    val mensajePedido = if (agotados > 0 || stockBajo > 0) {
        "Hay que hacer un pedido"
    } else {
        "No hace falta pedido"
    }

    println(
        "Agotados: $agotados. Stock bajo: $stockBajo. " +
            "Total: $totalUnidades uds. Media: $media. $mensajePedido."
    )
}