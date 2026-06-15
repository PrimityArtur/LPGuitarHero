(ns rhythm-game.resource-loader
  (:require
   [cheshire.core :as json]
   [clojure.java.io :as io]))

(defn leer-json
  [ruta]
  (with-open [reader (io/reader (io/resource ruta))]
    (json/parse-stream reader true)))

(defn cargar-catalogo
  []
  (leer-json "public/catalogo.json"))

(defn cargar-notas
  [archivo]
  (leer-json archivo))