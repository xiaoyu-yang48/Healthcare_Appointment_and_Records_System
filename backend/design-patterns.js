/**
 * Minimal Design Patterns Implementation (7 Patterns)
 */

// 1. SINGLETON PATTERN
class DatabaseConnection {
    constructor() {
        if (DatabaseConnection.instance) return DatabaseConnection.instance;
        this.connection = null;
        DatabaseConnection.instance = this;
    }
    connect() {
        if (!this.connection) this.connection = { status: 'connected' };
        return this.connection;
    }
}

// 2. FACTORY PATTERN
class NotificationFactory {
    static create(type) {
        switch(type) {
            case 'email': return { type: 'email', send: () => 'Email sent' };
            case 'sms': return { type: 'sms', send: () => 'SMS sent' };
            default: return { type: 'default', send: () => 'Notification sent' };
        }
    }
}

// 3. STRATEGY PATTERN
class AuthStrategy {
    authenticate(credentials) { throw new Error('Must implement'); }
}

class EmailAuth extends AuthStrategy {
    authenticate(credentials) {
        return credentials.email && credentials.password ? 
            { success: true, method: 'email' } : { success: false };
    }
}

class TokenAuth extends AuthStrategy {
    authenticate(credentials) {
        return credentials.token ? 
            { success: true, method: 'token' } : { success: false };
    }
}

class AuthContext {
    setStrategy(strategy) { this.strategy = strategy; }
    authenticate(credentials) { return this.strategy.authenticate(credentials); }
}

// 4. OBSERVER PATTERN
class Subject {
    constructor() { this.observers = []; }
    attach(observer) { this.observers.push(observer); }
    notify(event) { this.observers.forEach(o => o.update(event)); }
}

class Observer {
    update(event) { console.log('Event:', event); }
}

// 5. DECORATOR PATTERN
class RequestHandler {
    handle(req) { return req; }
}

class LogDecorator {
    constructor(handler) { this.handler = handler; }
    handle(req) {
        console.log(`[LOG] ${req.method} ${req.url}`);
        return this.handler.handle(req);
    }
}

class AuthDecorator {
    constructor(handler) { this.handler = handler; }
    handle(req) {
        req.authenticated = true;
        return this.handler.handle(req);
    }
}

// 6. REPOSITORY PATTERN
class Repository {
    constructor() { this.data = []; }
    findAll() { return this.data; }
    findById(id) { return this.data.find(item => item.id === id); }
    create(item) { 
        item.id = Date.now();
        this.data.push(item);
        return item;
    }
    update(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updates };
            return this.data[index];
        }
        return null;
    }
    delete(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            return this.data.splice(index, 1)[0];
        }
        return null;
    }
}

// 7. CHAIN OF RESPONSIBILITY
class ValidationHandler {
    setNext(handler) {
        this.next = handler;
        return handler;
    }
    handle(request) {
        if (this.validate(request)) {
            return this.next ? this.next.handle(request) : true;
        }
        return false;
    }
    validate(request) { return true; }
}

class RequiredFieldsValidator extends ValidationHandler {
    validate(request) { return request.email && request.password; }
}

class EmailValidator extends ValidationHandler {
    validate(request) { return !request.email || request.email.includes('@'); }
}

module.exports = {
    DatabaseConnection,
    NotificationFactory,
    AuthContext,
    EmailAuth,
    TokenAuth,
    Subject,
    Observer,
    RequestHandler,
    LogDecorator,
    AuthDecorator,
    Repository,
    RequiredFieldsValidator,
    EmailValidator
};