//-- Crear una variable con la estructura definida
//-- en un fichero JSON

const fs = require('fs');

//-- Npmbre del fichero JSON a leer
const FICHERO_JSON = "tienda.json"

//-- Leer el fichero JSON
const tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Mostrar informacion sobre la tienda
console.log("Usuarios de la tienda: " + tienda["users"].length);

tienda["users"].forEach((element, index) => {
    console.log("Nombre de usuario: " + (index + 1) + ": " + element["name"]);
});

console.log("Productos de la tienda: " + tienda["products"].length);

tienda["products"].forEach((element, index) => {
    console.log("Producto: " + (index + 1) + ": " + element["name"]);
});

console.log("Número de pedidos pendientes: " + tienda["orders"].length);

tienda["orders"].forEach((element, index) => {
    console.log("Cliente: " + element["user"]);
    console.log("Direccion: " + element["direction"]);
    console.log("Tarjeta de credito: " + element["card"]);
    element["products"].forEach((element, index) => {
        console.log("Producto: " + element["name"]);
        console.log("Cantidad: " + element["quantity"]);
    });
});


// //-- Recorrer el array de productos
// tienda.forEach((element, index) => {
//     console.log("Producto: " + (index + 1) + ": " + element["nombre"]);
// });