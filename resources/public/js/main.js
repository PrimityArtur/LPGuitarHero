const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// INIT
let mostrarLog = true;
const logger = new LogClass('logContainer');
const gameController = new GameControllerClass(logger);

// CONFIG LOGIN
gameController.configurarAssetsLogin(
    '/img/guitar/menu_inicio/menu_clean.png', 
    '/img/guitar/letras/blancas', 
    '/img/guitar/menu_inicio/boton_entrar_lobby.png', 
    '/img/guitar/menu_inicio/boton_entrar_lobby_hover.png'
);



// CONFIG SALA ESPERA
gameController.configurarAssetsSalaEspera(
    '/img/guitar/menu_admin/menu_admin.png', 
    '/img/guitar/menu_jugador/menu_jugador.png'
);
const salaEsperaObj = gameController.getSalaEsperaClass();
const listaCancionesObj = salaEsperaObj.getListaCancionesClass();
const configPlayersObj = salaEsperaObj.getConfigPlayersClass();
//      LISTA DE CANCIONES
//          setConfigLista(x, y, width, height, itemHeight)
listaCancionesObj.setConfigLista(310, 390, 830, 700, 70);
listaCancionesObj.setConfigBotones('/img/guitar/menu_admin/selector_cancion.png', '/img/guitar//menu_admin/selector_cancion_hover.png');
listaCancionesObj.setConfigTextos('/img/guitar/letras/blancas', '/img/guitar/letras/plomas', 16, 16, 2);
listaCancionesObj.setConfigDificultad(
    '/img/guitar/menu_admin/easy.png', 
    '/img/guitar/menu_admin/medium.png', 
    '/img/guitar/menu_admin/hard.png', 
    54, 23,
    65, 23,
    55, 23
);
//          setConfigOffsets(offXNombre, offYNombre, offXDiff, offYDiff, offXDur, offYDur)
listaCancionesObj.setConfigOffsets(40, 25, 605, 20, 750, 25);
//      CONTENEDOR DE JUGADORES
//          setConfigAdmin(x, y, width, gapYBloques)
configPlayersObj.setConfigAdmin(1245, 340, 342, 20); 
//          setConfigCliente(x, y, width) 
configPlayersObj.setConfigCliente(735, 550, 600); 
configPlayersObj.setConfigBotonIniciar(
    '/img/guitar/menu_admin/boton_iniciar_partida.png', 
    '/img/guitar/menu_admin/boton_iniciar_partida_hover.png', 
    193, 30, 999
);
//      CONFIGURAR GRID NUMEROS
const gridNumerosObj = configPlayersObj.getNumeroJugadoresClass();
//          setConfigGrid(maxWidth, itemWidth, itemHeight, gapX, gapY)
gridNumerosObj.setConfigGrid(372, 40, 41, 24, 20);
gridNumerosObj.setConfigBotones('/img/guitar/menu_admin', '/img/guitar/menu_admin');
//      CONFIGURAR LISTA JUGADORES
const listaConectadosObj = configPlayersObj.getListaJugadoresClass();
//          setConfigLista(maxWidth, itemHeight, gapY)
listaConectadosObj.setConfigLista(600, 25, 10);
listaConectadosObj.setConfigTextos('/img/guitar/letras/blancas', '/img/guitar/letras/plomas', '/img/guitar/letras/verdes', 16, 16, 2);
//          setConfigIconos(srcAdmin, srcJugador, srcEsperando, srcHostDer, srcTu, iconLeftW, iconLeftH, hostDerW, hostDerH, tuW, tuH)
listaConectadosObj.setConfigIconos(
    '/img/guitar/menu_admin/circulo_host.png',
    '/img/guitar/menu_admin/circulo_activo.png',
    '/img/guitar/menu_admin/circulo_inactivot.png',
    '/img/guitar/menu_admin/host.png',
    '/img/guitar/menu_admin/tu.png',
    16, 16, // dimensiones iconos izquierda
    48, 18, // dimensiones icono host derecha
    32, 18  // dimensiones icono "Tu" derecha
);



// CONFIG TABLEROS JUEGO INICIADO
const juegoIniciadoObj = gameController.getJuegoIniciadoClass();
const headerObj = juegoIniciadoObj.getHeaderClass();
//      HEADER
//          nombre cancion (Y, srcCarpeta, anchoImg, altoImg, gapCaracteres)
headerObj.setConfigFila1(200, '/img/guitar/letras/amarillas', 20, 20, 2);
//          timer (Y, srcCarpeta, anchoImg, altoImg, gapCaracteres)
headerObj.setConfigFila2(225, '/img/guitar/letras/blancas', 26, 26, 2);
//          barra de progreso (Y, srcSpritesheet, anchoDestino, altoDestino, totalFramesEnElPng)
headerObj.setConfigFila3(260, '/img/guitar/juego/timeline.png', 352, 30, 40);
juegoIniciadoObj.setConfigFondo('/img/guitar/juego/fondo_canciones.png');
juegoIniciadoObj.setConfigRemotosFondos(
    '/img/guitar/juego/tablero_activos.png', 
    '/img/guitar/juego/tablero_inactivos.png'
);
//      TABLERO LOCAL CENTRO MAS GRANDE
const objSrcFlechasLocal = {
    "izquierda": '/img/guitar/juego/circulos_principal/circulo_verde_blanco.png',
    "arriba": '/img/guitar/juego/circulos_principal/circulo_rojo_blanco.png',
    "abajo": '/img/guitar/juego/circulos_principal/circulo_ama_blanco.png',
    "derecha": '/img/guitar/juego/circulos_principal/circulo_azul_blanco.png'
};
//          botones base cuando se presionan
const objSrcBotonesLocal = {
    "izquierda": '/img/guitar/juego/circulos_principal/circulo_verde_blanco.png',
    "arriba": '/img/guitar/juego/circulos_principal/circulo_rojo_blanco.png',
    "abajo": '/img/guitar/juego/circulos_principal/circulo_ama_blanco.png',
    "derecha": '/img/guitar/juego/circulos_principal/circulo_azul_blanco.png'
};
const tableroLocal = juegoIniciadoObj.getTableroLocal();
//          x, y, width, height, srcBg
tableroLocal.setConfigTablero(730, 300, 431, 594, '/img/guitar/juego/tablero_principal.png');
const fontNombreLocal = new TextoPixelArtClass('/img/guitar/letras/alpha100', 30, 30, 2);
tableroLocal.setConfigNombreTablero(fontNombreLocal, -40);
tableroLocal.setConfigCarriles(
    775, 380,         // startX, startY
    90, 430,          // anchoCarril, altoCarril
    3,               // gapX entre carriles
    63, 59,           // btnW, btnH (tamano del boton y la flecha)
    1500,             // fallTimeMs
    objSrcFlechasLocal,
    objSrcBotonesLocal
);

//          score Local (fuente mas grande)
const fontLocal = new TextoPixelArtClass('/img/guitar/letras/blancas', 20, 20, 20);
tableroLocal.setConfigUI(
    fontLocal, 
    '/img/guitar/juego/perfect.png', 
    '/img/guitar/juego/good.png', 
    '/img/guitar/juego/miss.png', 
    30, 74 // Tamano de los indicadores laterales
);
//          offComboX, offComboY, offScoreX, offScoreY, offIndX, offIndY
tableroLocal.setConfigOffsets(100, 13, 178, 12, 0, 65);
//      CONFIGURAR TABLEROS REMOTOS 4 IZQ - 4 DER
const objSrcFlechasRemoto = {
    "izquierda": '/img/guitar/juego/circulos_activos/circulo_verde_blanco.png',
    "arriba": '/img/guitar/juego/circulos_activos/circulo_rojo_blanco.png',
    "abajo": '/img/guitar/juego/circulos_activos/circulo_ama_blanco.png',
    "derecha": '/img/guitar/juego/circulos_activos/circulo_azul_blanco.png'
};
const objSrcBotonesRemoto = {
    "izquierda": '/img/guitar/juego/circulos_activos/circulo_verde_blanco.png',
    "arriba": '/img/guitar/juego/circulos_activos/circulo_rojo_blanco.png',
    "abajo": '/img/guitar/juego/circulos_activos/circulo_azul_blanco.png',
    "derecha": '/img/guitar/juego/circulos_activos/circulo_azul_blanco.png'
};
const tablerosRemotos = juegoIniciadoObj.getTablerosRemotos();
const fontRemoto = new TextoPixelArtClass('/img/guitar/letras/blancas', 16, 16, 11);
const listFontColors = ['azules','blancas','rojas','verdes','amarillas'];
for (let i = 0; i < 8; i++) {
    const t = tablerosRemotos[i];
    let tx = 0, ty = 0;
    if (i < 4) { // 4 2x2 taleros izq
        const col = i % 2;
        const fila = Math.floor(i / 2);
        tx = 60 + (col * 300);  // espaciado horizontal
        ty = 100 + (fila * 480); // espaciado vertical
    } else { // 4 2x2 taleros der
        const col = (i - 4) % 2;
        const fila = Math.floor((i - 4) / 2);
        tx = 1260 + (col * 300);
        ty = 100 + (fila * 480);
    }
    //          x, y, width, height, srcBg
    t.setConfigTablero(tx, ty, 286, 399, '/img/guitar/juego/tablero_activos.png');
    const fontNombreRemoto = new TextoPixelArtClass(`/img/guitar/letras/amarillas`, 25, 25, 2);
    t.setConfigNombreTablero(fontNombreRemoto, -30);
    t.setConfigCarriles(
        tx + 28, ty + 50,   // startX, startY
        61, 300,            // anchoCarril, altoCarril
        1,                  // gapX
        31, 29,             // btnW, btnH
        1500,               // fallTimeMs
        objSrcFlechasRemoto,
        objSrcBotonesRemoto
    );
    t.setConfigUI(
        fontRemoto, 
        '/img/guitar/juego/perfect_mini.png', 
        '/img/guitar/juego/good_mini.png', 
        '/img/guitar/juego/miss_mini.png', 
        20, 50
    );
    //          offComboX, offComboY, offScoreX, offScoreY, offIndX, offIndY
    t.setConfigOffsets(66, 9, 117, 9, 0, 45);
}


// CONFIG FIN PARTIDA
const finPartidaObj = gameController.getFinPartidaClass();
finPartidaObj.setConfigFondo('/img/guitar/menu_fin/menu_fin_clean.png');
//      Corona (src, width, height, posY)
finPartidaObj.setConfigCorona('/img/guitar/menu_fin/corona.png', 238, 216, 680);
//      Botones inferiores (Volver y Menu)
finPartidaObj.setConfigBotones(
    '/img/guitar/menu_fin/volver_a_jugar.png', 
    '/img/guitar/menu_fin/volver_a_jugar_hover.png', 
    '/img/guitar/menu_fin/volver_al_menu.png', 
    '/img/guitar/menu_fin/volver_al_menu_hover.png', 
    419, 73, // btnW, btnH
    240,     // gapCentro
    925      // posY
);
//      3 scores
const scores = finPartidaObj.getClasesScore();
for (let i = 0; i < scores.length; i++) {
    const score = scores[i];
    //      width, height, gapY
    score.setConfigContenedor(400, 200, 25);
    score.setConfigFuenteNombre('/img/guitar/letras/blancas', 34, 34, 2);
    score.setConfigFuenteScore('/img/guitar/letras/amarillas', 32, 32, 4);
    //      srcP, wP, hP, gapP, srcG, wG, hG, gapG, srcM, wM, hM, gapM
    score.setConfigFuentesHits(
        '/img/guitar/letras/verdes', 20, 20, 2, // Perfect
        '/img/guitar/letras/amarillas', 20, 20, 2, // Good
        '/img/guitar/letras/rojas',  20, 20, 2  // Miss
    );
}

// EVENTOS MOUSE - TECLADO
function obtenerMouseCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

window.addEventListener('keydown', (e) => {
    gameController.procesarTecla(e.key);

    // LOGS TEST
    const tecla = e.key.toLowerCase();
    if (tecla === 'l') {
        mostrarLog = !mostrarLog;
        logger.toggle(mostrarLog);
    }
});

canvas.addEventListener('mousemove', (e) => {
    const mouse = obtenerMouseCanvas(e);
    gameController.actualizarHover(mouse.x, mouse.y);
});

canvas.addEventListener('click', (e) => {
    const mouse = obtenerMouseCanvas(e);
    gameController.obtenerClic(mouse.x, mouse.y);
});

// GAME LOOP 
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    gameController.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// INICIO
logger.toggle(mostrarLog);
logger.print("Presiona 'L' para Ocultar/Mostrar Logs");
requestAnimationFrame(gameLoop);
