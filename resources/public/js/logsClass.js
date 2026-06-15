class LogClass {
    constructor(contenedorId) {
        this.contenedor = document.getElementById(contenedorId);
        this.visible = false;
    }

    toggle(state = null) {
        if (state !== null) {
            this.visible = state;
        } else {
            this.visible = !this.visible;
        }

        if (this.visible) {
            this.contenedor.classList.add('mostrar');
        } else {
            this.contenedor.classList.remove('mostrar');
        }
    }

    print(mensaje) {
        const linea = document.createElement('div');
        linea.className = 'log-msg';
        linea.textContent = `> ${mensaje}`;
        this.contenedor.appendChild(linea);
        
        // para tener el scroll al final en cada msg         
        this.contenedor.scrollTop = this.contenedor.scrollHeight;
    }
}