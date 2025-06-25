# UNextDoor Server Structure

This document outlines the structure and organization of the UNextDoor backend server.

## Directory Structure

The server follows a clean architecture with clear separation of concerns:

```
/src
  /config             # Configuration files
    database.js       # Database connection
    index.js          # Environment variables and config
  
  /controllers        # Request handlers
    authController.js # Authentication controllers
    
  /middlewares        # Express middlewares
    authMiddleware.js # Authentication middleware
    
  /models             # Data models
    User.js           # User model
    OTP.js            # OTP model
    
  /routes             # API routes
    auth.js           # Authentication routes
    
  /services           # Business logic
    authService.js    # Authentication service
    
  /utils              # Utility functions
    authUtils.js      # Authentication utilities
    emailUtils.js     # Email utilities
    responseUtils.js  # Response formatting utilities
    validationUtils.js # Input validation utilities
```

## Best Practices

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each module has a single responsibility
   - Controllers handle request/response
   - Services contain business logic
   - Models define data structure

2. **Open/Closed Principle (OCP)**
   - Modules are open for extension but closed for modification
   - Use middleware composition for extending functionality

3. **Liskov Substitution Principle (LSP)**
   - Consistent interfaces for similar components
   - Consistent error handling and response formats

4. **Interface Segregation Principle (ISP)**
   - Focused interfaces for different client needs
   - Modular middleware functions

5. **Dependency Inversion Principle (DIP)**
   - High-level modules don't depend on low-level modules
   - Both depend on abstractions

### RESTful API Design

- Resource-based routes
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Consistent URL patterns
- Meaningful HTTP status codes
- Versioned API endpoints

### Error Handling

- Centralized error handling
- Consistent error response format
- Proper logging of errors
- Validation of all inputs

### Security

- JWT-based authentication
- Input validation and sanitization
- Secure password handling
- Rate limiting
- CORS configuration
- Environment variable management

### Database Practices

- Mongoose schemas with validation
- Indexes for performance
- Proper error handling for database operations
- Separation of database logic from business logic

### Code Style

- Consistent naming conventions
- Descriptive function and variable names
- JSDoc comments for functions
- Organized imports
- Consistent error handling

## Authentication Flow

1. Email Check → Send OTP → Verify OTP → (Register if new user) → Return JWT
2. Social Login (Google/Apple) → Return JWT

## API Endpoints

### Authentication

- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/register` - Register new user
- `POST /api/auth/google` - Authenticate with Google
- `POST /api/auth/apple` - Authenticate with Apple
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

## Testing Strategy

- Unit tests for utilities and services
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Security testing for authentication
