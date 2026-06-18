class ListaCancionesClass {
    constructor() {
        // config lista
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.itemHeight = 0;

        this.isAdmin = false;
        this.idxPermantHovered = null; // si se selecciona una cancion se guarda el idx

        // para las rutas para los botones que encapsula una cancion
        this.srcBotonNormal = "";
        this.srcBotonHover = "";

        // para dibujar el contenido de cada cancion
        this.fontNombreRender = null;
        this.fontDuracionRender = null;

        this.imgDificultad = {
            "Facil": null,
            "Media": null,
            "Dificil": null
        };

        // para las posiciones del contenido de cada cancion
        this.offsets = {
            nombre: { x: 0, y: 0 },
            dificultad: { x: 0, y: 0 },
            duracion: { x: 0, y: 0 }
        };

        // informacion de cada cancion { data de cancion, su boton }
        this.items = []; 

        // Ruta por defecto para el fallback local
        this.rutaCatalogoLocal = "catalogo.json";
    }

    // CONFIGURACIONES
    setConfigLista(x, y, width, height, itemHeight) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; // altura max de la lista
        this.itemHeight = itemHeight; // alto de cada cancion
    }

    // para dibujar el area de cada cancion
    setConfigBotones(srcNormal, srcHover) {
        this.srcBotonNormal = srcNormal;
        this.srcBotonHover = srcHover;
    }

    // para dibujar todos los textos de la lista
    setConfigTextos(srcCarpetaNombres, srcCarpetaDuracion, anchoImg, altoImg, gap) {
        this.fontNombreRender = new TextoPixelArtClass(srcCarpetaNombres, anchoImg, altoImg, gap);
        this.fontDuracionRender = new TextoPixelArtClass(srcCarpetaDuracion, anchoImg, altoImg, gap);
    }

    //para ubicar 3 imagenes de las dificultades de la cancion
    setConfigDificultad(srcFacil, srcMedia, srcDificil, facilW, facilH, mediaW, mediaH, dificilW, dificilH) {
        this.imgDificultad["Facil"] = new ImageClass(srcFacil, facilW, facilH);
        this.imgDificultad["Media"] = new ImageClass(srcMedia, mediaW, mediaH);
        this.imgDificultad["Dificil"] = new ImageClass(srcDificil, dificilW, dificilH);
    }

    // para definir el tamano de cada informacion de la cancion
    setConfigOffsets(offXNombre, offYNombre, offXDiff, offYDiff, offXDur, offYDur) {
        this.offsets.nombre = { x: offXNombre, y: offYNombre };
        this.offsets.dificultad = { x: offXDiff, y: offYDiff };
        this.offsets.duracion = { x: offXDur, y: offYDur };
    }

    setIsAdmin(state) {
        this.isAdmin = state;        
        // limpiar seleccion realizada
        if (!this.isAdmin) {
            this.limpiarIdxPermantHovered();
        }
    }

    limpiarIdxPermantHovered() {
        if (this.idxPermantHovered) this.items[this.idxPermantHovered].boton.setPermantHovered(false);
        this.idxPermantHovered = null;
    }

    async cargarCanciones(jsonCanciones) {
        // si es nulo o vacio, buscar el archivo local
        if (!jsonCanciones || jsonCanciones.length === 0) {
            console.log("[ListaCanciones] JSON no recibido por el servidor. Cargando catalogo local");
            try {
                const respuesta = await fetch(this.rutaCatalogoLocal);
                if (!respuesta.ok) throw new Error("Archivo no encontrado");
                const datosLocales = await respuesta.json();
                this._procesarArrayCanciones(datosLocales);
            } catch (error) {
                console.error("[ListaCanciones] Error al cargar catalogo local:", error);
            }
            return;
        }

        // procesa JSON del server
        this._procesarArrayCanciones(jsonCanciones);
    }

    // CARGA DE JSON CANCIONES
    _procesarArrayCanciones(jsonCanciones) {
        this.limpiarIdxPermantHovered();
        this.items = []; 

        // calcular posicion de cada cancion de la lista y cargar su informacion
        for (let i = 0; i < jsonCanciones.length; i++) {
            const cancion = jsonCanciones[i];
            const itemY = this.y + (i * this.itemHeight);

            // boton para encapsular cancion
            const botonFila = new BotonClass(
                this.srcBotonNormal, 
                this.srcBotonHover, 
                this.width, 
                this.itemHeight, 
                cancion.id // para retornar el ID
            );
            botonFila.setPos(this.x, itemY);

            this.items.push({
                data: cancion,
                boton: botonFila
            });
        }
    }

    // formatear segundos a minutos (204 = 3:24)
    _formatearDuracion(msTotales) {
        const segundosTotales = Math.floor(msTotales / 1000);
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        const segString = segundos < 10 ? "0" + segundos : segundos;
        return `${minutos}:${segString}`;
    }
    
    _setIdxPermantHovered(idx, state) {
        if (this.idxPermantHovered != null) {
            this.items[idx].boton.setPermantHovered(state);
            console.log(`se mprime ${idx}`)
        }
    }

    // MOUSE
    // cambiar el color de la cancion si se pasa el mause
    actualizarHover(mouseX, mouseY) {
        if (!this.isAdmin) return;
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].boton.actualizarHover(mouseX, mouseY);
        }
    }

    // para obtener el id de la cancion cuando se presiona la cancion
    obtenerClic(mouseX, mouseY) {
        if (!this.isAdmin) return null;
        for (let i = 0; i < this.items.length; i++) {
            const resultado = this.items[i].boton.obtenerClic(mouseX, mouseY);
            if (resultado !== null) {
                this._setIdxPermantHovered(this.idxPermantHovered, false);
                this.idxPermantHovered = i;
                this._setIdxPermantHovered(this.idxPermantHovered, true);
                return resultado; // id de la cancion
            }
        }
        return null;
    }

    // DIBUJAR
    draw(ctx) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const filaX = this.x;
            const filaY = this.y + (i * this.itemHeight);

            // TODO: por si se debe hacer scroll para ver el resto de canciones
            if (filaY + this.itemHeight > this.y + this.height) {
                continue; 
            }

            // dibujar el boton
            item.boton.setPos(filaX, filaY);
            item.boton.draw(ctx);

            // dibujar Nombre de la cancion
            if (this.fontNombreRender) {
                this.fontNombreRender.setPos(filaX + this.offsets.nombre.x, filaY + this.offsets.nombre.y);
                this.fontNombreRender.draw(ctx, item.data.nombre);
            }

            // dibujar dificultad
            const imgDiff = this.imgDificultad[item.data.dificultad];
            if (imgDiff) {
                imgDiff.setPos(filaX + this.offsets.dificultad.x, filaY + this.offsets.dificultad.y);
                imgDiff.draw(ctx);
            }

            // dibujar duracion
            if (this.fontDuracionRender) {
                const textoDuracion = this._formatearDuracion(item.data.duracion);
                this.fontDuracionRender.setPos(filaX + this.offsets.duracion.x, filaY + this.offsets.duracion.y);
                this.fontDuracionRender.draw(ctx, textoDuracion);
            }
        }
    }
}