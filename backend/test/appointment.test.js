const { 
  expect, 
  testUsers, 
  connectTestDB, 
  disconnectTestDB, 
  clearTestDB, 
  createTestUser,
  setupTestEnv,
  resetTestEnv
} = require('./test-setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const app = require('../server');

describe('Appointment API Tests', () => {
  let server;
  let testAdmin, testDoctor, testPatient;
  let patientToken, doctorToken;

  before(async () => {
    setupTestEnv();
    await connectTestDB();
    server = app.listen(5003);
  });

  after(async () => {
    await disconnectTestDB();
    server.close();
    resetTestEnv();
  });

  beforeEach(async () => {
    await clearTestDB();
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);

    // Get tokens
    const patientLogin = await chai.request(server)
      .post('/api/auth/login')
      .send({ email: testUsers.patient.email, password: testUsers.patient.password });
    patientToken = patientLogin.body.token;

    const doctorLogin = await chai.request(server)
      .post('/api/auth/login')
      .send({ email: testUsers.doctor.email, password: testUsers.doctor.password });
    doctorToken = doctorLogin.body.token;
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        doctorId: testDoctor._id,
        date: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '10:00',
        symptoms: 'Headache',
        type: 'consultation'
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('appointment');
      expect(res.body.appointment).to.have.property('patient');
      expect(res.body.appointment).to.have.property('doctor');
      expect(res.body.appointment.timeSlot).to.equal('10:00');
    });

    it('should reject duplicate time slot booking', async () => {
      const appointmentData = {
        doctorId: testDoctor._id,
        date: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '10:00',
        symptoms: 'Headache'
      };

      // Create first appointment
      await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      // Try to create duplicate
      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(res).to.have.status(400);
    });

    it('should reject appointment without authentication', async () => {
      const appointmentData = {
        doctorId: testDoctor._id,
        date: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '10:00'
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .send(appointmentData);

      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/appointments/patient', () => {
    it('should get patient appointments', async () => {
      // Create appointment first
      await Appointment.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        date: new Date(),
        timeSlot: '10:00',
        status: 'pending'
      });

      const res = await chai.request(server)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe('PUT /api/appointments/:id/status', () => {
    it('should update appointment status', async () => {
      const appointment = await Appointment.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        date: new Date(),
        timeSlot: '10:00',
        status: 'pending'
      });

      const res = await chai.request(server)
        .put(`/api/appointments/${appointment._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'confirmed' });

      expect(res).to.have.status(200);
      expect(res.body.appointment.status).to.equal('confirmed');
    });
  });

  describe('PUT /api/appointments/:id/cancel', () => {
    it('should cancel appointment', async () => {
      const appointment = await Appointment.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        date: new Date(),
        timeSlot: '10:00',
        status: 'pending'
      });

      const res = await chai.request(server)
        .put(`/api/appointments/${appointment._id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ reason: 'Cannot make it' });

      expect(res).to.have.status(200);
    });
  });
});

