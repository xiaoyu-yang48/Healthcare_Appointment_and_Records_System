// OOP Principles - Base Classes with SOLID Principles

// 1. Single Responsibility Principle - Each class has one reason to change
// 2. Open/Closed Principle - Open for extension, closed for modification
// 3. Liskov Substitution Principle - Derived classes must be substitutable
// 4. Interface Segregation - Clients shouldn't depend on unused interfaces
// 5. Dependency Inversion - Depend on abstractions, not concretions

// Abstract Base Entity (Abstraction & Encapsulation)
class BaseEntity {
    constructor(data = {}) {
        this._id = data._id || null;
        this._createdAt = data.createdAt || new Date();
        this._updatedAt = data.updatedAt || new Date();
        this._isActive = data.isActive !== undefined ? data.isActive : true;
    }
    
    // Getters (Encapsulation)
    get id() { return this._id; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    get isActive() { return this._isActive; }
    
    // Setters with validation
    set isActive(value) {
        if (typeof value !== 'boolean') {
            throw new Error('isActive must be a boolean');
        }
        this._isActive = value;
        this._updatedAt = new Date();
    }
    
    // Abstract methods (must be implemented by subclasses)
    validate() {
        throw new Error('validate() must be implemented by subclass');
    }
    
    toJSON() {
        return {
            id: this._id,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            isActive: this._isActive
        };
    }
    
    // Template method pattern
    async save() {
        this.validate();
        this._updatedAt = new Date();
        return await this._performSave();
    }
    
    async _performSave() {
        throw new Error('_performSave() must be implemented by subclass');
    }
}

// Person Base Class (Inheritance)
class Person extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this._name = data.name || '';
        this._email = data.email || '';
        this._phone = data.phone || '';
        this._dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
        this._gender = data.gender || null;
        this._address = data.address || '';
    }
    
    // Getters
    get name() { return this._name; }
    get email() { return this._email; }
    get phone() { return this._phone; }
    get dateOfBirth() { return this._dateOfBirth; }
    get gender() { return this._gender; }
    get address() { return this._address; }
    
    // Setters with validation
    set name(value) {
        if (!value || value.trim().length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        this._name = value.trim();
        this._updatedAt = new Date();
    }
    
    set email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new Error('Invalid email format');
        }
        this._email = value.toLowerCase().trim();
        this._updatedAt = new Date();
    }
    
    // Calculated property
    get age() {
        if (!this._dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(this._dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    
    // Method overriding
    validate() {
        if (!this._name || !this._email) {
            throw new Error('Name and email are required');
        }
        return true;
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            name: this._name,
            email: this._email,
            phone: this._phone,
            dateOfBirth: this._dateOfBirth,
            gender: this._gender,
            address: this._address,
            age: this.age
        };
    }
}

// Patient Class (Polymorphism)
class Patient extends Person {
    constructor(data = {}) {
        super(data);
        this._medicalHistory = data.medicalHistory || [];
        this._allergies = data.allergies || [];
        this._emergencyContact = data.emergencyContact || {};
        this._appointments = [];
        this._medicalRecords = [];
    }
    
    // Patient-specific methods
    addAllergy(allergy) {
        if (!this._allergies.includes(allergy)) {
            this._allergies.push(allergy);
            this._updatedAt = new Date();
        }
    }
    
    removeAllergy(allergy) {
        const index = this._allergies.indexOf(allergy);
        if (index > -1) {
            this._allergies.splice(index, 1);
            this._updatedAt = new Date();
        }
    }
    
    addMedicalHistory(condition) {
        if (!this._medicalHistory.includes(condition)) {
            this._medicalHistory.push(condition);
            this._updatedAt = new Date();
        }
    }
    
    setEmergencyContact(contact) {
        if (!contact.name || !contact.phone) {
            throw new Error('Emergency contact must have name and phone');
        }
        this._emergencyContact = contact;
        this._updatedAt = new Date();
    }
    
    // Override parent method
    validate() {
        super.validate();
        // Additional patient-specific validation
        return true;
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            role: 'patient',
            medicalHistory: this._medicalHistory,
            allergies: this._allergies,
            emergencyContact: this._emergencyContact
        };
    }
    
    async _performSave() {
        // Patient-specific save logic
        console.log('Saving patient:', this._name);
        return this;
    }
}

// Doctor Class
class Doctor extends Person {
    constructor(data = {}) {
        super(data);
        this._specialization = data.specialization || '';
        this._department = data.department || '';
        this._licenseNumber = data.licenseNumber || '';
        this._experience = data.experience || 0;
        this._education = data.education || '';
        this._bio = data.bio || '';
        this._appointments = [];
        this._schedule = [];
    }
    
    // Doctor-specific methods
    set specialization(value) {
        if (!value) {
            throw new Error('Specialization is required for doctors');
        }
        this._specialization = value;
        this._updatedAt = new Date();
    }
    
    set licenseNumber(value) {
        if (!value) {
            throw new Error('License number is required for doctors');
        }
        this._licenseNumber = value;
        this._updatedAt = new Date();
    }
    
    isAvailable(date, timeSlot) {
        // Check doctor's availability
        return !this._appointments.some(apt => 
            apt.date.getTime() === date.getTime() && 
            apt.timeSlot === timeSlot &&
            ['pending', 'confirmed'].includes(apt.status)
        );
    }
    
    addToSchedule(scheduleItem) {
        this._schedule.push(scheduleItem);
        this._updatedAt = new Date();
    }
    
    // Override parent method
    validate() {
        super.validate();
        if (!this._specialization || !this._licenseNumber) {
            throw new Error('Specialization and license number are required for doctors');
        }
        return true;
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            role: 'doctor',
            specialization: this._specialization,
            department: this._department,
            licenseNumber: this._licenseNumber,
            experience: this._experience,
            education: this._education,
            bio: this._bio
        };
    }
    
    async _performSave() {
        // Doctor-specific save logic
        console.log('Saving doctor:', this._name);
        return this;
    }
}

// Admin Class
class Admin extends Person {
    constructor(data = {}) {
        super(data);
        this._permissions = data.permissions || ['all'];
        this._department = data.department || 'Administration';
    }
    
    hasPermission(permission) {
        return this._permissions.includes('all') || this._permissions.includes(permission);
    }
    
    grantPermission(permission) {
        if (!this._permissions.includes(permission)) {
            this._permissions.push(permission);
            this._updatedAt = new Date();
        }
    }
    
    revokePermission(permission) {
        const index = this._permissions.indexOf(permission);
        if (index > -1) {
            this._permissions.splice(index, 1);
            this._updatedAt = new Date();
        }
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            role: 'admin',
            permissions: this._permissions,
            department: this._department
        };
    }
    
    async _performSave() {
        // Admin-specific save logic
        console.log('Saving admin:', this._name);
        return this;
    }
}

// Medical Entity Base Class
class MedicalEntity extends BaseEntity {
    constructor(data = {}) {
        super(data);
        this._patientId = data.patientId || null;
        this._doctorId = data.doctorId || null;
        this._date = data.date ? new Date(data.date) : new Date();
    }
    
    get patientId() { return this._patientId; }
    get doctorId() { return this._doctorId; }
    get date() { return this._date; }
    
    validate() {
        if (!this._patientId || !this._doctorId) {
            throw new Error('Patient ID and Doctor ID are required');
        }
        return true;
    }
}

// Appointment Class (extends MedicalEntity)
class AppointmentEntity extends MedicalEntity {
    constructor(data = {}) {
        super(data);
        this._timeSlot = data.timeSlot || '';
        this._status = data.status || 'pending';
        this._type = data.type || 'consultation';
        this._symptoms = data.symptoms || '';
        this._notes = data.notes || '';
    }
    
    // Status management with state pattern concepts
    canTransitionTo(newStatus) {
        const transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['completed', 'cancelled', 'no-show'],
            'cancelled': [],
            'completed': [],
            'no-show': []
        };
        
        return transitions[this._status].includes(newStatus);
    }
    
    updateStatus(newStatus, userId) {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this._status} to ${newStatus}`);
        }
        
        this._status = newStatus;
        this._updatedAt = new Date();
        
        if (newStatus === 'cancelled') {
            this._cancelledBy = userId;
            this._cancelledAt = new Date();
        }
        
        return this;
    }
    
    validate() {
        super.validate();
        if (!this._timeSlot) {
            throw new Error('Time slot is required');
        }
        return true;
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            patientId: this._patientId,
            doctorId: this._doctorId,
            date: this._date,
            timeSlot: this._timeSlot,
            status: this._status,
            type: this._type,
            symptoms: this._symptoms,
            notes: this._notes
        };
    }
    
    async _performSave() {
        console.log('Saving appointment');
        return this;
    }
}

// Medical Record Class
class MedicalRecordEntity extends MedicalEntity {
    constructor(data = {}) {
        super(data);
        this._diagnosis = data.diagnosis || '';
        this._treatment = data.treatment || '';
        this._prescription = data.prescription || { medications: [] };
        this._vitalSigns = data.vitalSigns || {};
        this._labResults = data.labResults || [];
        this._followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    }
    
    addMedication(medication) {
        if (!medication.name || !medication.dosage) {
            throw new Error('Medication must have name and dosage');
        }
        this._prescription.medications.push(medication);
        this._updatedAt = new Date();
    }
    
    addLabResult(result) {
        if (!result.testName || !result.result) {
            throw new Error('Lab result must have test name and result');
        }
        result.date = result.date || new Date();
        this._labResults.push(result);
        this._updatedAt = new Date();
    }
    
    setVitalSigns(vitalSigns) {
        this._vitalSigns = { ...this._vitalSigns, ...vitalSigns };
        this._updatedAt = new Date();
    }
    
    validate() {
        super.validate();
        if (!this._diagnosis || !this._treatment) {
            throw new Error('Diagnosis and treatment are required');
        }
        return true;
    }
    
    toJSON() {
        return {
            ...super.toJSON(),
            patientId: this._patientId,
            doctorId: this._doctorId,
            date: this._date,
            diagnosis: this._diagnosis,
            treatment: this._treatment,
            prescription: this._prescription,
            vitalSigns: this._vitalSigns,
            labResults: this._labResults,
            followUpDate: this._followUpDate
        };
    }
    
    async _performSave() {
        console.log('Saving medical record');
        return this;
    }
}

// User Factory (Factory Pattern + OOP)
class UserFactory {
    static createUser(role, data) {
        switch(role) {
            case 'patient':
                return new Patient(data);
            case 'doctor':
                return new Doctor(data);
            case 'admin':
                return new Admin(data);
            default:
                throw new Error(`Unknown role: ${role}`);
        }
    }
}

module.exports = {
    BaseEntity,
    Person,
    Patient,
    Doctor,
    Admin,
    MedicalEntity,
    AppointmentEntity,
    MedicalRecordEntity,
    UserFactory
};