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
   describe('Strategy Pattern', () => {
    const appointments = [
      { date: new Date('2025-10-15'), status: 'confirmed', timeSlot: '14:00' },
      { date: new Date('2025-10-10'), status: 'pending', timeSlot: '10:00' },
      { date: new Date('2025-10-20'), status: 'cancelled', timeSlot: '09:00' }
    ];

    it('should sort by date ascending', () => {
      const sorter = new AppointmentSorter(new DateSortStrategy('asc'));
      const sorted = sorter.sort(appointments);

      expect(sorted[0].date).to.deep.equal(new Date('2025-10-10'));
      expect(sorted[2].date).to.deep.equal(new Date('2025-10-20'));
    });

    it('should sort by status priority', () => {
      const sorter = new AppointmentSorter(new StatusSortStrategy());
      const sorted = sorter.sort(appointments);

      expect(sorted[0].status).to.equal('pending');
      expect(sorted[1].status).to.equal('confirmed');
    });

    it('should allow strategy switching', () => {
      const sorter = new AppointmentSorter(new DateSortStrategy('asc'));
      sorter.setStrategy(new StatusSortStrategy());
      
      const sorted = sorter.sort(appointments);
      expect(sorted[0].status).to.equal('pending');
    });
  });

  describe('Observer Pattern', () => {
    it('should notify all observers', async () => {
      const center = new NotificationCenter();
      const observer = new EmailNotificationObserver();
      
      center.attach(observer);
      
      const results = await center.notify('test_event', {
        recipientEmail: 'test@example.com',
        subject: 'Test',
        content: 'Test notification'
      });

      expect(results).to.have.lengthOf(1);
      expect(results[0].type).to.equal('email');
      expect(results[0].sent).to.be.true;
    });
    
    it('should track event history', async () => {
      const center = new NotificationCenter();
      
      await center.notify('event1', { data: 'test1' });
      await center.notify('event2', { data: 'test2' });
      
      const history = center.getEventHistory();
      expect(history).to.have.lengthOf(2);
    });
  });
});