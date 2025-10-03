const UserModel = require('./User');
const AppointmentModel = require('./Appointment');
const MedicalRecordModel = require('./MedicalRecord');
const DoctorScheduleModel = require('./DoctorSchedule');
const Notice = require('./Notice');
const MedicalRecord = require('./MedicalRecord');

// Abrstract class user (abstraction and encapsulation)
class User{
    #id;
    #name;
    #email;

    constructor(userDoc){
        if(new.target === User){
            throw new Error("Cannot instantiate abstract class User directly");
        }
        this.#id = userDoc && userDoc._id;
        this.#name = userDoc && userDoc.name;
        this.#email = userDoc && userDoc.email;
    }

    getId(){
        return this.#id;
    }
    getName(){
        return this.#name;
    }
    getEmail(){
        return this.#email;
    }

    displayName(){
        return this.#name || this.#email || 'Unknown User';
    }

    can(_action){
        throw new Error("Method 'can' must be implemented in subclass");
    }

    static async fromUserId(userId){
        const doc = await UserModel.findById(userId);
        if(!doc){
            throw new Error("User not found");
        }
        return User.fromUserDoc(doc);
    }

    static fromUserDoc(doc){
        switch(doc.role){
            case 'doctor':
                return new Doctor(doc);
            case 'admin':
                return new Admin(doc);
            default:
                return new Patient(doc);
        }
    }
}

// Patient class extends User (inheritance and Polymorphism)
class Patient extends User{
    can(action){
        const allowed = new Set(['view_self_records', 'request_appointment', 'message_doctor']);
        return allowed.has(action);
    }

    async getAppointments(filter = {}){
        const docs = await AppointmentModel.find({patientId: this.getId(), ...filter});
        return docs.map((d) => Appointment.fromDoc(d));
    }

    async getMedicalRecords(filter = {}){
        const docs = await MedicalRecordModel.find({patientId: this.getId(), ...filter});
        return docs.map((d) => MedicalRecord.fromDoc(d));
    }
}

// Doctor class extends User (inheritance and Polymorphism)
class Doctor extends User{
    #speciality;
    #schedule;

    constructor(userDoc){
        super(userDoc);
        this.#speciality = userDoc && (userDoc.specialization || userDoc.specialization) || null;
        this.#schedule = null; // Lazy load schedule
    }

    getSpeciality(){return this.#speciality;}
    async getSchedule(){ return this.#schedule || (this.#schedule = await DoctorScheduleModel.findOne({doctorId: this.getId()})); }
    can(action){
        const allowed = new Set(['view_assigned_records', 'manage_appointments', 'write_records', 'message_patient']);
        return allowed.has(action);
    }

    async loadScheduleFor(date){
        const doc = await DoctorScheduleModel.findOne({doctor: this.getId(), date: date});
        this.#schedule = doc? {date: doc.date, timeSlots: doc.timeSlots} : null;
        return this.#schedule;
    }

    async getAppointments(filter = {}){
        const docs = await AppointmentModel.find({doctorId: this.getId(), ...filter});
        return docs.map((d) => Appointment.fromDoc(d));
    }

    async createMedicalRecords(patientId, payload){
        if(!this.can('write_records')){
            throw new Error("Permission denied");
        }
        const record = await MedicalRecordModel.create({
            patientId,
            doctorId: this.getId()
        })
    }

    async appendRecordAttachment(recordId, attachment){
        if(!this.can('write_records')){
            throw new Error("Permission denied");
        }
        const record = await MedicalRecordModel.findById(recordId);
        if(!record){
            throw new Error("Medical record not found");
        }
        if(record.doctorId.toString() !== this.getId().toString()){
            throw new Error("Cannot modify records not created by you");
        }
        MedicalRecord.validateAttachment(attachment);
        record.attachments = Array.isArray(record.attachments) ? record.attachments : [];
        record.attachments.push({
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileType: attachment.fileType,
            uploadedAt: new Date()
        });
        await record.save();
        return MedicalRecord.fromDoc(record);
    }
}

// Admin class extends User (inheritance and Polymorphism)
class Admin extends User{
    can(action){
        return true; // Admin can do everything
    }
}

//Appointment class (abstraction and encapsulation)
class Appointment{
    #doc;
    #status;

    constructor(doc){
        this.#doc = doc;
        this.#status = doc && doc.status;
    }

    static fromDoc(doc){return new Appointment(doc);}

    get id(){return this.#doc && this.#doc._id;}
    get status(){return this.#status;}
    get doc(){return this.#doc;}

    static async book(patient, doctor, date, timeSlot){
        const creatd = await AppointmentModel.create({
            patient: patient.getId(),
            doctor: doctor.getId(),
            date,
            timeSlot,
            status: 'pending',
            type: 'consultation'
        });
        await Notice.createAppointmentRequest(doctor.getId(), patient.getId(), creatd._id, patient.displayName(), 'en');

        return Appointment.fromDoc(creatd);
    }

    async cancel(byUser, reason){
        if(this.#status === 'cancelled' || this.#status === 'completed'){
            throw new Error("Cannot cancel an already cancelled or completed appointment");
        }

        this.#doc.status = 'cancelled';
        this.#doc.cancellationReason = reason || 'No reason provided';
        this.#doc.cancelledBy = byUser.getId();
        this.#doc.cancelledAt = new Date();
        await this.#doc.save();
        this.#status = this.#doc.status;

        // Notify the other party
        const isPatient = byUser instanceof Patient;
        const recipientId = isPatient ? this.#doc.doctor : this.#doc.patient;
        await Notice.createAppointmentCancellation(recipientId, byUser.getId(), this.id, byUser.displayName(), 'en');
        return this;
    }

    async complete(){
        if(this.#status === 'cancelled') throw new Error("Cannot complete a cancelled appointment");
        if(this.#status === 'completed') throw new Error("Appointment already completed");
        this.#doc.status = 'completed';
        await this.#doc.save();
        this.#status = this.#doc.status;
        return this;
    }
}

//medical record class (encapsulation)
class MedicalRecord{
    #doc;
    #diagnosis;
    #treatment;
    #attachments;

    constructor(doc){
        this.#doc = doc;
        this.#diagnosis = doc && doc.diagnosis;
        this.#treatment = doc && doc.treatment;
        this.#attachments = (doc && doc.attachments) || [];
    }

    static fromDoc(doc){return new MedicalRecord(doc);}

    get id(){return this.#doc && this.#doc._id;}
    get diagnosis(){return this.#diagnosis;}
    get treatment(){return this.#treatment;}
    get attachments(){return this.#attachments;}
    get doc(){return this.#doc;}

    static validateAttachment(attachment){
        if(!attachment || !attachment.fileName || !attachment.filePath || !attachment.fileType){
            throw new Error("Invalid attachment format");
        }
    }
    \
    static async createByDoctor(doctor, patient, payload){
        if(!doctor instanceof Doctor){
            throw new Error("Only doctors can create medical records");
        }
        const created = await MedicalRecordModel.create({
            patientId: patient.getId(),
            doctorId: doctor.getId()
        });
        return MedicalRecord.fromDoc(created);
    }

    async appendAttachmentByDoctor(doctor, attachment){
        if(!doctor instanceof Doctor){
            throw new Error("Only doctors can append attachments");
        }
        if(this.#doc.doctorId.toString() !== doctor.getId().toString()){
            throw new Error("Cannot modify records not created by you");
        }
        MedicalRecord.validateAttachment(attachment);
        this.#doc.attachments = Array.isArray(this.#doc.attachments) ? this.#doc.attachments : [];
        this.#doc.attachments.push({
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileType: attachment.fileType,
            uploadedAt: new Date()
        });
        await this.#doc.save();
        this.#attachments = this.#doc.attachments;
        return this;
    }
}

module.exports = {User, Patient, Doctor, Admin, Appointment, MedicalRecord};

