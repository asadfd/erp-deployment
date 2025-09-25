# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Java-based ERP (Enterprise Resource Planning) Spring Boot application with integrated React frontend and Spring Boot backend packaged as a single JAR. Uses session-based authentication with Spring Security (no JWT).

## Development Environment

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17 (Backend), JavaScript/React (Frontend)
- **Build Tool**: Maven with frontend-maven-plugin
- **Database**: Postgresql1.
- **Frontend**: React 18 with React Router
- **Backend**: Spring Boot REST APIs
- **Security**: Spring Security with session management

## Common Commands

### Running the Application

#### Local Development
```bash
mvn spring-boot:run
```

#### Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t erp-custom .
docker run -p 8080:8080 erp-custom
```

#### Frontend Development (React)
```bash
# Navigate to frontend directory
cd src/main/frontend

# Install dependencies
npm install

# Start React development server (with proxy to Spring Boot)
npm start
```

### Building the Project
```bash
mvn clean compile
mvn clean package
mvn clean install
```

### Testing
```bash
mvn test
```

## Architecture

### Backend Package Structure
- `org.erp.entity` - JPA entities (User)
- `org.erp.repository` - Data access layer (UserRepository)
- `org.erp.service` - Business logic (UserDetailsServiceImpl)
- `org.erp.controller` - REST controllers (AuthController, ViewController)
- `org.erp.config` - Configuration classes (SecurityConfig)

### Frontend Structure
- `src/main/frontend/src/` - React source code
- `src/main/frontend/src/components/` - React components
- `src/main/frontend/public/` - Static assets
- Built React files served as static resources by Spring Boot

### Security Implementation
- Session-based authentication (no JWT)
- BCrypt password encoding
- Single session per user
- REST API endpoints for authentication
- CSRF disabled for API endpoints
- React frontend communicates with `/api/auth/*` endpoints

### Database
- Default user: username=`admin`, password=`password`
- JPA with Hibernate
- Auto-create schema on startup

### API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### React Components
- `Login` - Login form component
- `Dashboard` - Landing page component
- `App` - Main app with routing and authentication state

## Default Credentials
- Username: `admin`
- Password: `password`