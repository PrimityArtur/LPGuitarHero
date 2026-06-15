class PantallaLoginClass {
    constructor() {
        this.bg = null;
        this.inputNombre = new TextFieldClass();
        
        this.maxCaracteres = 10;
    }

    setConfig(srcBg, srcCarpetaLetras, srcBtnNormal, srcBtnHover) {
        // fondo de pantalla
        this.bg = new ImageClass(srcBg, 1920, 1080, 12, 10);
        
        //configurar letras
        const charW = 25;
        const charH = 25;
        const gap = 4;
        
        // ancho de TextField segun max de caracteres
        const anchoTotalTexto = this.maxCaracteres * (charW + gap); 
        
        // ubicar centrar el campo de texto en la pantalla 1920x1080
        const startX = ((1920 - anchoTotalTexto) / 2) - 5;
        const startY = 615;

        this.inputNombre.setConfigTextField(startX, startY, anchoTotalTexto, charH+100);
        this.inputNombre.setConfigFont(srcCarpetaLetras, charW, charH, gap, '/simbolos/linea_vertical.png');

        // Boton de entrar retorna '1' cuando se presione
        const btnW = 257;
        const btnH = 38;
        this.inputNombre.setConfigBoton(srcBtnNormal, srcBtnHover, btnW, btnH, 1);
        this.inputNombre.setPosBoton((1920 - btnW) / 2 - 6, 680); // debajo del texto
    }

    procesarTecla(tecla) {
        // solo letras ingles y numeros (0-9)
        if (tecla !== "Backspace" && !/^[a-zA-Z0-9]$/.test(tecla)) {
            return; 
        }
        this.inputNombre.procesarTecla(tecla);
    }

    actualizarHover(mouseX, mouseY) {
        this.inputNombre.actualizarHover(mouseX, mouseY);
    }

    obtenerClic(mouseX, mouseY) {
        return this.inputNombre.obtenerClic(mouseX, mouseY);
    }

    getTexto() {
        return this.inputNombre.getTexto();
    }

    draw(ctx) {
        if (this.bg) this.bg.draw(ctx);
        this.inputNombre.draw(ctx);
    }
}