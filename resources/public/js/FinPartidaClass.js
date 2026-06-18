class FinPartidaClass {
    constructor() {
        this.bgImagen = null;
        
        // imagen corona
        this.coronaCentral = null;
        this.coronaY = 0; // coord y, x centrado

        // 3 mejores lugares
        this.scorePrimero = new ScoreFinalJugadorClass();
        this.scoreSegundo = new ScoreFinalJugadorClass();
        this.scoreTercero = new ScoreFinalJugadorClass();

        this.offsetIzqDer = 500;
        this.offsetYPrimero = -20;
        this.offsetYSegundoTercero = 230;

        // botones inferiores
        this.botonVolver = null;
        this.botonMenu = null;
        
        this.cantidadJugadores = 0;
    }

    // CONFIGURACIONES
    setConfigFondo(srcBg) {
        this.bgImagen = new ImageClass(srcBg, 1920, 1080, 12, 10);
    }

    setConfigCorona(srcCorona, width, height, posY) {
        this.coronaCentral = new ImageClass(srcCorona, width, height);
        this.coronaY = posY; 
    }

    setConfigBotones(srcVolverNorm, srcVolverHov, srcMenuNorm, srcMenuHov, btnW, btnH, gapCentro, posY) {
        // horizontal centrado al BG   
        const centroX = 1920 / 2;
        
        const volverX = centroX - (btnW + (gapCentro / 2));
        const menuX = centroX + (gapCentro / 2);

        this.botonVolver = new BotonClass(srcVolverNorm, srcVolverHov, btnW, btnH, "volver");
        this.botonVolver.setPos(volverX, posY);

        this.botonMenu = new BotonClass(srcMenuNorm, srcMenuHov, btnW, btnH, "menu");
        this.botonMenu.setPos(menuX, posY);
    }

    getClasesScore() {
        return [this.scorePrimero, this.scoreSegundo, this.scoreTercero];
    }

    // al recibir el JSON resultadoFinal
    cargarResultados(jsonRankingArray) {
        // solo los 3 mejores 
        this.cantidadJugadores = Math.min(jsonRankingArray.length, 3);

        if (this.cantidadJugadores > 0) this.scorePrimero.cargarDatos(jsonRankingArray[0]);
        if (this.cantidadJugadores > 1) this.scoreSegundo.cargarDatos(jsonRankingArray[1]);
        if (this.cantidadJugadores > 2) this.scoreTercero.cargarDatos(jsonRankingArray[2]);
    }

    // EVENTOS MOUSE
    actualizarHover(mouseX, mouseY) {
        this.botonVolver.actualizarHover(mouseX, mouseY);
        this.botonMenu.actualizarHover(mouseX, mouseY);
    }

    obtenerClic(mouseX, mouseY) {
        if (this.botonVolver) {
            const resVolver = this.botonVolver.obtenerClic(mouseX, mouseY);
            if (resVolver) return resVolver;
        }

        if (this.botonMenu) {
            const resMenu = this.botonMenu.obtenerClic(mouseX, mouseY);
            if (resMenu) return resMenu; 
        }

        return null;
    }

    // DIBUJO
    draw(ctx) {
        if (this.bgImagen) {
            this.bgImagen.setPos(0, 0);
            this.bgImagen.draw(ctx);
        }

        const centroPantallaX = 1920 / 2;

        // dibujar Corona y Jugador 1 
        if (this.cantidadJugadores > 0 && this.coronaCentral) {
            const coronaX = centroPantallaX - (this.coronaCentral.width / 2);
            this.coronaCentral.setPos(coronaX, this.coronaY);
            this.coronaCentral.draw(ctx);

            // jugador 1 centrado arriba de corona
            const score1_X = centroPantallaX - (this.scorePrimero.width / 2);
            const score1_Y = this.coronaY - this.scorePrimero.height - this.offsetYPrimero; // 20px de separacion visual
            this.scorePrimero.setPos(score1_X, score1_Y);
            this.scorePrimero.draw(ctx);
        }

        // dibujar Jugador 2 izq
        if (this.cantidadJugadores > 1) {
            // pos x ej a 400px del centro hacia la izquierda
            const score2_X = (centroPantallaX - this.offsetIzqDer) - (this.scoreSegundo.width / 2);
            // mas abajo al jugador 1
            const score2_Y = this.coronaY - this.scoreSegundo.height + this.offsetYSegundoTercero; 
            
            this.scoreSegundo.setPos(score2_X, score2_Y);
            this.scoreSegundo.draw(ctx);
        }

        // dibujar Jugador 3 der
        if (this.cantidadJugadores > 2) {
            // centro hacia la derecha
            const score3_X = (centroPantallaX + this.offsetIzqDer) - (this.scoreTercero.width / 2);
            const score3_Y = this.coronaY - this.scoreTercero.height + this.offsetYSegundoTercero;
            
            this.scoreTercero.setPos(score3_X, score3_Y);
            this.scoreTercero.draw(ctx);
        }

        // dibujar botones
        if (this.botonVolver) this.botonVolver.draw(ctx);
        if (this.botonMenu) this.botonMenu.draw(ctx);
    }
}