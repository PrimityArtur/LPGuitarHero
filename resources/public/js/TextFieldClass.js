class TextFieldClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.texto = "";
        this.isActive = false;

        this.textPixelArt = null;
        this.lineaVertImg = null;
        this.boton = null;

        // para controlar el parpadeo del cursor
        this.lineaVertVisible = true;
        this.timeLineaVert = Date.now();
        this.intervalParpadeo = 500; // milisegundos
    }

    // CONFIGURACIONES
    // el ancho es para que el texto no sea mayor a ello
    // el lineaVertImg es la linea vertical que indica la escritura de texto
    setConfigTextField(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setConfigFont(srcCarpetaLetras, charAnchoImg, charAltoImg, gap, slash = '') {
        let srcLineVert = `${srcCarpetaLetras}${slash}`;
        this.lineaVertImg = new ImageClass(srcLineVert, charAnchoImg, charAltoImg);
        this.textPixelArt = new TextoPixelArtClass(srcCarpetaLetras, charAnchoImg, charAltoImg, gap);
    }

    setConfigBoton(srcNormal, srcHover, width, height, valorRetorno) {
        this.boton = new BotonClass(srcNormal, srcHover, width, height, valorRetorno);
    }

    setPosBoton(x, y) {
        this.boton.setPos(x, y);
    }

    getTexto() {
        return this.texto;
    }

    limpiarTexto() {
        this.texto = "";
    }


    // MOUSE - TECLADO
    actualizarHover(mouseX, mouseY) {
        this.boton.actualizarHover(mouseX, mouseY);
    }

    // verifical el clic al campo de texto o al boton
    obtenerClic(mouseX, mouseY) {
        // para verificar si se hizo clic en el campo de texto y empezar a escribir y salga la linea vertical
        if (mouseX >= this.x && mouseX <= this.x + this.width &&
            mouseY >= this.y && mouseY <= this.y + this.height) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }

        // para verificar si se hizo clic al boton
        if (this.boton) {
            const resultadoBoton = this.boton.obtenerClic(mouseX, mouseY);
            if (resultadoBoton !== null) {
                return resultadoBoton; // id del boton
            }
        }
        return null; 
    }

    // verifica que la tecla sea caracter normal para actualizarlo o borrar texto
    procesarTecla(tecla) {
        if (!this.isActive) return;

        if (tecla === "Backspace") { // borrar letra
            this.texto = this.texto.slice(0, -1);
        } else if (tecla.length === 1) { // ignora teclas especiales shift, enter. Solo caracteres
            if (this.textPixelArt && !this.textPixelArt.isCaracterValido(tecla)) {
                return; // rechaza la tecla
            }
            // para que el texto no sobrepase del width
            const anchoText = (this.texto.length + 1) * (this.textPixelArt.anchoImg + this.textPixelArt.gap);
            if (anchoText <= this.width) {
                this.texto += tecla;
            }
        }
    }

    draw(ctx) {
        // dibujar texto pixelArt
        this.textPixelArt.setPos(this.x, this.y);
        this.textPixelArt.draw(ctx, this.texto);

        // dibujar linea vertical
        if (this.isActive) {
            // parpadeo de la liea vertical
            const ahora = Date.now();
            if (ahora - this.timeLineaVert > this.intervalParpadeo) {
                this.lineaVertVisible = !this.lineaVertVisible;
                this.timeLineaVert = ahora;
            }

            // ubicar la linea al final del texto
            if (this.lineaVertVisible) {
                let cursorX = this.x;
                if (this.texto.length > 0) {
                    cursorX = this.x + this.textPixelArt.calcularAnchoTexto(this.texto);
                }                
                this.lineaVertImg.setPos(cursorX, this.y);
                this.lineaVertImg.draw(ctx);
            }
        }

        // dibujar boton
        this.boton.draw(ctx);
    }
}