(ns rhythm-game.core
  (:require
   [org.httpkit.server :as http]
   [clojure.java.io :as io]
   [ring.util.response :as resp]
   [ring.middleware.content-type :refer [wrap-content-type]]
   [rhythm-game.websocket :refer [ws-handler]])
  (:gen-class))

(defn app
  [req]
  (let [uri (:uri req)]
    (case uri
      "/ws"
      (ws-handler req)
      "/"
      (resp/resource-response "public/index.html")
      (or (resp/resource-response (subs uri 1)
                                  {:root "public"}) ;; js, css
          {:status 404 :body "File no Found"}))))

(defonce servidor
  (atom nil))

(defn iniciar-servidor!
  []

  (reset!
   servidor
   (http/run-server
    (wrap-content-type app)
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





;; --- REPL ---
;; En Clojure, este bloque 'comment' no se ejecuta al hacer el despliegue pero se puede ejecutar las lineas individualmente
;; PARA EJECUTAR EL PROYECTO ctrl+shift+p -> "Calva: Start a Project REPL and Connect (aka Jack-In)" -> Leiningen -> OK
(comment
  ;; ENCENDER el servidor en tu com
  ;; alt + Enter sobre (servidor-local) para ejecutar el server local
  ;; si se desea hacer cambias en la funcion agregada o cambiada se debe hacer Alt+Enter en dicha funcion cambiada y ya se refleja los cambios 
  (def servidor-local (-main))

  (reset! rhythm-game.state/estado-servidor {:jugadores [] :partida nil}))