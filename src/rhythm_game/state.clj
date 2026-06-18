(ns rhythm-game.state)

(def estado-servidor
  (agent
   {:jugadores []
    :partida nil}))