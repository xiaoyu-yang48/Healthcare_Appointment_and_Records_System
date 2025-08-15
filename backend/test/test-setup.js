const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 配置 chai
chai.use(chaiHttp);
const expect = chai.expect;

// 测试数据库配置
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb+srv://Brian:H58aSudmEjd4C1GQ@cluster0.csox1pv.mongodb.net/emrt';

// 测试用户数据
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Test Admin',
    role: 'admin'
  },
  doctor: {
    email: 'doctor@test.com',
    password: 'doctor123',
    name: 'Test Doctor',
    role: 'doctor',
    department: '内科',
    specialization: '内科疾病'
  },
  patient: {
    email: 'patient@test.com',
    password: 'patient123',
    name: 'Test Patient',
    role: 'patient'
  }
};

// 测试数据
const testData = {
  appointment: {
    date: '2024-12-25',
    timeSlot: '09:00-09:30',
    doctorId: null, // 将在测试中设置
    patientId: null, // 将在测试中设置
    status: 'pending'
  },
  medicalRecord: {
    visitDate: '2024-12-20',
    diagnosis: '感冒',
    symptoms: '发烧、咳嗽',
    treatment: '药物治疗',
    notes: '测试病历'
  },
  message: {
    content: '测试消息内容',
    senderId: null, // 将在测试中设置
    receiverId: null // 将在测试中设置
  }
};

// 连接测试数据库
const connectTestDB = async () => {
  try {
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error);
    throw error;
  }
};

// 断开测试数据库连接
const disconnectTestDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ 测试数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭测试数据库连接失败:', error);
  }
};

// 清空测试数据库
const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log('✅ 测试数据库已清空');
  } catch (error) {
    console.error('❌ 清空测试数据库失败:', error);
  }
};

// 生成测试 JWT token
const generateTestToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// 创建测试用户
const createTestUser = async (User, userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  return await user.save();
};

// 设置测试环境变量
const setupTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.PORT = 5001;
};

// 重置测试环境
const resetTestEnv = () => {
  delete process.env.NODE_ENV;
  delete process.env.JWT_SECRET;
  delete process.env.PORT;
};

module.exports = {
  chai,
  expect,
  sinon,
  testUsers,
  testData,
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  generateTestToken,
  createTestUser,
  setupTestEnv,
  resetTestEnv
};
