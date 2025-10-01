// Factory Pattern - Notification Factory
const Notice = require('../models/Notice');

// Base Notification Class
class BaseNotification {
    constructor(recipientId, senderId, relatedId) {
        this.recipientId = recipientId;
        this.senderId = senderId;
        this.relatedId = relatedId;
        this.type = 'system_notice';
        this.relatedType = 'system';
    }
    
    async create() {
        throw new Error('create() method must be implemented by subclass');
    }
    
    async send() {
        const noticeData = await this.create();
        return Notice.create(noticeData);
    }
}

// Appointment Request Notification
class AppointmentRequestNotification extends BaseNotification {
    constructor(doctorId, patientId, appointmentId, patientName, language = 'en') {
        super(doctorId, patientId, appointmentId);
        this.patientName = patientName;
        this.language = language;
        this.type = 'appointment_request';
        this.relatedType = 'appointment';
    }
    
    async create() {
        const { getNoticeText } = require('../utils/i18n');
        const { title, content } = getNoticeText('appointment_request', this.language, { 
            patientName: this.patientName 
        });
        
        return {
            recipientId: this.recipientId,
            senderId: this.senderId,
            type: this.type,
            title,
            content,
            relatedId: this.relatedId,
            relatedType: this.relatedType
        };
    }
}

// Appointment Confirmed Notification
class AppointmentConfirmedNotification extends BaseNotification {
    constructor(patientId, doctorId, appointmentId, doctorName, language = 'en') {
        super(patientId, doctorId, appointmentId);
        this.doctorName = doctorName;
        this.language = language;
        this.type = 'appointment_confirmed';
        this.relatedType = 'appointment';
    }
    
    async create() {
        const { getNoticeText } = require('../utils/i18n');
        const { title, content } = getNoticeText('appointment_confirmed', this.language, { 
            doctorName: this.doctorName 
        });
        
        return {
            recipientId: this.recipientId,
            senderId: this.senderId,
            type: this.type,
            title,
            content,
            relatedId: this.relatedId,
            relatedType: this.relatedType
        };
    }
}

// Medical Record Notification
class MedicalRecordNotification extends BaseNotification {
    constructor(patientId, doctorId, recordId, doctorName, language = 'en') {
        super(patientId, doctorId, recordId);
        this.doctorName = doctorName;
        this.language = language;
        this.type = 'medical_record_added';
        this.relatedType = 'medical_record';
    }
    
    async create() {
        const { getNoticeText } = require('../utils/i18n');
        const { title, content } = getNoticeText('medical_record_added', this.language, { 
            doctorName: this.doctorName 
        });
        
        return {
            recipientId: this.recipientId,
            senderId: this.senderId,
            type: this.type,
            title,
            content,
            relatedId: this.relatedId,
            relatedType: this.relatedType
        };
    }
}

// Factory Class
class NotificationFactory {
    static createNotification(type, ...args) {
        switch(type) {
            case 'appointment_request':
                return new AppointmentRequestNotification(...args);
            case 'appointment_confirmed':
                return new AppointmentConfirmedNotification(...args);
            case 'medical_record_added':
                return new MedicalRecordNotification(...args);
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }
    
    static async sendNotification(type, ...args) {
        const notification = this.createNotification(type, ...args);
        return await notification.send();
    }
}

module.exports = {
    NotificationFactory,
    BaseNotification,
    AppointmentRequestNotification,
    AppointmentConfirmedNotification,
    MedicalRecordNotification
};