(ns rhythm-game.messages
  (:require
   [cheshire.core :as json]))
(defn ->json
  [data]
  (json/generate-string data))
(defn <-json
  [texto]
  (json/parse-string texto true))