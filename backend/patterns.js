// Design Patterns
// 1. Singleton Pattern
class DatabaseConnection {
    constructor() {
        if (DatabaseConnection.instance) {
            return DatabaseConnection.instance;
        }
        this.connection = null;
        DatabaseConnection.instance = this;
    }

    connect() {
        if (!this.connection) {
            this.connection = { status: "connected", time: new Date() }; // Simulate a DB connection
            console.log("Database connected.");
        }
        return this.connection;
    }
}

// 2. Factory Pattern
class NotificationFactory {
    static createNotification(type) {
        switch (type) {
            case 'email':
                return { send: () => console.log("Email Sent Notification"), type: 'email' };
            case 'sms':
                return { send: () => console.log("SMS Sent Notification"), type: 'sms' };
            default:
                return { send: () => console.log("Default Notification"), type: 'default' };
        }
    }
}

// 3. Strategy Pattern
class Authstrategy {
    authenticate(credentials) {
        throw new Error("Must implement authentication method!");
    }
}

class EmailAuth extends Authstrategy {
    authenticate(credentials) {
        return credentials.email && credentials.password ?
        { success: true, method: 'email' } :
        { success: false };
    }
}

class TokenAuth extends Authstrategy {
    authenticate(credentials) {
        return credentials.token ?
        { success: true, method: 'token' } :
        { success: false };
    }   
}

class AuthContext {
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    authenticate(credentials) {
        return this.strategy.authenticate(credentials);
    }
}

// 4. Observer Pattern
class AppointmentSubject {
    constructor() {
        this.observers = [];
    }

    attach(observer) {
        this.observers.push(observer);
    }

    notify(event) {
        this.observers.forEach(observer => observer.update(event));
    }
}

class NotificationObserver {
    update(event) {
        console.log(`Notification: New event - ${event}`);
    }
}

class LogObserver {
    update(event) {
        console.log(`Log: Event logged - ${event}`);
    }
}

// 5.Decorator Pattern
class RequestHandler {
    handle(request) {
        return request;
    }
}

class LoggingDecorator {
    constructor(handler) {
        this.handler = handler;
    }

    handle(request) {
        console.log(`[LOG] ${request.method} ${request.url}`);
        return this.handler.handle(request);
    }
}

class AuthDecorator {
    constructor(handler) {
        this.handler = handler;
    }
    handle(request) {
        request.authenticated = true; // Simulate authentication
        return this.handler.handle(request);
    }
}

// 6. Repository Pattern
class BaseRepository {
    constructor(modelName) {
        this.modelName = modelName;
        this.data = [];
    }

    findAll() {
        return this.data;
    }

    findById(id) {
        return this.data.find(item => item.id === id);
    }

    create(item) {
        item.id = Date.now();
        this.data.push(item);
        return item;
    }
}

class UserRepository extends BaseRepository {
    constructor() {
        super('User');
    }
    findByEmail(email) {
        return this.data.find(user => user.email === email);
    }
}

// 7. Chain of Responsibility Pattern
class ValidationHandler {
    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }

    handle(request) {
        if (this.validate(request)) {
            return this.nextHandler ? this.nextHandler.handle(request) : true;
        }
        return false;
    }

    validate(request) {
        return true;
    }
}

class RequiredFieldValidator extends ValidationHandler {
    validate(request) {
        const valid = request.email && request.password;
        if (!valid) {
            console.log("Validation Failed: Required fields missing.");
        }
        return valid;
    }
}

class EmailValidator extends ValidationHandler {
    validate(request) {
        const valid = !request.email || /\S+@\S+\.\S+/.test(request.email);
        if (!valid) {
            console.log("Validation Failed: Invalid email format.");
        }
        return valid;
    }
}