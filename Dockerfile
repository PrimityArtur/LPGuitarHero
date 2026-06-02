# Usar la imagen oficial de Clojure con Leiningen preinstalado
FROM clojure:lein

# Crear el directorio de trabajo dentro del servidor
WORKDIR /app

# Copiar todos los archivos de tu proyecto al servidor
COPY . .

# Descargar las dependencias
RUN lein deps

# El comando exacto para iniciar tu juego
CMD ["lein", "run"]