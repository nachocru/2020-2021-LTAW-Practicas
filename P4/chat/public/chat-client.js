//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

socket.on("message", (msg) => {
    // Recibimos mensaje del servidor
    // Obtenemos el color que ha elegido el usuario para su chat
    let params = window.location.search;
    let urlParams = new URLSearchParams(params);
    let color = urlParams.get('color');
    // Mostramos el mensaje en el chat
    display.innerHTML += '<p style="color:' + color + '" class="messages">' + '> ' + msg + '</p>';
});

//-- Al apretar el botón o darle a enter se envía un mensaje al servidor
msg_entry.onchange = () => {
    // Obtenemos el nombre del usuario
    let params = window.location.search;
    let urlParams = new URLSearchParams(params);
    let name = urlParams.get('name');
    // Si contiene algún valor
    if (msg_entry.value)
        socket.send(name + ': ' + msg_entry.value); // Mandamos el mensaje junto con el nombre de usuario
    msg_entry.value = "";
}