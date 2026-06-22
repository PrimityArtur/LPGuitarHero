class NumeroJugadoresClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.maxWidth = 0;

        // config de la grid de cada opcion
        this.itemWidth = 0;
        this.itemHeight = 0;
        this.gapX = 0;
        this.gapY = 0;
        this.filas = 2;
        this.itemsFila1 = 5;
        this.itemsFila2 = 4;

        // globals
        this.maxJugadoresGlobal = 9; // max que soporta la lista (1 al 9)
        this.jugadoresDisponibles = 1; // Cuantos están conectados en la sala de espera 
        
        // botones
        this.botones = []; 
        this.idxPermantHovered = null; // si se selecciona una opcion se guarda el idx
    }

    // CONFIGURACIONES
    setConfigGrid(maxWidth, itemWidth, itemHeight, gapX, gapY) {
        this.maxWidth = maxWidth;
        this.itemWidth = itemWidth;
        this.itemHeight = itemHeight;
        this.gapX = gapX;
        this.gapY = gapY;
    }

    setConfigBotones(srcCarpetaNormal, srcCarpetaHover) {
        this.botones = [];
        // para crear los maxJugadoresGlobal botones "1.png", "2.png", etc.
        for (let i = 1; i <= this.maxJugadoresGlobal; i++) {
            const srcNorm = `${srcCarpetaNormal}/n_${i}.png`;
            const srcHov = `${srcCarpetaHover}/n_${i}_hover.png`;
            
            const btn = new BotonClass(srcNorm, srcHov, this.itemWidth, this.itemHeight, i);
            this.botones.push(btn);
        }
    }

    // actualiza cuantos botones estan segun players en la sala
    setJugadoresDisponibles(cantidad) {
        this.jugadoresDisponibles = Math.min(cantidad, this.maxJugadoresGlobal);

        // por si el idx es mayor a los jugadores, por ejemplo hay 5 y se selecciona 5 jugadores pero uno se desconecta entonces debo limpiar la seleccion
        if (this.idxPermantHovered !== null && this.idxPermantHovered >= this.jugadoresDisponibles) {
            this.limpiarIdxPermantHovered();
        }
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this._recalcularPosiciones();
    }

    // para distribuir los maxJugadoresGlobal botones en la grid
    _recalcularPosiciones() {
        if (this.itemWidth === 0 || this.maxWidth === 0) return;

        // fila 1
        const anchoTotalFila1 = (this.itemsFila1 * this.itemWidth) + ((this.itemsFila1 - 1) * this.gapX);
        const startXFila1 = this.x + (this.maxWidth - anchoTotalFila1) / 2;

        // fila 2 
        const anchoTotalFila2 = (this.itemsFila2 * this.itemWidth) + ((this.itemsFila2 - 1) * this.gapX);
        const startXFila2 = this.x + (this.maxWidth - anchoTotalFila2) / 2;

        // posiciones
        for (let i = 0; i < this.maxJugadoresGlobal; i++) {
            let btnX, btnY;
            
            if (i < this.itemsFila1) { // fila 1
                btnX = startXFila1 + i * (this.itemWidth + this.gapX);
                btnY = this.y;
            } else { // fila 2
                const col = i - this.itemsFila1; // Reiniciamos la columna para la fila 2
                btnX = startXFila2 + col * (this.itemWidth + this.gapX);
                btnY = this.y + this.itemHeight + this.gapY;
            }
            
            this.botones[i].setPos(btnX, btnY);
        }
    }

    // para devolver la altura total de toda la clase 
    //para que otra clase sepa ubacarse por debajo
    getAltoTotal() {
        if (this.itemWidth === 0 || this.maxWidth === 0) return 0;
        
        return (this.filas * this.itemHeight) + this.gapY;
    }

    // SELECCION PERMANENTE
    limpiarIdxPermantHovered() {
        if (this.idxPermantHovered !== null) {
            this.botones[this.idxPermantHovered].setPermantHovered(false);
        }
        this.idxPermantHovered = null;
    }

    _setIdxPermantHovered(idx, state) {
        if (idx !== null) {
            this.botones[idx].setPermantHovered(state);
        }
    }

    // Devuelve la cantidad de jugadores seleccionada 
    getSeleccion() {
        if (this.idxPermantHovered !== null) {
            return this.idxPermantHovered + 1; // inicia en 0, botones en 1
        }
        return null;
    }
    seleccionarCantidad(cantidad) 
    {
        this.limpiarIdxPermantHovered();
        if (cantidad == null) return;
        const idx = cantidad - 1;
        if (idx >= 0 && idx < this.jugadoresDisponibles) 
        {
            this.idxPermantHovered = idx;
            this._setIdxPermantHovered(idx, true);
        }
    }

    // MOUSE
    // para colision en los botones
    actualizarHover(mouseX, mouseY) {
        for (let i = 0; i < this.jugadoresDisponibles; i++) {
            this.botones[i].actualizarHover(mouseX, mouseY);
        }
    }

    // para verificar clic en las opciones 
    obtenerClic(mouseX, mouseY) {
        for (let i = 0; i < this.jugadoresDisponibles; i++) {
            const resultado = this.botones[i].obtenerClic(mouseX, mouseY);
            if (resultado !== null) {
                this.limpiarIdxPermantHovered();
                this.idxPermantHovered = i;
                this._setIdxPermantHovered(this.idxPermantHovered, true);

                return resultado; // numero de jugadores seleccionado 1-9
            }
        }
        return null;
    }

    // DIBUJAR
    draw(ctx) {
        // solo dibuja la cantidad de jugadores conectadores actuales
        for (let i = 0; i < this.jugadoresDisponibles; i++) {
            this.botones[i].draw(ctx);
        }
    }
}