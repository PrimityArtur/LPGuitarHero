(ns rhythm-game.websocket
  (:require
   [org.httpkit.server :as http]
   [rhythm-game.state :refer [estado-servidor]]
   [rhythm-game.messages :refer [->json <-json]]
   [rhythm-game.songs :refer [canciones]]
   [rhythm-game.game :refer [crear-partida!]]
   [clojure.set :as set]))


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
 iniciar-partida!
 actualizar-puntaje!
 broadcast-puntaje!
 procesar-puntaje!
 jugadores-partida
 todos-terminaron?
 ranking-final
 enviar-resultado-final!
 procesar-fin-partida!
 limpiar-partida!
 agregar-al-final-cola!
 limpiar-estadisticas-jugador
 procesar-continuar!
 procesar-salir!
 lista-publica-jugadores)

(defn enviar!
  [socket data]
  (http/send! socket
              (->json data)))

(defn broadcast!
  [data]
  (doseq [jugador (:jugadores @estado-servidor)]
    (enviar! (:socket jugador)
             data)))

(defn broadcast-excepto!
  [socket-excluido data]

  (doseq [jugador (:jugadores @estado-servidor)]

    (when (not= socket-excluido
                (:socket jugador))

      (enviar!
       (:socket jugador)
       data))))

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

;; PARA MANEJAR CASOS MENSAJES
(defn manejar-mensaje!
  [socket mensaje]
  (println mensaje)
  (let [data (<-json mensaje)]
    (case (:eventoCliente data)
      "conectar"
      (procesar-conexion!
       socket
       (:nombre data))
      "iniciarPartida"
      (iniciar-partida!
       socket
       (:cancion data)
       (:cantidadJugadores data))
      "puntaje"
      (procesar-puntaje!
       socket
       (:resultado data)
       (:puntajeTotal data))
      "finPartida"
      (procesar-fin-partida!
       socket)
      "continuar"
      (procesar-continuar! socket)
      "salir"
      (procesar-salir! socket)
      nil)))


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

(defn agregar-al-final-cola!
  [jugador]
  (swap!
   estado-servidor
   update
   :jugadores
   conj
   jugador))

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
        (buscar-jugador-por-socket socket)

        jugadores-conectados
        (count
         (remove
          :en-partida
          (:jugadores @estado-servidor)))]

    (cond

      (not= "admin" (:rol jugador))
      (enviar!
       socket
       {:eventoServidor "error"
        :mensaje "Solo el admin puede iniciar la partida"})

      (> cantidad jugadores-conectados)
      (enviar!
       socket
       {:eventoServidor "error"
        :mensaje "No hay suficientes jugadores conectados"})

      :else

      (let [{:keys [cancion notas jugadores]}
            (crear-partida!
             cancion-id
             cantidad)]

        ;; enviar partida a los jugadores participantes
        (enviar-a-jugadores!
         jugadores

         {:eventoServidor "partidaIniciada"

          :cancion cancion

          :jugadores
          (mapv
           #(select-keys %
                         [:nombre :rol])
           jugadores)

          :notas notas})

        ;; actualizar cola para los que NO están jugando
        (let [esperando

              (remove
               :en-partida
               (:jugadores @estado-servidor))]

          (enviar-a-jugadores!
           esperando

           {:eventoServidor "actualizarJugadores"

            :jugadores
            (lista-publica-jugadores)}))))))

(defn actualizar-puntaje!
  [nombre resultado puntaje-total]
  (let [campo
        (keyword resultado)]
    (swap!
     estado-servidor
     update
     :jugadores
     (fn [jugadores]
       (mapv
        (fn [jugador]
          (if (= nombre (:nombre jugador))
            (-> jugador
                (assoc :puntaje puntaje-total)
                (update campo
                        (fnil inc 0)))
            jugador))
        jugadores)))))

(defn marcar-terminado!
  [nombre]
  (swap!
   estado-servidor
   update
   :jugadores
   (fn [jugadores]
     (mapv
      (fn [jugador]
        (if (= nombre (:nombre jugador))
          (assoc jugador
                 :termino true)
          jugador))
      jugadores))))


(defn broadcast-puntaje!
  [socket nombre resultado puntaje-total]
  (broadcast-excepto!
   socket
   {:eventoServidor "actualizarPuntaje"
    :jugador nombre
    :resultado resultado
    :puntajeTotal puntaje-total}))

(defn procesar-puntaje!
  [socket resultado puntaje-total]
  (let [jugador
        (buscar-jugador-por-socket socket)
        nombre
        (:nombre jugador)]
    (actualizar-puntaje!
     nombre
     resultado
     puntaje-total)
    (broadcast-puntaje!
     socket
     nombre
     resultado
     puntaje-total)))

(defn jugadores-partida
  []
  (:jugadores-partida
   (:partida @estado-servidor)))

(defn todos-terminaron?
  []
  (let [nombres-partida
        (set (jugadores-partida))
        terminados
        (set
         (map :nombre
              (filter
               #(and (:termino %) (nombres-partida (:nombre %)))
               (:jugadores @estado-servidor))))]
    (set/subset? nombres-partida terminados)))

(defn ranking-final
  []
  (sort-by
   :puntaje
   >
   (filter
    #(some
      #{(:nombre %)}
      (jugadores-partida))
    (:jugadores @estado-servidor))))


(defn mover-jugador-al-final!
  [nombre]
  (let [jugadores
        (:jugadores @estado-servidor)
        jugador
        (first
         (filter
          #(= nombre (:nombre %))
          jugadores))
        restantes
        (remove
         #(= nombre (:nombre %))
         jugadores)]
    (swap!
     estado-servidor
     assoc
     :jugadores
     (vec
      (concat restantes
              [jugador])))))

(defn enviar-resultado-final!
  []
  (let [ranking (ranking-final)
        ganador (first ranking)
        participantes
        (filter :en-partida (:jugadores @estado-servidor))]
    (enviar-a-jugadores!
     participantes
     {:eventoServidor "resultadoFinal"
      :ganador (:nombre ganador)
      :ranking
      (mapv
       #(select-keys % [:nombre :puntaje :perfect :good :miss])
       ranking)})
    (limpiar-partida!)
    (swap!
     estado-servidor
     update
     :jugadores
     (fn [jugadores]
       (mapv #(dissoc % :en-partida) jugadores)))))


(defn procesar-fin-partida!
  [socket]
  (let [jugador
        (buscar-jugador-por-socket socket)
        nombre
        (:nombre jugador)]
    (marcar-terminado!
     nombre)
    (broadcast-excepto!
     socket
     {:eventoServidor "jugadorTermino"
      :jugador nombre})
    (when
     (todos-terminaron?)
      (enviar-resultado-final!))))

(defn limpiar-partida!
  []
  (swap!
   estado-servidor
   assoc
   :partida nil))

(defn preparar-sala-espera!
  []
  (swap!
   estado-servidor
   update
   :jugadores
   (fn [jugadores]
     (mapv
      (fn [jugador]
        (assoc jugador
               :puntaje 0
               :perfect 0
               :good 0
               :miss 0
               :termino false))
      jugadores)))
  (limpiar-partida!))

(defn limpiar-estadisticas-jugador
  [jugador]
  (assoc jugador
         :puntaje 0
         :perfect 0
         :good 0
         :miss 0
         :termino false))

(defn procesar-continuar!
  [socket]
  (let [jugador
        (buscar-jugador-por-socket socket)
        jugador-limpio
        (-> jugador
            limpiar-estadisticas-jugador
            (dissoc :en-partida))]
    (quitar-jugador-por-socket! socket)
    (agregar-al-final-cola! jugador-limpio)
    (reasignar-admin!)
    (broadcast!
     {:eventoServidor "actualizarJugadores"
      :jugadores (lista-publica-jugadores)})
    (enviar!
     socket
     {:eventoServidor "salaEspera"})))

(defn procesar-salir!
  [socket]
  (quitar-jugador-por-socket! socket)
  (reasignar-admin!)
  (broadcast!
   {:eventoServidor "actualizarJugadores"
    :jugadores (lista-publica-jugadores)}))

(defn lista-publica-jugadores
  []
  (mapv
   #(select-keys % [:nombre :rol])
   (remove :en-partida (:jugadores @estado-servidor))))