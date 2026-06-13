/*
Estructura del Proyecto unido en un solo archivo
Raiz: rhythm_game
- project.clj
- resources
-- notes
-- public
--- index.html
--- css
---- style.css
--- js
---- main.js
- src
-- rhythm_game
--- core.clj
--- game.clj
--- messages.clj
--- resource_loader.clj
--- songs.clj
--- state.clj
--- websocket.clj
- test
-- rhythm_game
--- core_test.clj
*/

// rhythm_game/project.clj
(defproject rhythm_game "0.1.0-SNAPSHOT"
  :dependencies [[org.clojure/clojure "1.12.0"]
                 [http-kit "2.8.0"]
                 [cheshire "5.13.0"]
                 [ring/ring-core "1.15.4"]]
  :main ^:skip-aot rhythm-game.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}})


// rhythm_game/resources/public/index.html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Rhythm Game Test Client</title>

<link rel="stylesheet" href="/css/style.css">
</head>

<body>

<div class="container">

    <h1>🎵 Rhythm Game Test Client</h1>

    <div class="card">

        <h3>Conexión</h3>

        <input
            id="nombre"
            type="text"
            placeholder="Nombre jugador">

        <button onclick="conectar()">
            Conectar
        </button>

    </div>

    <div class="card">

        <h3>Iniciar Partida</h3>

        <input
            id="cancion"
            type="number"
            value="1"
            placeholder="ID Canción">

        <input
            id="cantidad"
            type="number"
            value="2"
            placeholder="Jugadores">

        <button onclick="iniciarPartida()">
            Iniciar Partida
        </button>

    </div>

    <div class="card">

        <h3>Jugadores</h3>

        <div id="jugadores">
            Sin jugadores
        </div>

    </div>

    <div class="card">

        <h3>Mensajes</h3>

        <div id="log"></div>

    </div>

</div>

<script src="/js/main.js"></script>

</body>
</html>

// rhythm_game/resources/public/css/style.css

body{
    font-family: Arial, sans-serif;
    background:#1e1e1e;
    color:white;
    margin:20px;
}

.container{
    max-width:900px;
    margin:auto;
}

.card{
    background:#2d2d2d;
    padding:15px;
    border-radius:10px;
    margin-bottom:15px;
}

input, button{
    padding:10px;
    margin:5px;
    border:none;
    border-radius:5px;
}

input{
    width:200px;
}

button{
    cursor:pointer;
}

button:hover{
    opacity:0.9;
}

#log{
    background:black;
    color:#00ff00;
    padding:10px;
    height:300px;
    overflow-y:auto;
    font-family:monospace;
}

#jugadores{
    background:#111;
    padding:10px;
    min-height:100px;
}

// rhythm_game/resources/public/js/main.js

let ws;

function log(texto){

    const logDiv =
        document.getElementById("log");

    logDiv.innerHTML +=
        texto + "<br>";

    logDiv.scrollTop =
        logDiv.scrollHeight;
}

function conectar(){

    const nombre =
        document.getElementById("nombre").value;

    const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocolo}//${window.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {

        log("🟢 Conectado");

        ws.send(JSON.stringify({
            eventoCliente:"conectar",
            nombre:nombre
        }));
    };

    ws.onmessage = (evento) => {

        const data =
            JSON.parse(evento.data);

        log(
            "⬅️ " +
            JSON.stringify(data)
        );

        if(data.jugadores){

            mostrarJugadores(
                data.jugadores
            );
        }
    };

    ws.onclose = () => {

        log("🔴 Desconectado");
    };

    ws.onerror = (e) => {

        console.error(e);

        log("❌ Error");
    };
}

function iniciarPartida(){

    if(!ws){
        alert("Conéctate primero");
        return;
    }

    const cancion =
        Number(
            document.getElementById("cancion").value
        );

    const cantidad =
        Number(
            document.getElementById("cantidad").value
        );

    const mensaje = {

        eventoCliente:"iniciarPartida",

        cancion:cancion,

        cantidadJugadores:cantidad
    };

    ws.send(
        JSON.stringify(mensaje)
    );

    log(
        "➡️ " +
        JSON.stringify(mensaje)
    );
}

function mostrarJugadores(jugadores){

    const div =
        document.getElementById("jugadores");

    div.innerHTML = "";

    jugadores.forEach(j => {

        div.innerHTML += `
            <div>
                👤 ${j.nombre}
                (${j.rol})
            </div>
        `;
    });
}

// rhythm_game/src/rhythm_game/core.clj
(ns rhythm-game.core
  (:require
   [org.httpkit.server :as http]
   [clojure.java.io :as io]
   [ring.util.response :as resp]
   [rhythm-game.websocket :refer [ws-handler]])
  (:gen-class))

(defn app
  [req]
  (let [uri (:uri req)]
  (case uri

    "/ws"
    (ws-handler req)

    "/"
    (resp/resource-response "public/index.html")

    (or (resp/resource-response (subs uri 1)
                                {:root "public"}) ;; js, css
        {:status 404 :body "File no Found"}))))

(defonce servidor
  (atom nil))

(defn iniciar-servidor!
  []

  (reset!
   servidor
   (http/run-server
    app
    {:port 8080}))

  (println "Servidor iniciado en puerto 8080"))

(defn detener-servidor!
  []

  (when @servidor
    (@servidor)

    (reset! servidor nil)

    (println "Servidor detenido")))

(defn -main
  [& _]

  (iniciar-servidor!))



;; --- REPL ---
;; En Clojure, este bloque 'comment' no se ejecuta al hacer el despliegue pero se puede ejecutar las lineas individualmente
;; PARA EJECUTAR EL PROYECTO ctrl+shift+p -> "Calva: Start a Project REPL and Connect (aka Jack-In)" -> Leiningen -> OK
(comment
  ;; ENCENDER el servidor en tu computadora: alt + Enter sobre (servidor-local) para ejecutar el server local
  ;; si se desea hacer cambias en la funcion agregada o cambiada se debe hacer Alt+Enter en dicha funcion cambiada y ya se refleja los cambios 
  (def servidor-local (-main))

  ;; APAGAR el servidor (ejecuta esto antes de encenderlo de nuevo si falla)
  (detener-servidor!) 
)

// rhythm_game/src/rhythm_game/game.clj
(ns rhythm-game.game
  (:require
   [rhythm-game.state :refer [estado-servidor]]
   [rhythm-game.songs :refer [canciones]]
   [rhythm-game.resource-loader :refer [cargar-notas]]))

(defn buscar-cancion
  [id]
  (first
   (filter
    #(= id (:id %))
    canciones)))

(defn seleccionar-jugadores
  [cantidad]
  (take
   cantidad
   (:jugadores @estado-servidor)))

(defn crear-partida!
  [id-cancion cantidad]
  (let [cancion
        (buscar-cancion id-cancion)
        notas
        (cargar-notas
         (:archivoNotas cancion))
        jugadores
        (vec
         (take cantidad
               (:jugadores @estado-servidor)))]
    (swap!
     estado-servidor
     assoc
     :partida
     {:activa true
      :cancion cancion
      :notas notas
      :jugadores-partida
      (mapv :nombre jugadores)
      :terminados #{}})
    {:cancion cancion
     :notas notas
     :jugadores jugadores}))

(ns rhythm-game.game
  (:require
   [rhythm-game.state :refer [estado-servidor]]
   [rhythm-game.songs :refer [canciones]]
   [rhythm-game.resource-loader :refer [cargar-notas]]))

// rhythm_game/src/rhythm_game/messages.clj
(ns rhythm-game.messages
  (:require
   [cheshire.core :as json]))
(defn ->json
  [data]
  (json/generate-string data))
(defn <-json
  [texto]
  (json/parse-string texto true))

// rhythm_game/src/rhythm_game/resource_loader.clj
(ns rhythm-game.resource-loader
  (:require
   [cheshire.core :as json]
   [clojure.java.io :as io]))

(defn leer-json
  [ruta]
  (with-open [reader (io/reader (io/resource ruta))]
    (json/parse-stream reader true)))

(defn cargar-catalogo
  []
  (leer-json "catalogo.json"))

(defn cargar-notas
  [archivo]
  (leer-json archivo))

// rhythm_game/src/rhythm_game/songs.clj
(ns rhythm-game.songs
  (:require
   [rhythm-game.resource-loader
    :refer [cargar-catalogo]]))

(def canciones
  (cargar-catalogo))

// rhythm_game/src/rhythm_game/state.clj
(ns rhythm-game.state)

(def estado-servidor
  (atom
   {:jugadores []
    :partida nil}))

// rhythm_game/src/rhythm_game/websocket.clj
(ns rhythm-game.websocket
  (:require
   [org.httpkit.server :as http]
   [rhythm-game.state :refer [estado-servidor]]
   [rhythm-game.messages :refer [->json <-json]]
   [rhythm-game.songs :refer [canciones]]
   [rhythm-game.game :refer [crear-partida!]]))


(declare
 partida-activa?
 buscar-jugador
 reconectar-jugador!
 marcar-desconectado!
 quitar-jugador-por-socket!
 reasignar-admin!
 enviar-canciones!
 buscar-jugador-por-socket
 enviar-a-jugadores!
 iniciar-partida!)

(defn enviar!
  [socket data]
  (http/send! socket
              (->json data)))
(defn broadcast!
  [data]
  (doseq [jugador (:jugadores @estado-servidor)]
    (enviar! (:socket jugador)
             data)))
(defn nombre-ocupado?
  [nombre]
  (some #(= nombre (:nombre %))
        (:jugadores @estado-servidor)))
(defn crear-jugador
  [nombre socket]
  {:nombre nombre
   :socket socket
   :rol nil
   :conectado true
   :puntaje 0
   :perfect 0
   :good 0
   :miss 0
   :termino false})

(defn asignar-rol
  []
  (if (empty? (:jugadores @estado-servidor))
    "admin"
    "usuario"))
(defn agregar-jugador!
  [nombre socket]

  (let [rol (asignar-rol)

        jugador (assoc
                 (crear-jugador nombre socket)
                 :rol rol)]

    (swap! estado-servidor
           update
           :jugadores
           conj
           jugador)

    jugador))
(defn lista-publica-jugadores
  []
  (mapv
   #(select-keys %
                 [:nombre :rol])

   (:jugadores @estado-servidor)))

(defn procesar-desconexion!
  [socket]
  (println "Desconexión detectada")
  (if (partida-activa?)
    ;; Durante partida
    (marcar-desconectado! socket)
    ;; Sala de espera
    (do
      (quitar-jugador-por-socket! socket)
      (reasignar-admin!)
      (broadcast!
       {:eventoServidor "actualizarJugadores"
        :jugadores
        (lista-publica-jugadores)}))))

(defn procesar-conexion!
  [socket nombre]
  (println "Intento de conexión:" nombre)
  (let [jugador-existente
        (buscar-jugador nombre)]
    (cond
      ;; jugador nuevo
      (nil? jugador-existente)
      (let [jugador
            (agregar-jugador!
             nombre
             socket)]
        (enviar!
         socket
         {:eventoServidor "libre"
          :rol (:rol jugador)
          :jugadores
          (lista-publica-jugadores)})
        (when (= "admin" (:rol jugador))
          (enviar-canciones! socket))
        (broadcast!
         {:eventoServidor "actualizarJugadores"
          :jugadores
          (lista-publica-jugadores)}))
      ;; ya conectado
      (:conectado jugador-existente)
      (enviar!
       socket
       {:eventoServidor "ocupado"})
      ;; reconexión durante partida
      (and
       (not (:conectado jugador-existente))
       (partida-activa?))
      (do
        (reconectar-jugador!
         nombre
         socket)
        (enviar!
         socket
         {:eventoServidor "reconexionExitosa"}))
      ;; fallback
      :else
      (enviar!
       socket
       {:eventoServidor "ocupado"}))))

(defn manejar-mensaje!
  [socket mensaje]
  (println mensaje)
  (let [data (<-json mensaje)]
    (case (:eventoCliente data)
      "conectar"
      (procesar-conexion!
       socket
       (:nombre data))
      nil)
    "iniciarPartida"
    (iniciar-partida!
     socket
     (:cancion data)
     (:cantidadJugadores data))))


(defn ws-handler
  [req]
  (http/with-channel req socket
    (http/on-receive
     socket
     (fn [mensaje]
       (manejar-mensaje!
        socket
        mensaje)))
    (http/on-close
     socket
     (fn [status]
       (println "Socket cerrado:" status)
       (procesar-desconexion! socket)))))

(defn partida-activa?
  []
  (some?
   (:partida
    @estado-servidor)))

(defn buscar-jugador
  [nombre]
  (first
   (filter
    #(= nombre (:nombre %))
    (:jugadores @estado-servidor))))

(defn reconectar-jugador!
  [nombre socket]
  (swap!
   estado-servidor
   update
   :jugadores
   (fn [jugadores]
     (mapv
      (fn [jugador]
        (if (= nombre (:nombre jugador))
          (assoc jugador
                 :socket socket
                 :conectado true)
          jugador))
      jugadores))))

(defn marcar-desconectado!
  [socket]
  (swap!
   estado-servidor
   update
   :jugadores
   (fn [jugadores]
     (mapv
      (fn [jugador]
        (if (= socket (:socket jugador))
          (assoc jugador
                 :socket nil
                 :conectado false)
          jugador))
      jugadores))))

(defn quitar-jugador-por-socket!
  [socket]
  (swap!
   estado-servidor
   update
   :jugadores
   (fn [jugadores]
     (vec
      (remove
       #(= socket (:socket %))
       jugadores)))))

(defn reasignar-admin!
  []
  (let [jugadores
        (:jugadores @estado-servidor)]
    (when (seq jugadores)
      (swap!
       estado-servidor
       assoc
       :jugadores
       (vec
        (map-indexed
         (fn [indice jugador]
           (assoc jugador
                  :rol
                  (if (= indice 0)
                    "admin"
                    "usuario")))
         jugadores))))))

(defn enviar-canciones!
  [socket]

  (enviar!
   socket

   {:eventoServidor "listaCanciones"
    :canciones canciones}))

(defn buscar-jugador-por-socket
  [socket]
  (first
   (filter
    #(= socket (:socket %))
    (:jugadores @estado-servidor))))

(defn enviar-a-jugadores!
  [jugadores data]

  (doseq [jugador jugadores]

    (enviar!
     (:socket jugador)
     data)))

(defn iniciar-partida!
  [socket cancion-id cantidad]
  (let [jugador
        (buscar-jugador-por-socket socket)]
    (if (not= "admin" (:rol jugador))
      (enviar!
       socket
       {:eventoServidor "error"
        :mensaje "Solo el admin puede iniciar la partida"})
      (let [{:keys [cancion notas jugadores]}
            (crear-partida!
             cancion-id
             cantidad)]
        (enviar-a-jugadores!
         jugadores
         {:eventoServidor "partidaIniciada"
          :cancion cancion
          :jugadores
          (mapv
           #(select-keys %
                         [:nombre :rol])
           jugadores)
          :notas notas})))))

// rhythm_game/test/rhythm_game/core_test.clj
(ns rhythm-game.core-test
  (:require [clojure.test :refer :all]
            [rhythm-game.core :refer :all]))

(deftest a-test
  (testing "FIXME, I fail."
    (is (= 0 1))))


