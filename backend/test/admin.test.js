const { 
  expect, 
  testUsers, 
  connectTestDB, 
  disconnectTestDB, 
  clearTestDB, 
  createTestUser,
  generateTestToken,
  setupTestEnv,
  resetTestEnv
} = require('./test-setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

// 导入模型和服务器
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const app = require('../server');

describe('管理员接口测试', () => {
  let server;
  let testAdmin, testDoctor, testPatient;
  let adminToken, doctorToken, patientToken;

  before(async () => {
    setupTestEnv();
    await connectTestDB();
    server = app.listen(5002);
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

    // 生成测试 token
    adminToken = generateTestToken(testAdmin);
    doctorToken = generateTestToken(testDoctor);
    patientToken = generateTestToken(testPatient);
  });

  describe('GET /api/admin/stats', () => {
    it('管理员应该能够获取系统统计信息', async () => {
      const res = await chai.request(server)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('stats');
      expect(res.body.stats).to.have.property('totalUsers');
      expect(res.body.stats).to.have.property('totalAppointments');
      expect(res.body.stats).to.have.property('totalMedicalRecords');
    });

    it('非管理员用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(403);
    });

    it('未认证用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/admin/stats');

      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/admin/users', () => {
    it('管理员应该能够获取用户列表', async () => {
      const res = await chai.request(server)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array');
      expect(res.body.users.length).to.be.at.least(3); // 至少3个测试用户
    });

    it('应该支持分页查询', async () => {
      const res = await chai.request(server)
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('currentPage', 1);
      expect(res.body.pagination).to.have.property('totalPages');
      expect(res.body.pagination).to.have.property('totalUsers');
    });

    it('应该支持角色筛选', async () => {
      const res = await chai.request(server)
        .get('/api/admin/users?role=doctor')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.users).to.be.an('array');
      res.body.users.forEach(user => {
        expect(user.role).to.equal('doctor');
      });
    });

    it('应该支持搜索功能', async () => {
      const res = await chai.request(server)
        .get('/api/admin/users?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.users).to.be.an('array');
      // 所有返回的用户名都应该包含 "Test"
      res.body.users.forEach(user => {
        expect(user.name).to.include('Test');
      });
    });
  });

  describe('POST /api/admin/users', () => {
    it('管理员应该能够创建新用户', async () => {
      const newUser = {
        name: 'New Admin User',
        email: 'newadmin@test.com',
        password: 'password123',
        role: 'admin'
      };

      const res = await chai.request(server)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('email', newUser.email);
      expect(res.body.user).to.have.property('name', newUser.name);
      expect(res.body.user).to.not.have.property('password');
    });

    it('应该拒绝创建重复邮箱的用户', async () => {
      const duplicateUser = {
        name: 'Duplicate User',
        email: testUsers.patient.email,
        password: 'password123',
        role: 'patient'
      };

      const res = await chai.request(server)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该验证必填字段', async () => {
      const invalidUser = {
        name: 'Invalid User'
        // 缺少 email, password, role
      };

      const res = await chai.request(server)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('管理员应该能够更新用户信息', async () => {
      const updateData = {
        name: 'Updated Doctor Name',
        department: '外科',
        specialization: '外科手术'
      };

      const res = await chai.request(server)
        .put(`/api/admin/users/${testDoctor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('name', updateData.name);
      expect(res.body.user).to.have.property('department', updateData.department);
    });

    it('应该拒绝更新不存在的用户', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Name'
      };

      const res = await chai.request(server)
        .put(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res).to.have.status(404);
    });
  });

  describe('PUT /api/admin/users/:id/status', () => {
    it('管理员应该能够启用/禁用用户', async () => {
      const statusData = {
        isActive: false
      };

      const res = await chai.request(server)
        .put(`/api/admin/users/${testPatient._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('isActive', false);
    });

    it('应该能够重新启用用户', async () => {
      const statusData = {
        isActive: true
      };

      const res = await chai.request(server)
        .put(`/api/admin/users/${testPatient._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.user).to.have.property('isActive', true);
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('管理员应该能够删除用户', async () => {
      const res = await chai.request(server)
        .delete(`/api/admin/users/${testPatient._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);

      // 验证用户已被删除
      const deletedUser = await User.findById(testPatient._id);
      expect(deletedUser).to.be.null;
    });

    it('应该拒绝删除不存在的用户', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await chai.request(server)
        .delete(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(404);
    });
  });

  describe('GET /api/admin/appointments', () => {
    beforeEach(async () => {
      // 创建测试预约数据
      const appointment1 = new Appointment({
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'pending'
      });
      await appointment1.save();

      const appointment2 = new Appointment({
        date: '2024-12-26',
        timeSlot: '10:00-10:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'confirmed'
      });
      await appointment2.save();
    });

    it('管理员应该能够获取预约列表', async () => {
      const res = await chai.request(server)
        .get('/api/admin/appointments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointments');
      expect(res.body.appointments).to.be.an('array');
      expect(res.body.appointments.length).to.be.at.least(2);
    });

    it('应该支持状态筛选', async () => {
      const res = await chai.request(server)
        .get('/api/admin/appointments?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.appointments).to.be.an('array');
      res.body.appointments.forEach(appointment => {
        expect(appointment.status).to.equal('pending');
      });
    });

    it('应该支持日期范围筛选', async () => {
      const res = await chai.request(server)
        .get('/api/admin/appointments?startDate=2024-12-25&endDate=2024-12-26')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.appointments).to.be.an('array');
      expect(res.body.appointments.length).to.be.at.least(2);
    });
  });

  describe('GET /api/admin/medical-records', () => {
    beforeEach(async () => {
      // 创建测试病历数据
      const record1 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗'
      });
      await record1.save();

      const record2 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-21',
        diagnosis: '高血压',
        symptoms: '头晕、头痛',
        treatment: '降压药治疗'
      });
      await record2.save();
    });

    it('管理员应该能够获取病历列表', async () => {
      const res = await chai.request(server)
        .get('/api/admin/medical-records')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('records');
      expect(res.body.records).to.be.an('array');
      expect(res.body.records.length).to.be.at.least(2);
    });

    it('应该支持搜索功能', async () => {
      const res = await chai.request(server)
        .get('/api/admin/medical-records?search=感冒')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      // 至少有一个病历包含"感冒"
      const hasColdRecord = res.body.records.some(record => 
        record.diagnosis.includes('感冒')
      );
      expect(hasColdRecord).to.be.true;
    });
  });

  describe('GET /api/admin/stats/departments', () => {
    it('管理员应该能够获取科室统计信息', async () => {
      const res = await chai.request(server)
        .get('/api/admin/stats/departments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('departmentStats');
      expect(res.body.departmentStats).to.be.an('array');
    });
  });
});
