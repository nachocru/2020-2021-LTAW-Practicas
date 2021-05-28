//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const fs = require('fs');

var users = 0;

const PUERTO = 9000;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
    res.send(fs.readFileSync('./public/home.html', 'utf-8'));
    // res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/chat.html">Test</a></p>');
});

app.get('/procesar', (req, res) => {
    res.send(fs.readFileSync('./public/chat.html', 'utf-8'));
    // res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/chat.html">Test</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname + '/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {

    users += 1;

    console.log('** NUEVA CONEXIÓN **'.yellow);
    io.send('Nuevo usuario conectado');
    socket.send('Bienvenid@ al chat de Nacho :)');
    //-- Evento de desconexión
    socket.on('disconnect', function() {
        users -= 1;
        console.log('** CONEXIÓN TERMINADA **'.yellow);
        io.send('Usuario desconectado');
    });

    //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
    socket.on("message", (msg) => {
        if (msg.split(': ')[1].startsWith('/')) {
            switch (msg.split(': ')[1]) {
                case '/help':
                    console.log('estamos en help')
                    break;
                case '/list':
                    socket.send('Usuarios conectados: ' + users);
                    break;
                case '/hello':
                    socket.send('Hola! Espero que estés teniendo una agradable conversación!');
                    break;
                case '/date':
                    var currentdate = new Date();
                    var datetime = "Hoy es " + currentdate.getDate() + "/" +
                        (currentdate.getMonth() + 1) + "/" +
                        currentdate.getFullYear() + " y son las " +
                        currentdate.getHours() + ":" +
                        currentdate.getMinutes() + ":" +
                        currentdate.getSeconds();
                    socket.send(datetime);
                    break;
                default:
                    console.log('default');
                    break;
            }
        } else {
            console.log("Mensaje Recibido!: " + msg.blue);
            //-- Reenviarlo a todos los clientes conectados
            io.send(msg);
        }

    });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);