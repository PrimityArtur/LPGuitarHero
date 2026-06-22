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

(defn actualizar-estado-partida
  [estado jugadores esperando cancion notas timestamp-inicio]
  (assoc estado
         :jugadores
         (vec
          (concat
           (mapv #(assoc % :en-partida true) jugadores)
           esperando))
         :partida
         {:activa true
          :timestamp-inicio timestamp-inicio
          :cancion cancion
          :notas notas
          :jugadores-partida (mapv :nombre jugadores)
          :terminados #{}}))

(defn crear-partida!
  [id-cancion cantidad]
  (let [cancion (buscar-cancion id-cancion)
        notas (cargar-notas (:archivoNotas cancion))
        todos (:jugadores @estado-servidor)
        jugadores (vec (take cantidad todos))
        esperando (vec (drop cantidad todos))
        timestamp-inicio (System/currentTimeMillis)]
    (send estado-servidor
          actualizar-estado-partida
          jugadores
          esperando
          cancion
          notas
          timestamp-inicio)
    {:cancion cancion
     :notas notas
     :jugadores jugadores}))