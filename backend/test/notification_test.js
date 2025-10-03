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
const Notice = require('../models/Notice');
const app = require('../server');

describe('Notice API Tests', () => {
  let server;
  let testPatient;
  let patientToken;

  before(async () => {
    setupTestEnv();
    await connectTestDB();
    server = app.listen(5005);
  });

  after(async () => {
    await disconnectTestDB();
    server.close();
    resetTestEnv();
  });

  beforeEach(async () => {
    await clearTestDB();
    testPatient = await createTestUser(User, testUsers.patient);

    const patientLogin = await chai.request(server)
      .post('/api/auth/login')
      .send({ email: testUsers.patient.email, password: testUsers.patient.password });
    patientToken = patientLogin.body.token;
  });

  describe('GET /api/notices', () => {
    it('should get user notices', async () => {
      await Notice.create({
        recipientId: testPatient._id,
        type: 'system_notice',
        title: 'Test Notice',
        content: 'This is a test notice'
      });

      const res = await chai.request(server)
        .get('/api/notices')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.greaterThan(0);
    });
  });

  describe('GET /api/notices/unread', () => {
    it('should get unread notices', async () => {
      await Notice.create({
        recipientId: testPatient._id,
        type: 'system_notice',
        title: 'Unread Notice',
        content: 'This notice is unread',
        isRead: false
      });

      const res = await chai.request(server)
        .get('/api/notices/unread')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /api/notices/:id/read', () => {
    it('should mark notice as read', async () => {
      const notice = await Notice.create({
        recipientId: testPatient._id,
        type: 'system_notice',
        title: 'Test Notice',
        content: 'Mark me as read',
        isRead: false
      });

      const res = await chai.request(server)
        .put(`/api/notices/${notice._id}/read`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body.notice.isRead).to.be.true;
    });
  });
  
});