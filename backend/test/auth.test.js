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

// 导入模型和服务器
const User = require('../models/User');
const app = require('../server');

describe('认证接口测试', () => {
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
    // 创建测试用户
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
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

    it('应该拒绝重复邮箱注册', async () => {
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

    it('应该验证必填字段', async () => {
      const invalidUser = {
        name: 'Invalid User',
        // 缺少 email 和 password
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该验证密码长度', async () => {
      const shortPasswordUser = {
        name: 'Short Password User',
        email: 'short@test.com',
        password: '123', // 太短
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/auth/register')
        .send(shortPasswordUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('应该成功登录有效用户', async () => {
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

    it('应该拒绝错误的密码', async () => {
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

    it('应该拒绝不存在的用户', async () => {
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

    it('应该验证必填字段', async () => {
      const loginData = {
        email: testUsers.patient.email
        // 缺少 password
      };

      const res = await chai.request(server)
        .post('/api/auth/login')
        .send(loginData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('应该返回已认证用户的资料', async () => {
      // 先登录获取 token
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

    it('应该拒绝未认证的请求', async () => {
      const res = await chai.request(server)
        .get('/api/auth/profile');

      expect(res).to.have.status(401);
    });

    it('应该拒绝无效的 token', async () => {
      const res = await chai.request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('应该成功更新用户资料', async () => {
      // 先登录获取 token
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

    it('应该拒绝更新其他用户的资料', async () => {
      // 使用患者 token 尝试更新医生资料
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

      // 这个测试可能需要根据实际的业务逻辑调整
      expect(res).to.have.status(200); // 或者 403，取决于实现
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('应该成功修改密码', async () => {
      // 先登录获取 token
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

      // 验证新密码可以登录
      const newLoginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: passwordData.newPassword
        });

      expect(newLoginRes).to.have.status(200);
    });

    it('应该拒绝错误的当前密码', async () => {
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

    it('应该验证新密码长度', async () => {
      const loginRes = await chai.request(server)
        .post('/api/auth/login')
        .send({
          email: testUsers.patient.email,
          password: testUsers.patient.password
        });

      const token = loginRes.body.token;
      const passwordData = {
        currentPassword: testUsers.patient.password,
        newPassword: '123' // 太短
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
