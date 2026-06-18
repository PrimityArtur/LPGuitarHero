class ListaJugadoresClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.maxWidth = 0;
        this.itemHeight = 0; 
        this.gapY = 0;       
        
        this.jugadorCliente = ""; // nombre del usuario local
        this.jugadores = [];      // json [{nombre: "aaa", rol: "admin"}, ...]

        this.fontRender = null;       // fuente para nombres
        this.fontRenderEsperando = null; // fuente para esperando
        this.fontNumeroRender = null; // fuente para el numero de conectados

        // iconos antes del nombre
        this.iconoAdmin = null;     
        this.iconoJugador = null;   
        this.iconoEsperando = null; 
        
        // iconos especiales despues del nombre
        this.iconoHostDer = null;     
        this.iconoTu = null;          

        // Márgenes y alineación
        this.anchoIconoIzq = 0; 
        this.margenInterno = 15; // px entre iconos y textos
    }

    // CONFIGURACIONES 
    setConfigLista(maxWidth, itemHeight, gapY) {
        this.maxWidth = maxWidth;
        this.itemHeight = itemHeight;
        this.gapY = gapY;
    }

    setConfigTextos(srcCarpetaLetras, srcCarpetaLetrasEsperando, srcCarpetaNumeros, anchoImg, altoImg, gapTxt) {
        this.fontRender = new TextoPixelArtClass(srcCarpetaLetras, anchoImg, altoImg, gapTxt);
        this.fontRenderEsperando = new TextoPixelArtClass(srcCarpetaLetrasEsperando, anchoImg, altoImg, gapTxt);
        this.fontNumeroRender = new TextoPixelArtClass(srcCarpetaNumeros, anchoImg, altoImg, gapTxt);
    }

    setConfigIconos(srcAdmin, srcJugador, srcEsperando, srcHostDer, srcTu, iconLeftW, iconLeftH, hostDerW, hostDerH, tuW, tuH) {
        // iconos izq  nombre
        this.iconoAdmin = new ImageClass(srcAdmin, iconLeftW, iconLeftH);
        this.iconoJugador = new ImageClass(srcJugador, iconLeftW, iconLeftH);
        this.iconoEsperando = new ImageClass(srcEsperando, iconLeftW, iconLeftH);
        
        // iconos derecha nombre
        this.iconoHostDer = new ImageClass(srcHostDer, hostDerW, hostDerH);
        this.iconoTu = new ImageClass(srcTu, tuW, tuH);
        
        this.anchoIconoIzq = iconLeftW;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    setJugadores(jugadorCliente, listaJugadores) {
        this.jugadorCliente = jugadorCliente;
        this.jugadores = listaJugadores;
    }



    getAltoTotal() {
        if (!this.fontRender) return 0;
        
        // alto ocupado por titulo
        const altoTitulo = this.fontNumeroRender.altoImg + (this.gapY * 2);
        
        // total de filas n jugadores + "esperando"
        const totalFilas = this.jugadores.length > 0 ? this.jugadores.length + 1 : 0;
        
        const altoLista = (totalFilas * this.itemHeight) + ((totalFilas > 0 ? totalFilas - 1 : 0) * this.gapY);

        return altoTitulo + altoLista;
    }

    draw(ctx) {
        if (!this.fontRender || this.jugadores.length === 0) return;

        // dibujar titulo
        const textoTitulo = `Conectados ${String(this.jugadores.length)}`;
        this.fontNumeroRender.setPos(this.x, this.y);
        // this.fontNumeroRender.draw(ctx, textoTitulo);

        // filas
        const inicioListaY = this.y + this.fontNumeroRender.altoImg + (this.gapY * 2);

        // columnas
        const iconX = this.x;
        const nombreX = this.x + this.anchoIconoIzq + this.margenInterno;

        // dibujar jugadores
        for (let i = 0; i < this.jugadores.length; i++) {
            const jugador = this.jugadores[i];
            const filaY = inicioListaY + (i * (this.itemHeight + this.gapY));
            
            // icono izq
            const iconoIzquierdo = (jugador.rol === "admin") ? this.iconoAdmin : this.iconoJugador;
            if (iconoIzquierdo) {
                const centradoYIcono = filaY + ((this.itemHeight - iconoIzquierdo.height) / 2);
                iconoIzquierdo.setPos(iconX, centradoYIcono);
                iconoIzquierdo.draw(ctx);
            }

            // dibujar nombre
            const centradoYTexto = filaY + ((this.itemHeight - this.fontRender.altoImg) / 2);
            this.fontRender.setPos(nombreX, centradoYTexto);
            this.fontRender.draw(ctx, jugador.nombre);

            // dibujar icono der            
            // terminacion del texto del nombre
            const longitudTextoPx = jugador.nombre.length * (this.fontRender.anchoImg + this.fontRender.gap);
            
            let posicionXDerecha = nombreX + longitudTextoPx + this.margenInterno;

            // si es host
            if (jugador.rol === "admin" && this.iconoHostDer) {
                const centradoYHostDer = filaY + ((this.itemHeight - this.iconoHostDer.height) / 2);
                this.iconoHostDer.setPos(posicionXDerecha, centradoYHostDer);
                this.iconoHostDer.draw(ctx);
                
                posicionXDerecha += this.iconoHostDer.width + this.margenInterno;
            }

            // si es "tu"
            if (jugador.nombre === this.jugadorCliente && this.iconoTu) {
                const centradoYTu = filaY + ((this.itemHeight - this.iconoTu.height) / 2);
                this.iconoTu.setPos(posicionXDerecha, centradoYTu);
                this.iconoTu.draw(ctx);
                
                // posicionXDerecha += this.iconoTu.width + this.margenInterno; // tercer icono
            }
        }

        // dibujar "esperando"
        const indexEsperando = this.jugadores.length;
        const filaEsperandoY = inicioListaY + (indexEsperando * (this.itemHeight + this.gapY));
        
        if (this.iconoEsperando) {
            const centradoYIconoEsp = filaEsperandoY + ((this.itemHeight - this.iconoEsperando.height) / 2);
            this.iconoEsperando.setPos(iconX, centradoYIconoEsp);
            this.iconoEsperando.draw(ctx);
        }

        const centradoYTextoEsp = filaEsperandoY + ((this.itemHeight - this.fontRenderEsperando.altoImg) / 2);
        this.fontRenderEsperando.setPos(nombreX, centradoYTextoEsp);
        this.fontRenderEsperando.draw(ctx, "Esperando..."); 
    }
}