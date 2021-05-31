//-- Dependencias 
const http = require('http');
const fs = require('fs');
const PORT = 9000

// Vamos a sacar los nombres de los productos

const FICHERO_JSON = "tienda.json"
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

var product_stocks = []; // Obtener del fichero json los stocks de los productos
tienda["products"].forEach((element, index) => {
    product_stocks.push(element["stock"])
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

var product_carrito = []; // Para hacer un recuento de los productos comprados
tienda["products"].forEach((element, index) => {
    product_carrito.push({
        name: product_names[index],
        quantity: 0
    })
});

function resetCarrito() {
    product_carrito.forEach((element, index) => {
        element.quantity = 0;
    });
}


var users_names = []; // Obtener del fichero json los nombres de usuarios
tienda["users"].forEach((element, index) => {
    users_names.push(element["name"])
});

var users_passwords = []; // Obtener del fichero json las contraseñas de usuarios
tienda["users"].forEach((element, index) => {
    users_passwords.push(element["password"])
});


//-- Función que obtiene la cookie de usuario
function get_user(req) {
    //-- Leer la Cookie recibida
    const cookie = req.headers.cookie;

    //-- Hay cookie
    if (cookie) {
        //-- Obtener un array con todos los pares nombre-valor
        let pares = cookie.split(";");
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

//-- Función que obtiene la cookie del carrito con los productos
function get_carrito(req) {
    console.log("REQ" + req.headers.cookie)
    const cookie = req.headers.cookie;

    if (cookie) {
        let pares = cookie.split(";");
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

//-- Función que obtiene la cookie del producto actual
function get_product(req) {
    const cookie = req.headers.cookie;

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

function get_products(string) {
    let products = string.split(":");
    return products
}

// Funcion que obtiene los datos de un producto al pinchaer en su página
function setProductData(name) {
    var PRODUCT_DETAIL_HTML = fs.readFileSync('product-detail.html', 'utf-8');
    let content;
    let indice = product_names.indexOf(name);


    // Reemplazamos todos los datos
    content = PRODUCT_DETAIL_HTML.replace("PRODUCT_NAME", name);
    content = content.replace("PRODUCT_TITLE", name);
    content = content.replace("PRICE", product_prices[indice]);
    content = content.replace("STOCK", product_stocks[indice]);
    content = content.replace("PHOTO", product_photo[indice]);
    content = content.replace("ALTERNATIVE_PHOTO", product_alternative_photo[indice]);
    content = content.replace("DESCRIPTION", product_descriptions[indice]);
    if (product_stocks[indice] != 0) {
        content = content.replace("BUTTON", `<button class="buy_button"><a style="text-decoration:none; color:rgb(53, 53, 53)" href="/anadir">Añadir al carrito</a></button>`);
    } else {
        content = content.replace("BUTTON", 'No hay stock de este producto');
    }

    return content;
}

// Funcion que devuelve una respuesta del servidor
function sendContent(res, content, content_type) {
    res.setHeader('Content-Type', content_type);
    res.write(content);
    res.end()
}

const server = http.createServer((req, res) => {

    console.log("Petición recibida!");
    const myURL = new URL(req.url, 'http://' + req.headers['host']);
    console.log("URL solicitada: " + myURL.pathname);

    //-- Obtenemos la info del usuario, el producto y el carrito
    let user = get_user(req);
    let carrito = get_carrito(req);
    let product = get_product(req);

    let page = '' //-- Página que queremos cargar
    if (myURL.pathname == '/procesar') { // Cuando se hace login
        let name = myURL.searchParams.get('name');
        let password = myURL.searchParams.get('password');
        console.log("Nombre: " + name);
        console.log("Password: " + password);
        //-- Comprobamos si el nombre coincide con el guardado en base de datos
        let userExist = false;
        for (i = 0; i < users_names.length; i++) {
            if (name == users_names[i] && password == users_passwords[i]) {
                userExist = true
            }
        }
        if (userExist == true) {
            //-- Asignar la cookie de usuario 
            res.setHeader('Set-Cookie', "user=" + name);
            page = './login-success.html'
        } else {
            page = './login-fail.html'
        }
    } else if (myURL.pathname == "/anadir") { // Añadir producto al carrito
        if (user) { // Solo se puede añadir si hay un usuario registrado
            tienda["products"].forEach((element, index) => {
                if (element['name'] == product) {
                    tienda["products"][index].stock = tienda["products"][index].stock - 1;
                    product_stocks[index] -= 1;
                    let myJSON = JSON.stringify(tienda);
                    //-- Guardarla en el fichero destino
                    fs.writeFileSync(FICHERO_JSON, myJSON);
                }
            });
            if (carrito && carrito != 'empty') {
                res.setHeader('Set-Cookie', "carrito=" + carrito + ':' + product);
            } else {
                res.setHeader('Set-Cookie', "carrito=" + product);
            }
            page = './added-success.html'
        } else {
            page = './not-logged.html'
        }

    } else if (myURL.pathname == "/cart.html") {
        if (user) {
            page = '.' + myURL.pathname;

        } else {
            page = './not-logged.html'
        }


    } else if (myURL.pathname == "/comprar") { // Procesamiento de la compra

        let direction = myURL.searchParams.get('direction');
        let card = myURL.searchParams.get('card');
        console.log("Dirección: " + direction);
        console.log("Número de tarjeta: " + card);

        if (carrito) {
            product_carrito.forEach((element, index) => {
                if (element.quantity != 0) {
                    tienda["orders"].push({
                        "user": user,
                        "direction": direction,
                        "card": card,
                        "products": [{
                            "name": element.name,
                            "quantity": element.quantity
                        }]
                    })
                }
            })
        }
        //-- Añadimos esta info al fichero json
        //-- Modificar el nombre del producto 2


        //-- Convertir la variable a cadena JSON
        let myJSON = JSON.stringify(tienda);

        //-- Guardarla en el fichero destino
        fs.writeFileSync(FICHERO_JSON, myJSON);
        res.setHeader('Set-Cookie', "carrito=empty");
        page = './shop_finish.html'


    } else if (myURL.pathname == "/") { //-- Cuando lanzamos nuestra página web
        page = './home.html'
    } else if (myURL.pathname == "/productos") {

        console.log("Peticion de Productos!")
        content_type = "application/json";

        //-- Leer los parámetros
        let param1 = myURL.searchParams.get('param1');

        param1 = param1.toUpperCase();

        console.log("  Param: " + param1);

        let result = [];

        for (let prod of product_names) {

            //-- Pasar a mayúsculas
            prodU = prod.toUpperCase();

            //-- Si el producto comienza por lo indicado en el parametro
            //-- meter este producto en el array de resultados
            if (prodU.includes(param1)) {
                result.push(prod);
            }

        }
        console.log(result);
        content = JSON.stringify(result);
        res.setHeader('Content-Type', content_type);
        res.write(content);
        res.end()
        return;
    } else if (myURL.pathname == "/client.js") {
        //-- Leer fichero javascript
        let recurso = myURL.pathname;
        recurso = recurso.substr(1);
        console.log("recurso: " + recurso);
        fs.readFile(recurso, 'utf-8', (err, data) => {
            if (err) {
                console.log("Error: " + err)
                return;
            } else {
                res.setHeader('Content-Type', 'application/javascript');
                res.write(data);
                res.end();
            }
        });

        return;

        //-- Si no es ninguna de las anteriores devolver mensaje de error
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
    } else if (page == './cart.html') {
        var CART_HTML = fs.readFileSync('cart.html', 'utf-8');
        let content_type = "text/html";
        let content = CART_HTML;
        if (carrito) {
            resetCarrito();
            productos = get_products(carrito)
            productos.forEach((element, index) => {
                product_carrito.forEach((element2, index2) => {
                    if (element == element2.name) {
                        product_carrito[index2].quantity += 1;
                    }
                })
            })
            let linea = ''
            product_carrito.forEach((element, index) => {
                if (element.quantity != 0) {
                    linea = linea + '<br>' + element.name + '  ---------------->  ' + element.quantity + '<br>'
                }
            })
            content = CART_HTML.replace("No hay productos en el carrito.", linea);
            CART_HTML = content;
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
        let content = setProductData("Catan");
        let content_type = "text/html";
        //-- Enviar la respuesta
        res.setHeader('Set-Cookie', "product=" + "Catan");
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