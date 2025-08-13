const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// Admin用户数据
const adminUser = {
  name: '系统管理员',
  email: 'admin@healthcare.com',
  password: 'Admin@1234',
  role: 'admin',
  phone: '13800000000'
};

async function createAdminUser() {
  console.log('🔧 开始创建管理员用户...\n');

  try {
    // 1. 测试后端连接
    console.log('1. 测试后端连接...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 后端连接正常:', healthResponse.data.message);

    // 2. 创建admin用户
    console.log('\n2. 创建管理员用户...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminUser);
    console.log('✅ 管理员用户创建成功:', registerResponse.data.message);
    console.log('   邮箱:', adminUser.email);
    console.log('   密码:', adminUser.password);
    console.log('   角色:', adminUser.role);

    // 3. 测试admin登录
    console.log('\n3. 测试管理员登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    console.log('✅ 管理员登录成功:', loginResponse.data.message);
    console.log('   用户信息:', loginResponse.data.user.name, `(${loginResponse.data.user.role})`);

    // 4. 测试获取admin资料
    console.log('\n4. 测试获取管理员资料...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${loginResponse.data.token}` }
    });
    console.log('✅ 获取管理员资料成功:', profileResponse.data.name);

    console.log('\n🎉 管理员用户创建和测试完成！');
    console.log('📝 登录信息:');
    console.log(`   邮箱: ${adminUser.email}`);
    console.log(`   密码: ${adminUser.password}`);
    console.log('⚠️  请务必在首次登录后修改密码！');

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === '用户已存在') {
      console.log('⚠️  管理员用户已存在，尝试登录...');
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: adminUser.email,
          password: adminUser.password
        });
        console.log('✅ 管理员登录成功:', loginResponse.data.message);
        console.log('   用户信息:', loginResponse.data.user.name, `(${loginResponse.data.user.role})`);
      } catch (loginError) {
        console.error('❌ 管理员登录失败:', loginError.response?.data?.message);
        console.log('💡 可能的原因:');
        console.log('   1. 密码不正确');
        console.log('   2. 用户被禁用');
        console.log('   3. 数据库连接问题');
      }
    } else {
      console.error('❌ 创建管理员失败:', error.response?.data?.message || error.message);
    }
  }
}

// 运行脚本
createAdminUser();
