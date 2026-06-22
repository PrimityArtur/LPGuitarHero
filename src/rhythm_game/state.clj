(ns rhythm-game.state)

(def estado-servidor
  (agent
   {:jugadores []
    :partida nil 
    :configuracion-sala
       {:cancion-id nil
        :cantidad-jugadores nil}}))