console.log("Ejecutando Javascript...");

//-- Elementos HTML para mostrar informacion
const display1 = document.getElementById("display1");

//-- Caja de busqueda
const caja = document.getElementById("caja");

//-- Retrollamda del boton de Ver productos
caja.oninput = () => {

    //-- Crear objeto para hacer peticiones AJAX
    const m = new XMLHttpRequest();

    //-- Función de callback que se invoca cuando
    //-- hay cambios de estado en la petición
    m.onreadystatechange = () => {

        //-- Petición enviada y recibida. Todo OK!
        if (m.readyState == 4) {

            //-- Solo la procesamos si la respuesta es correcta
            if (m.status == 200) {

                //-- La respuesta es un objeto JSON
                let productos = JSON.parse(m.responseText)

                console.log("PRODUCTOOOS: " + productos);

                //-- Borrar el resultado anterior
                display1.innerHTML = "";

                //--Recorrer los productos del objeto JSON
                for (let i = 0; i < productos.length; i++) {
                    let link;
                    switch (productos[i]) {
                        case 'Risk Star Wars':
                            link = 'risk-detail.html';
                            break;
                        case 'Exploding Kittens':
                            link = 'exploding-detail.html';
                            break;
                        case 'Harry Potter juego de mesa':
                            link = 'harry-details.html';
                            break;
                        default:
                            link = productos[i].toLowerCase() + '-detail.html'
                            break;
                    }

                    //-- Añadir cada producto al párrafo de visualización
                    display1.innerHTML += '<div class="search"><a href="' + link + '">' + productos[i] + '</a></div>';
                    //display1.innerHTML += '<a class="search" href="' + productos[i].toLowerCase(); + '-detail.html">' + productos[i] + '</a>';
                }

            } else {
                //-- Hay un error en la petición
                //-- Lo notificamos en la consola y en la propia web
                console.log("Error en la petición: " + m.status + " " + m.statusText);
                display1.innerHTML += '<p>ERROR</p>'
            }
        }
    }

    console.log(caja.value.length);

    //-- La peticion se realia solo si hay al menos 1 carácter
    if (caja.value.length >= 1) {

        //-- Configurar la petición
        m.open("GET", "/productos?param1=" + caja.value, true);

        //-- Enviar la petición!
        m.send();

    } else {
        display1.innerHTML = "";
    }
}