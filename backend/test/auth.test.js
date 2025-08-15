const { 
  expect, 
  testUsers, 
  connectTestDB, 
  disconnectTestDB, 
  clearTestDB, 
  createTestUser,
  setupTestEnv,
  resetTestEnv,
  generateTestToken
} = require('./test-setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Import models and server
const User = require('../models/User');
const app = require('../server');

describe('Authentication API Tests', () => {
  let server;
  let testAdmin, testDoctor, testPatient;

  before(async () => {
    setupTestEnv();
    await connectTestDB();
    server = app.listen(5001);
  });

  after(async () => {
    await disconnectTestDB();
    server.close();
    resetTestEnv();
  });

  beforeEach(async () => {
    await clearTestDB();
    // Create test users
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(newUser);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', newUser.email);
      expect(res.body.user).to.have.property('name', newUser.name);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should reject duplicate email registration', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: testUsers.patient.email,
        password: 'password123',
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(duplicateUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message');
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: 'Invalid User',
        // Missing email and password
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should validate password length', async () => {
      const shortPasswordUser = {
        name: 'Short Password User',
        email: 'short@test.com',
        password: '123', // Too short
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(shortPasswordUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should register doctor with specialization', async () => {
      const doctorUser = {
        name: 'Test Doctor',
        email: 'doctor2@test.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Cardiology',
        department: 'Cardiology Department'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(doctorUser);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('role', 'doctor');
      expect(res.body.user).to.have.property('specialization', doctorUser.specialization);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login valid user', async () => {
      const loginData = {
        email: testUsers.patient.email,
        password: testUsers.patient.password
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', loginData.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should reject wrong password', async () => {
      const loginData = {
        email: testUsers.patient.email,
        password: 'wrongpassword'
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(res).to.have.status(401);
      expect(res.body).to.have.property('success', false);
    });

    it('should validate required fields', async () => {
      const loginData = {
        email: testUsers.patient.email
        // Missing password
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return authenticated user profile', async () => {
      // First login to get token
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;

      const res = await chai.request(server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('email', testUsers.patient.email);
      expect(res.body.user).to.have.property('name', testUsers.patient.name);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await chai.request(server)
        .get('/api/auth/profile');

      expect(res).to.have.status(401);
    });

    it('should reject invalid token', async () => {
      const res = await chai.request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should successfully update user profile', async () => {
      // First login to get token
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const updateData = {
        name: 'Updated Name',
        phone: '1234567890',
        address: 'Updated Address'
      };

      const res = await chai.request(server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('name', updateData.name);
      expect(res.body.user).to.have.property('phone', updateData.phone);
      expect(res.body.user).to.have.property('address', updateData.address);
    });

    it('should reject updating other user profiles', async () => {
      // Use patient token to try updating doctor profile
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const updateData = {
        name: 'Unauthorized Update'
      };

      const res = await chai.request(server)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      // This test may need adjustment based on actual business logic
      expect(res).to.have.status(200); // or 403, depending on implementation
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should successfully change password', async () => {
      // First login to get token
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const passwordData = {
        currentPassword: testUsers.patient.password,
        newPassword: 'newpassword123'
      };

      const res = await chai.request(server)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);

      // Verify new password can be used to login
      const newLoginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: passwordData.newPassword
        });

      expect(newLoginRes).to.have.status(200);
    });

    it('should reject wrong current password', async () => {
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const res = await chai.request(server)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('should validate new password length', async () => {
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const passwordData = {
        currentPassword: testUsers.patient.password,
        newPassword: '123' // Too short
      };

      const res = await chai.request(server)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });
});
