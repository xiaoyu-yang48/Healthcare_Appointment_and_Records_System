const UserModel = require('./User');
const AppointmentModel = require('./Appointment');
const MedicalRecordModel = require('./MedicalRecord');
const DoctorScheduleModel = require('./DoctorSchedule');
const Notice = require('./Notice');

// A: Abstract class User (Abstraction + Encapsulation)
class User {
  #id;
  #name;
  #email;

  constructor(userDoc) {
    if (new.target === User) {
      throw new Error('User is abstract and cannot be instantiated directly');
    }
    this.#id = userDoc && userDoc._id;
    this.#name = userDoc && userDoc.name;
    this.#email = userDoc && userDoc.email;
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get email() { return this.#email; }

  displayName() {
    return this.#name || this.#email || 'Unknown';
  }

  can(_action) { // intended to be overridden (Polymorphism)
    throw new Error('can(action) must be implemented by subclass');
  }

  static async fromUserId(userId) {
    const doc = await UserModel.findById(userId);
    if (!doc) throw new Error('User not found');
    return User.fromUserDoc(doc);
  }

  static fromUserDoc(doc) {
    switch (doc.role) {
      case 'doctor':
        return new Doctor(doc);
      default:
        return new Patient(doc);
    }
  }
}

// B: Patient extends User (Inheritance + Polymorphism)
class Patient extends User {
  can(action) {
    const allowed = new Set(['view_self_records', 'request_appointment', 'message_doctor']);
    return allowed.has(action);
  }

  async getAppointments(filter = {}) {
    const docs = await AppointmentModel.find(Object.assign({ patient: this.id }, filter)).sort({ date: -1 });
    return docs.map((d) => Appointment.fromDoc(d));
  }

  async getMedicalRecords(filter = {}) {
    const docs = await MedicalRecordModel.find(Object.assign({ patient: this.id }, filter)).sort({ visitDate: -1 });
    return docs.map((d) => MedicalRecord.fromDoc(d));
  }
}

// C: Doctor extends User (Inheritance + Polymorphism + Encapsulation)
class Doctor extends User {
  #specialty;
  #schedule;

  constructor(userDoc) {
    super(userDoc);
    this.#specialty = userDoc && (userDoc.specialization || userDoc.specialty) || null;
    this.#schedule = null; // value object/aggregation
  }

  get specialty() { return this.#specialty; }
  get schedule() { return this.#schedule; }

  can(action) {
    const allowed = new Set(['manage_appointments', 'view_assigned_records', 'write_records', 'message_patient']);
    return allowed.has(action);
  }

  async loadScheduleFor(date) {
    const doc = await DoctorScheduleModel.findOne({ doctor: this.id, date });
    this.#schedule = doc ? { date: doc.date, timeSlots: doc.timeSlots, isWorkingDay: doc.isWorkingDay } : null;
    return this.#schedule;
  }

  async getAppointments(filter = {}) {
    const docs = await AppointmentModel.find(Object.assign({ doctor: this.id }, filter)).sort({ date: -1 });
    return docs.map((d) => Appointment.fromDoc(d));
  }

  async createMedicalRecord(patientId, payload) {
    if (!this.can('write_records')) throw new Error('Doctor not permitted to write records');
    const record = await MedicalRecordModel.create(Object.assign({}, payload, { patient: patientId, doctor: this.id }));
    return MedicalRecord.fromDoc(record);
  }

  async appendRecordAttachment(recordId, attachment) {
    if (!this.can('write_records')) throw new Error('Doctor not permitted to write records');
    const record = await MedicalRecordModel.findById(recordId);
    if (!record) throw new Error('Record not found');
    if (String(record.doctor) !== String(this.id)) throw new Error('Only assigned doctor can modify this record');
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

// D: Appointment (Encapsulation + Abstraction)
class Appointment {
  #doc;
  #status;

  constructor(doc) {
    this.#doc = doc;
    this.#status = doc && doc.status;
  }

  static fromDoc(doc) { return new Appointment(doc); }
  get id() { return this.#doc && this.#doc._id; }
  get status() { return this.#status; }
  get doc() { return this.#doc; }

  static async book(patient, doctor, date, timeSlot) {
    const created = await AppointmentModel.create({
      patient: patient.id,
      doctor: doctor.id,
      date,
      timeSlot,
      status: 'pending',
      type: 'consultation'
    });
    await Notice.createAppointmentRequest(doctor.id, patient.id, created._id, patient.displayName(), 'en');
    return Appointment.fromDoc(created);
  }

  async cancel(byUser, reason) {
    if (this.#status === 'completed') throw new Error('Cannot cancel a completed appointment');
    this.#doc.status = 'cancelled';
    this.#doc.cancellationReason = reason || 'cancelled';
    this.#doc.cancelledBy = byUser.id;
    this.#doc.cancelledAt = new Date();
    await this.#doc.save();
    this.#status = this.#doc.status;

    // notify counterpart
    const isPatient = byUser instanceof Patient;
    const recipientId = isPatient ? this.#doc.doctor : this.#doc.patient;
    await Notice.createAppointmentCancelled(recipientId, byUser.id, this.id, byUser.displayName(), 'en');
    return this;
  }

  async complete() {
    if (this.#status === 'cancelled') throw new Error('Cannot complete a cancelled appointment');
    this.#doc.status = 'completed';
    await this.#doc.save();
    this.#status = this.#doc.status;
    return this;
  }
}

// E: MedicalRecord (Encapsulation)
class MedicalRecord {
  #doc;
  #diagnosis;
  #treatment;
  #attachments;

  constructor(doc) {
    this.#doc = doc;
    this.#diagnosis = doc && doc.diagnosis;
    this.#treatment = doc && doc.treatment;
    this.#attachments = (doc && doc.attachments) || [];
  }

  static fromDoc(doc) { return new MedicalRecord(doc); }
  get id() { return this.#doc && this.#doc._id; }
  get diagnosis() { return this.#diagnosis; }
  get treatment() { return this.#treatment; }
  get attachments() { return [...this.#attachments]; }
  get doc() { return this.#doc; }

  static validateAttachment(att) {
    if (!att || !att.fileName || !att.filePath || !att.fileType) {
      throw new Error('Invalid attachment');
    }
  }

  static async createByDoctor(doctor, patientId, payload) {
    if (!(doctor instanceof Doctor)) throw new Error('Only doctor can create medical record');
    const created = await MedicalRecordModel.create(Object.assign({}, payload, { patient: patientId, doctor: doctor.id }));
    return MedicalRecord.fromDoc(created);
  }

  async appendAttachmentByDoctor(doctor, attachment) {
    if (!(doctor instanceof Doctor)) throw new Error('Only doctor can modify medical record');
    if (String(this.#doc.doctor) !== String(doctor.id)) throw new Error('Only assigned doctor can modify this record');
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

module.exports = {
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord
};

