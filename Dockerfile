# Multi-stage Dockerfile for Spring Boot + React deployment

# Frontend build stage
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

# Copy package files first (better caching)
COPY src/main/frontend/package*.json ./
# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source files after dependencies
COPY src/main/frontend/ ./
RUN npm run build

# Maven dependencies stage (separate for caching)
FROM maven:3.9.6-eclipse-temurin-17 as maven-deps
WORKDIR /app

# Copy only pom.xml first
COPY pom.xml .
# Download dependencies - this layer will be cached if pom.xml doesn't change
RUN mvn dependency:go-offline -B

# Builder stage
FROM maven-deps as builder
WORKDIR /app

# Copy source code
COPY src ./src

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/build/ ./src/main/resources/static/

# Build application (dependencies already cached)
RUN mvn clean package -DskipTests -Dmaven.main.skip -Dspring-boot.repackage.skip && \
    mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create logs and uploads directories
RUN mkdir -p /app/logs /app/uploads

# Copy the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -s /bin/sh -D appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health 2>/dev/null || curl -f http://localhost:8080/ || exit 1

# Start application
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]