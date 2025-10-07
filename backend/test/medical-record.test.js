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
const MedicalRecord = require('../models/MedicalRecord');
const app = require('../server');

describe('Medical Record API Tests', () => {
  let server;
  let testDoctor, testPatient;
  let patientToken, doctorToken;

  before(async () => {
    setupTestEnv();
    await connectTestDB();
    server = app.listen(5004);
  });

  after(async () => {
    await disconnectTestDB();
    server.close();
    resetTestEnv();
  });

  beforeEach(async () => {
    await clearTestDB();
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);

    const patientLogin = await chai.request(server)
      .post('/api/auth/login')
      .send({ email: testUsers.patient.email, password: testUsers.patient.password });
    patientToken = patientLogin.body.token;

    const doctorLogin = await chai.request(server)
      .post('/api/auth/login')
      .send({ email: testUsers.doctor.email, password: testUsers.doctor.password });
    doctorToken = doctorLogin.body.token;
  });

  describe('POST /api/medical-records', () => {
    it('should create medical record by doctor', async () => {
      const recordData = {
        patientId: testPatient._id,
        symptoms: 'Fever and cough',
        diagnosis: 'Common cold',
        treatment: 'Rest and fluids',
        prescription: {
          medications: ['Paracetamol 500mg'],
          dosage: '3 times daily'
        }
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(recordData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.record).to.have.property('diagnosis', 'Common cold');
    });

    it('should reject record creation by patient', async () => {
      const recordData = {
        patientId: testPatient._id,
        symptoms: 'Fever',
        diagnosis: 'Cold',
        treatment: 'Rest'
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(recordData);

      expect(res).to.have.status(403);
    });
  });

  describe('GET /api/medical-records/patient/:patientId', () => {
    it('should get patient medical records', async () => {
      await MedicalRecord.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        symptoms: 'Test symptoms',
        diagnosis: 'Test diagnosis',
        treatment: 'Test treatment'
      });

      const res = await chai.request(server)
        .get(`/api/medical-records/patient/${testPatient._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/medical-records/:id', () => {
    it('should get specific medical record', async () => {
      const record = await MedicalRecord.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        symptoms: 'Test symptoms',
        diagnosis: 'Test diagnosis',
        treatment: 'Test treatment'
      });

      const res = await chai.request(server)
        .get(`/api/medical-records/${record._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('diagnosis', 'Test diagnosis');
    });
  });

  describe('PUT /api/medical-records/:id', () => {
    it('should update medical record', async () => {
      const record = await MedicalRecord.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        symptoms: 'Original symptoms',
        diagnosis: 'Original diagnosis',
        treatment: 'Original treatment'
      });

      const res = await chai.request(server)
        .put(`/api/medical-records/${record._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          diagnosis: 'Updated diagnosis',
          treatment: 'Updated treatment'
        });

      expect(res).to.have.status(200);
      expect(res.body.record.diagnosis).to.equal('Updated diagnosis');
    });
  });
});

