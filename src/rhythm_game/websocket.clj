(ns rhythm-game.websocket
  (:require
   [org.httpkit.server :as http]
   [rhythm-game.state :refer [estado-servidor]]
   [rhythm-game.messages :refer [->json <-json]]
   [rhythm-game.songs :refer [canciones]]
   [rhythm-game.game :refer [crear-partida!]]
   [rhythm-game.state-manager :as sm]
   [clojure.set :as set]))


;; UTILIDADES 
(defn enviar!
  [socket data]
  (when socket
    (http/send! socket (->json data))))

(defn broadcast-a!
  "Envía `data` a la lista de jugadores dada."
  [jugadores data]
  (doseq [j jugadores]
    (enviar! (:socket j) data)))

(defn broadcast!
  "Envía `data` a TODOS los jugadores del estado actual."
  [data]
  (broadcast-a! (:jugadores @estado-servidor) data))

(defn broadcast-excepto!
  "Envía `data` a todos excepto al socket indicado."
  [socket-excluido data]
  (doseq [j (:jugadores @estado-servidor)]
    (when (not= socket-excluido (:socket j))
      (enviar! (:socket j) data))))

;; HELPERS: LECTURA DE ESTADOS 

(defn partida-activa?
  []
  (some? (:partida @estado-servidor)))

(defn buscar-jugador
  [nombre]
  (first (filter #(= nombre (:nombre %))
                 (:jugadores @estado-servidor))))

(defn buscar-jugador-por-socket
  [socket]
  (first (filter #(= socket (:socket %))
                 (:jugadores @estado-servidor))))

(defn jugadores-partida-nombres
  "Devuelve el set de nombres de jugadores en la partida activa."
  []
  (set (get-in @estado-servidor [:partida :jugadores-partida])))

(defn todos-terminaron?
  []
  (let [en-partida (jugadores-partida-nombres)
        terminados (set (map :nombre
                             (filter #(and (:termino %)
                                           (en-partida (:nombre %)))
                                     (:jugadores @estado-servidor))))]
    (and (seq en-partida)
         (set/subset? en-partida terminados))))

(defn ranking-final
  []
  (sort-by :puntaje >
           (filter #(contains? (jugadores-partida-nombres) (:nombre %))
                   (:jugadores @estado-servidor))))

(defn lista-publica-jugadores
  "Jugadores visibles en sala de espera (sin :en-partida)."
  []
  (mapv #(select-keys % [:nombre :rol])
        (remove :en-partida (:jugadores @estado-servidor))))

(defn lista-espectadores
  []
  (filterv #(not (:en-partida %))
           (:jugadores @estado-servidor)))

(defn cantidad-espectadores
  []
  (count (lista-espectadores)))


;; HELPERS DE ESTADO (usan agent)
(defn asignar-rol
  []
  (if (empty? (:jugadores @estado-servidor)) "admin" "usuario"))

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

(defn nombre-ocupado?
  [nombre]
  (some #(= nombre (:nombre %))
        (:jugadores @estado-servidor)))

(defn enviar-canciones!
  [socket]
  (enviar! socket {:eventoServidor "listaCanciones"
                   :canciones canciones}))

;; MUTACIONES DE ESTADO - SENDS
(defn agregar-jugador!
  "Agrega jugador al agente y devuelve el jugador creado."
  [nombre socket]
  (let [rol (asignar-rol)
        jugador (assoc (crear-jugador nombre socket) :rol rol)]
    (send estado-servidor sm/agregar-jugador jugador)
    jugador))

(defn quitar-y-reasignar!
  "Quita al jugador con `socket` y reasigna admin en una sola transacción."
  [socket]
  (send estado-servidor
        (fn [estado]
          (-> estado
              (sm/quitar-jugador socket)
              (sm/reasignar-admin)))))

(defn marcar-desconectado!
  [socket]
  (send estado-servidor sm/marcar-desconectado socket))

(defn reconectar-jugador!
  [nombre socket]
  (send estado-servidor sm/reconectar-jugador nombre socket))

(defn actualizar-puntaje!
  [nombre resultado puntaje-total]
  (send estado-servidor sm/actualizar-puntaje nombre resultado puntaje-total))

(defn marcar-terminado!
  [nombre]
  (send estado-servidor sm/marcar-terminado nombre))

(defn limpiar-partida!
  []
  (send estado-servidor sm/limpiar-partida))

(defn quitar-agregar-reasignar!
  "Quita al jugador del socket, lo agrega al final con stats limpias,
   y reasigna admin — todo en una sola transacción atómica."
  [jugador-limpio socket]
  (send estado-servidor
        (fn [estado]
          (-> estado
              (sm/quitar-jugador socket)
              (sm/agregar-al-final jugador-limpio)
              (sm/reasignar-admin)))))

(defn actualizar-configuracion-sala!
  [cancion-id cantidad-jugadores]

  (send estado-servidor
        sm/actualizar-configuracion-sala
        cancion-id
        cantidad-jugadores))

;; LÓGICA DE CONEXIÓN
(defn procesar-desconexion!
  [socket]
  (println "Desconexión detectada")
  (if (partida-activa?)
    (do
      (marcar-desconectado! socket)
      (await estado-servidor)
      (broadcast! {:eventoServidor "espectadores"
                   :cantidad (cantidad-espectadores)}))
    (do
      (quitar-y-reasignar! socket)
      (await estado-servidor)
      (broadcast! {:eventoServidor "actualizarJugadores"
                   :jugadores (lista-publica-jugadores)}))))

(defn procesar-conexion!
  [socket nombre]
  (println "Intento de conexión:" nombre)
  (let [jugador-existente (buscar-jugador nombre)]
    (cond
      (nil? jugador-existente)
      (let [jugador (agregar-jugador! nombre socket)]
        (await estado-servidor)
        (enviar! socket {:eventoServidor "libre"
                         :rol (:rol jugador)
                         :jugadores (lista-publica-jugadores)})
        (let [config (:configuracion-sala @estado-servidor)]
        
          (when (:cancion-id config)
        
            (enviar! socket
                     {:eventoServidor "configuracionSala"
                      :cancionId (:cancion-id config)
                      :cantidadJugadores (:cantidad-jugadores config)})))
        (when (= "admin" (:rol jugador))
          (enviar-canciones! socket))
        (when (partida-activa?)
          (let [partida (:partida @estado-servidor)]
            (enviar! socket {:eventoServidor "infoEspectador"
                             :cancion (:cancion partida)
                             :jugadoresPartida (:jugadores-partida partida)
                             :puntajes
                             (mapv #(select-keys % [:nombre :puntaje :perfect :good :miss])
                                   (filter #(contains? (set (:jugadores-partida partida))
                                                       (:nombre %))
                                           (:jugadores @estado-servidor)))})))
        (broadcast! {:eventoServidor "actualizarJugadores"
                     :jugadores (lista-publica-jugadores)
                     :espectadores (cantidad-espectadores)}))

      (and (not (:conectado jugador-existente)) (partida-activa?))
      (do
        (reconectar-jugador! nombre socket)
        (await estado-servidor)
        (let [partida (:partida @estado-servidor)
              jugador (buscar-jugador nombre)
              en-partida? (:en-partida jugador)]
          (if en-partida?
            (do
              (enviar! socket {:eventoServidor "reconexionExitosa"
                               :cancion (:cancion partida)
                               :notas (:notas partida)
                               :jugadores (:jugadores-partida partida)
                               :puntajes
                               (mapv #(select-keys % [:nombre :puntaje :perfect :good :miss])
                                     (filter #(contains? (set (:jugadores-partida partida))
                                                         (:nombre %))
                                             (:jugadores @estado-servidor)))})
              (broadcast-excepto! socket {:eventoServidor "jugadorReconectado"
                                          :jugador nombre}))
            (enviar! socket {:eventoServidor   "infoEspectador"
                             :cancion (:cancion partida)
                             :jugadoresPartida (:jugadores-partida partida)
                             :puntajes
                             (mapv #(select-keys % [:nombre :puntaje :perfect :good :miss])
                                   (filter #(contains? (set (:jugadores-partida partida))
                                                       (:nombre %))
                                           (:jugadores @estado-servidor)))}))
          (broadcast! {:eventoServidor "espectadores"
                       :cantidad (cantidad-espectadores)})))

      (:conectado jugador-existente)
      (enviar! socket {:eventoServidor "ocupado"})

      :else
      (enviar! socket {:eventoServidor "ocupado"}))))


;; PARTIDA

(defn iniciar-partida!
  [socket cancion-id cantidad]
  (let [jugador (buscar-jugador-por-socket socket)
        jugadores-libres (remove :en-partida (:jugadores @estado-servidor))]
    (cond
      (not= "admin" (:rol jugador))
      (enviar! socket {:eventoServidor "error"
                       :mensaje "Solo el admin puede iniciar la partida"})

      (> cantidad (count jugadores-libres))
      (enviar! socket {:eventoServidor "error"
                       :mensaje "No hay suficientes jugadores conectados"})

      :else

      (let [_ (actualizar-configuracion-sala!
               cancion-id
               cantidad)
            {:keys [cancion notas jugadores]} (crear-partida! cancion-id cantidad)]
        (broadcast-a! jugadores {:eventoServidor "partidaIniciada"
                                 :cancion cancion
                                 :jugadores (mapv #(select-keys % [:nombre :rol]) jugadores)
                                 :notas notas})
        (await estado-servidor)
        (let [espectadores (lista-espectadores)]
          (broadcast-a! espectadores {:eventoServidor "infoEspectador"
                                      :cancion cancion
                                      :jugadoresPartida (mapv :nombre jugadores)
                                      :puntajes []})
          (broadcast! {:eventoServidor "actualizarJugadores"
                       :jugadores (lista-publica-jugadores)
                       :espectadores (count espectadores)}))))))

(defn broadcast-puntaje!
  [socket nombre resultado puntaje-total]
  (let [estado @estado-servidor
        partida (:partida estado)
        todos (:jugadores estado)]
    (doseq [j todos]
      (when (and (not= socket (:socket j))
                 (:socket j))
        (enviar! (:socket j)
                 {:eventoServidor "actualizarPuntaje"
                  :jugador nombre
                  :resultado resultado
                  :puntajeTotal puntaje-total})))
    (let [espectadores  (lista-espectadores)
          nombres-part  (set (:jugadores-partida partida))
          puntajes-todos (mapv #(select-keys % [:nombre :puntaje :perfect :good :miss])
                               (filter #(nombres-part (:nombre %)) todos))]
      (broadcast-a! espectadores {:eventoServidor "puntajeEspectador"
                                  :jugador nombre
                                  :resultado resultado
                                  :puntajeTotal puntaje-total
                                  :puntajes puntajes-todos}))))

(defn procesar-puntaje!
  [socket resultado puntaje-total]
  (let [jugador (buscar-jugador-por-socket socket)
        nombre (:nombre jugador)]
    (actualizar-puntaje! nombre resultado puntaje-total)
    (broadcast-puntaje! socket nombre resultado puntaje-total)))

(defn enviar-resultado-final!
  []
  (let [ranking (ranking-final)
        ganador (first ranking)
        participantes (filter :en-partida (:jugadores @estado-servidor))
        espectadores (lista-espectadores)
        payload {:eventoServidor "resultadoFinal"
                      :ganador (:nombre ganador)
                      :ranking (mapv #(select-keys % [:nombre :puntaje :perfect :good :miss])
                                            ranking)}]
    (broadcast-a! participantes payload)
    (broadcast-a! espectadores  payload)
    (send estado-servidor
          (fn [estado]
            (-> estado
                (sm/limpiar-partida)
                (update :jugadores
                        (fn [jugadores]
                          (mapv #(dissoc % :en-partida) jugadores))))))))

(defn procesar-fin-partida!
  [socket]
  (let [jugador (buscar-jugador-por-socket socket)
        nombre  (:nombre jugador)]
    (marcar-terminado! nombre)
    (broadcast-excepto! socket {:eventoServidor "jugadorTermino"
                                :jugador nombre})
    (await estado-servidor)
    (when (todos-terminaron?)
      (enviar-resultado-final!))))


;; CONTINUAR / SALIR
(defn limpiar-estadisticas-jugador
  [jugador]
  (assoc jugador :puntaje 0 :perfect 0 :good 0 :miss 0 :termino false))

(defn procesar-continuar!
  [socket]
  (let [jugador (buscar-jugador-por-socket socket)
        jugador-limpio (-> jugador
                           limpiar-estadisticas-jugador
                           (dissoc :en-partida))]
    (quitar-agregar-reasignar! jugador-limpio socket)
    (await estado-servidor)
    (broadcast! {:eventoServidor "actualizarJugadores"
                 :jugadores (lista-publica-jugadores)
                 :espectadores (cantidad-espectadores)})
    (enviar! socket {:eventoServidor "salaEspera"})))

(defn procesar-salir!
  [socket]
  (quitar-y-reasignar! socket)
  (await estado-servidor)
  (broadcast! {:eventoServidor "actualizarJugadores"
               :jugadores (lista-publica-jugadores)
               :espectadores (cantidad-espectadores)}))

;; GUARDAR ESTADO CONFIGURACION SALA DE ESPERA
(defn procesar-configuracion-sala!
  [socket cancion-id cantidad-jugadores]
  (let [jugador (buscar-jugador-por-socket socket)]
    (when (= "admin" (:rol jugador))
      (actualizar-configuracion-sala!
       cancion-id
       cantidad-jugadores)
      (broadcast-excepto!
       socket
       {:eventoServidor "configuracionSala"
        :cancionId cancion-id
        :cantidadJugadores cantidad-jugadores}))))

;; ROUTER DE MENSAJES
(defn manejar-mensaje!
  [socket mensaje]
  (println mensaje)
  (let [data (<-json mensaje)]
    (case (:eventoCliente data)
      "conectar" (procesar-conexion! socket (:nombre data))
      "iniciarPartida" (iniciar-partida! socket (:cancion data) (:cantidadJugadores data))
      "puntaje" (procesar-puntaje! socket (:resultado data) (:puntajeTotal data))
      "finPartida" (procesar-fin-partida! socket)
      "continuar" (procesar-continuar! socket)
      "salir" (procesar-salir! socket)
      "configuracionSala" (procesar-configuracion-sala! socket (:cancionId data) (:cantidadJugadores data))
      nil)))

(defn ws-handler
  [req]
  (http/with-channel req socket
    (http/on-receive socket
                     (fn [mensaje] (manejar-mensaje! socket mensaje)))
    (http/on-close   socket
                     (fn [status]
                       (println "Socket cerrado:" status)
                       (procesar-desconexion! socket)))))