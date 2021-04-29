//-- Dependencias 
const http = require('http');
const fs = require('fs');
const PORT = 9000

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
        let code = 200;
        let code_msg = "OK";
        let content_type = "text/html";

        if (err) {
            console.log("Error!!")
            console.log(err.message);
            code = 404;
            code_msg = "404 Not Found"
            res.writeHead(code, { 'Content-Type': 'text/html' });
            return res.end(code_msg);
        }
        switch (content) {
            case 'html':
                content_type = "text/html";
            case 'css':
                content_type = "text/css";
            default:
                content_type = content;
        }
        res.statusCode = code;
        res.statusMessage = code_msg;
        res.setHeader('Content-Type', content_type);
        res.write(data);
        res.end();
    });

});

server.listen(PORT);

console.log("Mi tienda. Escuchando en puerto: " + PORT);