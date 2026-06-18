class ScoreFinalJugadorClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.gapY = 0; // espacio vertical entre las filas

        // datos jugador
        this.nombre = "";
        this.puntaje = 0;
        this.perfect = 0;
        this.good = 0;
        this.miss = 0;

        // fonts
        this.fontNombre = null;
        this.fontScore = null;
        this.fontPerfect = null;
        this.fontGood = null;
        this.fontMiss = null;
    }

    // CONFIGURACIONES
    setConfigContenedor(width, height, gapY) {
        this.width = width;
        this.height = height;
        this.gapY = gapY;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }

    setConfigFuenteNombre(src, w, h, gap) {
        this.fontNombre = new TextoPixelArtClass(src, w, h, gap);
    }

    setConfigFuenteScore(src, w, h, gap) {
        this.fontScore = new TextoPixelArtClass(src, w, h, gap);
    }

    setConfigFuentesHits(srcP, wP, hP, gapP, srcG, wG, hG, gapG, srcM, wM, hM, gapM) {
        this.fontPerfect = new TextoPixelArtClass(srcP, wP, hP, gapP);
        this.fontGood = new TextoPixelArtClass(srcG, wG, hG, gapG);
        this.fontMiss = new TextoPixelArtClass(srcM, wM, hM, gapM);
    }

    cargarDatos(jsonRanking) {
        this.nombre = `${jsonRanking.nombre}`;
        this.puntaje = jsonRanking.puntaje;
        this.perfect = `P ${jsonRanking.perfect}`;
        this.good = `G ${jsonRanking.good}`;
        this.miss = `M ${jsonRanking.miss}`;
    }

    // DUBUJO centrar todo
    draw(ctx) {
        if (!this.fontNombre || this.nombre === "") return;

        let currentY = this.y;

        // fila 1 nombre
        const txtNombre = String(this.nombre);
        const anchoNombre = this.fontNombre.calcularAnchoTexto(txtNombre);
        const xNombre = this.x + (this.width - anchoNombre) / 2;
        
        this.fontNombre.setPos(xNombre, currentY);
        this.fontNombre.draw(ctx, txtNombre);

        currentY += this.fontNombre.altoImg + this.gapY;

        // fila  2 score 
        if (this.fontScore) {
            const txtScore = "PUNTAJE FINAL " + this.puntaje;
            const anchoScore =  this.fontScore.calcularAnchoTexto(txtScore);
            const xScore = this.x + (this.width - anchoScore) / 2;

            this.fontScore.setPos(xScore, currentY);
            this.fontScore.draw(ctx, txtScore);
            
            currentY += this.fontScore.altoImg + this.gapY;
        }

        // fila 3 (Perfect, Good, Miss)
        if (this.fontPerfect && this.fontGood && this.fontMiss) {
            const txtPerfect = String(this.perfect);
            const txtGood = String(this.good);
            const txtMiss = String(this.miss);

            // ancho independiente de cada hit
            const anchoPerfect = this.fontPerfect.calcularAnchoTexto(txtPerfect);
            const anchoGood = this.fontGood.calcularAnchoTexto(txtGood);
            const anchoMiss = this.fontMiss.calcularAnchoTexto(txtMiss);

            // espacio horizontal entre cada hit
            const gapHorizontalHits = 30; 

            // ancho total para centrar
            const anchoTotalFila3 = anchoPerfect + gapHorizontalHits + anchoGood + gapHorizontalHits + anchoMiss;
            
            let xHits = this.x + (this.width - anchoTotalFila3) / 2;

            // dibujar perfect
            this.fontPerfect.setPos(xHits, currentY);
            this.fontPerfect.draw(ctx, txtPerfect);
            xHits += anchoPerfect + gapHorizontalHits;

            // dibujar good
            this.fontGood.setPos(xHits, currentY);
            this.fontGood.draw(ctx, txtGood);
            xHits += anchoGood + gapHorizontalHits;

            // dibujar miss
            this.fontMiss.setPos(xHits, currentY);
            this.fontMiss.draw(ctx, txtMiss);
        }
    }
}