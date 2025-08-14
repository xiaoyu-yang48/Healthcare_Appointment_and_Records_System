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
const Notice = require('../models/Notice');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Message = require('../models/Message');
const app = require('../server');

describe('通知功能测试', () => {
  let server;
  let testAdmin, testDoctor, testPatient;
  let adminToken, doctorToken, patientToken;

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
    // 创建测试用户
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);

    // 生成测试 token
    adminToken = generateTestToken(testAdmin);
    doctorToken = generateTestToken(testDoctor);
    patientToken = generateTestToken(testPatient);
  });

  describe('通知模型测试', () => {
    it('应该能够创建预约请求通知', async () => {
      const notice = await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );

      expect(notice).to.have.property('type', 'appointment_request');
      expect(notice).to.have.property('recipientId', testDoctor._id);
      expect(notice).to.have.property('senderId', testPatient._id);
      expect(notice).to.have.property('title', '新的预约请求');
      expect(notice.content).to.include(testPatient.name);
    });

    it('应该能够创建预约确认通知', async () => {
      const notice = await Notice.createAppointmentConfirmed(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439011',
        testDoctor.name
      );

      expect(notice).to.have.property('type', 'appointment_confirmed');
      expect(notice).to.have.property('recipientId', testPatient._id);
      expect(notice).to.have.property('senderId', testDoctor._id);
      expect(notice).to.have.property('title', '预约已确认');
      expect(notice.content).to.include(testDoctor.name);
    });

    it('应该能够创建病历添加通知', async () => {
      const notice = await Notice.createMedicalRecordAdded(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439011',
        testDoctor.name
      );

      expect(notice).to.have.property('type', 'medical_record_added');
      expect(notice).to.have.property('recipientId', testPatient._id);
      expect(notice).to.have.property('senderId', testDoctor._id);
      expect(notice).to.have.property('title', '新的病历记录');
      expect(notice.content).to.include(testDoctor.name);
    });

    it('应该能够创建新消息通知', async () => {
      const notice = await Notice.createNewMessage(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439011',
        testDoctor.name
      );

      expect(notice).to.have.property('type', 'new_message');
      expect(notice).to.have.property('recipientId', testPatient._id);
      expect(notice).to.have.property('senderId', testDoctor._id);
      expect(notice).to.have.property('title', '新消息');
      expect(notice.content).to.include(testDoctor.name);
    });
  });

  describe('GET /api/notices', () => {
    beforeEach(async () => {
      // 创建测试通知
      await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );

      await Notice.createAppointmentConfirmed(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439012',
        testDoctor.name
      );
    });

    it('用户应该能够获取自己的通知列表', async () => {
      const res = await chai.request(server)
        .get('/api/notices')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('notices');
      expect(res.body.notices).to.be.an('array');
      expect(res.body.notices.length).to.be.at.least(1);
    });

    it('应该支持分页查询', async () => {
      const res = await chai.request(server)
        .get('/api/notices?page=1&limit=1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('currentPage', 1);
      expect(res.body.pagination).to.have.property('totalPages');
      expect(res.body.pagination).to.have.property('totalNotices');
    });

    it('应该支持只查询未读通知', async () => {
      const res = await chai.request(server)
        .get('/api/notices?unreadOnly=true')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body.notices).to.be.an('array');
      res.body.notices.forEach(notice => {
        expect(notice.isRead).to.be.false;
      });
    });

    it('应该返回未读通知数量', async () => {
      const res = await chai.request(server)
        .get('/api/notices')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('unreadCount');
      expect(res.body.unreadCount).to.be.a('number');
    });
  });

  describe('PUT /api/notices/:noticeId/read', () => {
    let testNotice;

    beforeEach(async () => {
      testNotice = await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );
    });

    it('用户应该能够标记通知为已读', async () => {
      const res = await chai.request(server)
        .put(`/api/notices/${testNotice._id}/read`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.notice).to.have.property('isRead', true);
    });

    it('应该拒绝标记其他用户的通知为已读', async () => {
      const res = await chai.request(server)
        .put(`/api/notices/${testNotice._id}/read`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(404);
    });

    it('应该拒绝标记不存在的通知为已读', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await chai.request(server)
        .put(`/api/notices/${fakeId}/read`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(404);
    });
  });

  describe('PUT /api/notices/mark-all-read', () => {
    beforeEach(async () => {
      // 创建多个未读通知
      await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );

      await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439012',
        testPatient.name
      );
    });

    it('用户应该能够标记所有通知为已读', async () => {
      const res = await chai.request(server)
        .put('/api/notices/mark-all-read')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('已标记');
    });
  });

  describe('DELETE /api/notices/:noticeId', () => {
    let testNotice;

    beforeEach(async () => {
      testNotice = await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );
    });

    it('用户应该能够删除自己的通知', async () => {
      const res = await chai.request(server)
        .delete(`/api/notices/${testNotice._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.equal('通知已删除');
    });

    it('应该拒绝删除其他用户的通知', async () => {
      const res = await chai.request(server)
        .delete(`/api/notices/${testNotice._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(404);
    });
  });

  describe('GET /api/notices/unread-count', () => {
    beforeEach(async () => {
      // 创建未读通知
      await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );

      // 创建已读通知
      const readNotice = await Notice.createAppointmentConfirmed(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439012',
        testDoctor.name
      );
      readNotice.isRead = true;
      await readNotice.save();
    });

    it('应该返回正确的未读通知数量', async () => {
      const res = await chai.request(server)
        .get('/api/notices/unread-count')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('unreadCount', 1);
    });
  });

  describe('管理员通知管理', () => {
    beforeEach(async () => {
      // 创建测试通知
      await Notice.createAppointmentRequest(
        testDoctor._id,
        testPatient._id,
        '507f1f77bcf86cd799439011',
        testPatient.name
      );

      await Notice.createAppointmentConfirmed(
        testPatient._id,
        testDoctor._id,
        '507f1f77bcf86cd799439012',
        testDoctor.name
      );
    });

    it('管理员应该能够获取所有通知', async () => {
      const res = await chai.request(server)
        .get('/api/notices/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('notices');
      expect(res.body.notices).to.be.an('array');
      expect(res.body.notices.length).to.be.at.least(2);
    });

    it('管理员应该能够删除通知', async () => {
      const notices = await Notice.find();
      const noticeId = notices[0]._id;

      const res = await chai.request(server)
        .delete(`/api/notices/admin/${noticeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.equal('通知已删除');
    });

    it('管理员应该能够发送系统通知', async () => {
      const systemNotice = {
        recipientIds: [testPatient._id, testDoctor._id],
        title: '系统维护通知',
        content: '系统将于今晚进行维护，请提前做好准备。'
      };

      const res = await chai.request(server)
        .post('/api/notices/admin/send-system')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(systemNotice);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.message).to.include('已向');
      expect(res.body).to.have.property('notices');
      expect(res.body.notices.length).to.equal(2);
    });

    it('非管理员用户应该被拒绝访问管理员功能', async () => {
      const res = await chai.request(server)
        .get('/api/notices/admin/all')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(403);
    });
  });

  describe('通知集成测试', () => {
    it('创建预约时应该自动创建通知', async () => {
      // 创建预约
      const appointmentData = {
        doctorId: testDoctor._id,
        date: '2024-12-25',
        timeSlot: '09:00-09:30'
      };

      const res = await chai.request(server)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(res).to.have.status(201);

      // 检查是否创建了通知
      const notices = await Notice.find({ recipientId: testDoctor._id });
      expect(notices.length).to.be.at.least(1);
      expect(notices[0]).to.have.property('type', 'appointment_request');
    });

    it('确认预约时应该创建确认通知', async () => {
      // 先创建预约
      const appointment = new Appointment({
        patient: testPatient._id,
        doctor: testDoctor._id,
        date: '2024-12-25',
        timeSlot: '09:00-09:30',
        status: 'pending'
      });
      await appointment.save();

      // 确认预约
      const res = await chai.request(server)
        .put(`/api/appointments/${appointment._id}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'confirmed' });

      expect(res).to.have.status(200);

      // 检查是否创建了确认通知
      const notices = await Notice.find({ recipientId: testPatient._id });
      expect(notices.length).to.be.at.least(1);
      expect(notices[0]).to.have.property('type', 'appointment_confirmed');
    });

    it('创建病历时应该创建通知', async () => {
      // 创建病历
      const recordData = {
        patientId: testPatient._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗'
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(recordData);

      expect(res).to.have.status(201);

      // 检查是否创建了通知
      const notices = await Notice.find({ recipientId: testPatient._id });
      expect(notices.length).to.be.at.least(1);
      expect(notices[0]).to.have.property('type', 'medical_record_added');
    });

    it('发送消息时应该创建通知', async () => {
      // 发送消息
      const messageData = {
        recipientId: testPatient._id,
        content: '测试消息'
      };

      const res = await chai.request(server)
        .post('/api/messages')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(messageData);

      expect(res).to.have.status(201);

      // 检查是否创建了通知
      const notices = await Notice.find({ recipientId: testPatient._id });
      expect(notices.length).to.be.at.least(1);
      expect(notices[0]).to.have.property('type', 'new_message');
    });
  });
});
