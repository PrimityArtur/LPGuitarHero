class GameControllerClass {
    constructor(logger) {
        // Coneccion para definir sus lambdas
        this.red = new ConexionClass(logger);

        // estados ("LOGIN", "SALA_ESPERA", "JUEGO")
        this.estadoActual = "LOGIN"; 
        
        // pantallas de estados
        this.pantallaLogin = new PantallaLoginClass();
        this.salaEspera = new SalaEsperaClass();
        this.juegoIniciado = new JuegoIniciadoClass();
        this.finPartida = new FinPartidaClass();

        // INIT server ConexionClass
        this._configurarEventosRed();
    }

    // CONFIG ESTADOS IMG 
    configurarAssetsLogin(srcBg, srcCarpetaLetras, srcBtnNormal, srcBtnHover) {
        this.pantallaLogin.setConfig(srcBg, srcCarpetaLetras, srcBtnNormal, srcBtnHover);
    }

    configurarAssetsSalaEspera(srcBgAdmin, srcBgCliente) {
        this.salaEspera.setConfigBgs(srcBgAdmin, srcBgCliente);
    }

    getSalaEsperaClass() {
        return this.salaEspera;
    }

    getJuegoIniciadoClass() {
        return this.juegoIniciado;
    }

    getFinPartidaClass() {
        return this.finPartida;
    }

    // CONGIF FUNCIONES SERVER ConexionClass
    _configurarEventosRed() {
        this.red.onLibre = (data) => { // nombre aceptado
            console.log(`[JUEGO] [Login] Rol asignado: ${data.rol}`);
            this.estadoActual = "SALA_ESPERA";
            // cargar catalogo local al entrar a la sala
            this.salaEspera.getListaCancionesClass().cargarCanciones(null);
        };

        this.red.onOcupado = () => { // nombre ocupado
            console.log("[JUEGO] [Login] Nombre Ocupado. Limpiando input");
            this.pantallaLogin.inputNombre.limpiarTexto();
        };

        this.red.onReconexionExitosa = (data) => {
            console.log("[JUEGO] Reconexion exitosa");

            this.estadoActual = "JUEGO";

            this.juegoIniciado.iniciarPartida(data, this.red.nombreJugador, data.tiempoActual);
            this.juegoIniciado.restaurarPuntajes(data.puntajes);

        };

        // recibir actualizacion de jugadores se envia a la sala de espera
        this.red.onActualizarJugadores = (jugadores) => {
            if (this.estadoActual !== "JUEGO") {
                this.salaEspera.setJugadores(this.red.nombreJugador, jugadores);
            }
        };

        // recibir catalogo de canciones se envia a la sala de espera
        this.red.onListaCanciones = (canciones) => {
            this.salaEspera.getListaCancionesClass().cargarCanciones(canciones);
        };

        this.red.onConfiguracionSala = (data) => {
            const sala = this.salaEspera;
            sala.getListaCancionesClass().seleccionarCancion(data.cancionId);
            sala.getConfigPlayersClass().seleccionarCantidad(data.cantidadJugadores);
        };
        
        // recibir json partida
        this.red.onPartidaIniciada = (data) => {
            console.log("[JUEGO] Partida iniciada por el host.");
            this.estadoActual = "JUEGO";
            // json y nombre local para tablero nuestro
            this.juegoIniciado.iniciarPartida(data, this.red.nombreJugador);
        };

        // recibir hit reivales
        this.red.onActualizarPuntaje = (data) => {
            if (this.estadoActual === "JUEGO") {
                this.juegoIniciado.actualizarPuntajeRemoto(data.jugador, data.resultado, data.puntajeTotal);
            }
        };

        this.red.onJugadorTermino = (data) => {
            console.log(`[JUEGO] Rival termino la cancion: ${data.jugador}`);
        };

        this.red.onResultadoFinal = (data) => {
            console.log(`[JUEGO] Partida finalizada. Ganador: ${data.ganador}`);
            this.finPartida.cargarResultados(data.ranking); 
            this.estadoActual = "FIN_PARTIDA"; 
        };

        this.red.onSalaEspera = (data) => {
            console.log("[JUEGO] Retornando a la sala de espera por host");
            this.estadoActual = "SALA_ESPERA";
        };

        this.red.onError = (data) => {
            console.error("[JUEGO] Error del servidor:", data);
        };
    }

    // EVENTOS MOUSE - TECLADO
    procesarTecla(tecla) {
        if (this.estadoActual === "LOGIN") {
            this.pantallaLogin.procesarTecla(tecla);
        } else if (this.estadoActual === "JUEGO") {
            // si fue un hit, retorna datos.
            const hitRes = this.juegoIniciado.procesarTecla(tecla);
            if (hitRes !== null) {
                // enviar puntaje local al servidor
                this.red.enviarPuntaje(hitRes.resultado, hitRes.puntaje);
            }
        }
    }

    actualizarHover(mouseX, mouseY) {
        if (this.estadoActual === "LOGIN") {
            this.pantallaLogin.actualizarHover(mouseX, mouseY);
        } else if (this.estadoActual === "SALA_ESPERA") {
            this.salaEspera.actualizarHover(mouseX, mouseY);
        } else if (this.estadoActual === "FIN_PARTIDA") {
            this.finPartida.actualizarHover(mouseX, mouseY);
        }
    }

    obtenerClic(mouseX, mouseY) {
        if (this.estadoActual === "LOGIN") {
            const res = this.pantallaLogin.obtenerClic(mouseX, mouseY);
            // res === 1, se presiono el boton de entrar al lobby
            if (res === 1) { 
                const nombreIngresado = this.pantallaLogin.getTexto();
                if (nombreIngresado.length > 0) {
                    this.red.conectar(nombreIngresado); // conectar al backend
                }
            }
        } else if (this.estadoActual === "SALA_ESPERA") {
            const resSala = this.salaEspera.obtenerClic(mouseX, mouseY);

            if (resSala && resSala.tipo === "configuracionSala") 
            {
                this.red.enviarConfiguracionSala(resSala.idCancion, resSala.cantidad);
                return;
            }
            // si admin apreto boton de iniciar con cancion y n jugadores
            if (resSala && resSala.tipo === "iniciarPartida") {
                if (resSala.idCancion === null) {
                    alert("Selecciona una cancion primero.");
                    return;
                }
                if (resSala.cantidad === null) {
                    alert("Selecciona la cantidad de jugadores primero.");
                    return;
                }
                
                // enviar al backend
                this.red.iniciarPartida(resSala.idCancion, resSala.cantidad);
            }
        } else if (this.estadoActual === "FIN_PARTIDA") {
            const resFin = this.finPartida.obtenerClic(mouseX, mouseY);
            
            if (resFin === "volver") {
                this.red.continuarJugando();
                this.estadoActual = "SALA_ESPERA";
            } else if (resFin === "menu") {
                this.red.salirPartida();
                this.estadoActual = "LOGIN";
            }
        }
    }

    // DIBUJAR ESTADO
    draw(ctx) {
        if (this.estadoActual === "LOGIN") {
            this.pantallaLogin.draw(ctx);
        } else if (this.estadoActual === "SALA_ESPERA") {
            this.salaEspera.draw(ctx);
        } else if (this.estadoActual === "JUEGO") {
            
            // por si hubo varios mis al mismo tiempo junto con fin de partida
            const eventos = this.juegoIniciado.actualizarLogica();

            if (eventos && eventos.length > 0) {
                for (let i = 0; i < eventos.length; i++) {
                    const ev = eventos[i];
                    
                    if (ev.tipo === "FIN_CANCION") {
                        this.red.enviarFinPartida();
                        this.estadoActual = "FIN_PARTIDA";
                    } else if (ev.tipo === "MISS") {
                        for (let m = 0; m < ev.cantidad; m++) {
                            this.red.enviarPuntaje("miss", ev.puntaje);
                        }
                    }
                }
            }

            // Solo se dibuja el juego si no acabo de terminar
            if (this.estadoActual === "JUEGO") {
                this.juegoIniciado.draw(ctx);
            }
            
        } else if (this.estadoActual === "FIN_PARTIDA") {
            this.finPartida.draw(ctx);
        }
    }
}