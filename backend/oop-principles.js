/**
 * Minimal OOP Principles & SOLID Implementation (5 Classes)
 */

// 1. BASE ENTITY - Abstraction & Encapsulation
class BaseEntity {
    constructor(id) {
        this._id = id;  // Private property (Encapsulation)
        this._createdAt = new Date();
        this._isActive = true;
    }
    
    // Getters (Encapsulation)
    get id() { return this._id; }
    get createdAt() { return this._createdAt; }
    get isActive() { return this._isActive; }
    
    // Abstract method
    validate() {
        throw new Error('validate() must be implemented');
    }
}

// 2. PERSON - Inheritance
class Person extends BaseEntity {
    constructor(id, name, email) {
        super(id);  // Inheritance
        this._name = name;
        this._email = email;
    }
    
    get name() { return this._name; }
    get email() { return this._email; }
    
    // Override abstract method
    validate() {
        return this._name && this._email && this._email.includes('@');
    }
    
    // Polymorphism - can be overridden
    getRole() { return 'person'; }
}

// 3. PATIENT - Polymorphism & Inheritance
class Patient extends Person {
    constructor(id, name, email, medicalHistory = []) {
        super(id, name, email);
        this._medicalHistory = medicalHistory;
    }
    
    addMedicalHistory(record) {
        this._medicalHistory.push(record);
    }
    
    // Polymorphism - override parent method
    getRole() { return 'patient'; }
    
    // Single Responsibility - patient-specific logic
    getMedicalHistory() { return [...this._medicalHistory]; }
}

// 4. DOCTOR - Single Responsibility & Inheritance
class Doctor extends Person {
    constructor(id, name, email, specialization) {
        super(id, name, email);
        this._specialization = specialization;
        this._patients = [];
    }
    
    get specialization() { return this._specialization; }
    
    // Liskov Substitution - can accept any Patient
    addPatient(patient) {
        if (patient instanceof Patient) {
            this._patients.push(patient);
        }
    }
    
    // Polymorphism
    getRole() { return 'doctor'; }
    
    // Single Responsibility - doctor-specific logic
    getPatientCount() { return this._patients.length; }
}

// 5. APPOINTMENT - Composition & Dependency Inversion
class Appointment extends BaseEntity {
    constructor(id, patient, doctor, date) {
        super(id);
        // Dependency Inversion - depends on Person abstraction, not concrete classes
        if (!(patient instanceof Person) || !(doctor instanceof Person)) {
            throw new Error('Invalid patient or doctor');
        }
        this._patient = patient;  // Composition
        this._doctor = doctor;    // Composition
        this._date = date;
        this._status = 'scheduled';
    }
    
    get patient() { return this._patient; }
    get doctor() { return this._doctor; }
    get status() { return this._status; }
    
    // Open/Closed - open for extension via status changes
    updateStatus(status) {
        const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
        if (validStatuses.includes(status)) {
            this._status = status;
            return true;
        }
        return false;
    }
    
    validate() {
        return this._patient && this._doctor && this._date;
    }
}

module.exports = {
    BaseEntity,
    Person,
    Patient,
    Doctor,
    Appointment
};