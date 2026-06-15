class ConfigPlayersClass {
    constructor() {
        // posiciones admin
        this.xAdmin = 0;
        this.yAdmin = 0;
        this.widthAdmin = 0;
        this.gapAdmin = 0;

        // posiciones cliente
        this.xCliente = 0;
        this.yCliente = 0;
        this.widthCliente = 0;
        
        this.isAdmin = false;
        this.cargarCotenido = false;

        this.numeroJugadores = new NumeroJugadoresClass(); // seleccion de num de jugadores
        this.listaJugadores = new ListaJugadoresClass(); // lista de conectados
        this.botonIniciar = null; // boton inicar Partida
    }

    // CONFIGURACIONES
    setConfigAdmin(x, y, width, gapYBloques) {
        this.xAdmin = x;
        this.yAdmin = y;
        this.widthAdmin = width;
        this.gapAdmin = gapYBloques;
    }

    setConfigCliente(x, y, width) {
        this.xCliente = x;
        this.yCliente = y;
        this.widthCliente = width;
    }

    setConfigBotonIniciar(srcNormal, srcHover, width, height, valorRetorno) {
        this.botonIniciar = new BotonClass(srcNormal, srcHover, width, height, valorRetorno);
    }

    getListaJugadoresClass() {
        return this.listaJugadores;
    }

    getNumeroJugadoresClass() {
        return this.numeroJugadores;
    }

    // CARGA DE DATOS 
    setJugadores(jugadorCliente, listaJugadoresJson) {
        this.cargarCotenido = true;
        const miJugador = listaJugadoresJson.find(j => j.nombre === jugadorCliente);
        this.isAdmin = miJugador ? (miJugador.rol === "admin") : false;

        this.numeroJugadores.setJugadoresDisponibles(listaJugadoresJson.length);        
        this.listaJugadores.setJugadores(jugadorCliente, listaJugadoresJson);

        this._recalcularPosiciones();
    }
    
    // recalcular posiciones de los componentes hacia abajo segun el rol
    _recalcularPosiciones() {
        if (this.isAdmin) {
            let currentY = this.yAdmin;
            const currentX = this.xAdmin;

            // opciones numeros jugadores
            this.numeroJugadores.setPos(currentX, currentY);
            currentY += this.numeroJugadores.getAltoTotal() + this.gapAdmin;

            // boton iniciar
            if (this.botonIniciar) {
                const btnX = currentX + (this.widthAdmin - this.botonIniciar.width) / 2;
                this.botonIniciar.setPos(btnX, currentY);
                currentY += this.botonIniciar.height + this.gapAdmin;
            }

            // lista Jugadores
            this.listaJugadores.setPos(currentX, currentY);
            
        } else { // no admins
            // solo la lista de jugadores
            this.listaJugadores.setPos(this.xCliente, this.yCliente);
        }
    }

    // EVENTOS MOUSE
    actualizarHover(mouseX, mouseY) {
        if (this.isAdmin) {
            this.numeroJugadores.actualizarHover(mouseX, mouseY);
            if (this.botonIniciar) {
                this.botonIniciar.actualizarHover(mouseX, mouseY);
            }
        }
    }

    obtenerClic(mouseX, mouseY) {
        if (!this.isAdmin) return null;

        // para verificar clic en la seleccion de jugadores
        const resNumeros = this.numeroJugadores.obtenerClic(mouseX, mouseY);
        if (resNumeros !== null) {
            console.log(`[ConfigPlayersClass] cantidad seleccionada: ${resNumeros}`);
            return null; // no activar el inicio de partida de abajo 
        }

        // para verificar clic en boton iniciar
        const resBoton = this.botonIniciar.obtenerClic(mouseX, mouseY);
        if (resBoton !== null) {
            const cantidadSeleccionada = this.numeroJugadores.getSeleccion();
            console.log(`[ConfigPlayersClass] Boton iniciarPartida presionado. con: ${cantidadSeleccionada} players`);
            return cantidadSeleccionada; 
        }
        return null;
    }

    // DRAW    
    draw(ctx) {
        if (this.cargarCotenido !== true) return;
        
        if (this.isAdmin) {
            this.numeroJugadores.draw(ctx);
            this.botonIniciar.draw(ctx);
        }
        
        this.listaJugadores.draw(ctx);
    }
}