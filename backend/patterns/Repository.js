// Repository Pattern - Data Access Layer

// Base Repository
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    
    async findAll(filter = {}, options = {}) {
        const query = this.model.find(filter);
        
        if (options.populate) {
            query.populate(options.populate);
        }
        
        if (options.sort) {
            query.sort(options.sort);
        }
        
        if (options.limit) {
            query.limit(options.limit);
        }
        
        if (options.skip) {
            query.skip(options.skip);
        }
        
        if (options.select) {
            query.select(options.select);
        }
        
        return await query.exec();
    }
    
    async findById(id, options = {}) {
        const query = this.model.findById(id);
        
        if (options.populate) {
            query.populate(options.populate);
        }
        
        if (options.select) {
            query.select(options.select);
        }
        
        return await query.exec();
    }
    
    async findOne(filter, options = {}) {
        const query = this.model.findOne(filter);
        
        if (options.populate) {
            query.populate(options.populate);
        }
        
        if (options.select) {
            query.select(options.select);
        }
        
        return await query.exec();
    }
    
    async create(data) {
        const entity = new this.model(data);
        return await entity.save();
    }
    
    async update(id, data, options = {}) {
        return await this.model.findByIdAndUpdate(
            id, 
            data, 
            { new: true, ...options }
        );
    }
    
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
    
    async count(filter = {}) {
        return await this.model.countDocuments(filter);
    }
    
    async exists(filter) {
        const count = await this.count(filter);
        return count > 0;
    }
    
    async paginate(filter = {}, page = 1, limit = 10, options = {}) {
        const skip = (page - 1) * limit;
        const total = await this.count(filter);
        const data = await this.findAll(filter, { ...options, limit, skip });
        
        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        };
    }
}

// User Repository
class UserRepository extends BaseRepository {
    constructor() {
        const User = require('../models/User');
        super(User);
    }
    
    async findByEmail(email) {
        return await this.findOne({ email });
    }
    
    async findByRole(role) {
        return await this.findAll({ role });
    }
    
    async findActiveUsers() {
        return await this.findAll({ isActive: true });
    }
    
    async findDoctors() {
        return await this.findAll({ role: 'doctor', isActive: true });
    }
    
    async findDoctorsBySpecialization(specialization) {
        return await this.findAll({ 
            role: 'doctor', 
            specialization, 
            isActive: true 
        });
    }
    
    async updateLastLogin(userId) {
        return await this.update(userId, { lastLogin: new Date() });
    }
    
    async deactivateUser(userId) {
        return await this.update(userId, { isActive: false });
    }
    
    async searchUsers(searchTerm) {
        return await this.findAll({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ]
        });
    }
}

// Appointment Repository
class AppointmentRepository extends BaseRepository {
    constructor() {
        const Appointment = require('../models/Appointment');
        super(Appointment);
    }
    
    async findByPatient(patientId, options = {}) {
        return await this.findAll({ patient: patientId }, {
            populate: 'doctor patient',
            sort: { date: -1 },
            ...options
        });
    }
    
    async findByDoctor(doctorId, options = {}) {
        return await this.findAll({ doctor: doctorId }, {
            populate: 'doctor patient',
            sort: { date: 1, timeSlot: 1 },
            ...options
        });
    }
    
    async findByDateRange(startDate, endDate, filter = {}) {
        return await this.findAll({
            ...filter,
            date: { $gte: startDate, $lte: endDate }
        }, {
            populate: 'doctor patient',
            sort: { date: 1 }
        });
    }
    
    async findTodayAppointments(doctorId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return await this.findByDateRange(today, tomorrow, { doctor: doctorId });
    }
    
    async findUpcomingAppointments(userId, role) {
        const filter = role === 'doctor' 
            ? { doctor: userId }
            : { patient: userId };
            
        return await this.findAll({
            ...filter,
            date: { $gte: new Date() },
            status: { $in: ['pending', 'confirmed'] }
        }, {
            populate: 'doctor patient',
            sort: { date: 1 },
            limit: 10
        });
    }
    
    async checkTimeSlotAvailability(doctorId, date, timeSlot) {
        const exists = await this.exists({
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });
        
        return !exists;
    }
    
    async cancelAppointment(appointmentId, cancelledBy, reason) {
        return await this.update(appointmentId, {
            status: 'cancelled',
            cancelledBy,
            cancelledAt: new Date(),
            cancellationReason: reason
        });
    }
    
    async getStatistics(filter = {}) {
        const appointments = await this.findAll(filter);
        
        const stats = {
            total: appointments.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0
        };
        
        appointments.forEach(apt => {
            if (stats.hasOwnProperty(apt.status)) {
                stats[apt.status]++;
            }
        });
        
        return stats;
    }
}

// Medical Record Repository
class MedicalRecordRepository extends BaseRepository {
    constructor() {
        const MedicalRecord = require('../models/MedicalRecord');
        super(MedicalRecord);
    }
    
    async findByPatient(patientId, options = {}) {
        return await this.findAll({ patient: patientId }, {
            populate: 'doctor patient appointment',
            sort: { visitDate: -1 },
            ...options
        });
    }
    
    async findByDoctor(doctorId, options = {}) {
        return await this.findAll({ doctor: doctorId }, {
            populate: 'doctor patient appointment',
            sort: { visitDate: -1 },
            ...options
        });
    }
    
    async findByAppointment(appointmentId) {
        return await this.findOne({ appointment: appointmentId }, {
            populate: 'doctor patient'
        });
    }
    
    async searchByDiagnosis(searchTerm, filter = {}) {
        return await this.findAll({
            ...filter,
            diagnosis: { $regex: searchTerm, $options: 'i' }
        }, {
            populate: 'doctor patient'
        });
    }
    
    async getPatientHistory(patientId, limit = 10) {
        return await this.findAll({ patient: patientId }, {
            populate: 'doctor',
            sort: { visitDate: -1 },
            limit,
            select: 'visitDate diagnosis treatment doctor'
        });
    }
}

// Notice Repository
class NoticeRepository extends BaseRepository {
    constructor() {
        const Notice = require('../models/Notice');
        super(Notice);
    }
    
    async findByRecipient(recipientId, options = {}) {
        return await this.findAll({ recipientId }, {
            populate: 'senderId',
            sort: { createdAt: -1 },
            ...options
        });
    }
    
    async findUnreadByRecipient(recipientId) {
        return await this.findAll({ 
            recipientId, 
            isRead: false 
        }, {
            populate: 'senderId',
            sort: { createdAt: -1 }
        });
    }
    
    async markAsRead(noticeId) {
        return await this.update(noticeId, { isRead: true });
    }
    
    async markAllAsRead(recipientId) {
        return await this.model.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        );
    }
    
    async getUnreadCount(recipientId) {
        return await this.count({ recipientId, isRead: false });
    }
}

// Repository Factory
class RepositoryFactory {
    static repositories = new Map();
    
    static getRepository(modelName) {
        if (!this.repositories.has(modelName)) {
            switch(modelName) {
                case 'User':
                    this.repositories.set(modelName, new UserRepository());
                    break;
                case 'Appointment':
                    this.repositories.set(modelName, new AppointmentRepository());
                    break;
                case 'MedicalRecord':
                    this.repositories.set(modelName, new MedicalRecordRepository());
                    break;
                case 'Notice':
                    this.repositories.set(modelName, new NoticeRepository());
                    break;
                default:
                    throw new Error(`Unknown repository: ${modelName}`);
            }
        }
        return this.repositories.get(modelName);
    }
}

module.exports = {
    BaseRepository,
    UserRepository,
    AppointmentRepository,
    MedicalRecordRepository,
    NoticeRepository,
    RepositoryFactory
};