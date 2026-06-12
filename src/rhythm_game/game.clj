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
      :terminados #{}
      :decisiones #{}})
    {:cancion cancion
     :notas notas
     :jugadores jugadores}))


(defn mover-jugadores-al-final!
  []

  (let [participantes

        (set
         (get-in
          @estado-servidor
          [:partida :jugadores-partida]))

        jugadores

        (:jugadores @estado-servidor)
        esperando
        (filterv
         #(not (participantes (:nombre %)))
         jugadores)
        jugados
        (filterv
         #(participantes (:nombre %))
         jugadores)]
    (swap!
     estado-servidor
     assoc
     :jugadores
     (vec
      (concat esperando jugados)))))