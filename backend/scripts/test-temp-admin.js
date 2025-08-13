const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 临时管理员凭据
const tempAdmin = {
  email: 'admin@healthcare.com',
  password: 'admin123'
};

async function testTempAdmin() {
  console.log('🧪 测试临时管理员登录...\n');

  try {
    // 1. 测试后端连接
    console.log('1. 测试后端连接...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 后端连接正常:', healthResponse.data.message);

    // 2. 测试临时管理员登录
    console.log('\n2. 测试临时管理员登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, tempAdmin);
    
    console.log('✅ 临时管理员登录成功!');
    console.log('   消息:', loginResponse.data.message);
    console.log('   用户信息:', loginResponse.data.user.name, `(${loginResponse.data.user.role})`);
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');

    // 3. 测试获取管理员资料
    console.log('\n3. 测试获取管理员资料...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` }
      });
      console.log('✅ 获取管理员资料成功:', profileResponse.data.name);
    } catch (profileError) {
      console.log('⚠️  获取管理员资料失败:', profileError.response?.data?.message);
    }

    // 4. 测试其他用户登录（确保正常功能不受影响）
    console.log('\n4. 测试普通用户登录...');
    try {
      const normalUserResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: '123456'
      });
      console.log('✅ 普通用户登录测试:', normalUserResponse.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 普通用户登录失败（预期行为）:', error.response.data.message);
      } else {
        console.log('⚠️  普通用户登录异常:', error.response?.data?.message);
      }
    }

    console.log('\n🎉 临时管理员登录测试完成！');
    console.log('📝 临时管理员凭据:');
    console.log(`   邮箱: ${tempAdmin.email}`);
    console.log(`   密码: ${tempAdmin.password}`);
    console.log('⚠️  注意：这是临时调试功能，生产环境请移除！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testTempAdmin();
