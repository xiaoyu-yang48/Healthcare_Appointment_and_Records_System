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
const MedicalRecord = require('../models/MedicalRecord');
const app = require('../server');

describe('病历接口测试', () => {
  let server;
  let testAdmin, testDoctor, testPatient;
  let adminToken, doctorToken, patientToken;

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
    // 创建测试用户
    testAdmin = await createTestUser(User, testUsers.admin);
    testDoctor = await createTestUser(User, testUsers.doctor);
    testPatient = await createTestUser(User, testUsers.patient);

    // 生成测试 token
    adminToken = generateTestToken(testAdmin);
    doctorToken = generateTestToken(testDoctor);
    patientToken = generateTestToken(testPatient);
  });

  describe('GET /api/medical-records/patient', () => {
    beforeEach(async () => {
      // 创建测试病历数据
      const record1 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '测试病历1'
      });
      await record1.save();

      const record2 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-21',
        diagnosis: '高血压',
        symptoms: '头晕、头痛',
        treatment: '降压药治疗',
        notes: '测试病历2'
      });
      await record2.save();
    });

    it('患者应该能够获取自己的病历列表', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/patient')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('records');
      expect(res.body.records).to.be.an('array');
      expect(res.body.records.length).to.be.at.least(2);
    });

    it('非患者用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/patient')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(403);
    });

    it('应该支持分页查询', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/patient?page=1&limit=1')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('currentPage', 1);
      expect(res.body.pagination).to.have.property('totalPages');
      expect(res.body.pagination).to.have.property('totalRecords');
    });

    it('应该支持日期范围筛选', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/patient?startDate=2024-12-20&endDate=2024-12-21')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      expect(res.body.records.length).to.be.at.least(2);
    });
  });

  describe('GET /api/medical-records/doctor', () => {
    beforeEach(async () => {
      // 创建测试病历数据
      const record1 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '测试病历1'
      });
      await record1.save();

      const record2 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-21',
        diagnosis: '高血压',
        symptoms: '头晕、头痛',
        treatment: '降压药治疗',
        notes: '测试病历2'
      });
      await record2.save();
    });

    it('医生应该能够获取自己创建的病历列表', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/doctor')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('records');
      expect(res.body.records).to.be.an('array');
      expect(res.body.records.length).to.be.at.least(2);
    });

    it('非医生用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/doctor')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(403);
    });

    it('应该支持患者筛选', async () => {
      const res = await chai.request(server)
        .get(`/api/medical-records/doctor?patientId=${testPatient._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      res.body.records.forEach(record => {
        expect(record.patientId).to.equal(testPatient._id.toString());
      });
    });
  });

  describe('POST /api/medical-records', () => {
    it('医生应该能够创建病历', async () => {
      const recordData = {
        patientId: testPatient._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '测试病历'
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(recordData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('record');
      expect(res.body.record).to.have.property('patientId', testPatient._id.toString());
      expect(res.body.record).to.have.property('doctorId', testDoctor._id.toString());
      expect(res.body.record).to.have.property('diagnosis', recordData.diagnosis);
      expect(res.body.record).to.have.property('symptoms', recordData.symptoms);
      expect(res.body.record).to.have.property('treatment', recordData.treatment);
    });

    it('非医生用户应该被拒绝创建病历', async () => {
      const recordData = {
        patientId: testPatient._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗'
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(recordData);

      expect(res).to.have.status(403);
    });

    it('应该验证必填字段', async () => {
      const invalidRecord = {
        patientId: testPatient._id
        // 缺少其他必填字段
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(invalidRecord);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success', false);
    });

    it('应该验证患者存在', async () => {
      const fakePatientId = '507f1f77bcf86cd799439011';
      const recordData = {
        patientId: fakePatientId,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗'
      };

      const res = await chai.request(server)
        .post('/api/medical-records')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(recordData);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('GET /api/medical-records/:id', () => {
    let testRecord;

    beforeEach(async () => {
      testRecord = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '测试病历详情'
      });
      await testRecord.save();
    });

    it('患者应该能够获取自己的病历详情', async () => {
      const res = await chai.request(server)
        .get(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('record');
      expect(res.body.record).to.have.property('_id', testRecord._id.toString());
      expect(res.body.record).to.have.property('diagnosis', '感冒');
    });

    it('医生应该能够获取病历详情', async () => {
      const res = await chai.request(server)
        .get(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('record');
    });

    it('应该拒绝获取不存在的病历', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await chai.request(server)
        .get(`/api/medical-records/${fakeId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(404);
    });

    it('未认证用户应该被拒绝访问', async () => {
      const res = await chai.request(server)
        .get(`/api/medical-records/${testRecord._id}`);

      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/medical-records/:id', () => {
    let testRecord;

    beforeEach(async () => {
      testRecord = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '原始病历'
      });
      await testRecord.save();
    });

    it('医生应该能够更新病历', async () => {
      const updateData = {
        diagnosis: '重感冒',
        symptoms: '高烧、严重咳嗽',
        treatment: '加强药物治疗',
        notes: '更新后的病历'
      };

      const res = await chai.request(server)
        .put(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);
      expect(res.body.record).to.have.property('diagnosis', updateData.diagnosis);
      expect(res.body.record).to.have.property('symptoms', updateData.symptoms);
      expect(res.body.record).to.have.property('treatment', updateData.treatment);
      expect(res.body.record).to.have.property('notes', updateData.notes);
    });

    it('非医生用户应该被拒绝更新病历', async () => {
      const updateData = {
        diagnosis: '重感冒'
      };

      const res = await chai.request(server)
        .put(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);

      expect(res).to.have.status(403);
    });

    it('应该拒绝更新不存在的病历', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        diagnosis: '重感冒'
      };

      const res = await chai.request(server)
        .put(`/api/medical-records/${fakeId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData);

      expect(res).to.have.status(404);
    });
  });

  describe('DELETE /api/medical-records/:id', () => {
    let testRecord;

    beforeEach(async () => {
      testRecord = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '待删除的病历'
      });
      await testRecord.save();
    });

    it('医生应该能够删除病历', async () => {
      const res = await chai.request(server)
        .delete(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success', true);

      // 验证病历已被删除
      const deletedRecord = await MedicalRecord.findById(testRecord._id);
      expect(deletedRecord).to.be.null;
    });

    it('非医生用户应该被拒绝删除病历', async () => {
      const res = await chai.request(server)
        .delete(`/api/medical-records/${testRecord._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res).to.have.status(403);
    });

    it('应该拒绝删除不存在的病历', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await chai.request(server)
        .delete(`/api/medical-records/${fakeId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(404);
    });
  });

  describe('GET /api/medical-records/search', () => {
    beforeEach(async () => {
      // 创建测试病历数据
      const record1 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-20',
        diagnosis: '感冒',
        symptoms: '发烧、咳嗽',
        treatment: '药物治疗',
        notes: '测试病历1'
      });
      await record1.save();

      const record2 = new MedicalRecord({
        patientId: testPatient._id,
        doctorId: testDoctor._id,
        visitDate: '2024-12-21',
        diagnosis: '高血压',
        symptoms: '头晕、头痛',
        treatment: '降压药治疗',
        notes: '测试病历2'
      });
      await record2.save();
    });

    it('应该支持按诊断搜索', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/search?diagnosis=感冒')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      res.body.records.forEach(record => {
        expect(record.diagnosis).to.include('感冒');
      });
    });

    it('应该支持按症状搜索', async () => {
      const res = await chai.request(server)
        .get('/api/medical-records/search?symptoms=发烧')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      res.body.records.forEach(record => {
        expect(record.symptoms).to.include('发烧');
      });
    });

    it('应该支持按患者搜索', async () => {
      const res = await chai.request(server)
        .get(`/api/medical-records/search?patientId=${testPatient._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.records).to.be.an('array');
      res.body.records.forEach(record => {
        expect(record.patientId).to.equal(testPatient._id.toString());
      });
    });
  });
});
