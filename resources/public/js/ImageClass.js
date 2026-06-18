class ImageClass {
    constructor(src, width = 1920, height = 1080, frames = 1, ticksPerFrame = 10) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;

        // config de animacion
        this.frames = frames;
        this.frameActual = 0;
        this.ticksPerFrame = ticksPerFrame;
        this.tickActual = 0;

        this.imagen = new Image();
        this.imagen.src = src;
        this.cargada = false;
        this.error = false;

        this.imagen.onload = () => {
            this.cargada = true;
            this.error = false;
            
            this.frameWidth = this.imagen.width / this.frames;
            this.frameHeight = this.imagen.height;
        };

        this.imagen.onerror = () => {
            this.cargada = false;
            this.error = true;
        };
    }

    setPos(x, y) { 
        this.x = x; 
        this.y = y;
    }

    // actualiza la animacion frame x frame
    _actualizarAnimacion() {
        this.tickActual++;
        if (this.tickActual >= this.ticksPerFrame) {
            this.tickActual = 0;
            this.frameActual++;
            if (this.frameActual >= this.frames) {
                this.frameActual = 0; 
            }
        }
    }

    // dibuja una imagen o el fotograma actual 
    draw(ctx) {
        if (this.cargada) {
            if (this.frames > 1) {
                // recortar el sprite
                const recorteX = this.frameActual * this.frameWidth;
                
                ctx.drawImage(
                    this.imagen,
                    recorteX, 0, this.frameWidth, this.frameHeight, // recorte al image 
                    this.x, this.y, this.width, this.height         // donde y tamano se dibuja 
                );
                // avanzar frame
                this._actualizarAnimacion();
            } else {
                // imagen normal sin frames
                ctx.drawImage(this.imagen, this.x, this.y, this.width, this.height);
            }
            
        } else if (this.error) { // no cargo la imagen
            ctx.fillStyle = '#b818bd';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else { // Precarga
            ctx.fillStyle = '#050006';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}