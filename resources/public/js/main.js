
let ws;

function log(texto){

    const logDiv =
        document.getElementById("log");

    logDiv.innerHTML +=
        texto + "<br>";

    logDiv.scrollTop =
        logDiv.scrollHeight;
}

function conectar(){

    const nombre = document.getElementById("nombre").value;

    const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocolo}//${window.location.host}/ws`;

    console.log("HOST =", window.location.host);
    console.log("PROTO =", window.location.protocol);
    console.log("WS URL =", wsUrl);
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {

        log("🟢 Conectado");

        ws.send(JSON.stringify({
            eventoCliente:"conectar",
            nombre:nombre
        }));
    };

    ws.onmessage = (evento) => {

        const data =
            JSON.parse(evento.data);

        log(
            "⬅️ " +
            JSON.stringify(data)
        );

        if(data.jugadores){

            mostrarJugadores(
                data.jugadores
            );
        }
    };

    ws.onclose = () => {

        log("🔴 Desconectado");
    };

    ws.onerror = (e) => {

        console.error(e);

        log("❌ Error");
    };
}

function iniciarPartida(){

    if(!ws){
        alert("Conéctate primero");
        return;
    }

    const cancion =
        Number(
            document.getElementById("cancion").value
        );

    const cantidad =
        Number(
            document.getElementById("cantidad").value
        );

    const mensaje = {

        eventoCliente:"iniciarPartida",

        cancion:cancion,

        cantidadJugadores:cantidad
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ " +
        JSON.stringify(mensaje)
    );
}

function mostrarJugadores(jugadores){

    const div =
        document.getElementById("jugadores");

    div.innerHTML = "";

    jugadores.forEach(j => {

        div.innerHTML += `
            <div>
                👤 ${j.nombre}
                (${j.rol})
            </div>
        `;
    });
}

let puntajeActual = 0;

function enviarPerfect(){

    puntajeActual += 100;

    const mensaje = {
        eventoCliente:"puntaje",
        resultado:"perfect",
        puntajeTotal:puntajeActual
    };

    ws.send(JSON.stringify(mensaje));

    log("➡️ " + JSON.stringify(mensaje));
}

function enviarGood(){

    puntajeActual += 50;

    const mensaje = {
        eventoCliente:"puntaje",
        resultado:"good",
        puntajeTotal:puntajeActual
    };

    ws.send(JSON.stringify(mensaje));

    log("➡️ " + JSON.stringify(mensaje));
}

function enviarMiss(){

    const mensaje = {
        eventoCliente:"puntaje",
        resultado:"miss",
        puntajeTotal:puntajeActual
    };

    ws.send(JSON.stringify(mensaje));

    log("➡️ " + JSON.stringify(mensaje));
}