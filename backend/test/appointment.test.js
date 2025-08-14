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
const DoctorSchedule = require('../models/DoctorSchedule');
const app = require('../server');

describe('预约接口测试', () => {
  let server;
  let testAdmin, testDoctor, testPatient;
  let adminToken, doctorToken, patientToken;

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
    // 创建测试用户
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);

    // 生成测试 token
    adminToken = generateTestToken(testAdmin);
    doctorToken = generateTestToken(testDoctor);
    patientToken = generateTestToken(testPatient);

    // 创建医生排班
    const schedule = new DoctorSchedule({
      doctorId: testDoctor._id,
      date: '2024-12-25',
      timeSlots: ['09:00-09:30', '10:00-10:30', '14:00-14:30'],
      isAvailable: true
    });
    await schedule.save();
  });

  describe('GET /api/appointments/patient', () => {
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

    it('患者应该能够获取自己的预约列表', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointments');
      expect(res.body.appointments).to.be.an('array');
      expect(res.body.appointments.length).to.be.at.least(2);
    });

    it('非患者用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(403);
    });

    it('应该支持状态筛选', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/patient?status=pending')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body.appointments).to.be.an('array');
      res.body.appointments.forEach(appointment => {
        expect(appointment.status).to.equal('pending');
      });
    });

    it('应该支持分页查询', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/patient?page=1&limit=1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('currentPage', 1);
      expect(res.body.pagination).to.have.property('totalPages');
      expect(res.body.pagination).to.have.property('totalAppointments');
    });
  });

  describe('GET /api/appointments/doctor', () => {
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

    it('医生应该能够获取自己的预约列表', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointments');
      expect(res.body.appointments).to.be.an('array');
      expect(res.body.appointments.length).to.be.at.least(2);
    });

    it('非医生用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/doctor')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(403);
    });

    it('应该支持日期筛选', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/doctor?date=2024-12-25')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.appointments).to.be.an('array');
      res.body.appointments.forEach(appointment => {
        expect(appointment.date).to.equal('2024-12-25');
      });
    });
  });

  describe('GET /api/appointments/doctor/today', () => {
    beforeEach(async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // 创建今天的预约
      const todayAppointment = new Appointment({
        date: today,
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'confirmed'
      });
      await todayAppointment.save();

      // 创建明天的预约
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const tomorrowAppointment = new Appointment({
        date: tomorrowStr,
        timeSlot: '10:00-10:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'confirmed'
      });
      await tomorrowAppointment.save();
    });

    it('医生应该能够获取今天的预约', async () => {
      const res = await chai.request(server)
        .get('/api/appointments/doctor/today')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointments');
      expect(res.body.appointments).to.be.an('array');
      // 应该至少有一个今天的预约
      expect(res.body.appointments.length).to.be.at.least(1);
    });
  });

  describe('POST /api/appointments', () => {
    it('患者应该能够创建预约', async () => {
      const appointmentData = {
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointment');
      expect(res.body.appointment).to.have.property('date', appointmentData.date);
      expect(res.body.appointment).to.have.property('timeSlot', appointmentData.timeSlot);
      expect(res.body.appointment).to.have.property('doctorId', testDoctor._id.toString());
      expect(res.body.appointment).to.have.property('patientId', testPatient._id.toString());
      expect(res.body.appointment).to.have.property('status', 'pending');
    });

    it('非患者用户应该被拒绝创建预约', async () => {
      const appointmentData = {
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(appointmentData);

      expect(res).to.have.status(403);
    });

    it('应该验证必填字段', async () => {
      const invalidAppointment = {
        date: '2024-12-25'
        // 缺少 timeSlot 和 doctorId
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(invalidAppointment);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该拒绝重复时间段的预约', async () => {
      // 先创建一个预约
      const appointment1 = new Appointment({
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'pending'
      });
      await appointment1.save();

      // 尝试创建相同时间段的预约
      const duplicateAppointment = {
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(duplicateAppointment);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该拒绝医生不排班的时间段', async () => {
      const unavailableSlot = {
        date: '2024-12-25',
        timeSlot: '11:00-11:30', // 医生没有排班的时间段
        doctorId: testDoctor._id
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(unavailableSlot);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('PUT /api/appointments/:id/status', () => {
    let testAppointment;

    beforeEach(async () => {
      testAppointment = new Appointment({
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'pending'
      });
      await testAppointment.save();
    });

    it('医生应该能够更新预约状态', async () => {
      const statusData = {
        status: 'confirmed'
      };

      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(statusData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.appointment).to.have.property('status', 'confirmed');
    });

    it('非医生用户应该被拒绝更新预约状态', async () => {
      const statusData = {
        status: 'confirmed'
      };

      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/status`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(statusData);

      expect(res).to.have.status(403);
    });

    it('应该拒绝无效的状态值', async () => {
      const statusData = {
        status: 'invalid_status'
      };

      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(statusData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该拒绝更新不存在的预约', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const statusData = {
        status: 'confirmed'
      };

      const res = await chai.request(server)
        .put(`/api/appointments/${fakeId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(statusData);

      expect(res).to.have.status(404);
    });
  });

  describe('PUT /api/appointments/:id/cancel', () => {
    let testAppointment;

    beforeEach(async () => {
      testAppointment = new Appointment({
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'confirmed'
      });
      await testAppointment.save();
    });

    it('患者应该能够取消自己的预约', async () => {
      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.appointment).to.have.property('status', 'cancelled');
    });

    it('医生应该能够取消预约', async () => {
      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/cancel`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.appointment).to.have.property('status', 'cancelled');
    });

    it('应该拒绝取消已取消的预约', async () => {
      // 先取消预约
      testAppointment.status = 'cancelled';
      await testAppointment.save();

      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该拒绝取消已完成的预约', async () => {
      // 设置预约为已完成
      testAppointment.status = 'completed';
      await testAppointment.save();

      const res = await chai.request(server)
        .put(`/api/appointments/${testAppointment._id}/cancel`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/appointments/:id', () => {
    let testAppointment;

    beforeEach(async () => {
      testAppointment = new Appointment({
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        doctorId: testDoctor._id,
        patientId: testPatient._id,
        status: 'confirmed'
      });
      await testAppointment.save();
    });

    it('患者应该能够获取自己的预约详情', async () => {
      const res = await chai.request(server)
        .get(`/api/appointments/${testAppointment._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointment');
      expect(res.body.appointment).to.have.property('_id', testAppointment._id.toString());
    });

    it('医生应该能够获取预约详情', async () => {
      const res = await chai.request(server)
        .get(`/api/appointments/${testAppointment._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('appointment');
    });

    it('应该拒绝获取不存在的预约', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await chai.request(server)
        .get(`/api/appointments/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(404);
    });

    it('未认证用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get(`/api/appointments/${testAppointment._id}`);

      expect(res).to.have.status(401);
    });
  });
});
