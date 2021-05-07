//-- Dependencias 
const http = require('http');
const fs = require('fs');
const PORT = 9000

// Vamos a sacar los nombres de los productos
const FICHERO_JSON = "tienda.json"
    //-- Leer el fichero JSON
const tienda_json = fs.readFileSync(FICHERO_JSON);
const tienda = JSON.parse(tienda_json);

var product_names = [];
tienda["products"].forEach((element, index) => {
    product_names.push(element["name"])
});

var product_prices = [];
tienda["products"].forEach((element, index) => {
    product_prices.push(element["price"])
});

var product_photo = [];
tienda["products"].forEach((element, index) => {
    product_photo.push(element["photo"])
});

var product_alternative_photo = [];
tienda["products"].forEach((element, index) => {
    product_alternative_photo.push(element["alternative_photo"])
});

var product_links = [];
tienda["products"].forEach((element, index) => {
    product_links.push(element["link"])
});

var users_names = [];
tienda["users"].forEach((element, index) => {
    users_names.push(element["name"])
});


//-- Analizar la cookie y devolver el nombre del
//-- usuario si existe, o null en caso contrario
// function get_user(req) {

//     //-- Leer la Cookie recibida
//     const cookie = req.headers.cookie;

//     //-- Hay cookie
//     if (cookie) {

//         //-- Obtener un array con todos los pares nombre-valor
//         let pares = cookie.split(";");

//         //-- Variable para guardar el usuario
//         let user;

//         //-- Recorrer todos los pares nombre-valor
//         pares.forEach((element, index) => {

//             //-- Obtener los nombres y valores por separado
//             let [nombre, valor] = element.split('=');

//             //-- Leer el usuario
//             //-- Solo si el nombre es 'user'
//             if (nombre.trim() === 'user') {
//                 user = valor;
//             }
//         });

//         //-- Si la variable user no está asignada
//         //-- se devuelve null
//         return user || null;
//     }
// }

const server = http.createServer((req, res) => {


    console.log("Petición recibida!");
    const myURL = new URL(req.url, 'http://' + req.headers['host']);
    console.log("URL solicitada: " + myURL.pathname);

    //-- Obtener le usuario que ha accedido
    //-- null si no se ha reconocido
    if (myURL.pathname == '/procesar') {

        let name = myURL.searchParams.get('nombre');
        let apellidos = myURL.searchParams.get('password');
        console.log("Nombre: " + name);
        console.log("Apellidos: " + apellidos);
        //-- Comprobamos si el nombre coincide con el guardado en base de datos
        let userExist = false;
        for (i = 0; i < users_names.length; i++) {
            if (name == users_names[i]) {
                userExist = true
            }
        }
        console.log(userExist)
        content_type = "text/html";


    }

    let page = '' //-- Página que queremos cargar
    if (myURL.pathname == "/") { //-- Cuando lanzamos nuestra página web
        page = './home.html'
    } else { // -- En cualquier otro caso
        page = '.' + myURL.pathname;
    }

    console.log("Página solicitada: " + page)

    content = page.split(".").pop()
    console.log("Contenido de la página: " + content);

    if (page == './home.html') {
        var HOME_HTML = fs.readFileSync('home.html', 'utf-8');
        let content_type = "text/html";
        let content;
        for (i = 1; i < 7; i++) {
            content = HOME_HTML.replace("PRODUCT" + i, product_names[i - 1]);
            HOME_HTML = content;
            content = HOME_HTML.replace("PRICE" + i, product_prices[i - 1]);
            HOME_HTML = content;
            content = HOME_HTML.replace("PHOTO" + i, product_photo[i - 1]);
            HOME_HTML = content;
            content = HOME_HTML.replace("ALTERNATIVE_PHOTO" + i, product_alternative_photo[i - 1]);
            HOME_HTML = content;
            content = HOME_HTML.replace("LINK" + i, product_links[i - 1]);
            HOME_HTML = content;
        }

        //-- Enviar la respuesta
        res.setHeader('Content-Type', content_type);
        res.write(content);
        res.end()
    } else {
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
            } else {
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
            }

        });
    }

});

server.listen(PORT);

console.log("Mi tienda. Escuchando en puerto: " + PORT);