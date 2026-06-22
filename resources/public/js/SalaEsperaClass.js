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
        // ¿Se seleccionó una canción?
        const idCancion = this.listaCanciones.obtenerClic(mouseX, mouseY);
        console.log("IDCANCION =", idCancion);
        if (idCancion !== null) 
        {
            return {tipo: "configuracionSala",
                    idCancion: idCancion,
                    cantidad: this.configPlayers.getNumeroJugadoresClass().getSeleccion()};
        }

        // verificar si se presiono Iniciar Partida
        const resConfig = this.configPlayers.obtenerClic(mouseX, mouseY);

        if (resConfig && resConfig.tipo === "configuracionSala") {

            let idCancionSel = null;

            if (this.listaCanciones.idxPermantHovered !== null) {
                idCancionSel =
                    this.listaCanciones.items[
                        this.listaCanciones.idxPermantHovered
                    ].data.id;
            }

            return {
                tipo: "configuracionSala",
                idCancion: idCancionSel,
                cantidad: resConfig.cantidad
            };
        }

        if (typeof resConfig === "number") {

            let idCancionSel = null;

            if (this.listaCanciones.idxPermantHovered !== null) {
                idCancionSel =
                    this.listaCanciones.items[
                        this.listaCanciones.idxPermantHovered
                    ].data.id;
            }

            return {
                tipo: "iniciarPartida",
                idCancion: idCancionSel,
                cantidad: resConfig
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