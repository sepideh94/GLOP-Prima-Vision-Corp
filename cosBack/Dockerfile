# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier le pom.xml et télécharger les dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le code source et builder
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8080

# Variables d'environnement par défaut
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_NAME=ciblorgasport
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres123

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]