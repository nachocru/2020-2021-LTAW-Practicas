//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

socket.on("message", (msg) => {
    let params = window.location.search;
    let urlParams = new URLSearchParams(params);
    let color = urlParams.get('color');
    display.innerHTML += '<p style="color:' + color + '" class="messages">' + '> ' + msg + '</p>';
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
    let params = window.location.search;
    let urlParams = new URLSearchParams(params);
    let name = urlParams.get('name');
    if (msg_entry.value)
        socket.send(name + ': ' + msg_entry.value);
    msg_entry.value = "";
}