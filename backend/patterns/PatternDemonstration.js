/**
 * Design Pattern Demonstration
 * This file demonstrates all 7 design patterns and OOP principles implemented
 */

// 1. SINGLETON PATTERN - Database Connection
const DatabaseManager = require('./DatabaseManager');

function demonstrateSingleton() {
    console.log('\n=== SINGLETON PATTERN DEMO ===');
    
    // Multiple calls return the same instance
    const db1 = DatabaseManager.getInstance();
    const db2 = DatabaseManager.getInstance();
    
    console.log('Same instance?', db1 === db2); // true
    console.log('Database ready?', db1.isReady());
}

// 2. FACTORY PATTERN - Notification Creation
const { NotificationFactory } = require('./NotificationFactory');

async function demonstrateFactory() {
    console.log('\n=== FACTORY PATTERN DEMO ===');
    
    // Factory creates different notification types
    const appointmentNotification = NotificationFactory.createNotification(
        'appointment_request',
        'doctor123',
        'patient456',
        'appointment789',
        'John Doe',
        'en'
    );
    
    const medicalRecordNotification = NotificationFactory.createNotification(
        'medical_record_added',
        'patient456',
        'doctor123',
        'record789',
        'Dr. Smith',
        'en'
    );
    
    console.log('Created appointment notification:', appointmentNotification.constructor.name);
    console.log('Created medical record notification:', medicalRecordNotification.constructor.name);
}

// 3. STRATEGY PATTERN - Authentication Methods
const { AuthContext, EmailPasswordStrategy, TokenStrategy } = require('./AuthStrategy');

async function demonstrateStrategy() {
    console.log('\n=== STRATEGY PATTERN DEMO ===');
    
    const authContext = new AuthContext();
    
    // Switch strategies at runtime
    console.log('Using EmailPassword Strategy:');
    authContext.setStrategy(new EmailPasswordStrategy());
    // Would authenticate with email/password
    
    console.log('Switching to Token Strategy:');
    authContext.setStrategy(new TokenStrategy());
    // Would authenticate with token
}

// 4. OBSERVER PATTERN - Appointment Status Changes
const { getAppointmentSubject, StatisticsObserver } = require('./AppointmentObserver');

function demonstrateObserver() {
    console.log('\n=== OBSERVER PATTERN DEMO ===');
    
    const subject = getAppointmentSubject();
    const statsObserver = new StatisticsObserver();
    
    // Attach additional observer
    subject.attach(statsObserver);
    
    // Notify observers of appointment events
    const mockAppointment = {
        _id: 'apt123',
        patient: 'patient456',
        doctor: 'doctor789',
        status: 'pending'
    };
    
    subject.notify(mockAppointment, 'created', { patientName: 'John Doe' });
    subject.notify(mockAppointment, 'confirmed', { doctorName: 'Dr. Smith' });
    
    console.log('Statistics collected:', statsObserver.getStats());
}

// 5. DECORATOR PATTERN - Request Enhancement
const { 
    RequestHandler, 
    LoggingDecorator, 
    PerformanceDecorator,
    SecurityDecorator 
} = require('./RequestDecorator');

function demonstrateDecorator() {
    console.log('\n=== DECORATOR PATTERN DEMO ===');
    
    // Base handler
    let handler = new RequestHandler();
    
    // Decorate with logging
    handler = new LoggingDecorator(handler);
    
    // Add performance monitoring
    handler = new PerformanceDecorator(handler, 500);
    
    // Add security headers
    handler = new SecurityDecorator(handler);
    
    console.log('Created decorated handler with multiple layers');
    console.log('Handler chain:', handler.constructor.name, 
                '→', handler.handler.constructor.name,
                '→', handler.handler.handler.constructor.name);
}

// 6. REPOSITORY PATTERN - Data Access Layer
const { RepositoryFactory } = require('./Repository');

async function demonstrateRepository() {
    console.log('\n=== REPOSITORY PATTERN DEMO ===');
    
    // Get repositories from factory
    const userRepo = RepositoryFactory.getRepository('User');
    const appointmentRepo = RepositoryFactory.getRepository('Appointment');
    const noticeRepo = RepositoryFactory.getRepository('Notice');
    
    console.log('User Repository methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(userRepo)));
    console.log('Appointment Repository has custom methods:', 
                'findByPatient' in appointmentRepo,
                'checkTimeSlotAvailability' in appointmentRepo);
}

// 7. CHAIN OF RESPONSIBILITY - Validation Chain
const { ValidationChainBuilder } = require('./ValidationChain');

async function demonstrateChainOfResponsibility() {
    console.log('\n=== CHAIN OF RESPONSIBILITY PATTERN DEMO ===');
    
    // Build validation chains
    const loginChain = ValidationChainBuilder.createLoginChain();
    const registrationChain = ValidationChainBuilder.createRegistrationChain();
    const appointmentChain = ValidationChainBuilder.createAppointmentChain();
    
    // Test login validation
    const loginRequest = {
        body: {
            email: 'test@example.com',
            password: 'password123'
        }
    };
    
    const result = await loginChain.handle(loginRequest);
    console.log('Login validation result:', result);
    
    // Test with invalid data
    const invalidRequest = {
        body: {
            email: 'invalid-email',
            password: '123' // Too short
        }
    };
    
    const invalidResult = await loginChain.handle(invalidRequest);
    console.log('Invalid login validation result:', invalidResult);
}

// 8. OOP PRINCIPLES - SOLID & Inheritance
const { UserFactory, Patient, Doctor, Admin, AppointmentEntity } = require('./BaseClasses');

function demonstrateOOP() {
    console.log('\n=== OOP PRINCIPLES DEMO ===');
    
    // Factory creates different user types (Open/Closed Principle)
    const patient = UserFactory.createUser('patient', {
        name: 'John Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01'
    });
    
    const doctor = UserFactory.createUser('doctor', {
        name: 'Dr. Smith',
        email: 'smith@hospital.com',
        specialization: 'Cardiology',
        licenseNumber: 'MD12345'
    });
    
    const admin = UserFactory.createUser('admin', {
        name: 'Admin User',
        email: 'admin@hospital.com'
    });
    
    // Polymorphism - all have toJSON but return different structures
    console.log('Patient type:', patient.constructor.name);
    console.log('Patient age:', patient.age); // Calculated property
    console.log('Doctor specialization:', doctor._specialization);
    console.log('Admin permissions:', admin._permissions);
    
    // Inheritance - all inherit from Person → BaseEntity
    console.log('All are instances of Person:', 
                patient instanceof require('./BaseClasses').Person,
                doctor instanceof require('./BaseClasses').Person,
                admin instanceof require('./BaseClasses').Person);
    
    // Encapsulation - properties are protected with getters/setters
    try {
        patient.email = 'invalid-email'; // Will throw error
    } catch (e) {
        console.log('Email validation error:', e.message);
    }
    
    // Single Responsibility - Appointment handles only appointment logic
    const appointment = new AppointmentEntity({
        patientId: 'patient123',
        doctorId: 'doctor456',
        date: new Date(),
        timeSlot: '09:00-09:30'
    });
    
    console.log('Appointment can transition from pending to confirmed?', 
                appointment.canTransitionTo('confirmed'));
    console.log('Appointment can transition from pending to completed?', 
                appointment.canTransitionTo('completed'));
}

// Main demonstration function
async function runAllDemonstrations() {
    console.log('=' .repeat(50));
    console.log('DESIGN PATTERNS & OOP DEMONSTRATION');
    console.log('=' .repeat(50));
    
    demonstrateSingleton();
    await demonstrateFactory();
    await demonstrateStrategy();
    demonstrateObserver();
    demonstrateDecorator();
    await demonstrateRepository();
    await demonstrateChainOfResponsibility();
    demonstrateOOP();
    
    console.log('\n' + '=' .repeat(50));
    console.log('ALL PATTERNS DEMONSTRATED SUCCESSFULLY');
    console.log('=' .repeat(50));
}

// Export for testing
module.exports = {
    runAllDemonstrations,
    demonstrateSingleton,
    demonstrateFactory,
    demonstrateStrategy,
    demonstrateObserver,
    demonstrateDecorator,
    demonstrateRepository,
    demonstrateChainOfResponsibility,
    demonstrateOOP
};

// Run if executed directly
if (require.main === module) {
    runAllDemonstrations().catch(console.error);
}