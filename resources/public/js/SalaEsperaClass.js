class SalaEsperaClass {
    constructor() {
        this.bgAdmin = null;
        this.bgCliente = null;
        this.isAdmin = false;

        this.listaCanciones = new ListaCancionesClass();
        this.configPlayers = new ConfigPlayersClass();
    }

    // CONFIGURACIONES
    setConfigBgs(srcBgAdmin, srcBgCliente) {
        this.bgAdmin = new ImageClass(srcBgAdmin, 1920, 1080, 12, 10);
        this.bgCliente = new ImageClass(srcBgCliente, 1920, 1080, 12, 10);
    }

    getListaCancionesClass() {
        return this.listaCanciones;
    }

    getConfigPlayersClass() {
        return this.configPlayers;
    }

    // cargar lista y obtener si el local es admin
    setJugadores(jugadorCliente, listaJugadoresJson) {
        const miJugador = listaJugadoresJson.find(j => j.nombre === jugadorCliente);
        this.isAdmin = miJugador ? (miJugador.rol === "admin") : false;

        this.listaCanciones.setIsAdmin(this.isAdmin);
        this.configPlayers.setJugadores(jugadorCliente, listaJugadoresJson);
    }

    actualizarHover(mouseX, mouseY) {
        this.listaCanciones.actualizarHover(mouseX, mouseY);
        this.configPlayers.actualizarHover(mouseX, mouseY);
    }

    obtenerClic(mouseX, mouseY) {
        if (!this.isAdmin) return null;

        // verificar y para setear idxPermantHovered (id de cancion) en la cancion seleccionada
        this.listaCanciones.obtenerClic(mouseX, mouseY);

        // verificar si se presiono Iniciar Partida
        const cantidadJugadores = this.configPlayers.obtenerClic(mouseX, mouseY);
        
        if (cantidadJugadores !== null) {
            let idCancionSel = null;
            
            // obtener cancion seleccionada idxPermantHovered de la lista
            if (this.listaCanciones.idxPermantHovered !== null) {
                idCancionSel = this.listaCanciones.items[this.listaCanciones.idxPermantHovered].data.id;
            }

            return {
                tipo: "iniciarPartida",
                idCancion: idCancionSel,
                cantidad: cantidadJugadores
            };
        }
        
        return null;
    }

    // dibuja fondo y componentes segun rol
    draw(ctx) {
        if (this.isAdmin) {
            if (this.bgAdmin) this.bgAdmin.draw(ctx);
            this.listaCanciones.draw(ctx);
        } else {
            if (this.bgCliente) this.bgCliente.draw(ctx);
        }
        
        this.configPlayers.draw(ctx);
    }
}