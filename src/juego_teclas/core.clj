(ns juego-teclas.core
  (:require [org.httpkit.server :as server]
            [cheshire.core :as json]
            [clojure.java.io :as io])
  (:gen-class))

;; 1. CONCURRENCIA MEDIANTE AGENTE (Estado inmutable inicial)
;; El mapa representa a los jugadores. Ej: {"p1" "ArrowUp", "p2" "ArrowLeft"}
(def estado-partida (agent {}))

;; Un registro de las conexiones activas de WebSockets para enviar el broadcast
(def canales-activos (atom #{}))

;; 2. FUNCIÓN PURA (Requisito obligatorio)
;; Recibe el estado viejo, el ID del jugador y la tecla. Retorna un mapa nuevo.
(defn registrar-tecla [estado-viejo id-jugador tecla]
  (assoc estado-viejo id-jugador tecla))

(defn eliminar-jugador [estado-viejo id-jugador]
  (dissoc estado-viejo id-jugador))

;; 3. BROADCAST: Enviar el estado a todos los HTML en tiempo real
(defn notificar-a-todos [estado-actual]
  (let [json-estado (json/generate-string estado-actual)]
    (doseq [canal @canales-activos]
      (server/send! canal json-estado))))

;; Configuramos un "observador" en el Agente. 
;; Cada vez que la función pura modifique el agente, esto se ejecuta automáticamente.
(add-watch estado-partida :sincronizador
           (fn [_ _ _ nuevo-estado]
             (notificar-a-todos nuevo-estado)))

;; 4. COMUNICACIÓN (Manejo de WebSockets)
(defn manejador-ws [req]
  (server/with-channel req canal
    ;; Cuando alguien se conecta:
    (swap! canales-activos conj canal)
    (let [id-jugador (str "Jugador_" (rand-int 1000))]

      ;; Cuando el jugador presiona una flecha:
      (server/on-receive canal
                         (fn [tecla]
                           ;; Enviamos la FUNCIÓN PURA al AGENTE (Paso de mensajes)
                           (send estado-partida registrar-tecla id-jugador tecla)))

      ;; Cuando el jugador cierra la ventana:
      (server/on-close canal
                       (fn [_]
                         (swap! canales-activos disj canal)
                         (send estado-partida eliminar-jugador id-jugador))))))

;; 5. ENRUTADOR PRINCIPAL
(defn app [req]
  (if (:websocket? req)
    (manejador-ws req)
    ;; Si entra por el navegador normal, le devolvemos el HTML
    {:status 200
     :headers {"Content-Type" "text/html"}
     :body (slurp (io/resource "public/index.html"))}))

;; 6. INICIO DEL SERVIDOR
(defn -main [& args]
  (let [puerto (Integer/parseInt (or (System/getenv "PORT") "3000"))]
    (println "Servidor funcional iniciado en el puerto:" puerto)
    (server/run-server app {:port puerto})))