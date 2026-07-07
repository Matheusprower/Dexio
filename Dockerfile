# Build stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# Usando o mvnw local que é muito mais estável
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
