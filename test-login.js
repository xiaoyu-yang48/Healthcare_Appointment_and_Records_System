const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试数据
const testUsers = [
  {
    name: '测试患者',
    email: 'patient@test.com',
    password: '123456',
    role: 'patient'
  },
  {
    name: '测试医生',
    email: 'doctor@test.com',
    password: '123456',
    role: 'doctor'
  },
  {
    name: '测试管理员',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin'
  }
];

async function testLoginFlow() {
  console.log('🔍 开始诊断登录问题...\n');

  try {
    // 1. 测试后端连接
    console.log('1. 测试后端连接...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 后端连接正常:', healthResponse.data.message);

    // 2. 测试用户注册
    console.log('\n2. 测试用户注册...');
    for (const user of testUsers) {
      try {
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, user);
        console.log(`✅ 用户注册成功: ${user.email} (${user.role})`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message === '用户已存在') {
          console.log(`⚠️  用户已存在: ${user.email}`);
        } else {
          console.log(`❌ 用户注册失败: ${user.email}`, error.response?.data?.message);
        }
      }
    }

    // 3. 测试用户登录
    console.log('\n3. 测试用户登录...');
    for (const user of testUsers) {
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: user.email,
          password: user.password
        });
        
        console.log(`✅ 登录成功: ${user.email}`);
        console.log(`   用户信息: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
        console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
        
        // 4. 测试获取用户资料
        console.log(`\n4. 测试获取用户资料 (${user.email})...`);
        try {
          const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${loginResponse.data.token}` }
          });
          console.log(`✅ 获取用户资料成功: ${profileResponse.data.name}`);
        } catch (profileError) {
          console.log(`❌ 获取用户资料失败:`, profileError.response?.data?.message);
        }
        
      } catch (error) {
        console.log(`❌ 登录失败: ${user.email}`, error.response?.data?.message);
      }
    }

    // 5. 测试错误情况
    console.log('\n5. 测试错误情况...');
    
    // 测试错误的密码
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'patient@test.com',
        password: 'wrongpassword'
      });
      console.log('❌ 错误密码测试失败：应该返回错误');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 错误密码测试通过：正确返回401错误');
      } else {
        console.log('❌ 错误密码测试异常：', error.response?.data?.message);
      }
    }

    // 测试不存在的用户
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'nonexistent@test.com',
        password: '123456'
      });
      console.log('❌ 不存在用户测试失败：应该返回错误');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 不存在用户测试通过：正确返回401错误');
      } else {
        console.log('❌ 不存在用户测试异常：', error.response?.data?.message);
      }
    }

    console.log('\n🎉 登录诊断完成！');
    console.log('📝 如果所有测试都通过，说明后端登录功能正常');
    console.log('💡 如果前端仍有问题，请检查：');
    console.log('   1. 前端API配置是否正确');
    console.log('   2. 浏览器控制台是否有错误');
    console.log('   3. 网络请求是否正常发送');

  } catch (error) {
    console.error('❌ 诊断失败:', error.response?.data || error.message);
  }
}

// 运行诊断
testLoginFlow();
