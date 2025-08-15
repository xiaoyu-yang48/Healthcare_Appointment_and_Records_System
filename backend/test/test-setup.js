const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configure chai
chai.use(chaiHttp);
const expect = chai.expect;

// Test database configuration
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb+srv://Brian:H58aSudmEjd4C1GQ@cluster0.csox1pv.mongodb.net/emrt';

// Test user data
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
  department: 'Internal Medicine',
  specialization: 'Internal Medicine Diseases'
  },
  patient: {
    email: 'patient@test.com',
    password: 'patient123',
    name: 'Test Patient',
    role: 'patient'
  }
};

// Test data
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
  diagnosis: 'Cold',
  symptoms: 'Fever, Cough',
  treatment: 'Medication',
  notes: 'Test medical record'
  },
  message: {
  content: 'Test message content',
  senderId: null, // Will be set in test
  receiverId: null // Will be set in test
  }
};

// Connect to test database
const connectTestDB = async () => {
  try {
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  console.log('✅ Test database connected successfully');
  } catch (error) {
  console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
};

// Disconnect test database
const disconnectTestDB = async () => {
  try {
    await mongoose.connection.close();
  console.log('✅ Test database connection closed');
  } catch (error) {
  console.error('❌ Failed to close test database connection:', error);
  }
};

// Clear test database
const clearTestDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  console.log('✅ Test database cleared');
  } catch (error) {
  console.error('❌ Failed to clear test database:', error);
  }
};

// Generate test JWT token
const generateTestToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// Create test user
const createTestUser = async (User, userData) => {
  const user = new User(userData);
  return await user.save();
};

// Set test environment variables
const setupTestEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.PORT = 5001;
};

// Reset test environment
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
