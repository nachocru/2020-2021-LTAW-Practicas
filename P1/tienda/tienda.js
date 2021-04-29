//-- Dependencias 
const http = require('http');
const fs = require('fs');
const PORT = 9002

const server = http.createServer((req, res) => {

    console.log("Petición recibida!");
    const myURL = new URL(req.url, 'http://' + req.headers['host']);
    console.log("URL solicitada: " + myURL.pathname);

    let page = '' //-- Página que queremos cargar
    if (myURL.pathname == "/") { //-- Cuando lanzamos nuestra página web
        page = './home.html'
    } else { // -- En cualquier otro caso
        page = '.' + myURL.pathname;
    }

    console.log("Página solicitada: " + page)

    content = page.split(".").pop()
    console.log("Contenido de la página: " + content);

    fs.readFile(page, (err, data) => {

        if (err) {
            console.log("Error!!")
            console.log(err.message);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        switch (content) {
            case 'html':
                res.writeHead(200, { 'Content-Type': 'text/html' });
            case 'css':
                res.writeHead(200, { 'Content-Type': 'text/css' });
            default:
                res.writeHead(200, { 'Content-Type': content });
        }
        res.write(data);
        res.end();
    });

});

server.listen(PORT);

console.log("Mi tienda. Escuchando en puerto: " + PORT);