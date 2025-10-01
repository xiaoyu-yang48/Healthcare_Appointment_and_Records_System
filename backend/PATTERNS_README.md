# Design Patterns & OOP Implementation

## Overview
This is a **minimal implementation** that demonstrates 7 design patterns and 5 OOP classes with SOLID principles in the backend.

## Implementation Details

### File Structure
- **`/backend/design-patterns.js`** - Contains all 7 design patterns
- **`/backend/oop-principles.js`** - Contains 5 OOP classes with SOLID principles
- **`/backend/server.js`** - Added two endpoints for demonstration

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

### Run the demonstrations directly:
```bash
cd backend

# Test design patterns
node design-patterns.js

# Test OOP principles
node oop-principles.js
```

### Via API endpoints:
```bash
# Design patterns demo
curl http://localhost:5001/api/patterns-demo

# OOP principles demo
curl http://localhost:5001/api/oop-demo
```

## Key Features

- **Separated concerns** - Design patterns and OOP principles in separate files
- **Minimal implementation** - Two focused files for better organization
- **No breaking changes** - Existing functionality preserved
- **Easy to understand** - Clear demonstration of each concept
- **Self-contained** - Can be removed without affecting the main application

## Notes

This implementation is designed for **demonstration purposes only**. Each pattern and OOP principle is applied to at least one instance as required. The code is intentionally kept minimal while still meeting all requirements.

### Files Summary:
- `design-patterns.js` (~650 lines) - All 7 design patterns with detailed examples
- `oop-principles.js` (~450 lines) - 5 OOP classes demonstrating SOLID principles
- Total: ~1100 lines of well-organized, documented code