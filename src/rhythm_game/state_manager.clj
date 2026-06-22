(ns rhythm-game.state-manager)

(defn agregar-jugador
  [estado jugador]
  (update estado :jugadores conj jugador))

(defn reconectar-jugador
  [estado nombre socket]
  (update estado
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

(defn marcar-desconectado
  [estado socket]
  (update estado
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

(defn quitar-jugador
  [estado socket]
  (update estado
          :jugadores
          (fn [jugadores]
            (vec
             (remove
              #(= socket (:socket %))
              jugadores)))))

(defn agregar-al-final
  [estado jugador]
  (update estado
          :jugadores
          conj
          jugador))
  
(defn reasignar-admin
  [estado]
  (update estado
          :jugadores
          (fn [jugadores]
            (vec
             (map-indexed
              (fn [indice jugador]
                (assoc jugador
                       :rol
                       (if (= indice 0)
                         "admin"
                         "usuario")))
              jugadores)))))

(defn actualizar-puntaje
  [estado nombre resultado puntaje-total]
  (let [campo (keyword resultado)]
    (update estado
            :jugadores
            (fn [jugadores]
              (mapv
               (fn [jugador]
                 (if (= nombre (:nombre jugador))
                   (-> jugador
                       (assoc :puntaje puntaje-total)
                       (update campo (fnil inc 0)))
                   jugador))
               jugadores)))))

(defn marcar-terminado
  [estado nombre]
  (update estado
          :jugadores
          (fn [jugadores]
            (mapv
             (fn [jugador]
               (if (= nombre (:nombre jugador))
                 (assoc jugador :termino true)
                 jugador))
             jugadores))))



(defn limpiar-estadisticas
  [estado]
  (update estado
          :jugadores
          (fn [jugadores]
            (mapv
             #(assoc %
                     :puntaje 0
                     :perfect 0
                     :good 0
                     :miss 0
                     :termino false)
             jugadores))))

(defn mover-jugador-al-final
  [estado nombre]
  (let [jugadores (:jugadores estado)
        jugador (first (filter #(= nombre (:nombre %)) jugadores))
        restantes (remove #(= nombre (:nombre %)) jugadores)]
    (assoc estado
           :jugadores
           (vec (concat restantes [jugador])))))

(defn limpiar-partida
  [estado]
  (assoc estado :partida nil))

(defn preparar-sala-espera
  [estado]
  (-> estado
      (update :jugadores
              (fn [jugadores]
                (mapv
                 #(assoc %
                         :puntaje 0
                         :perfect 0
                         :good 0
                         :miss 0
                         :termino false)
                 jugadores)))
      (assoc :partida nil)))

(defn actualizar-configuracion-sala
  [estado cancion-id cantidad-jugadores]

  (assoc estado
         :configuracion-sala
         {:cancion-id cancion-id
          :cantidad-jugadores cantidad-jugadores}))