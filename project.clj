(defproject juego-teclas "0.1.0-SNAPSHOT"
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [http-kit "2.6.0"]
                 [cheshire "5.11.0"]]
  :main ^:skip-aot juego-teclas.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}})