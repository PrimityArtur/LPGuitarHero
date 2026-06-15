class CaidaFlechaClass {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0; // altura total del carril (distancia de caida)

        this.fallTimeMs = 2000; 

        // Rangos ms diferencia
        this.rangoPerfect = 50;  
        this.rangoGood = 100;    
        this.rangoMiss = 200;    

        this.imagenFlecha = null; // la nota que cae
        this.imagenBoton = null;  // receptor al final del carril boton presionado
        
        this.tiempoBotonPresionado = 0; 
        this.duracionBrilloMs = 150; // Tiempo en ms que el boton se mantendra visible

        this.notas = []; // { tiempoObjetivo: 1500, activa: true }
    }

    // CONFIGURACIONES
    setConfig(x, y, width, height, srcFlecha, srcBoton, btnW, btnH, fallTimeMs) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.fallTimeMs = fallTimeMs;
        
        // La nota y el receptor heredan el mismo tamano
        this.imagenFlecha = new ImageClass(srcFlecha, btnW, btnH); 
        this.imagenBoton = new ImageClass(srcBoton, btnW, btnH);
    }

    setRangos(perfect, good, miss) {
        this.rangoPerfect = perfect;
        this.rangoGood = good;
        this.rangoMiss = miss;
    }

    agregarNota(tiempoObjetivoMs) {
        this.notas.push({
            tiempoObjetivo: tiempoObjetivoMs,
            activa: true
        });
    }

    evaluarHit(tiempoActualMs) {
        // registrar el momento en el que se presiono la tecla para activar el efecto visual
        this.tiempoBotonPresionado = tiempoActualMs;

        // evaluar notas hit
        let notaEvaluada = null;

        for (let i = 0; i < this.notas.length; i++) {
            if (this.notas[i].activa) {
                notaEvaluada = this.notas[i];
                break;
            }
        }

        if (!notaEvaluada) return null; 

        const diferencia = Math.abs(notaEvaluada.tiempoObjetivo - tiempoActualMs);

        if (diferencia <= this.rangoPerfect) {
            notaEvaluada.activa = false; 
            return "perfect";
        } else if (diferencia <= this.rangoGood) {
            notaEvaluada.activa = false;
            return "good";
        } else if (diferencia <= this.rangoMiss) {
            notaEvaluada.activa = false;
            return "miss";
        }

        return null; 
    }

    actualizarNotasPerdidas(tiempoActualMs) {
        let missesGenerados = 0;
        
        for (let i = 0; i < this.notas.length; i++) {
            const nota = this.notas[i];
            
            if (nota.activa) {
                const diferencia = tiempoActualMs - nota.tiempoObjetivo;
                
                if (diferencia > this.rangoMiss) {
                    nota.activa = false; 
                    missesGenerados++;
                }
            }
        }
        
        return missesGenerados;
    }

    // RENDERIZADO
    draw(ctx, tiempoActualMs) {
        // dibujar el boton receptor al final del carril cuando se presiona
        if (this.imagenBoton && (tiempoActualMs - this.tiempoBotonPresionado < this.duracionBrilloMs)) {
            // centro del carril
            const btnX = this.x + (this.width - this.imagenBoton.width) / 2;
            // al final del carril
            const btnY = this.y + this.height - (this.imagenBoton.height / 2);
            
            this.imagenBoton.setPos(btnX, btnY);
            this.imagenBoton.draw(ctx);
        }

        if (!this.imagenFlecha) return;

        // dibujar las notas que estan cayendo
        for (let i = 0; i < this.notas.length; i++) {
            const nota = this.notas[i];
            if (!nota.activa) continue;

            const tiempoInicioCaida = nota.tiempoObjetivo - this.fallTimeMs;
            if (tiempoActualMs < tiempoInicioCaida) continue; 

            const progresoCaida = (tiempoActualMs - tiempoInicioCaida) / this.fallTimeMs;
            
            // X centrada en el carril, Y animado hasta el fondo
            const notaX = this.x + (this.width - this.imagenFlecha.width) / 2;
            const notaY = this.y + (this.height * progresoCaida) - (this.imagenFlecha.height / 2);

            this.imagenFlecha.setPos(notaX, notaY);
            this.imagenFlecha.draw(ctx);
        }
    }
}