const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const info4 = document.getElementById("info4");
const info5 = document.getElementById("info5");
const info6 = document.getElementById("info6");
const info7 = document.getElementById("info7");
const URL = document.getElementById("URL");
const QR = document.getElementById("QR");
const print = document.getElementById("print");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.arch;
info2.textContent = process.platform;
info3.textContent = process.cwd();
info4.textContent = process.versions.node;
info5.textContent = process.versions.electron;
info6.textContent = process.versions.chrome;

// -- Cuando apretamos el botón enviamos a todos los usuarios del chat un mensaje
btn_test.onclick = () => {
    console.log("Botón apretado!");
    electron.ipcRenderer.invoke('test', "Hola desde el Home Chat Server!");
}

// -- Recibir los usuarios conectados al chat
electron.ipcRenderer.on('users', (event, message) => {
    console.log("Recibido: " + message);
    info8.textContent = message;
});

// -- Los usuarios del chat escriben algún mensaje
electron.ipcRenderer.on('message', (event, message) => {
    console.log("Recibido: " + message);
    display.innerHTML += '<p class="messages">' + '> ' + message + '</p>';
});

// -- Los usuarios del chat escriben algún mensaje
electron.ipcRenderer.on('url', (event, message) => {
    URL.innerHTML = '<a href="' + message + '">' + message + '</a>';
});