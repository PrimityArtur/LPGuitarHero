class TextoPixelArtClass {
    constructor(srcCarpetaBase, anchoImg, altoImg, gap) {
        this.x = 0;
        this.y = 0;
        
        this.srcCarpetaBase = srcCarpetaBase; 
        this.anchoImg = anchoImg;
        this.altoImg = altoImg;
        this.gap = gap;
        
        this.diccionarioPixelLetras = {};

        // DICCIONARIO PROPORCIONES
        // w = multiplicador de ancho 
        // h = multiplicador de alto
        // y = offset vertical hacia abajo
        this.ajustesCaracteres = {
            // minusculas estandar
            'a': { w: 1.0, h: 0.75, y: 0.22 },
            'c': { w: 1.0, h: 0.75, y: 0.22 },
            'e': { w: 1.0, h: 0.75, y: 0.22 },
            'm': { w: 1.0, h: 0.75, y: 0.22 },
            'n': { w: 1.0, h: 0.75, y: 0.22 },
            'o': { w: 1.0, h: 0.75, y: 0.22 },
            'r': { w: 1.0, h: 0.75, y: 0.22 },
            's': { w: 1.0, h: 0.75, y: 0.22 },
            'u': { w: 1.0, h: 0.75, y: 0.22 },
            'v': { w: 1.0, h: 0.75, y: 0.22 },
            'w': { w: 1.0, h: 0.75, y: 0.22 },
            'x': { w: 1.0, h: 0.75, y: 0.22 },
            'z': { w: 1.0, h: 0.75, y: 0.22 },
            'i': { w: 1.0, h: 1.0, y: 0.0 },

            // minusculas altas
            'b': { w: 1.0, h: 1.0, y: 0.0 },
            'd': { w: 1.0, h: 1.0, y: 0.0 },
            'f': { w: 1.0, h: 1.0, y: 0.0 },
            'h': { w: 1.0, h: 1.0, y: 0.0 },
            'k': { w: 1.0, h: 1.0, y: 0.0 },
            'l': { w: 1.0, h: 1.0, y: 0.0 },
            't': { w: 1.0, h: 1.0, y: 0.0 },

            // minusculas descendentes
            'g': { w: 1.0, h: 1.0, y: 0.22 },
            'j': { w: 1.0, h: 1.0, y: 0.22 },
            'p': { w: 1.0, h: 1.0, y: 0.22 },
            'q': { w: 1.0, h: 1.0, y: 0.22 },
            'y': { w: 1.0, h: 1.0, y: 0.22 },

            // simbolos y puntuacion
            '.': { w: 0.2, h: 0.2, y: 0.8 },
            ',': { w: 0.2, h: 0.3, y: 0.8 },
            ':': { w: 0.2, h: 1.0, y: 0.0 },
            '(': { w: 1.0, h: 1.0, y: 0.0 },
            ')': { w: 1.0, h: 1.0, y: 0.0 },
            '/': { w: 1.0, h: 1.0, y: 0.0 },
            
            // Espacio en blanco
            ' ': { w: 0.5, h: 1.0, y: 0.0 }
        };
    }

    _obtenerAjuste(caracter) {
        // retorna el ajuste o uno por defecto
        return this.ajustesCaracteres[caracter] || { w: 1.0, h: 1.0, y: 0.0 };
    }

    // devuelve la ruta de la subcarpeta y el nombre de archivo
    _obtenerRutaRelativa(caracter) {
        // numeros 0 al 9
        if (/^[0-9]$/.test(caracter)) {
            return `numeros/${caracter}.png`;
        }
        
        // mayusculas 
        if (/^[A-Z]$/.test(caracter)) {
            return `mayusculas/${caracter}.png`;
        }
        
        // minusculas 
        if (/^[a-z]$/.test(caracter)) {
            return `minusculas/${caracter}.png`;
        }
        
        // simbolos
        switch (caracter) {
            case ':': return 'simbolos/dos_puntos.png';
            case ')': return 'simbolos/parentesis_der.png';
            case '(': return 'simbolos/parentesis_izq.png';
            case '.': return 'simbolos/punto.png';
            case '/': return 'simbolos/slash.png';
        }
        
        return null;
    }

    // para que TextFieldClass consulte si debe aceptar la tecla
    isCaracterValido(caracter) {
        if (caracter === ' ') return true; // barra de espacio
        return this._obtenerRutaRelativa(caracter) !== null;
    }

    // crear o obtener la imageClass del caracter modificado con sus ajustes
    _obtenerImagenCaracter(caracter) {
        if (!this.diccionarioPixelLetras[caracter]) {
            const rutaRelativa = this._obtenerRutaRelativa(caracter);
            
            if (!rutaRelativa) return null; 

            const ajuste = this._obtenerAjuste(caracter);
            const wReal = this.anchoImg * ajuste.w;
            const hReal = this.altoImg * ajuste.h;

            const srcCompleta = `${this.srcCarpetaBase}/${rutaRelativa}`;
            
            this.diccionarioPixelLetras[caracter] = new ImageClass(
                srcCompleta, 
                wReal, 
                hReal
            );
        }

        return this.diccionarioPixelLetras[caracter];
    }

    setPos(x, y) { 
        this.x = x;  
        this.y = y; 
    }

    calcularAnchoTexto(texto) {
        const textoString = String(texto);
        let anchoTotal = 0;

        for (let i = 0; i < textoString.length; i++) {
            const caracter = textoString[i];
            const ajuste = this._obtenerAjuste(caracter);
            
            // calcula el ancho de la imagen para cada caracter
            const wReal = this.anchoImg * ajuste.w;
            
            // Sumal ancho + gap. el ultimo caracter no se suma gap
            anchoTotal += wReal;
            
            if (i < textoString.length - 1) {
                anchoTotal += this.gap;
            }
        }
        
        return anchoTotal;
    }

    draw(ctx, texto) {
        const textoString = String(texto);
        let posXActual = this.x;

        for (let i = 0; i < textoString.length; i++) {
            const caracter = textoString[i];
            const ajuste = this._obtenerAjuste(caracter);
            
            // espacio en blanco avanza segun su multiplicador w
            if (caracter === ' ') {
                posXActual += (this.anchoImg * ajuste.w) + this.gap;
                continue;
            }

            const imagenLetra = this._obtenerImagenCaracter(caracter);

            if (imagenLetra) {
                // aplicamr el offsetY basado en la altura original
                const posYLetra = this.y + (this.altoImg * ajuste.y);

                imagenLetra.setPos(posXActual, posYLetra);
                imagenLetra.draw(ctx);

                posXActual += imagenLetra.width + this.gap;
            }
        }
    }
}