const { expect } = require('chai');
const UserFactory = require('../patterns/UserFactory');
const { AppointmentSorter, DateSortStrategy, StatusSortStrategy } = require('../patterns/SortingStrategy');
const { NotificationCenter, EmailNotificationObserver } = require('../patterns/NotificationObserver');

describe('Design Patterns Tests', () => {
  
  describe('Factory Pattern', () => {
    it('should create patient with correct defaults', () => {
      const patientData = UserFactory.createUser('patient', {
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'test123'
      });

      expect(patientData.role).to.equal('patient');
      expect(patientData.permissions).to.include('view_appointments');
      expect(patientData.medicalHistory).to.be.an('array');
    });

    it('should create doctor with correct defaults', () => {
      const doctorData = UserFactory.createUser('doctor', {
        name: 'Dr. Test',
        email: 'doctor@test.com',
        password: 'test123',
        specialization: 'Cardiology'
      });

      expect(doctorData.role).to.equal('doctor');
      expect(doctorData.permissions).to.include('manage_appointments');
      expect(doctorData.specialization).to.equal('Cardiology');
    });

    it('should validate user data', () => {
      const validation = UserFactory.validateUserData('patient', {
        name: 'Test',
        email: 'test@test.com',
        password: 'test123'
      });

      expect(validation.valid).to.be.true;
    });
  });
  
});