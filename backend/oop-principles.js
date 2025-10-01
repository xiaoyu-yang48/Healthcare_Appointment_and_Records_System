/**
 * OOP Principles & SOLID Demonstration
 * 5 Classes demonstrating OOP concepts and SOLID principles
 * 
 * OOP Concepts Demonstrated:
 * - Encapsulation: Private properties with controlled access
 * - Inheritance: Class hierarchy (BaseEntity → Person → Patient/Doctor)
 * - Polymorphism: Method overriding and different implementations
 * - Abstraction: Abstract base classes with concrete implementations
 * - Composition: Objects containing other objects
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Each class has one purpose
 * - Open/Closed: Open for extension, closed for modification
 * - Liskov Substitution: Subclasses can replace parent classes
 * - Interface Segregation: Classes only have methods they need
 * - Dependency Inversion: Depend on abstractions, not concretions
 * 
 * Run directly: node oop-principles.js
 * Or via API: GET /api/oop-demo
 */

// ============= OOP CLASSES WITH SOLID PRINCIPLES =============

// 1. Base Entity (Abstraction & Encapsulation)
class BaseEntity {
    constructor(id) {
        // Private properties (Encapsulation)
        this._id = id;
        this._createdAt = new Date();
        this._isActive = true;
    }
    
    // Encapsulation with getters
    get id() { return this._id; }
    get createdAt() { return this._createdAt; }
    get isActive() { return this._isActive; }
    
    // Protected setter
    set isActive(value) {
        if (typeof value !== 'boolean') {
            throw new Error('isActive must be boolean');
        }
        this._isActive = value;
    }
    
    // Common method for all entities
    deactivate() {
        this._isActive = false;
    }
    
    // Abstract method (must be overridden by subclasses)
    validate() {
        throw new Error('validate() must be implemented by subclass');
    }
    
    // Template method
    save() {
        if (this.validate()) {
            console.log(`Saving ${this.constructor.name} with ID: ${this._id}`);
            return true;
        }
        return false;
    }
}

// 2. Person Class (Inheritance from BaseEntity)
class Person extends BaseEntity {
    constructor(id, name, email) {
        super(id); // Call parent constructor
        this._name = name;
        this._email = email;
    }
    
    // Getters for encapsulation
    get name() { return this._name; }
    get email() { return this._email; }
    
    // Setters with validation
    set email(value) {
        if (!value.includes('@')) {
            throw new Error('Invalid email format');
        }
        this._email = value;
    }
    
    // Override abstract method from parent
    validate() {
        return this._name && this._email && this._email.includes('@');
    }
    
    // Polymorphism - can be overridden by subclasses
    getRole() {
        return 'person';
    }
    
    // Method specific to Person
    getFullInfo() {
        return `${this._name} (${this._email})`;
    }
}

// 3. Patient Class (Inheritance & Polymorphism)
class Patient extends Person {
    constructor(id, name, email, medicalHistory = []) {
        super(id, name, email);
        this._medicalHistory = medicalHistory;
        this._appointments = [];
        this._allergies = [];
    }
    
    // Patient-specific methods (Single Responsibility)
    addMedicalHistory(record) {
        this._medicalHistory.push({
            date: new Date(),
            record: record
        });
    }
    
    addAllergy(allergy) {
        if (!this._allergies.includes(allergy)) {
            this._allergies.push(allergy);
        }
    }
    
    scheduleAppointment(appointment) {
        this._appointments.push(appointment);
    }
    
    getMedicalHistory() {
        return [...this._medicalHistory]; // Return copy for encapsulation
    }
    
    // Polymorphism - override parent method
    getRole() {
        return 'patient';
    }
    
    // Override validation with additional checks
    validate() {
        return super.validate() && Array.isArray(this._medicalHistory);
    }
    
    // Override to include patient-specific info
    getFullInfo() {
        return `Patient: ${super.getFullInfo()} - ${this._medicalHistory.length} medical records`;
    }
}

// 4. Doctor Class (Inheritance & Single Responsibility)
class Doctor extends Person {
    constructor(id, name, email, specialization, licenseNumber) {
        super(id, name, email);
        this._specialization = specialization;
        this._licenseNumber = licenseNumber;
        this._patients = [];
        this._availability = {};
    }
    
    // Getters
    get specialization() { return this._specialization; }
    get licenseNumber() { return this._licenseNumber; }
    
    // Doctor-specific methods (Single Responsibility)
    addPatient(patient) {
        // Liskov Substitution - can accept any Person subclass
        if (patient instanceof Patient) {
            this._patients.push(patient);
            return true;
        }
        return false;
    }
    
    setAvailability(day, hours) {
        this._availability[day] = hours;
    }
    
    isAvailable(day, time) {
        return this._availability[day] && 
               this._availability[day].includes(time);
    }
    
    getPatientCount() {
        return this._patients.length;
    }
    
    // Polymorphism
    getRole() {
        return 'doctor';
    }
    
    // Doctor-specific validation
    validate() {
        return super.validate() && 
               this._specialization && 
               this._licenseNumber;
    }
    
    // Override to include doctor-specific info
    getFullInfo() {
        return `Dr. ${this._name} - ${this._specialization} (License: ${this._licenseNumber})`;
    }
}

// 5. Appointment Class (Composition & Dependency Inversion)
class Appointment extends BaseEntity {
    constructor(id, patient, doctor, date, duration = 30) {
        super(id);
        
        // Dependency Inversion - depends on abstractions (Person), not concrete classes
        if (!(patient instanceof Person) || !(doctor instanceof Person)) {
            throw new Error('Invalid patient or doctor');
        }
        
        // Composition - has-a relationship
        this._patient = patient;
        this._doctor = doctor;
        this._date = date;
        this._duration = duration; // in minutes
        this._status = 'scheduled';
        this._notes = '';
    }
    
    // Getters
    get patient() { return this._patient; }
    get doctor() { return this._doctor; }
    get date() { return this._date; }
    get status() { return this._status; }
    
    // State management (Open/Closed - open for extension via states)
    confirm() {
        if (this._status === 'scheduled') {
            this._status = 'confirmed';
            console.log(`Appointment ${this._id} confirmed`);
            return true;
        }
        return false;
    }
    
    complete() {
        if (this._status === 'confirmed') {
            this._status = 'completed';
            console.log(`Appointment ${this._id} completed`);
            return true;
        }
        return false;
    }
    
    cancel(reason) {
        if (this._status !== 'completed' && this._status !== 'cancelled') {
            this._status = 'cancelled';
            this._notes = reason;
            console.log(`Appointment ${this._id} cancelled: ${reason}`);
            return true;
        }
        return false;
    }
    
    addNotes(notes) {
        this._notes += '\n' + notes;
    }
    
    // Validate appointment
    validate() {
        return this._patient && 
               this._doctor && 
               this._date && 
               this._date > new Date();
    }
    
    // Get appointment summary
    getSummary() {
        return `Appointment ${this._id}: ${this._patient.name} with ${this._doctor.getFullInfo()} on ${this._date.toLocaleDateString()}`;
    }
}

// ============= DEMONSTRATION FUNCTION =============
function demonstrateOOPPrinciples() {
    console.log('\n=== OOP PRINCIPLES & SOLID DEMONSTRATION ===\n');
    
    console.log('1. ENCAPSULATION:');
    const patient = new Patient(1, 'John Doe', 'john@example.com');
    console.log('   - Private properties accessed via getters');
    console.log('   - Patient ID:', patient.id);
    console.log('   - Patient Name:', patient.name);
    console.log('   - Cannot directly access _name:', patient._name === undefined ? 'undefined (protected)' : 'accessible');
    
    console.log('\n2. INHERITANCE:');
    const doctor = new Doctor(2, 'Sarah Smith', 'sarah@hospital.com', 'Cardiology', 'MD12345');
    console.log('   - Doctor inherits from Person, Person from BaseEntity');
    console.log('   - Doctor is Person?', doctor instanceof Person);
    console.log('   - Doctor is BaseEntity?', doctor instanceof BaseEntity);
    console.log('   - Has inherited method save():', typeof doctor.save === 'function');
    
    console.log('\n3. POLYMORPHISM:');
    console.log('   - Same method, different behavior:');
    console.log('   - Patient role:', patient.getRole());
    console.log('   - Doctor role:', doctor.getRole());
    console.log('   - Patient info:', patient.getFullInfo());
    console.log('   - Doctor info:', doctor.getFullInfo());
    
    console.log('\n4. ABSTRACTION:');
    console.log('   - BaseEntity has abstract validate() method');
    console.log('   - Each subclass implements it differently');
    console.log('   - Patient validation:', patient.validate());
    console.log('   - Doctor validation:', doctor.validate());
    
    console.log('\n5. COMPOSITION:');
    const appointment = new Appointment(3, patient, doctor, new Date('2025-12-01'));
    console.log('   - Appointment composed of Patient and Doctor');
    console.log('   - Appointment summary:', appointment.getSummary());
    
    console.log('\n=== SOLID PRINCIPLES ===\n');
    
    console.log('S - SINGLE RESPONSIBILITY:');
    console.log('   - Patient class: manages patient data only');
    console.log('   - Doctor class: manages doctor data only');
    console.log('   - Appointment class: manages appointment logic only');
    
    console.log('\nO - OPEN/CLOSED:');
    console.log('   - Classes can be extended (Patient extends Person)');
    console.log('   - But base classes are closed for modification');
    
    console.log('\nL - LISKOV SUBSTITUTION:');
    const person = new Person(4, 'Generic Person', 'person@example.com');
    function processPerson(p) {
        return p.getFullInfo(); // Works with Person or any subclass
    }
    console.log('   - Function works with Person:', processPerson(person));
    console.log('   - Same function with Patient:', processPerson(patient));
    console.log('   - Same function with Doctor:', processPerson(doctor));
    
    console.log('\nI - INTERFACE SEGREGATION:');
    console.log('   - Patient has patient-specific methods (addMedicalHistory)');
    console.log('   - Doctor has doctor-specific methods (setAvailability)');
    console.log('   - Not all Person subclasses need all methods');
    
    console.log('\nD - DEPENDENCY INVERSION:');
    console.log('   - Appointment depends on Person abstraction');
    console.log('   - Not on concrete Patient/Doctor implementations');
    console.log('   - Can work with any Person subclass');
    
    // Additional demonstrations
    console.log('\n=== ADDITIONAL OOP FEATURES ===\n');
    
    // Encapsulation with validation
    console.log('Email validation:');
    try {
        patient.email = 'invalid-email';
    } catch (e) {
        console.log('   - Error:', e.message);
    }
    
    // State management
    console.log('\nAppointment state management:');
    console.log('   - Initial status:', appointment.status);
    appointment.confirm();
    console.log('   - After confirm:', appointment.status);
    appointment.complete();
    console.log('   - After complete:', appointment.status);
    
    // Method chaining and fluent interface
    patient.addMedicalHistory('Flu vaccination');
    patient.addAllergy('Peanuts');
    patient.addAllergy('Dust');
    console.log('\nPatient medical history:', patient.getMedicalHistory().length, 'records');
    
    // Doctor managing patients
    doctor.addPatient(patient);
    console.log('Doctor patient count:', doctor.getPatientCount());
    
    // Template method pattern in save()
    console.log('\nTemplate method pattern:');
    doctor.save(); // Calls validate() then saves
}

// Export classes and demo function
module.exports = {
    BaseEntity,
    Person,
    Patient,
    Doctor,
    Appointment,
    demonstrateOOPPrinciples
};

// Run if executed directly
if (require.main === module) {
    demonstrateOOPPrinciples();
}