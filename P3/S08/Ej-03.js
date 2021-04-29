//-- Importar express
const express = require('express');

//-- Crear una aplicación web vacia
const app = express();

//-- Puerto donde lanzar el servidor
const PORT = 8080;

//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', function(req, res) {
    res.send('Bienvenido a mi aplicación Web!!!');
})

//-- Lanzar el servidor
app.listen(PORT);
console.log("Servidor Express corriendo en puerto " + PORT);