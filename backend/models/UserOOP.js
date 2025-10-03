const User = require('./User');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');

// Abstract base for user roles (Abstraction)
class AbstractUserRole {
  constructor(userDoc) {
    if (new.target === AbstractUserRole) {
      throw new Error('AbstractUserRole cannot be instantiated directly');
    }
    this.userDoc = userDoc;
  }

  getId() {
    return this.userDoc && this.userDoc._id;
  }

  getEmail() {
    return this.userDoc && this.userDoc.email;
  }

  getRole() {
    return this.userDoc && this.userDoc.role;
  }

  // abstract-like methods to be overridden by subclasses (Abstraction)
  getPermissions() {
    throw new Error('getPermissions must be implemented by subclass');
  }

  canViewRecord(recordDoc) {
    throw new Error('canViewRecord must be implemented by subclass');
  }

  canMessage(targetUserDoc) {
    throw new Error('canMessage must be implemented by subclass');
  }
}

// Patient role (Inheritance + Polymorphism)
class PatientRole extends AbstractUserRole {
  getPermissions() {
    return ['view_self_records', 'request_appointment', 'message_doctor'];
  }

  canViewRecord(recordDoc) {
    if (!recordDoc) return false;
    return String(recordDoc.patient) === String(this.getId());
  }

  canMessage(targetUserDoc) {
    if (!targetUserDoc) return false;
    return targetUserDoc.role === 'doctor' || targetUserDoc.role === 'admin';
  }
}

// Doctor role (Inheritance + Polymorphism)
class DoctorRole extends AbstractUserRole {
  getPermissions() {
    return ['manage_appointments', 'view_assigned_records', 'write_records', 'message_patient'];
  }

  canViewRecord(recordDoc) {
    if (!recordDoc) return false;
    return String(recordDoc.doctor) === String(this.getId());
  }

  canMessage(targetUserDoc) {
    if (!targetUserDoc) return false;
    return targetUserDoc.role === 'patient' || targetUserDoc.role === 'admin';
  }
}

// Encapsulated access policy using private state (Encapsulation)
const _policyState = new WeakMap();
class RecordAccessPolicy {
  constructor(userRole) {
    _policyState.set(this, { userRole });
  }

  getUserRole() {
    return _policyState.get(this).userRole;
  }

  canAccessRecord(recordDoc) {
    const role = this.getUserRole();
    return role.canViewRecord(recordDoc);
  }

  assertCanAccessRecord(recordDoc) {
    if (!this.canAccessRecord(recordDoc)) {
      throw new Error('Access denied to medical record');
    }
  }
}

// Coordinator encapsulates appointment workflows and leverages role polymorphism (Encapsulation + Polymorphism)
const _coordState = new WeakMap();
class AppointmentCoordinator {
  constructor() {
    _coordState.set(this, { createdBy: 'system' });
  }

  getCreatedBy() {
    return _coordState.get(this).createdBy;
  }

  // Returns boolean eligibility using role polymorphism
  canSchedule(patientRole, doctorRole) {
    const patientPerms = patientRole.getPermissions();
    const doctorPerms = doctorRole.getPermissions();
    return patientPerms.includes('request_appointment') && doctorPerms.includes('manage_appointments');
  }

  // Minimal integration with Mongoose models; no side effects unless invoked
  async createAppointment(patientRole, doctorRole, date, timeSlot) {
    if (!this.canSchedule(patientRole, doctorRole)) {
      throw new Error('Either patient or doctor role does not allow scheduling');
    }
    return Appointment.create({
      patient: patientRole.getId(),
      doctor: doctorRole.getId(),
      date,
      timeSlot,
      status: 'pending',
      type: 'consultation'
    });
  }

  async addDoctorNote(doctorRole, recordId, note) {
    const record = await MedicalRecord.findById(recordId);
    if (!record) throw new Error('Record not found');
    const policy = new RecordAccessPolicy(doctorRole);
    policy.assertCanAccessRecord(record);
    record.notes = [record.notes, note].filter(Boolean).join('\n');
    return record.save();
  }
}

function createUserRoleFor(userOrId) {
  if (typeof userOrId === 'object' && userOrId._id) {
    const userDoc = userOrId;
    if (userDoc.role === 'doctor') return new DoctorRole(userDoc);
    return new PatientRole(userDoc);
  }
  return User.findById(userOrId).then((doc) => {
    if (!doc) throw new Error('User not found');
    if (doc.role === 'doctor') return new DoctorRole(doc);
    return new PatientRole(doc);
  });
}

module.exports = {
  AbstractUserRole,
  PatientRole,
  DoctorRole,
  RecordAccessPolicy,
  AppointmentCoordinator,
  createUserRoleFor
};

