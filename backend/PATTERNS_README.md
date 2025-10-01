# Design Patterns & OOP Implementation

## Overview
This is a **minimal implementation** that demonstrates 7 design patterns and 5 OOP classes with SOLID principles in the backend.

## Implementation Details

### File Structure
- **`/backend/patterns.js`** - OOP classes and basic pattern demonstrations
- **`/backend/patterns-integration.js`** - Design patterns applied to actual functions
- **`/backend/server.js`** - API endpoints using each pattern

### 7 Design Patterns Implemented

1. **Singleton Pattern** - `DatabaseConnection` class
   - Ensures only one instance of database connection exists

2. **Factory Pattern** - `NotificationFactory` class
   - Creates different notification types (email, SMS, default)

3. **Strategy Pattern** - Authentication strategies
   - `AuthContext`, `EmailAuth`, `TokenAuth` classes
   - Switch authentication methods at runtime

4. **Observer Pattern** - Appointment status monitoring
   - `AppointmentSubject`, `NotificationObserver`, `LogObserver` classes
   - Notifies multiple observers when appointment status changes

5. **Decorator Pattern** - Request enhancement
   - `LoggingDecorator`, `AuthDecorator` classes
   - Adds logging and authentication to requests

6. **Repository Pattern** - Data access abstraction
   - `BaseRepository`, `UserRepository` classes
   - Abstracts data access with common CRUD operations

7. **Chain of Responsibility Pattern** - Validation chain
   - `RequiredFieldsValidator`, `EmailValidator` classes
   - Sequential validation of requests

### 5 OOP Classes with SOLID Principles

1. **BaseEntity** (Abstract Base Class)
   - Encapsulation with private properties and getters
   - Abstract validate() method

2. **Person** (Inheritance)
   - Inherits from BaseEntity
   - Base class for user types

3. **Patient** (Polymorphism)
   - Inherits from Person
   - Overrides getRole() method
   - Patient-specific properties and methods

4. **Doctor** (Single Responsibility)
   - Inherits from Person
   - Doctor-specific functionality
   - Manages specialization and patients

5. **Appointment** (Composition & Dependency Inversion)
   - Depends on Person abstraction, not concrete classes
   - State management for appointment status

### SOLID Principles Applied

- **S**ingle Responsibility - Each class has one clear purpose
- **O**pen/Closed - Classes open for extension, closed for modification
- **L**iskov Substitution - Derived classes can substitute base classes
- **I**nterface Segregation - Classes only implement needed methods
- **D**ependency Inversion - Depend on abstractions, not concrete implementations

## Testing

### Pattern Integration API Endpoints:

Each pattern is applied to a functional endpoint:

```bash
# 1. Singleton - Database connection status
curl http://localhost:5001/api/patterns/db-status

# 2. Factory - Create entities
curl -X POST http://localhost:5001/api/patterns/create-entity \
  -H "Content-Type: application/json" \
  -d '{"type": "user", "data": {"name": "John"}}'

# 3. Strategy - Authentication
curl -X POST http://localhost:5001/api/patterns/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password123"}'

# 4. Observer - Create appointment (triggers notifications)
curl -X POST http://localhost:5001/api/patterns/appointment \
  -H "Content-Type: application/json" \
  -d '{"patient": "John", "doctor": "Dr. Smith"}'

# 5. Decorator - Applied as middleware (logs all /api/patterns/* requests)

# 6. Repository - Get user by ID
curl http://localhost:5001/api/patterns/user/123

# 7. Chain of Responsibility - Validate user data
curl -X POST http://localhost:5001/api/patterns/validate \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "pass123", "role": "patient"}'
```

### Run OOP demonstration:
```bash
cd backend
node patterns.js
```

## Key Features

- **Minimal implementation** - All patterns in a single file
- **No breaking changes** - Existing functionality preserved
- **Easy to understand** - Clear demonstration of each pattern
- **Self-contained** - Can be removed without affecting the main application

## Notes

This implementation is designed for **demonstration purposes only**. Each pattern and OOP principle is applied to at least one instance as required. The code is intentionally kept minimal while still meeting all requirements.