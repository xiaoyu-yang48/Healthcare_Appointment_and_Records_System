/**
 * Minimal Design Patterns & OOP Demonstration
 * 7 Design Patterns + 5 OOP Classes with SOLID Principles
 */

// ============= 1. SINGLETON PATTERN =============
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
            this.connection = { status: 'connected', time: new Date() };
            console.log('Database connected');
        }
        return this.connection;
    }
}

// ============= 2. FACTORY PATTERN =============
class NotificationFactory {
    static createNotification(type) {
        switch(type) {
            case 'email':
                return { send: () => console.log('Email sent'), type: 'email' };
            case 'sms':
                return { send: () => console.log('SMS sent'), type: 'sms' };
            default:
                return { send: () => console.log('Default notification'), type: 'default' };
        }
    }
}

// ============= 3. STRATEGY PATTERN =============
class AuthStrategy {
    authenticate(credentials) {
        throw new Error('Must implement authenticate method');
    }
}

class EmailAuth extends AuthStrategy {
    authenticate(credentials) {
        return credentials.email && credentials.password ? 
            { success: true, method: 'email' } : 
            { success: false };
    }
}

class TokenAuth extends AuthStrategy {
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

// ============= 4. OBSERVER PATTERN =============
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
        console.log(`Notification: Appointment ${event.id} status changed to ${event.status}`);
    }
}

class LogObserver {
    update(event) {
        console.log(`Log: ${new Date()} - Appointment ${event.id} updated`);
    }
}

// ============= 5. DECORATOR PATTERN =============
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
        request.authenticated = true;
        return this.handler.handle(request);
    }
}

// ============= 6. REPOSITORY PATTERN =============
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

// ============= 7. CHAIN OF RESPONSIBILITY =============
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

class RequiredFieldsValidator extends ValidationHandler {
    validate(request) {
        const valid = request.email && request.password;
        if (!valid) console.log('Validation failed: Missing required fields');
        return valid;
    }
}

class EmailValidator extends ValidationHandler {
    validate(request) {
        const valid = !request.email || request.email.includes('@');
        if (!valid) console.log('Validation failed: Invalid email');
        return valid;
    }
}

// ============= OOP CLASSES WITH SOLID PRINCIPLES =============

// 1. Base Entity (Abstraction & Encapsulation)
class BaseEntity {
    constructor(id) {
        this._id = id;
        this._createdAt = new Date();
        this._isActive = true;
    }
    
    // Encapsulation with getters
    get id() { return this._id; }
    get createdAt() { return this._createdAt; }
    get isActive() { return this._isActive; }
    
    // Common method for all entities
    deactivate() {
        this._isActive = false;
    }
    
    // Abstract method (must be overridden)
    validate() {
        throw new Error('validate() must be implemented');
    }
}

// 2. Person Class (Inheritance from BaseEntity)
class Person extends BaseEntity {
    constructor(id, name, email) {
        super(id);
        this._name = name;
        this._email = email;
    }
    
    get name() { return this._name; }
    get email() { return this._email; }
    
    // Override abstract method
    validate() {
        return this._name && this._email && this._email.includes('@');
    }
    
    // Polymorphism - can be overridden by subclasses
    getRole() {
        return 'person';
    }
}

// 3. Patient Class (Inheritance & Polymorphism)
class Patient extends Person {
    constructor(id, name, email, medicalHistory = []) {
        super(id, name, email);
        this._medicalHistory = medicalHistory;
        this._appointments = [];
    }
    
    addMedicalHistory(record) {
        this._medicalHistory.push(record);
    }
    
    scheduleAppointment(appointment) {
        this._appointments.push(appointment);
    }
    
    // Polymorphism - override parent method
    getRole() {
        return 'patient';
    }
    
    // Additional validation for patients
    validate() {
        return super.validate() && Array.isArray(this._medicalHistory);
    }
}

// 4. Doctor Class (Inheritance & Single Responsibility)
class Doctor extends Person {
    constructor(id, name, email, specialization) {
        super(id, name, email);
        this._specialization = specialization;
        this._patients = [];
    }
    
    get specialization() { return this._specialization; }
    
    addPatient(patient) {
        if (patient instanceof Patient) {
            this._patients.push(patient);
        }
    }
    
    // Polymorphism
    getRole() {
        return 'doctor';
    }
    
    // Doctor-specific validation
    validate() {
        return super.validate() && this._specialization;
    }
}

// 5. Appointment Class (Composition & Dependency Inversion)
class Appointment extends BaseEntity {
    constructor(id, patient, doctor, date) {
        super(id);
        // Dependency Inversion - depends on abstractions (Person), not concrete classes
        if (!(patient instanceof Person) || !(doctor instanceof Person)) {
            throw new Error('Invalid patient or doctor');
        }
        this._patient = patient;
        this._doctor = doctor;
        this._date = date;
        this._status = 'scheduled';
    }
    
    get patient() { return this._patient; }
    get doctor() { return this._doctor; }
    get status() { return this._status; }
    
    // State management
    confirm() {
        if (this._status === 'scheduled') {
            this._status = 'confirmed';
            return true;
        }
        return false;
    }
    
    cancel() {
        if (this._status !== 'completed') {
            this._status = 'cancelled';
            return true;
        }
        return false;
    }
    
    validate() {
        return this._patient && this._doctor && this._date;
    }
}

// ============= DEMONSTRATION =============
function demonstratePatterns() {
    console.log('\n=== DESIGN PATTERNS DEMONSTRATION ===\n');
    
    // 1. Singleton
    console.log('1. SINGLETON:');
    const db1 = new DatabaseConnection();
    const db2 = new DatabaseConnection();
    console.log('Same instance?', db1 === db2); // true
    db1.connect();
    
    // 2. Factory
    console.log('\n2. FACTORY:');
    const emailNotif = NotificationFactory.createNotification('email');
    const smsNotif = NotificationFactory.createNotification('sms');
    emailNotif.send();
    smsNotif.send();
    
    // 3. Strategy
    console.log('\n3. STRATEGY:');
    const authContext = new AuthContext();
    authContext.setStrategy(new EmailAuth());
    console.log('Email auth:', authContext.authenticate({ email: 'test@test.com', password: '123' }));
    authContext.setStrategy(new TokenAuth());
    console.log('Token auth:', authContext.authenticate({ token: 'abc123' }));
    
    // 4. Observer
    console.log('\n4. OBSERVER:');
    const subject = new AppointmentSubject();
    subject.attach(new NotificationObserver());
    subject.attach(new LogObserver());
    subject.notify({ id: 'APT001', status: 'confirmed' });
    
    // 5. Decorator
    console.log('\n5. DECORATOR:');
    let handler = new RequestHandler();
    handler = new AuthDecorator(handler);
    handler = new LoggingDecorator(handler);
    const request = handler.handle({ method: 'GET', url: '/api/users' });
    console.log('Decorated request:', request);
    
    // 6. Repository
    console.log('\n6. REPOSITORY:');
    const userRepo = new UserRepository();
    const user = userRepo.create({ name: 'John', email: 'john@test.com' });
    console.log('Created user:', user);
    console.log('Find by email:', userRepo.findByEmail('john@test.com'));
    
    // 7. Chain of Responsibility
    console.log('\n7. CHAIN OF RESPONSIBILITY:');
    const validator1 = new RequiredFieldsValidator();
    const validator2 = new EmailValidator();
    validator1.setNext(validator2);
    console.log('Valid request:', validator1.handle({ email: 'test@test.com', password: '123' }));
    console.log('Invalid request:', validator1.handle({ email: 'invalid' }));
    
    // OOP Demonstration
    console.log('\n=== OOP PRINCIPLES DEMONSTRATION ===\n');
    
    // Create instances demonstrating inheritance and polymorphism
    const patient = new Patient(1, 'John Doe', 'john@test.com');
    const doctor = new Doctor(2, 'Dr. Smith', 'smith@hospital.com', 'Cardiology');
    
    // Polymorphism - same method, different behavior
    console.log('Patient role:', patient.getRole());
    console.log('Doctor role:', doctor.getRole());
    
    // Encapsulation - accessing through getters
    console.log('Doctor specialization:', doctor.specialization);
    
    // Composition and Dependency Inversion
    const appointment = new Appointment(3, patient, doctor, new Date());
    console.log('Appointment status:', appointment.status);
    appointment.confirm();
    console.log('After confirmation:', appointment.status);
    
    // Validation (Template Method)
    console.log('Patient valid?', patient.validate());
    console.log('Doctor valid?', doctor.validate());
    console.log('Appointment valid?', appointment.validate());
    
    // SOLID Principles demonstrated:
    console.log('\nSOLID PRINCIPLES:');
    console.log('S - Single Responsibility: Each class has one purpose');
    console.log('O - Open/Closed: Classes can be extended but not modified');
    console.log('L - Liskov Substitution: Patient/Doctor can replace Person');
    console.log('I - Interface Segregation: Classes only implement needed methods');
    console.log('D - Dependency Inversion: Appointment depends on Person abstraction');
}

// Export for use in other files
module.exports = {
    // Singleton
    DatabaseConnection,
    // Factory
    NotificationFactory,
    // Strategy
    AuthContext,
    EmailAuth,
    TokenAuth,
    // Observer
    AppointmentSubject,
    NotificationObserver,
    // Decorator
    LoggingDecorator,
    AuthDecorator,
    // Repository
    UserRepository,
    // Chain of Responsibility
    RequiredFieldsValidator,
    EmailValidator,
    // OOP Classes
    BaseEntity,
    Person,
    Patient,
    Doctor,
    Appointment,
    // Demo function
    demonstratePatterns
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstratePatterns();
}