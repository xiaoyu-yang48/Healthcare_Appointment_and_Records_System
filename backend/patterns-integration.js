/**
 * Design Patterns Applied to Backend Functions
 * Each pattern is applied once to actual functionality
 */

// Optional mongoose import for database connection
let mongoose;
try {
    mongoose = require('mongoose');
} catch (e) {
    // Mongoose not available, will use mock connection
    mongoose = null;
}

// ============= 1. SINGLETON PATTERN - Database Manager =============
class DatabaseManager {
    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        this.connection = null;
        DatabaseManager.instance = this;
    }
    
    async connect() {
        if (!this.connection) {
            if (mongoose) {
                this.connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
            } else {
                // Mock connection when mongoose is not available
                this.connection = { status: 'connected', mock: true, time: new Date() };
            }
            console.log('Database connected via Singleton');
        }
        return this.connection;
    }
    
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
}

// ============= 2. FACTORY PATTERN - Model Factory =============
class ModelFactory {
    static createModel(type, data) {
        switch(type) {
            case 'user':
                return {
                    type: 'user',
                    data: { ...data, role: data.role || 'patient' },
                    save: function() { console.log('User saved:', this.data); return this.data; }
                };
            case 'appointment':
                return {
                    type: 'appointment',
                    data: { ...data, status: 'pending' },
                    save: function() { console.log('Appointment saved:', this.data); return this.data; }
                };
            case 'notice':
                return {
                    type: 'notice',
                    data: { ...data, isRead: false },
                    save: function() { console.log('Notice saved:', this.data); return this.data; }
                };
            default:
                throw new Error(`Unknown model type: ${type}`);
        }
    }
}

// ============= 3. STRATEGY PATTERN - Authentication =============
class AuthStrategy {
    authenticate(credentials) {
        throw new Error('Must implement authenticate');
    }
}

class JWTStrategy extends AuthStrategy {
    authenticate(credentials) {
        const jwt = require('jsonwebtoken');
        if (credentials.token) {
            try {
                const decoded = jwt.verify(credentials.token, process.env.JWT_SECRET || 'test-secret');
                return { success: true, userId: decoded.id };
            } catch {
                return { success: false, error: 'Invalid token' };
            }
        }
        return { success: false, error: 'No token provided' };
    }
}

class PasswordStrategy extends AuthStrategy {
    authenticate(credentials) {
        // Simple password check for demonstration
        if (credentials.email && credentials.password && credentials.password.length >= 6) {
            return { success: true, userId: 'user_' + Date.now() };
        }
        return { success: false, error: 'Invalid credentials' };
    }
}

// Authentication function using Strategy pattern
function authenticateUser(credentials, strategy) {
    return strategy.authenticate(credentials);
}

// ============= 4. OBSERVER PATTERN - Event System =============
class EventManager {
    constructor() {
        this.listeners = {};
    }
    
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Global event manager instance
const eventManager = new EventManager();

// Subscribe to appointment events
eventManager.subscribe('appointment.created', (data) => {
    console.log('Notification: New appointment created:', data.id);
});

eventManager.subscribe('appointment.created', (data) => {
    console.log('Log: Appointment logged:', data);
});

// ============= 5. DECORATOR PATTERN - Request Enhancement =============
function baseRequestHandler(req, res, next) {
    req.timestamp = new Date();
    next();
}

// Logging decorator
function withLogging(handler) {
    return function(req, res, next) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        handler(req, res, next);
    };
}

// Validation decorator
function withValidation(handler) {
    return function(req, res, next) {
        req.validated = true;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is required' });
        }
        handler(req, res, next);
    };
}

// Apply decorators
const enhancedRequestHandler = withLogging(withValidation(baseRequestHandler));

// ============= 6. REPOSITORY PATTERN - Data Access =============
class BaseRepository {
    constructor(modelName) {
        this.modelName = modelName;
        this.cache = new Map();
    }
    
    async findById(id) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        // Simulate database query
        const result = { id, modelName: this.modelName, timestamp: new Date() };
        this.cache.set(id, result);
        return result;
    }
    
    async save(data) {
        const id = data.id || Date.now().toString();
        const entity = { ...data, id, modelName: this.modelName };
        this.cache.set(id, entity);
        return entity;
    }
    
    async findAll() {
        return Array.from(this.cache.values());
    }
}

// Specific repositories
class UserRepository extends BaseRepository {
    constructor() {
        super('User');
    }
    
    async findByEmail(email) {
        const all = await this.findAll();
        return all.find(user => user.email === email);
    }
}

class AppointmentRepository extends BaseRepository {
    constructor() {
        super('Appointment');
    }
    
    async findByPatientId(patientId) {
        const all = await this.findAll();
        return all.filter(apt => apt.patientId === patientId);
    }
}

// ============= 7. CHAIN OF RESPONSIBILITY - Validation Pipeline =============
class ValidationHandler {
    setNext(handler) {
        this.next = handler;
        return handler;
    }
    
    validate(data) {
        const result = this.check(data);
        if (result.valid && this.next) {
            return this.next.validate(data);
        }
        return result;
    }
    
    check(data) {
        return { valid: true };
    }
}

class EmailValidationHandler extends ValidationHandler {
    check(data) {
        if (!data.email || !data.email.includes('@')) {
            return { valid: false, error: 'Invalid email format' };
        }
        return { valid: true };
    }
}

class PasswordValidationHandler extends ValidationHandler {
    check(data) {
        if (!data.password || data.password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }
        return { valid: true };
    }
}

class RoleValidationHandler extends ValidationHandler {
    check(data) {
        const validRoles = ['patient', 'doctor', 'admin'];
        if (data.role && !validRoles.includes(data.role)) {
            return { valid: false, error: 'Invalid role' };
        }
        return { valid: true };
    }
}

// Create validation chain
function createValidationChain() {
    const emailValidator = new EmailValidationHandler();
    const passwordValidator = new PasswordValidationHandler();
    const roleValidator = new RoleValidationHandler();
    
    emailValidator.setNext(passwordValidator).setNext(roleValidator);
    return emailValidator;
}

// ============= INTEGRATION FUNCTIONS =============

// 1. Using Singleton for database operations
async function getDatabaseConnection() {
    const dbManager = DatabaseManager.getInstance();
    return await dbManager.connect();
}

// 2. Using Factory for creating models
function createEntity(type, data) {
    return ModelFactory.createModel(type, data);
}

// 3. Using Strategy for authentication
function login(email, password, useToken = false) {
    const strategy = useToken ? new JWTStrategy() : new PasswordStrategy();
    return authenticateUser({ email, password, token: useToken ? password : null }, strategy);
}

// 4. Using Observer for events
function createAppointment(data) {
    const appointment = { ...data, id: Date.now(), status: 'pending' };
    eventManager.emit('appointment.created', appointment);
    return appointment;
}

// 5. Using Decorator is applied as middleware (enhancedRequestHandler)

// 6. Using Repository for data access
async function getUserById(id) {
    const userRepo = new UserRepository();
    return await userRepo.findById(id);
}

async function getAppointmentsByPatient(patientId) {
    const aptRepo = new AppointmentRepository();
    return await aptRepo.findByPatientId(patientId);
}

// 7. Using Chain of Responsibility for validation
function validateUserData(data) {
    const validationChain = createValidationChain();
    return validationChain.validate(data);
}

// ============= EXPORT ALL PATTERNS AND FUNCTIONS =============
module.exports = {
    // Patterns
    DatabaseManager,
    ModelFactory,
    AuthStrategy,
    JWTStrategy,
    PasswordStrategy,
    EventManager,
    eventManager,
    enhancedRequestHandler,
    UserRepository,
    AppointmentRepository,
    createValidationChain,
    
    // Integration functions
    getDatabaseConnection,
    createEntity,
    login,
    createAppointment,
    getUserById,
    getAppointmentsByPatient,
    validateUserData,
    
    // For middleware use
    withLogging,
    withValidation
};