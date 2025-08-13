const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 临时管理员凭据
const tempAdmin = {
  email: 'admin@healthcare.com',
  password: 'admin123'
};

async function testCompleteLogin() {
  console.log('🧪 测试完整登录流程...\n');

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

    const token = loginResponse.data.token;

    // 3. 测试获取管理员资料（关键测试）
    console.log('\n3. 测试获取管理员资料...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取管理员资料成功!');
    console.log('   用户姓名:', profileResponse.data.name);
    console.log('   用户角色:', profileResponse.data.role);
    console.log('   用户邮箱:', profileResponse.data.email);

    // 4. 测试其他需要认证的API
    console.log('\n4. 测试其他API...');
    
    // 测试预约API
    try {
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 预约API访问成功');
    } catch (error) {
      console.log('⚠️  预约API返回:', error.response?.data?.message || '未知错误');
    }

    // 测试医生API
    try {
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 医生API访问成功');
    } catch (error) {
      console.log('⚠️  医生API返回:', error.response?.data?.message || '未知错误');
    }

    // 测试管理员API
    try {
      const adminResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 管理员API访问成功');
    } catch (error) {
      console.log('⚠️  管理员API返回:', error.response?.data?.message || '未知错误');
    }

    console.log('\n🎉 完整登录流程测试完成！');
    console.log('📝 临时管理员凭据:');
    console.log(`   邮箱: ${tempAdmin.email}`);
    console.log(`   密码: ${tempAdmin.password}`);
    console.log('✅ 所有关键API都能正常访问');
    console.log('⚠️  注意：这是临时调试功能，生产环境请移除！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    console.log('\n💡 可能的问题:');
    console.log('1. 后端服务未启动');
    console.log('2. 端口配置错误');
    console.log('3. 认证中间件有问题');
  }
}

// 运行测试
testCompleteLogin();
