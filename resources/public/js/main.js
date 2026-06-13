let ws;

let puntajeActual = 0;

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

    if(nombre.trim() === ""){
        alert("Ingrese un nombre");
        return;
    }

    const protocolo =
        window.location.protocol === "https:"
        ? "wss:"
        : "ws:";

    const wsUrl =
        `${protocolo}//${window.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {

        log("🟢 Conectado");

        ws.send(
            JSON.stringify({
                eventoCliente:"conectar",
                nombre:nombre
            })
        );

        document.getElementById("estadoNombre")
            .textContent = nombre;
    };

    ws.onmessage = (evento) => {

        const data =
            JSON.parse(evento.data);

        log(
            "⬅️ " +
            JSON.stringify(data)
        );

        procesarEventoServidor(data);
    };

    ws.onclose = () => {

        log("🔴 Desconectado");
    };

    ws.onerror = (e) => {

        console.error(e);

        log("❌ Error");
    };
}

function procesarEventoServidor(data){

    switch(data.eventoServidor){

        case "libre":

            if(data.rol){

                document
                    .getElementById("estadoRol")
                    .textContent =
                    data.rol;
            }

            if(data.jugadores){

                mostrarJugadores(
                    data.jugadores
                );
            }

            break;

        case "ocupado":

            alert(
                "Nombre ocupado"
            );

            break;

        case "actualizarJugadores":

            mostrarJugadores(
                data.jugadores
            );

            break;

        case "listaCanciones":

            mostrarCanciones(
                data.canciones
            );

            break;

        case "partidaIniciada":

            mostrarPartida(
                data
            );

            break;

        case "actualizarPuntaje":

            log(
                `🏆 ${data.jugador} -> ${data.puntajeTotal}`
            );

            break;

        case "jugadorTermino":

            log(
                `🏁 ${data.jugador} terminó`
            );

            break;

        case "resultadoFinal":

            mostrarResultadoFinal(
                data
            );

            break;

        case "error":

            alert(
                data.mensaje
            );

            break;

        default:

            console.log(
                "Evento desconocido:",
                data
            );
    }
}

function mostrarJugadores(jugadores){

    const div =
        document.getElementById("jugadores");

    div.innerHTML = "";

    jugadores.forEach(
        (j,index) => {

            div.innerHTML += `
                <div>
                    ${index + 1}.
                    👤 ${j.nombre}
                    (${j.rol})
                </div>
            `;
        }
    );
}

function mostrarCanciones(canciones){

    const tabla =
        document.getElementById(
            "tablaCanciones"
        );

    tabla.innerHTML = "";

    canciones.forEach(c => {

        tabla.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.duracion}</td>
            <td>${c.dificultad}</td>
        </tr>
        `;
    });
}

function mostrarPartida(data){

    document
        .getElementById(
            "partidaCancion"
        )
        .textContent =
        data.cancion.nombre;

    document
        .getElementById(
            "partidaJugadores"
        )
        .textContent =
        data.jugadores
            .map(j => j.nombre)
            .join(", ");

    document
        .getElementById(
            "partidaNotas"
        )
        .textContent =
        data.notas.length;

    log(
        `🎵 Partida iniciada`
    );
}

function iniciarPartida(){

    if(!ws){

        alert(
            "Conéctate primero"
        );

        return;
    }

    const cancion =
        Number(
            document
            .getElementById(
                "cancion"
            ).value
        );

    const cantidad =
        Number(
            document
            .getElementById(
                "cantidad"
            ).value
        );

    const mensaje = {

        eventoCliente:
            "iniciarPartida",

        cancion:
            cancion,

        cantidadJugadores:
            cantidad
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ " +
        JSON.stringify(mensaje)
    );
}

function actualizarPuntajeVisual(){

    document
        .getElementById(
            "estadoPuntaje"
        )
        .textContent =
        puntajeActual;
}

function enviarPerfect(){

    puntajeActual += 100;

    actualizarPuntajeVisual();

    enviarResultado(
        "perfect"
    );
}

function enviarGood(){

    puntajeActual += 50;

    actualizarPuntajeVisual();

    enviarResultado(
        "good"
    );
}

function enviarMiss(){

    enviarResultado(
        "miss"
    );
}

function enviarResultado(resultado){

    const mensaje = {

        eventoCliente:
            "puntaje",

        resultado:
            resultado,

        puntajeTotal:
            puntajeActual
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ " +
        JSON.stringify(mensaje)
    );
}

function enviarFinPartida(){

    const mensaje = {

        eventoCliente:
            "finPartida"
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ finPartida"
    );
}

function mostrarResultadoFinal(data){

    const div =
        document.getElementById(
            "resultadoFinal"
        );

    let html = "";

    html += `
        <h3>
            🏆 Ganador:
            ${data.ganador}
        </h3>
    `;

    html += `
        <table>
        <tr>
            <th>Jugador</th>
            <th>Puntaje</th>
            <th>Perfect</th>
            <th>Good</th>
            <th>Miss</th>
        </tr>
    `;

    data.ranking.forEach(j => {

        html += `
        <tr>
            <td>${j.nombre}</td>
            <td>${j.puntaje}</td>
            <td>${j.perfect}</td>
            <td>${j.good}</td>
            <td>${j.miss}</td>
        </tr>
        `;
    });

    html += "</table>";

    div.innerHTML = html;
}

function continuarJugando(){

    const mensaje = {

        eventoCliente:
            "continuar"
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ continuar"
    );

    puntajeActual = 0;

    actualizarPuntajeVisual();
}

function salirPartida(){

    const mensaje = {

        eventoCliente:
            "salir"
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ salir"
    );
}