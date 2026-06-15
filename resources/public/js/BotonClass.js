class BotonClass {
    constructor(srcNormal, srcHover, width, height, valorRetorno) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.valorRetorno = valorRetorno;

        this.imgNormal = new ImageClass(srcNormal, width, height);
        this.imgHover = new ImageClass(srcHover, width, height);

        this.isHovered = false;
        this.isPermantHovered = false;
    }

    // para cambiar hover segun si apuntamos al boton o no
    actualizarHover(mouseX, mouseY) {
        if (mouseX >= this.x && 
            mouseX <= this.x + this.width &&
            mouseY >= this.y && 
            mouseY <= this.y + this.height) {
            this.isHovered = true;
        } else {
            this.isHovered = false;
        }
    }

    // actualiza el hover del boton y returna el id del boton si se presiona
    obtenerClic(mouseX, mouseY) {
        this.actualizarHover(mouseX, mouseY); 
        if (this.isHovered) {
            return this.valorRetorno;
        }
        return null; 
    }

    setPos(x, y) { this.x = x; this.y = y;}
    setPermantHovered(state){
        this.isPermantHovered = state;
    }
    // dibuja el boton segun su hover y una posicion 
    draw(ctx) {
        if (this.isHovered || this.isPermantHovered) {
            this.imgHover.setPos(this.x, this.y);
            this.imgHover.draw(ctx);
        } else {
            this.imgNormal.setPos(this.x, this.y);
            this.imgNormal.draw(ctx);
        }
    }
}