# Pickleball Club Backend API

A Spring Boot backend API for the Pickleball Club Platform, integrating with Supabase for database and authentication.

## Features

- Spring Boot 3.2.1 with Java 17
- Spring Security with JWT authentication
- PostgreSQL database integration via Supabase
- Spring Data JPA for data access
- RESTful API design
- Health check endpoints
- CORS configuration for frontend integration

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Supabase project with PostgreSQL database

## Configuration

The application uses environment variables for Supabase configuration. Set the following variables:

```bash
export SUPABASE_DB_HOST=<your-supabase-db-host>
export SUPABASE_DB_PORT=5432
export SUPABASE_DB_NAME=postgres
export SUPABASE_DB_USERNAME=<your-supabase-db-username>
export SUPABASE_DB_PASSWORD=<your-supabase-db-password>
export SUPABASE_JWT_ISSUER_URI=<your-supabase-jwt-issuer>
export SUPABASE_URL=<your-supabase-url>
export SUPABASE_ANON_KEY=<your-supabase-anon-key>
export SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

## Running the Application

### Development Mode

```bash
# Set development profile
export SPRING_PROFILES_ACTIVE=dev

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

### Available Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/info` - Application information

## Testing

Run tests with:

```bash
mvn test
```

Tests use an in-memory H2 database for isolation.

## Building

Build the application:

```bash
mvn clean package
```

This creates a JAR file in the `target/` directory.

## Project Structure

```
src/
├── main/
│   ├── java/com/pickleballclub/backend/
│   │   ├── PickleballClubApplication.java    # Main application class
│   │   ├── config/
│   │   │   └── SecurityConfig.java           # Security configuration
│   │   └── controller/
│   │       └── HealthController.java         # Health check endpoints
│   └── resources/
│       ├── application.yml                   # Main configuration
│       └── application-dev.yml               # Development configuration
└── test/
    ├── java/com/pickleballclub/backend/
    │   └── PickleballClubApplicationTests.java
    └── resources/
        └── application-test.yml              # Test configuration
```

## Next Steps

1. Add domain models and entities
2. Implement repository layer
3. Create service layer for business logic
4. Add API controllers for specific features
5. Implement JWT token validation with Supabase
6. Add API documentation with OpenAPI/Swagger
