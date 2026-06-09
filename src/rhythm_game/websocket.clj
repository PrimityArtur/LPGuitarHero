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