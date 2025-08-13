const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 临时管理员凭据
const tempAdmin = {
  email: 'admin@healthcare.com',
  password: 'admin123'
};

async function testAdminAPIs() {
  console.log('🧪 测试管理员API...\n');

  try {
    // 1. 登录获取token
    console.log('1. 管理员登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, tempAdmin);
    const token = loginResponse.data.token;
    console.log('✅ 登录成功，获取token');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. 测试系统统计
    console.log('\n2. 测试系统统计...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`, { headers });
      console.log('✅ 系统统计API正常');
      console.log('   用户统计:', statsResponse.data.users);
      console.log('   预约统计:', statsResponse.data.appointments);
    } catch (error) {
      console.log('❌ 系统统计API失败:', error.response?.data?.message);
    }

    // 3. 测试最近用户
    console.log('\n3. 测试最近用户...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users/recent`, { headers });
      console.log('✅ 最近用户API正常');
      console.log('   用户数量:', usersResponse.data.total);
    } catch (error) {
      console.log('❌ 最近用户API失败:', error.response?.data?.message);
    }

    // 4. 测试最近预约
    console.log('\n4. 测试最近预约...');
    try {
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/admin/appointments/recent`, { headers });
      console.log('✅ 最近预约API正常');
      console.log('   预约数量:', appointmentsResponse.data.total);
    } catch (error) {
      console.log('❌ 最近预约API失败:', error.response?.data?.message);
    }

    // 5. 测试用户列表
    console.log('\n5. 测试用户列表...');
    try {
      const usersListResponse = await axios.get(`${API_BASE_URL}/admin/users`, { headers });
      console.log('✅ 用户列表API正常');
      console.log('   用户数量:', usersListResponse.data.pagination?.totalUsers || 0);
    } catch (error) {
      console.log('❌ 用户列表API失败:', error.response?.data?.message);
    }

    console.log('\n🎉 管理员API测试完成！');
    console.log('📝 所有API都应该正常工作');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testAdminAPIs();
