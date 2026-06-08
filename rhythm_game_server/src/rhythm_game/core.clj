(ns rhythm-game.core
  (:require
   [org.httpkit.server :as http]
   [rhythm-game.websocket :refer [ws-handler]]))

(defn app
  [req]

  (case (:uri req)

    "/ws"
    (ws-handler req)

    {:status 404
     :headers {"Content-Type" "text/plain"}
     :body "Not Found"}))

(defonce servidor
  (atom nil))

(defn iniciar-servidor!
  []

  (reset!
   servidor
   (http/run-server
    app
    {:port 8080}))

  (println "Servidor iniciado en puerto 8080"))

(defn detener-servidor!
  []

  (when @servidor
    (@servidor)

    (reset! servidor nil)

    (println "Servidor detenido")))

(defn -main
  [& _]

  (iniciar-servidor!))