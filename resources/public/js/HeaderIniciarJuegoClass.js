class HeaderIniciarJuegoClass {
    constructor() {
        this.nombreCancion = "";
        this.duracionMs = 0;

        // posiciones verticales 
        this.yFila1 = 0;
        this.yFila2 = 0;
        this.yFila3 = 0;

        // fuentes 
        this.fontCancion = null;
        this.fontTiempo = null;

        // confid barra de progreso
        this.progresoImgNativa = new Image(); 
        this.barAncho = 0;
        this.barAlto = 0;
        this.totalFrames = 1;
    }

    // CONFIGURACIONES
    setConfigFila1(y, src, w, h, gap) {
        this.yFila1 = y;
        this.fontCancion = new TextoPixelArtClass(src, w, h, gap);
    }

    setConfigFila2(y, src, w, h, gap) {
        this.yFila2 = y;
        this.fontTiempo = new TextoPixelArtClass(src, w, h, gap);
    }

    setConfigFila3(y, srcProgressBar, ancho, alto, totalFrames) {
        this.yFila3 = y;
        this.barAncho = ancho;
        this.barAlto = alto;
        this.totalFrames = totalFrames;
        this.progresoImgNativa.src = srcProgressBar;
    }

    setDatos(nombreCancion, duracionMs) {
        this.nombreCancion = nombreCancion;
        this.duracionMs = duracionMs;
    }

    // formatear milisegundos a mm:ss
    _formatearTiempo(ms) {
        const segundosTotales = Math.floor(ms / 1000);
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        const minString = minutos < 10 ? "0" + minutos : minutos;
        const segString = segundos < 10 ? "0" + segundos : segundos;
        return `${minString}:${segString}`;
    }

    // RENDERIZADO DEL HEADER
    draw(ctx, tiempoActualMs) {
        const centroX = 1920 / 2;

        // fila 1 nombre cancion
        if (this.fontCancion && this.nombreCancion !== "") {
            const texto1 = "CANCION: " + this.nombreCancion.toUpperCase();
            const ancho1 = this.fontCancion.calcularAnchoTexto(texto1);
            const x1 = centroX - (ancho1 / 2);
            
            this.fontCancion.setPos(x1, this.yFila1);
            this.fontCancion.draw(ctx, texto1);
        }

        // fila 2 timer
        if (this.fontTiempo && this.duracionMs > 0) {
            const tiempoActualStr = this._formatearTiempo(tiempoActualMs);
            const tiempoTotalStr = this._formatearTiempo(this.duracionMs);
            const texto2 = `TIEMPO: ${tiempoActualStr} / ${tiempoTotalStr}`;
            
            const ancho2 = this.fontTiempo.calcularAnchoTexto(texto2);
            const x2 = centroX - (ancho2 / 2);
            
            this.fontTiempo.setPos(x2, this.yFila2);
            this.fontTiempo.draw(ctx, texto2);
        }

        // fila 3 barra de progrso
        if (this.progresoImgNativa.complete && this.duracionMs > 0) {
            // calcular el progreso segun el tiempo de cancion 0.0 a 1.0
            const porcentaje = Math.min(tiempoActualMs / this.duracionMs, 1.0);
            
            // ubicar frame le corresponde dibujar
            let currentFrame = Math.floor(porcentaje * this.totalFrames);
            if (currentFrame >= this.totalFrames) currentFrame = this.totalFrames - 1;

            const frameWidthSource = this.progresoImgNativa.width / this.totalFrames;
            const frameHeightSource = this.progresoImgNativa.height;

            // recorte X 
            const srcX = currentFrame * frameWidthSource;

            // posicion de destino centrada en el canvas
            const destX = centroX - (this.barAncho / 2);
            const destY = this.yFila3;

            // dibujar el cuadro recortado 
            ctx.drawImage(
                this.progresoImgNativa,
                srcX, 0, frameWidthSource, frameHeightSource, 
                destX, destY, this.barAncho, this.barAlto     
            );
        }
    }
}