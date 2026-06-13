==============================================================
PASOS PARA INSTALAR Y TRBAJAR CLOJURE EN DESPLIEGUE:

Install Temurin JDK-25.0.3+9 https://adoptium.net/es/temurin/releases
	- No es lo mismo que JDK de oracle
Download lein.bat del leiningen.org  https://codeberg.org/leiningen/leiningen/
	- Enlace directo al batch file https://codeberg.org/leiningen/leiningen/raw/branch/stable/bin/lein.bat

Colocar el lein.bat en una carpeta nueva = C:\ClojureBin y colocar esta ruta en Path de variables de entorno en la parte de sistema
	- Ejecutar los siguientes comandos en un cmd
        - lein self-install
        - lein
        - lein version
	- Con esto ya tendras listo e instalado leiningen que es el constructor de Clojure como Maven o Gradle de Java

==============================================================
CREAR UN NUEVO PROYECTO CON LEIN: 

En Visual S. Instalar Calva: Clojure & ClojureScript Interactive Programming.

Para crear la estructura del juego. en un cmd desde la carpeta de proyecto ejecutar
	- lein new app nombre-juego


Una vez creado el proyecto lo mas importante son las carpetas
	- Src: los codigos clojure backend
	- Resource: html js frontend, json, etc
	- Test: automatizacion de pruebas 
El archivo project.clj -> es para agregar dependencias lo mismo que maven y gradle de Java

==============================================================
PARA EJECUTAR EL CODIGO EN LOCAL: 

Debes activar el REPL y te permitira recompilar funciones individuales. dentro de src/rhythm_game/core.clj al final se encuentra la seccion comment donde estan los pasos para su ejecucion    

    - En Clojure, este bloque 'comment' no se ejecuta al hacer el despliegue pero se puede ejecutar las lineas individualmente
    - PARA EJECUTAR EL PROYECTO ctrl+shift+p -> "Calva: Start a Project REPL and Connect (aka Jack-In)" -> Leiningen -> OK
    - ENCENDER el servidor en tu computadora: alt + Enter sobre (servidor-local) para ejecutar el server local
    - si se desea hacer cambias en la funcion agregada o cambiada se debe hacer Alt+Enter en dicha funcion cambiada y ya se refleja los cambios 
    - APAGAR el servidor (ejecuta esto antes de encenderlo de nuevo si falla)