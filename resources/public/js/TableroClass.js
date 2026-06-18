class TableroClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.bgImagen = null;

        // datos del jugador de este tablero
        this.nombreJugador = "";
        this.textoDisplay = ""; // 'P1 nombre'
        this.isLocal = false; // true = procesa teclas, false = solo refleja datos del server
        
        // estado del juego
        this.puntaje = 0;
        this.combo = 0;

        // diccionario carriles 
        this.carriles = {
            "derecha": new CaidaFlechaClass(),
            "arriba": new CaidaFlechaClass(),
            "abajo": new CaidaFlechaClass(),
            "izquierda": new CaidaFlechaClass()
        };

        // fuentes
        this.fontNumeros = null;
        this.fontNombre = null; // dibujar el nombre encima
        this.offsetNombreY = -40;
        
        // Imagenes de aciertos
        this.iconW = 0;
        this.iconH = 0;
        this.indicadoresImg = {
            "perfect": null,
            "good": null,
            "miss": null
        };
        
        // control de tiempo para mostrar el indicador de hit por milisegundos
        this.indicadorActivo = {
            tipo: null,
            tiempoFin: 0
        };

        // posiciones X y Y del tablero
        this.offsetCombo = { x: 0, y: 0 };
        this.offsetScore = { x: 0, y: 0 };
        this.offsetIndicadores = { x: 0, y: 0 };
    }

    // CONFIGURACIONES 
    setConfigTablero(x, y, width, height, srcBg) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bgImagen = new ImageClass(srcBg, width, height);
    }
    
    setConfigNombreTablero(fontObj, offsetY) {
        this.fontNombre = fontObj;
        this.offsetNombreY = offsetY;
    }

    setJugador(nombre, textoDisplay, isLocal) {
        this.nombreJugador = nombre;
        this.textoDisplay = textoDisplay;
        this.isLocal = isLocal;
        this.puntaje = 0;
        this.combo = 0;
    }

    // configura los 4 carriles calculando sus posiciones dentro del tablero
    setConfigCarriles(startX, startY, anchoCarril, altoCarril, gapX, btnW, btnH, fallTimeMs, objSrcFlechas, objSrcBotones) {
        // Orden de carriles izquierda a derecha
        const ordenVisual = ["izquierda", "arriba", "abajo", "derecha"];
        
        // centrar los 4 carriles dentro del tablero
        for (let i = 0; i < ordenVisual.length; i++) {
            const direccion = ordenVisual[i];
            
            // desde la posicion X sumando el ancho y el gap
            const carrilX = startX + (i * (anchoCarril + gapX));
            
            this.carriles[direccion].setConfig(
                carrilX, 
                startY, 
                anchoCarril, 
                altoCarril, 
                objSrcFlechas[direccion], 
                objSrcBotones[direccion], 
                btnW, 
                btnH, 
                fallTimeMs
            );
        }
    }

    setConfigUI(fontNumerosObj, srcPerfect, srcGood, srcMiss, iconW, iconH) {
        this.fontNumeros = fontNumerosObj;
        this.iconW = iconW;
        this.iconH = iconH;
        
        this.indicadoresImg["perfect"] = new ImageClass(srcPerfect, iconW, iconH);
        this.indicadoresImg["good"] = new ImageClass(srcGood, iconW, iconH);
        this.indicadoresImg["miss"] = new ImageClass(srcMiss, iconW, iconH);
    }

    setConfigOffsets(offComboX, offComboY, offScoreX, offScoreY, offIndX, offIndY) {
        this.offsetCombo = { x: offComboX, y: offComboY };
        this.offsetScore = { x: offScoreX, y: offScoreY };
        this.offsetIndicadores = { x: offIndX, y: offIndY };
    }

    // JUEGO Y RED
    cargarNotas(arrayNotas) {
        // limpiar notas por si se reinicia
        for (const dir in this.carriles) {
            this.carriles[dir].notas = [];
        }

        // repartimos cada nota a su carril 
        for (let i = 0; i < arrayNotas.length; i++) {
            const nota = arrayNotas[i];
            if (this.carriles[nota.direccion]) {
                this.carriles[nota.direccion].agregarNota(nota.tiempo);
            }
        }
    }

    // activar indicador de hit
    _activarIndicadorVisual(tipo, tiempoActualMs) {
        this.indicadorActivo.tipo = tipo;
        this.indicadorActivo.tiempoFin = tiempoActualMs + 300; // visible 300 milisegundos
    }

    // PARA EL JUGADOR LOCAL Procesa input del teclado
    intentarHitLocal(direccion, tiempoActualMs) {
        if (!this.isLocal) return null; 
        if (!this.carriles[direccion]) return null;

        const resultado = this.carriles[direccion].evaluarHit(tiempoActualMs);
        
        if (resultado) {
            this._activarIndicadorVisual(resultado, tiempoActualMs);
            
            if (resultado === "miss") {
                this.combo = 0;
            } else {
                this.combo = Math.min(this.combo + 1, 9); // maximo combo de 9
                this.puntaje += (resultado === "perfect" ? 100 : 50);
            }
            
            return { 
                resultado: resultado, 
                puntaje: this.puntaje 
            }; // para el backend
        }
        
        return null;
    }

    // PARA JUGADORES REMOTOS datos del server
    registrarHitRemoto(resultado, puntajeTotalDelServer, tiempoActualMs) {
        if (this.isLocal) return; 
        
        this.puntaje = puntajeTotalDelServer;
        this._activarIndicadorVisual(resultado, tiempoActualMs);

        if (resultado === "miss") {
            this.combo = 0;
        } else {
            this.combo = Math.min(this.combo + 1, 9);
        }
        
    }

    // ACTUALIZACION notas perdidas por no presionarlas
    actualizar(tiempoActualMs) {
        // Si el tablero es local calculamos misses, no del remoto porque el server nos avisa

        let missesGenerados = 0;
        for (const dir in this.carriles) {
            missesGenerados += this.carriles[dir].actualizarNotasPerdidas(tiempoActualMs);
        }

        if (!this.isLocal) return 0;

        if (missesGenerados > 0) {
            this.combo = 0;
            this._activarIndicadorVisual("miss", tiempoActualMs);
        }
        return missesGenerados;
    }

    // RENDERIZADO
    draw(ctx, tiempoActualMs) {
        // dibujar tablero
        if (this.bgImagen) {
            this.bgImagen.setPos(this.x, this.y);
            this.bgImagen.draw(ctx);
        }

        // dibujar el texto superior centrado
        if (this.textoDisplay !== "" && this.fontNombre) {
            const anchoTexto = this.fontNombre.calcularAnchoTexto(this.textoDisplay);
            const xTexto = this.x + (this.width - anchoTexto) / 2;
            this.fontNombre.setPos(xTexto + 20, this.y + this.offsetNombreY);
            this.fontNombre.draw(ctx, this.textoDisplay);
        }

        // dibujar indicadores de hit activos
        if (this.indicadorActivo.tipo && tiempoActualMs < this.indicadorActivo.tiempoFin) {
            let tipoIndicador = this.indicadorActivo.tipo;
            const imgInd = this.indicadoresImg[tipoIndicador];
            if (tipoIndicador == "perfect") {
                imgInd.setPos(this.x + this.offsetIndicadores.x, this.y + this.offsetIndicadores.y);
            } else if (tipoIndicador == "good") {
                imgInd.setPos(this.x + this.offsetIndicadores.x, this.y + this.offsetIndicadores.y + this.iconH - 10);
            } else if (tipoIndicador == "miss") {
                imgInd.setPos(this.x + this.offsetIndicadores.x, this.y + this.offsetIndicadores.y + ((this.iconH - 10)* 2));
            }
            imgInd.draw(ctx);
            

        } else {
            // apagar indicador
            this.indicadorActivo.tipo = null;
        }

        // dibujar combo y score
        if (this.fontNumeros) {
            // Combo
            this.fontNumeros.setPos(this.x + this.offsetCombo.x, this.y + this.offsetCombo.y);
            this.fontNumeros.draw(ctx, String(this.combo));
            
            // Score
            this.fontNumeros.setPos(this.x + this.offsetScore.x, this.y + this.offsetScore.y);
            this.fontNumeros.draw(ctx, String(this.puntaje));
        }

        // dibujar carriles notas cayendo
        for (const dir in this.carriles) {
            this.carriles[dir].draw(ctx, tiempoActualMs);
        }
    }
}