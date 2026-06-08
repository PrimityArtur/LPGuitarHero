(ns rhythm-game.state)

(def estado-servidor
  (atom
   {:jugadores []
    :partida nil}))