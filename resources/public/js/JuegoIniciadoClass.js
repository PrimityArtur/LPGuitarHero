class JuegoIniciadoClass {
    constructor() {
        this.bgImagen = null;
        
        // tablero central 
        this.tableroLocal = new TableroClass();
        
        // tableros remotos
        this.tablerosRemotos = [];
        for (let i = 0; i < 8; i++) {
            this.tablerosRemotos.push(new TableroClass());
        }

        // para cambiar los fondos segun si el tablero remoto existe
        this.srcBgActivo = "";
        this.srcBgInactivo = "";

        // control de tiempo 
        this.tiempoInicio = 0;
        this.duracionCancionMs = 0; // duracion de cancion enviada por el JSON
        this.enPartida = false;

        this.header = new HeaderIniciarJuegoClass();
    }

    // CONFIGURACIONES
    setConfigFondo(srcBg) {
        this.bgImagen = new ImageClass(srcBg, 1920, 1080, 46, 10);
    }

    setConfigRemotosFondos(srcActivo, srcInactivo) {
        this.srcBgActivo = srcActivo;
        this.srcBgInactivo = srcInactivo;
    }

    // METODOS PARA EXTRAER Y CONFIGURAR DESDE main
    getTableroLocal() {
        return this.tableroLocal;
    }

    getTablerosRemotos() {
        return this.tablerosRemotos;
    }

    getHeaderClass() {
        return this.header;
    }

    // RECIBE EL JSON partidaIniciada
    iniciarPartida(dataPartida, miNombre) {
        const jugadores = dataPartida.jugadores;
        const notas = dataPartida.notas;
        
        this.duracionCancionMs = dataPartida.cancion.duracion;
        
        this.header.setDatos(dataPartida.cancion.nombre, this.duracionCancionMs);
        
        // configurar tablero local
        const miJugadorIndex = jugadores.findIndex(j => j.nombre === miNombre);
        if (miJugadorIndex !== -1) {
            const miJugador = jugadores[miJugadorIndex];
            const textoDisplay = `P${miJugadorIndex + 1} ${miJugador.nombre}`;
            this.tableroLocal.setJugador(miNombre, textoDisplay, true);
            this.tableroLocal.cargarNotas(notas);
        }

        // configurar tableros remotos
        let remotoIndex = 0;
        for (let i = 0; i < jugadores.length; i++) {
            if (jugadores[i].nombre !== miNombre) {
                const tablero = this.tablerosRemotos[remotoIndex];
                const textoDisplay = `P${i + 1} ${jugadores[i].nombre}`; // Ej: P2 ddd
                
                tablero.setJugador(jugadores[i].nombre, textoDisplay, false);
                tablero.cargarNotas(notas);
                if (tablero.bgImagen) {
                    tablero.bgImagen.imagen.src = this.srcBgActivo;
                }
                remotoIndex++;
            }
        }

        // apagar tableros inactivos restantes
        for (let i = remotoIndex; i < 8; i++) {
            const tablero = this.tablerosRemotos[i];
            tablero.setJugador("", "", false);
            tablero.carriles = {}; 
            if (tablero.bgImagen) {
                tablero.bgImagen.imagen.src = this.srcBgInactivo;
            }
        }

        // reiniciar reloj de la cancion
        this.tiempoInicio = Date.now();
        this.enPartida = true;
    }

    // RECIBE EL JSON actualizarPuntaje
    actualizarPuntajeRemoto(nombreJugador, resultado, puntajeTotal) {
        if (!this.enPartida) return;
        
        const tablero = this.tablerosRemotos.find(t => t.nombreJugador === nombreJugador);
        if (tablero) {
            // sincroniza el efecto visual con el tiempo actual
            const tiempoActualMs = Date.now() - this.tiempoInicio;
            tablero.registrarHitRemoto(resultado, puntajeTotal, tiempoActualMs);
        }
    }

    // EVENTO TECLADO LOCAL
    procesarTecla(tecla) {
        if (!this.enPartida) return null;

        let direccion = null;
        
        // aceptaar flechas o ASDF
        if (tecla === "ArrowLeft" || tecla.toLowerCase() === "a") direccion = "izquierda";
        if (tecla === "ArrowUp" || tecla.toLowerCase() === "s") direccion = "arriba";
        if (tecla === "ArrowDown" || tecla.toLowerCase() === "d") direccion = "abajo";
        if (tecla === "ArrowRight" || tecla.toLowerCase() === "f") direccion = "derecha";

        if (direccion) {
            const tiempoActualMs = Date.now() - this.tiempoInicio;
            const hitData = this.tableroLocal.intentarHitLocal(direccion, tiempoActualMs);
            
            return hitData; // { resultado, puntaje } para el backend
        }
        return null;
    }

     //  verifica el fin de la partida y retorna si no se presiono la tecla en un miss
    actualizarLogica() {
        if (!this.enPartida) return null;

        const tiempoActualMs = Date.now() - this.tiempoInicio;
        const eventosDisparados = [];
        
        // verificar misses de notas que pasaron de largo el rango
        const misses = this.tableroLocal.actualizar(tiempoActualMs);
        if (misses > 0) {
            eventosDisparados.push({ tipo: "MISS", cantidad: misses, puntaje: this.tableroLocal.puntaje });
        }

        // Limpiar notas remotos
        for (let i = 0; i < 8; i++) {
            if (this.tablerosRemotos[i].nombreJugador !== "") {
                this.tablerosRemotos[i].actualizar(tiempoActualMs);
            }
        }
        
        // verificar si la cancion termino segun la duracion
        if (tiempoActualMs >= this.duracionCancionMs) {
            this.enPartida = false;
            eventosDisparados.push({ tipo: "FIN_CANCION" });
        }

        return eventosDisparados;
    }

    // DIBUJAR
    draw(ctx) {
        if (!this.enPartida) return;

        const tiempoActualMs = Date.now() - this.tiempoInicio;

        // actualizar local
        this.tableroLocal.actualizar(tiempoActualMs);

        // dibujar fondo
        if (this.bgImagen) this.bgImagen.draw(ctx);

        // dibujar header cancion, tiempo, barra de progreso
        this.header.draw(ctx, tiempoActualMs);

        // dibujar tablero central
        this.tableroLocal.draw(ctx, tiempoActualMs);

        // dibujar tableros laterales
        for (let i = 0; i < 8; i++) {
            const tablero = this.tablerosRemotos[i];
            
            if (tablero.nombreJugador === "") {
                // si esta inactivo
                if (tablero.bgImagen) {
                    tablero.bgImagen.setPos(tablero.x, tablero.y);
                    tablero.bgImagen.draw(ctx);
                }
            } else {
                // si esta activo
                tablero.draw(ctx, tiempoActualMs);
            }
        }
    }
}