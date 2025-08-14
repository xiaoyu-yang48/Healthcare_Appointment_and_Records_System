const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试医生登录
async function testDoctorLogin() {
  try {
    console.log('🔍 测试医生登录...');
    
    // 1. 尝试登录
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'doctor@test.com',
      password: 'password123'
    });
    
    console.log('✅ 登录成功:', {
      status: loginResponse.status,
      user: loginResponse.data.user,
      token: loginResponse.data.token ? '存在' : '不存在'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. 测试获取医生统计信息
    console.log('\n🔍 测试获取医生统计信息...');
    const statsResponse = await axios.get(`${API_BASE_URL}/doctors/stats`, { headers });
    console.log('✅ 统计信息获取成功:', {
      status: statsResponse.status,
      data: statsResponse.data
    });
    
    // 3. 测试获取今日预约
    console.log('\n🔍 测试获取今日预约...');
    const todayResponse = await axios.get(`${API_BASE_URL}/appointments/doctor/today`, { headers });
    console.log('✅ 今日预约获取成功:', {
      status: todayResponse.status,
      count: todayResponse.data.length
    });
    
    // 4. 测试获取医生预约列表
    console.log('\n🔍 测试获取医生预约列表...');
    const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/doctor`, { headers });
    console.log('✅ 预约列表获取成功:', {
      status: appointmentsResponse.status,
      count: appointmentsResponse.data.length
    });
    
    console.log('\n🎉 所有测试通过！医生登录功能正常。');
    
  } catch (error) {
    console.error('❌ 测试失败:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      console.log('💡 可能是认证问题，请检查：');
      console.log('1. 医生用户是否存在');
      console.log('2. 密码是否正确');
      console.log('3. 用户是否被禁用');
    }
  }
}

// 创建测试医生用户
async function createTestDoctor() {
  try {
    console.log('🔍 创建测试医生用户...');
    
    const doctorData = {
      name: '测试医生',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'doctor',
      phone: '13800000001',
      department: '内科',
      specialization: '心血管疾病',
      isActive: true
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, doctorData);
    console.log('✅ 测试医生创建成功:', response.data.user);
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('已存在')) {
      console.log('ℹ️ 测试医生已存在，跳过创建');
    } else {
      console.error('❌ 创建测试医生失败:', error.response?.data?.message || error.message);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始医生登录功能测试\n');
  
  // 先创建测试医生
  await createTestDoctor();
  
  // 测试登录
  await testDoctorLogin();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDoctorLogin, createTestDoctor };
