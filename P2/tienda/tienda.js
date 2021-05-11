//-- Dependencias 
const http = require('http');
const fs = require('fs');
const PORT = 9000

// Vamos a sacar los nombres de los productos
const FICHERO_JSON = "tienda.json"
    //-- Leer el fichero JSON
const tienda_json = fs.readFileSync(FICHERO_JSON);
const tienda = JSON.parse(tienda_json);

var product_names = []; // Obtener del fichero json los nombres de los productos
tienda["products"].forEach((element, index) => {
    product_names.push(element["name"])
});

var product_prices = []; // Obtener del fichero json los precios de los productos
tienda["products"].forEach((element, index) => {
    product_prices.push(element["price"])
});

var product_photo = []; // Obtener del fichero json la foto principal de los productos
tienda["products"].forEach((element, index) => {
    product_photo.push(element["photo"])
});

var product_alternative_photo = []; // Obtener del fichero json la foto secundaria de los productos
tienda["products"].forEach((element, index) => {
    product_alternative_photo.push(element["alternative_photo"])
});

var product_descriptions = []; // Obtener del fichero json la descripcion de los productos
tienda["products"].forEach((element, index) => {
    product_descriptions.push(element["description"])
});

var product_links = []; // Obtener del fichero json los links hacia los productos
tienda["products"].forEach((element, index) => {
    product_links.push(element["link"])
});

var users_names = []; // Obtener del fichero json los nombres de usuarios
tienda["users"].forEach((element, index) => {
    users_names.push(element["name"])
});


//-- Analizar la cookie y devolver el nombre del
//-- usuario si existe, o null en caso contrario
function get_user(req) {

    //-- Leer la Cookie recibida
    const cookie2 = req.headers.cookie;

    //-- Hay cookie
    if (cookie2) {

        //-- Obtener un array con todos los pares nombre-valor
        let pares = cookie2.split(";");
        console.log("PARES" + pares)

        //-- Variable para guardar el usuario
        let user;

        //-- Recorrer todos los pares nombre-valor
        pares.forEach((element, index) => {

            //-- Obtener los nombres y valores por separado
            let [nombre, valor] = element.split('=');

            //-- Leer el usuario
            //-- Solo si el nombre es 'user'
            if (nombre.trim() === 'user') {
                user = valor;
            }
        });

        //-- Si la variable user no está asignada
        //-- se devuelve null
        return user || null;
    }
}

function get_carrito(req) {
    console.log("REQ" + req.headers.cookie)

    //-- Leer la Cookie recibida
    const cookie3 = req.headers.cookie;

    //-- Hay cookie
    if (cookie3) {
        let pares = cookie3.split(";");
        let carrito;

        pares.forEach((element, index) => {

            let [nombre, valor] = element.split('=');

            if (nombre.trim() === 'carrito') {
                carrito = valor;
            }
        });

        return carrito || null;
    }
}

function get_product(req) {

    //-- Leer la Cookie recibida
    const cookie = req.headers.cookie;

    //-- Hay cookie
    if (cookie) {
        let pares = cookie.split(";");
        let product;

        pares.forEach((element, index) => {

            let [nombre, valor] = element.split('=');

            if (nombre.trim() === 'product') {
                product = valor;
            }
        });

        return product || null;
    }
}

function setProductData(name) {
    var PRODUCT_DETAIL_HTML = fs.readFileSync('product-detail.html', 'utf-8');
    let content;
    let indice = product_names.indexOf(name);

    content = PRODUCT_DETAIL_HTML.replace("PRODUCT_NAME", name);
    content = content.replace("PRODUCT_TITLE", name);
    content = content.replace("PRICE", product_prices[indice]);
    content = content.replace("PHOTO", product_photo[indice]);
    content = content.replace("ALTERNATIVE_PHOTO", product_alternative_photo[indice]);
    content = content.replace("DESCRIPTION", product_descriptions[indice]);

    return content;
}

function sendContent(res, content, content_type) {
    res.setHeader('Content-Type', content_type);
    res.write(content);
    res.end()
}

const server = http.createServer((req, res) => {


    console.log("Petición recibida!");
    const myURL = new URL(req.url, 'http://' + req.headers['host']);
    console.log("URL solicitada: " + myURL.pathname);

    //-- Obtener le usuario que ha accedido
    //-- null si no se ha reconocido
    let user = get_user(req);
    let carrito = get_carrito(req);
    let product = get_product(req);

    //-- Obtener le usuario que ha accedido
    //-- null si no se ha reconocido
    let page = '' //-- Página que queremos cargar
    if (myURL.pathname == '/procesar') {
        let name = myURL.searchParams.get('name');
        let password = myURL.searchParams.get('password');
        console.log("Nombre: " + name);
        console.log("Password: " + password);
        //-- Comprobamos si el nombre coincide con el guardado en base de datos
        let userExist = false;
        for (i = 0; i < users_names.length; i++) {
            if (name == users_names[i]) {
                userExist = true
            }
        }
        console.log(userExist)
        if (userExist == true) {

            //-- Asignar la cookie de usuario Chuck
            res.setHeader('Set-Cookie', "user=" + name);
            page = './login-success.html'
        } else {
            page = './login-fail.html'
        }
    } else if (myURL.pathname == "/anadir") {
        if (user) {
            if (carrito) {
                res.setHeader('Set-Cookie', "carrito=" + carrito + ':' + product);
            } else {
                res.setHeader('Set-Cookie', "carrito=" + product);
            }
            page = './added-success.html'
        } else {
            page = './not-logged.html'
        }

    } else if (myURL.pathname == "/comprar") {
        let direction = myURL.searchParams.get('direction');
        let card = myURL.searchParams.get('card');
        console.log("Dirección: " + direction);
        console.log("Número de tarjeta: " + card);
        //-- Añadimos esta info al fichero json
        //-- Modificar el nombre del producto 2
        tienda["orders"].push({
            "user": "nachocru",
            "direction": direction,
            "card": card,
            "products": [{
                "name": "Zombicide",
                "quantity": 1
            }]
        })

        //-- Convertir la variable a cadena JSON
        let myJSON = JSON.stringify(tienda);

        //-- Guardarla en el fichero destino
        fs.writeFileSync(FICHERO_JSON, myJSON);
        page = './home.html'
    } else if (myURL.pathname == "/") { //-- Cuando lanzamos nuestra página web
        page = './home.html'
    } else if (myURL.pathname == "/product_details.html/zombicide-detail.html") {
        res.setHeader('Set-Cookie', "product=" + "Zombicide", 'path=/');
        page = '.' + myURL.pathname;
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
        console.log(user)
        if (user) {
            //-- Añadir a la página el nombre del usuario
            content = HOME_HTML.replace("USER", `<p class="welcome">Hola ` + user + `</p>`);
            HOME_HTML = content;
        } else {
            //-- Mostrar el enlace a la página de login
            content = HOME_HTML.replace("USER", `
            <a class="login" href="login.html">Iniciar Sesión</a>
            `);
            HOME_HTML = content;
        }
        for (i = 1; i < 7; i++) {
            content = HOME_HTML.replace("PRODUCT" + i, product_names[i - 1]);
            content = content.replace("PRICE" + i, product_prices[i - 1]);
            content = content.replace("PHOTO" + i, product_photo[i - 1]);
            content = content.replace("ALTERNATIVE_PHOTO" + i, product_alternative_photo[i - 1]);
            content = content.replace("LINK" + i, product_links[i - 1]);
            HOME_HTML = content;
        }

        //-- Enviar la respuesta
        sendContent(res, content, content_type);
    } else if (page == './zombicide-detail.html') {
        let content = setProductData("Zombicide");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Zombicide");
        sendContent(res, content, content_type);
    } else if (page == './catan-detail.html') {
        let content = setProductData("Catán");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Catán");
        sendContent(res, content, content_type);
    } else if (page == './virus-detail.html') {
        let content = setProductData("Virus");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Virus");
        sendContent(res, content, content_type);
    } else if (page == './risk-detail.html') {
        let content = setProductData("Risk Star Wars");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Risk Star Wars");
        sendContent(res, content, content_type);
    } else if (page == './harry-details.html') {
        let content = setProductData("Harry Potter juego de mesa");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Harry Potter juego de mesa");
        sendContent(res, content, content_type);
    } else if (page == './exploding-detail.html') {
        let content = setProductData("Exploding Kittens");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Exploding Kittens");
        sendContent(res, content, content_type);
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