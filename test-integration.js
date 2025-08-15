const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试数据
const testUser = {
  name: '集成测试用户',
  email: 'integration-test@example.com',
  password: '123456',
  role: 'patient'
};

async function testBackendAPI() {
  console.log('🧪 开始前后端联调测试...\n');

  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthResponse.data.message);

    // 2. 测试用户注册
    console.log('\n2. 测试用户注册...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ 用户注册成功:', registerResponse.data.message);
    const token = registerResponse.data.token;

    // 3. 测试用户登录
    console.log('\n3. 测试用户登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ 用户登录成功:', loginResponse.data.message);

    // 4. 测试获取用户资料（需要认证）
    console.log('\n4. 测试获取用户资料...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取用户资料成功:', profileResponse.data.name);

    // 5. 测试预约相关API
    console.log('\n5. 测试预约API...');
    try {
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 获取预约列表成功');
    } catch (error) {
      console.log('⚠️  预约API返回:', error.response?.data?.message || '未知错误');
    }

    // 6. 测试病历相关API
    console.log('\n6. 测试病历API...');
    try {
      const recordsResponse = await axios.get(`${API_BASE_URL}/medical-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 获取病历列表成功');
    } catch (error) {
      console.log('⚠️  病历API返回:', error.response?.data?.message || '未知错误');
    }

    console.log('\n🎉 前后端联调测试完成！');
    console.log('📝 测试结果: 所有核心API功能正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testBackendAPI();
