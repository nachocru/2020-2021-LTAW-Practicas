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
            console.log('ha habido error')
            var HOME_HTML = fs.readFileSync('./error.html', 'utf-8');
            res.statusCode = 404;
            res.statusMessage = "Ha habido un error";
            res.setHeader('Content-Type', "text/html");
            res.write(HOME_HTML);
            return res.end();
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