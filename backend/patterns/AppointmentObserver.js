// Observer Pattern - Appointment Status Observer
const EventEmitter = require('events');
const Notice = require('../models/Notice');
const { NotificationFactory } = require('./NotificationFactory');

// Subject (Observable)
class AppointmentSubject extends EventEmitter {
    constructor() {
        super();
        this.observers = [];
    }
    
    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
            observer.setSubject(this);
        }
    }
    
    detach(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notify(appointment, event, additionalData = {}) {
        this.emit('appointmentChanged', { appointment, event, ...additionalData });
        this.observers.forEach(observer => {
            observer.update(appointment, event, additionalData);
        });
    }
}

// Base Observer
class AppointmentObserver {
    constructor(name) {
        this.name = name;
        this.subject = null;
    }
    
    setSubject(subject) {
        this.subject = subject;
    }
    
    update(appointment, event, additionalData) {
        console.log(`[${this.name}] Appointment ${appointment._id} event: ${event}`);
    }
}

// Notification Observer
class NotificationObserver extends AppointmentObserver {
    constructor() {
        super('NotificationObserver');
    }
    
    async update(appointment, event, additionalData) {
        super.update(appointment, event, additionalData);
        
        try {
            switch(event) {
                case 'created':
                    await this.handleAppointmentCreated(appointment, additionalData);
                    break;
                case 'confirmed':
                    await this.handleAppointmentConfirmed(appointment, additionalData);
                    break;
                case 'cancelled':
                    await this.handleAppointmentCancelled(appointment, additionalData);
                    break;
                case 'completed':
                    await this.handleAppointmentCompleted(appointment, additionalData);
                    break;
                default:
                    console.log(`Unknown event: ${event}`);
            }
        } catch (error) {
            console.error(`Error in NotificationObserver: ${error.message}`);
        }
    }
    
    async handleAppointmentCreated(appointment, data) {
        const { patientName, language } = data;
        await NotificationFactory.sendNotification(
            'appointment_request',
            appointment.doctor,
            appointment.patient,
            appointment._id,
            patientName,
            language
        );
    }
    
    async handleAppointmentConfirmed(appointment, data) {
        const { doctorName, language } = data;
        await NotificationFactory.sendNotification(
            'appointment_confirmed',
            appointment.patient,
            appointment.doctor,
            appointment._id,
            doctorName,
            language
        );
    }
    
    async handleAppointmentCancelled(appointment, data) {
        const { cancelledBy, cancellerName } = data;
        const recipientId = cancelledBy.toString() === appointment.doctor.toString() 
            ? appointment.patient 
            : appointment.doctor;
            
        await Notice.createAppointmentCancelled(
            recipientId,
            cancelledBy,
            appointment._id,
            cancellerName
        );
    }
    
    async handleAppointmentCompleted(appointment, data) {
        console.log(`Appointment ${appointment._id} completed`);
        // Additional logic for completed appointments
    }
}

// Audit Log Observer
class AuditLogObserver extends AppointmentObserver {
    constructor() {
        super('AuditLogObserver');
        this.logs = [];
    }
    
    update(appointment, event, additionalData) {
        super.update(appointment, event, additionalData);
        
        const logEntry = {
            timestamp: new Date(),
            appointmentId: appointment._id,
            event,
            patientId: appointment.patient,
            doctorId: appointment.doctor,
            status: appointment.status,
            additionalData
        };
        
        this.logs.push(logEntry);
        this.persistLog(logEntry);
    }
    
    persistLog(logEntry) {
        // In a real application, this would save to database or file
        console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);
    }
    
    getLogs() {
        return this.logs;
    }
}

// Statistics Observer
class StatisticsObserver extends AppointmentObserver {
    constructor() {
        super('StatisticsObserver');
        this.stats = {
            created: 0,
            confirmed: 0,
            cancelled: 0,
            completed: 0,
            noShow: 0
        };
    }
    
    update(appointment, event, additionalData) {
        super.update(appointment, event, additionalData);
        
        if (this.stats.hasOwnProperty(event)) {
            this.stats[event]++;
        }
        
        this.updateDailyStats(appointment, event);
    }
    
    updateDailyStats(appointment, event) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.stats[today]) {
            this.stats[today] = {
                created: 0,
                confirmed: 0,
                cancelled: 0,
                completed: 0
            };
        }
        
        if (this.stats[today].hasOwnProperty(event)) {
            this.stats[today][event]++;
        }
    }
    
    getStats() {
        return this.stats;
    }
}

// Singleton instance of the subject
let appointmentSubjectInstance = null;

function getAppointmentSubject() {
    if (!appointmentSubjectInstance) {
        appointmentSubjectInstance = new AppointmentSubject();
        
        // Attach default observers
        appointmentSubjectInstance.attach(new NotificationObserver());
        appointmentSubjectInstance.attach(new AuditLogObserver());
        appointmentSubjectInstance.attach(new StatisticsObserver());
    }
    return appointmentSubjectInstance;
}

module.exports = {
    AppointmentSubject,
    AppointmentObserver,
    NotificationObserver,
    AuditLogObserver,
    StatisticsObserver,
    getAppointmentSubject
};