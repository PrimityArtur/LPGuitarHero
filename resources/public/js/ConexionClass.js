class ConexionClass {
    constructor(logger) {
        this.ws = null;
        this.logger = logger;
        this.nombreJugador = "";

        this.onLibre = null;
        this.onOcupado = null;
        this.onReconexionExitosa = null;
        this.onActualizarJugadores = null;
        this.onListaCanciones = null;
        this.onPartidaIniciada = null;
        this.onActualizarPuntaje = null;
        this.onJugadorTermino = null;
        this.onResultadoFinal = null;
        this.onSalaEspera = null;
        this.onError = null;
    }

    conectar(nombre) {
        if (nombre.trim() === "") {
            alert("Ingrese un nombre");
            return;
        }

        this.nombreJugador = nombre;

        const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocolo}//${window.location.host}/ws`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.logger.print("🟢 Conectado");
            
            this.enviar({
                eventoCliente: "conectar",
                nombre: this.nombreJugador
            });
        };

        this.ws.onmessage = (evento) => {
            const data = JSON.parse(evento.data);
            this.logger.print("⬅️ " + JSON.stringify(data));
            this.procesarEventoServidor(data);
        };

        this.ws.onclose = () => {
            this.logger.print("🔴 Desconectado");
        };

        this.ws.onerror = (e) => {
            console.error(e);
            this.logger.print("❌ Error");
        };
    }

    procesarEventoServidor(data) {
        switch (data.eventoServidor) {
            case "libre":
                this.onLibre(data);
                break;
            case "ocupado":
                alert("Nombre ocupado");
                this.onOcupado(data);
                break;
            case "reconexionExitosa":
                this.onReconexionExitosa(data);
                break;
            case "actualizarJugadores":
                this.onActualizarJugadores(data.jugadores);
                break;
            case "listaCanciones":
                this.onListaCanciones(data.canciones);
                break;
            case "partidaIniciada":
                this.logger.print(`🎵 Partida iniciada`);
                this.onPartidaIniciada(data);
                break;
            case "actualizarPuntaje":
                this.logger.print(`🏆 ${data.jugador} -> ${data.puntajeTotal}`);
                this.onActualizarPuntaje(data);
                break;
            case "jugadorTermino":
                this.logger.print(`🏁 ${data.jugador} termino`);
                this.onJugadorTermino(data);
                break;
            case "resultadoFinal":
                this.onResultadoFinal(data);
                break;
            case "salaEspera": 
                this.onSalaEspera(data);
                break;
            case "error":
                alert(data.mensaje);
                this.onError(data);
                break;
            default:
                console.log("🔴 Evento desconocido:", data);
        }
    }

    // ENVIAR MENSAJES AL SERVER
    enviar(mensaje) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const json = JSON.stringify(mensaje);
            this.ws.send(json);
            this.logger.print("➡️ " + json);
        } else {
            alert("No hay conexión con el servidor");
        }
    }

    // ============== ACCIONES JUGADOR
    // ====================================

    iniciarPartida(idCancion, cantidadJugadores) {
        this.enviar({
            eventoCliente: "iniciarPartida",
            cancion: idCancion,
            cantidadJugadores: cantidadJugadores
        });
    }

    enviarPuntaje(resultado, puntajeTotal) {
        this.enviar({
            eventoCliente: "puntaje",
            resultado: resultado,
            puntajeTotal: puntajeTotal
        });
    }

    enviarFinPartida() {
        this.enviar({
            eventoCliente: "finPartida"
        });
        this.logger.print("➡️ finPartida"); 
    }

    continuarJugando() {
        this.enviar({
            eventoCliente: "continuar"
        });
        this.logger.print("➡️ continuar");
    }

    salirPartida() {
        this.enviar({
            eventoCliente: "salir"
        });
        this.logger.print("➡️ salir");
    }
}