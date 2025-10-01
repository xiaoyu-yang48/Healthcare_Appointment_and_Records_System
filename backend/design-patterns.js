/**
 * Design Patterns Demonstration
 * 7 Essential Design Patterns Implementation
 * 
 * This file contains minimal implementations of:
 * 1. Singleton Pattern - Database connection management
 * 2. Factory Pattern - Notification creation
 * 3. Strategy Pattern - Authentication methods
 * 4. Observer Pattern - Event notification system
 * 5. Decorator Pattern - Request enhancement
 * 6. Repository Pattern - Data access abstraction
 * 7. Chain of Responsibility - Validation pipeline
 * 
 * Run directly: node design-patterns.js
 * Or via API: GET /api/patterns-demo
 */

// ============= 1. SINGLETON PATTERN =============
class DatabaseConnection {
    constructor() {
        // Return existing instance if it exists
        if (DatabaseConnection.instance) {
            return DatabaseConnection.instance;
        }
        
        // Initialize connection properties
        this.connection = null;
        this.isConnected = false;
        
        // Store the singleton instance
        DatabaseConnection.instance = this;
    }
    
    connect() {
        if (!this.isConnected) {
            this.connection = { 
                status: 'connected', 
                time: new Date(),
                database: 'healthcare_db'
            };
            this.isConnected = true;
            console.log('Database connected at', this.connection.time);
        }
        return this.connection;
    }
    
    disconnect() {
        if (this.isConnected) {
            this.connection = null;
            this.isConnected = false;
            console.log('Database disconnected');
        }
    }
    
    getStatus() {
        return this.isConnected ? 'Connected' : 'Disconnected';
    }
}

// ============= 2. FACTORY PATTERN =============
// Base Notification class
class Notification {
    constructor(type) {
        this.type = type;
        this.timestamp = new Date();
    }
    
    send() {
        throw new Error('send() must be implemented');
    }
}

// Concrete notification types
class EmailNotification extends Notification {
    constructor(to, subject) {
        super('email');
        this.to = to;
        this.subject = subject;
    }
    
    send() {
        console.log(`Email sent to ${this.to}: ${this.subject}`);
        return { success: true, type: 'email', to: this.to };
    }
}

class SMSNotification extends Notification {
    constructor(phone, message) {
        super('sms');
        this.phone = phone;
        this.message = message;
    }
    
    send() {
        console.log(`SMS sent to ${this.phone}: ${this.message}`);
        return { success: true, type: 'sms', phone: this.phone };
    }
}

class PushNotification extends Notification {
    constructor(deviceId, alert) {
        super('push');
        this.deviceId = deviceId;
        this.alert = alert;
    }
    
    send() {
        console.log(`Push notification to device ${this.deviceId}: ${this.alert}`);
        return { success: true, type: 'push', deviceId: this.deviceId };
    }
}

// Factory class
class NotificationFactory {
    static createNotification(type, ...args) {
        switch(type) {
            case 'email':
                return new EmailNotification(...args);
            case 'sms':
                return new SMSNotification(...args);
            case 'push':
                return new PushNotification(...args);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }
}

// ============= 3. STRATEGY PATTERN =============
// Base Strategy
class AuthStrategy {
    authenticate(credentials) {
        throw new Error('authenticate() must be implemented');
    }
}

// Concrete Strategies
class EmailPasswordStrategy extends AuthStrategy {
    authenticate(credentials) {
        const { email, password } = credentials;
        if (email && password && password.length >= 6) {
            return { 
                success: true, 
                method: 'email',
                user: { email, id: Date.now() }
            };
        }
        return { success: false, error: 'Invalid email or password' };
    }
}

class TokenStrategy extends AuthStrategy {
    authenticate(credentials) {
        const { token } = credentials;
        if (token && token.length > 10) {
            return { 
                success: true, 
                method: 'token',
                user: { id: 'user_' + token.substring(0, 5) }
            };
        }
        return { success: false, error: 'Invalid token' };
    }
}

class OAuthStrategy extends AuthStrategy {
    authenticate(credentials) {
        const { provider, authCode } = credentials;
        if (provider && authCode) {
            return { 
                success: true, 
                method: 'oauth',
                provider,
                user: { id: 'oauth_user_123' }
            };
        }
        return { success: false, error: 'OAuth authentication failed' };
    }
}

// Context
class AuthContext {
    constructor(strategy) {
        this.strategy = strategy;
    }
    
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    
    authenticate(credentials) {
        if (!this.strategy) {
            throw new Error('No authentication strategy set');
        }
        return this.strategy.authenticate(credentials);
    }
}

// ============= 4. OBSERVER PATTERN =============
// Subject
class AppointmentSubject {
    constructor() {
        this.observers = [];
        this.state = null;
    }
    
    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
            console.log(`Observer ${observer.name} attached`);
        }
    }
    
    detach(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            console.log(`Observer ${observer.name} detached`);
        }
    }
    
    notify(event) {
        console.log(`Notifying ${this.observers.length} observers about:`, event.type);
        this.observers.forEach(observer => {
            observer.update(event);
        });
    }
    
    changeAppointmentStatus(appointmentId, newStatus) {
        this.state = { appointmentId, status: newStatus };
        this.notify({
            type: 'status_change',
            appointmentId,
            newStatus,
            timestamp: new Date()
        });
    }
}

// Concrete Observers
class NotificationObserver {
    constructor() {
        this.name = 'NotificationObserver';
    }
    
    update(event) {
        console.log(`[${this.name}] Sending notification for appointment ${event.appointmentId}: ${event.newStatus}`);
    }
}

class AuditLogObserver {
    constructor() {
        this.name = 'AuditLogObserver';
        this.logs = [];
    }
    
    update(event) {
        const log = {
            timestamp: event.timestamp,
            action: event.type,
            details: `Appointment ${event.appointmentId} changed to ${event.newStatus}`
        };
        this.logs.push(log);
        console.log(`[${this.name}] Logged:`, log.details);
    }
    
    getLogs() {
        return this.logs;
    }
}

class StatisticsObserver {
    constructor() {
        this.name = 'StatisticsObserver';
        this.stats = {
            total_changes: 0,
            by_status: {}
        };
    }
    
    update(event) {
        this.stats.total_changes++;
        this.stats.by_status[event.newStatus] = (this.stats.by_status[event.newStatus] || 0) + 1;
        console.log(`[${this.name}] Stats updated:`, this.stats);
    }
}

// ============= 5. DECORATOR PATTERN =============
// Base Component
class RequestHandler {
    handle(request) {
        return { ...request, handled: true };
    }
}

// Base Decorator
class RequestDecorator {
    constructor(handler) {
        this.handler = handler;
    }
    
    handle(request) {
        return this.handler.handle(request);
    }
}

// Concrete Decorators
class LoggingDecorator extends RequestDecorator {
    handle(request) {
        console.log(`[LOG] ${new Date().toISOString()} - ${request.method} ${request.url}`);
        const result = super.handle(request);
        console.log(`[LOG] Response:`, result.status || 'OK');
        return result;
    }
}

class AuthenticationDecorator extends RequestDecorator {
    handle(request) {
        // Add authentication
        request.authenticated = true;
        request.userId = 'user_123';
        console.log('[AUTH] Request authenticated');
        return super.handle(request);
    }
}

class ValidationDecorator extends RequestDecorator {
    handle(request) {
        // Validate request
        if (!request.method || !request.url) {
            throw new Error('Invalid request: missing method or URL');
        }
        request.validated = true;
        console.log('[VALIDATION] Request validated');
        return super.handle(request);
    }
}

class CacheDecorator extends RequestDecorator {
    constructor(handler) {
        super(handler);
        this.cache = new Map();
    }
    
    handle(request) {
        const cacheKey = `${request.method}:${request.url}`;
        
        if (request.method === 'GET' && this.cache.has(cacheKey)) {
            console.log('[CACHE] Cache hit for:', cacheKey);
            return { ...this.cache.get(cacheKey), fromCache: true };
        }
        
        const result = super.handle(request);
        
        if (request.method === 'GET') {
            this.cache.set(cacheKey, result);
            console.log('[CACHE] Cached result for:', cacheKey);
        }
        
        return result;
    }
}

// ============= 6. REPOSITORY PATTERN =============
// Base Repository
class BaseRepository {
    constructor(modelName) {
        this.modelName = modelName;
        this.data = new Map();
        this.nextId = 1;
    }
    
    // CRUD operations
    create(item) {
        const id = this.nextId++;
        const entity = { ...item, id, createdAt: new Date() };
        this.data.set(id, entity);
        console.log(`Created ${this.modelName} with ID:`, id);
        return entity;
    }
    
    findById(id) {
        return this.data.get(id) || null;
    }
    
    findAll() {
        return Array.from(this.data.values());
    }
    
    update(id, updates) {
        const entity = this.data.get(id);
        if (entity) {
            const updated = { ...entity, ...updates, updatedAt: new Date() };
            this.data.set(id, updated);
            console.log(`Updated ${this.modelName} with ID:`, id);
            return updated;
        }
        return null;
    }
    
    delete(id) {
        const result = this.data.delete(id);
        if (result) {
            console.log(`Deleted ${this.modelName} with ID:`, id);
        }
        return result;
    }
    
    count() {
        return this.data.size;
    }
}

// Specific Repositories
class UserRepository extends BaseRepository {
    constructor() {
        super('User');
    }
    
    findByEmail(email) {
        return this.findAll().find(user => user.email === email) || null;
    }
    
    findByRole(role) {
        return this.findAll().filter(user => user.role === role);
    }
}

class AppointmentRepository extends BaseRepository {
    constructor() {
        super('Appointment');
    }
    
    findByPatient(patientId) {
        return this.findAll().filter(apt => apt.patientId === patientId);
    }
    
    findByDoctor(doctorId) {
        return this.findAll().filter(apt => apt.doctorId === doctorId);
    }
    
    findByStatus(status) {
        return this.findAll().filter(apt => apt.status === status);
    }
    
    findByDateRange(startDate, endDate) {
        return this.findAll().filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= startDate && aptDate <= endDate;
        });
    }
}

// ============= 7. CHAIN OF RESPONSIBILITY =============
// Base Handler
class ValidationHandler {
    constructor(name) {
        this.name = name;
        this.nextHandler = null;
    }
    
    setNext(handler) {
        this.nextHandler = handler;
        return handler; // For chaining
    }
    
    handle(request) {
        console.log(`[${this.name}] Processing...`);
        
        if (this.validate(request)) {
            if (this.nextHandler) {
                return this.nextHandler.handle(request);
            }
            return { success: true, message: 'All validations passed' };
        }
        
        return { success: false, failedAt: this.name };
    }
    
    validate(request) {
        return true; // Base implementation
    }
}

// Concrete Handlers
class RequiredFieldsValidator extends ValidationHandler {
    constructor(requiredFields) {
        super('RequiredFields');
        this.requiredFields = requiredFields;
    }
    
    validate(request) {
        for (const field of this.requiredFields) {
            if (!request[field]) {
                console.log(`[${this.name}] Failed: Missing field '${field}'`);
                return false;
            }
        }
        console.log(`[${this.name}] Passed: All required fields present`);
        return true;
    }
}

class EmailValidator extends ValidationHandler {
    constructor() {
        super('EmailValidator');
    }
    
    validate(request) {
        if (request.email && !request.email.includes('@')) {
            console.log(`[${this.name}] Failed: Invalid email format`);
            return false;
        }
        console.log(`[${this.name}] Passed: Email format valid`);
        return true;
    }
}

class PasswordStrengthValidator extends ValidationHandler {
    constructor() {
        super('PasswordStrength');
    }
    
    validate(request) {
        if (request.password && request.password.length < 8) {
            console.log(`[${this.name}] Failed: Password too short`);
            return false;
        }
        console.log(`[${this.name}] Passed: Password strength acceptable`);
        return true;
    }
}

class DateValidator extends ValidationHandler {
    constructor() {
        super('DateValidator');
    }
    
    validate(request) {
        if (request.date) {
            const date = new Date(request.date);
            if (date < new Date()) {
                console.log(`[${this.name}] Failed: Date is in the past`);
                return false;
            }
        }
        console.log(`[${this.name}] Passed: Date is valid`);
        return true;
    }
}

// ============= DEMONSTRATION FUNCTION =============
function demonstrateDesignPatterns() {
    console.log('\n=== DESIGN PATTERNS DEMONSTRATION ===\n');
    
    // 1. Singleton Pattern
    console.log('1. SINGLETON PATTERN:');
    const db1 = new DatabaseConnection();
    const db2 = new DatabaseConnection();
    console.log('   Same instance?', db1 === db2);
    db1.connect();
    console.log('   Status:', db2.getStatus());
    
    // 2. Factory Pattern
    console.log('\n2. FACTORY PATTERN:');
    const emailNotif = NotificationFactory.createNotification('email', 'user@example.com', 'Appointment Reminder');
    const smsNotif = NotificationFactory.createNotification('sms', '+1234567890', 'Your appointment is tomorrow');
    emailNotif.send();
    smsNotif.send();
    
    // 3. Strategy Pattern
    console.log('\n3. STRATEGY PATTERN:');
    const authContext = new AuthContext(new EmailPasswordStrategy());
    console.log('   Email auth:', authContext.authenticate({ email: 'user@test.com', password: 'password123' }));
    authContext.setStrategy(new TokenStrategy());
    console.log('   Token auth:', authContext.authenticate({ token: 'abc123xyz789' }));
    authContext.setStrategy(new OAuthStrategy());
    console.log('   OAuth auth:', authContext.authenticate({ provider: 'google', authCode: 'oauth_code_123' }));
    
    // 4. Observer Pattern
    console.log('\n4. OBSERVER PATTERN:');
    const appointmentSubject = new AppointmentSubject();
    appointmentSubject.attach(new NotificationObserver());
    appointmentSubject.attach(new AuditLogObserver());
    appointmentSubject.attach(new StatisticsObserver());
    appointmentSubject.changeAppointmentStatus('APT001', 'confirmed');
    appointmentSubject.changeAppointmentStatus('APT002', 'cancelled');
    
    // 5. Decorator Pattern
    console.log('\n5. DECORATOR PATTERN:');
    let handler = new RequestHandler();
    handler = new ValidationDecorator(handler);
    handler = new AuthenticationDecorator(handler);
    handler = new LoggingDecorator(handler);
    handler = new CacheDecorator(handler);
    
    const request = { method: 'GET', url: '/api/appointments' };
    const response = handler.handle(request);
    console.log('   Final response:', response);
    
    // 6. Repository Pattern
    console.log('\n6. REPOSITORY PATTERN:');
    const userRepo = new UserRepository();
    const user1 = userRepo.create({ name: 'John Doe', email: 'john@example.com', role: 'patient' });
    const user2 = userRepo.create({ name: 'Dr. Smith', email: 'smith@hospital.com', role: 'doctor' });
    console.log('   Find by email:', userRepo.findByEmail('john@example.com'));
    console.log('   Find doctors:', userRepo.findByRole('doctor'));
    console.log('   Total users:', userRepo.count());
    
    // 7. Chain of Responsibility
    console.log('\n7. CHAIN OF RESPONSIBILITY:');
    const validator = new RequiredFieldsValidator(['email', 'password']);
    validator
        .setNext(new EmailValidator())
        .setNext(new PasswordStrengthValidator())
        .setNext(new DateValidator());
    
    console.log('   Valid request:');
    const validRequest = { email: 'user@example.com', password: 'StrongPass123', date: '2025-12-01' };
    console.log('   Result:', validator.handle(validRequest));
    
    console.log('   Invalid request:');
    const invalidRequest = { email: 'invalid-email', password: 'weak' };
    console.log('   Result:', validator.handle(invalidRequest));
}

// Export all patterns
module.exports = {
    // Singleton
    DatabaseConnection,
    // Factory
    NotificationFactory,
    EmailNotification,
    SMSNotification,
    PushNotification,
    // Strategy
    AuthContext,
    EmailPasswordStrategy,
    TokenStrategy,
    OAuthStrategy,
    // Observer
    AppointmentSubject,
    NotificationObserver,
    AuditLogObserver,
    StatisticsObserver,
    // Decorator
    RequestHandler,
    LoggingDecorator,
    AuthenticationDecorator,
    ValidationDecorator,
    CacheDecorator,
    // Repository
    UserRepository,
    AppointmentRepository,
    // Chain of Responsibility
    RequiredFieldsValidator,
    EmailValidator,
    PasswordStrengthValidator,
    DateValidator,
    // Demo function
    demonstrateDesignPatterns
};

// Run if executed directly
if (require.main === module) {
    demonstrateDesignPatterns();
}