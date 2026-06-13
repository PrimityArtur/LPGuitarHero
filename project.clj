(defproject rhythm_game "0.1.0-SNAPSHOT"
  :dependencies [[org.clojure/clojure "1.12.0"]
                 [http-kit "2.8.0"]
                 [cheshire "5.13.0"]
                 [ring/ring-core "1.15.4"]]
  :main ^:skip-aot rhythm-game.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]}})
