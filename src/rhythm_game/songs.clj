(ns rhythm-game.songs
  (:require
   [rhythm-game.resource-loader
    :refer [cargar-catalogo]]))

(def canciones
  (cargar-catalogo))