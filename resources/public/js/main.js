
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

    const nombre =
        document.getElementById("nombre").value;

    const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocolo}//${window.location.host}/ws`;

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