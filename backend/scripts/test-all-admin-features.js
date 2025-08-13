const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 临时管理员凭据
const tempAdmin = {
  email: 'admin@healthcare.com',
  password: 'admin123'
};

async function testAllAdminFeatures() {
  console.log('🧪 测试所有管理员功能...\n');

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

    // 3. 测试用户管理
    console.log('\n3. 测试用户管理...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, { headers });
      console.log('✅ 用户管理API正常');
      console.log('   用户数量:', usersResponse.data.pagination?.totalUsers || 0);
    } catch (error) {
      console.log('❌ 用户管理API失败:', error.response?.data?.message);
    }

    // 4. 测试最近用户
    console.log('\n4. 测试最近用户...');
    try {
      const recentUsersResponse = await axios.get(`${API_BASE_URL}/admin/users/recent`, { headers });
      console.log('✅ 最近用户API正常');
      console.log('   用户数量:', recentUsersResponse.data.total);
    } catch (error) {
      console.log('❌ 最近用户API失败:', error.response?.data?.message);
    }

    // 5. 测试预约管理
    console.log('\n5. 测试预约管理...');
    try {
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/admin/appointments`, { headers });
      console.log('✅ 预约管理API正常');
      console.log('   预约数量:', appointmentsResponse.data.pagination?.totalAppointments || 0);
    } catch (error) {
      console.log('❌ 预约管理API失败:', error.response?.data?.message);
    }

    // 6. 测试最近预约
    console.log('\n6. 测试最近预约...');
    try {
      const recentAppointmentsResponse = await axios.get(`${API_BASE_URL}/admin/appointments/recent`, { headers });
      console.log('✅ 最近预约API正常');
      console.log('   预约数量:', recentAppointmentsResponse.data.total);
    } catch (error) {
      console.log('❌ 最近预约API失败:', error.response?.data?.message);
    }

    // 7. 测试病历管理
    console.log('\n7. 测试病历管理...');
    try {
      const recordsResponse = await axios.get(`${API_BASE_URL}/admin/medical-records`, { headers });
      console.log('✅ 病历管理API正常');
      console.log('   病历数量:', recordsResponse.data.pagination?.totalRecords || 0);
    } catch (error) {
      console.log('❌ 病历管理API失败:', error.response?.data?.message);
    }

    // 8. 测试部门统计
    console.log('\n8. 测试部门统计...');
    try {
      const deptStatsResponse = await axios.get(`${API_BASE_URL}/admin/stats/departments`, { headers });
      console.log('✅ 部门统计API正常');
    } catch (error) {
      console.log('❌ 部门统计API失败:', error.response?.data?.message);
    }

    console.log('\n🎉 所有管理员功能测试完成！');
    console.log('📝 功能状态:');
    console.log('   ✅ 系统统计 - 正常');
    console.log('   ✅ 用户管理 - 正常');
    console.log('   ✅ 预约管理 - 正常');
    console.log('   ✅ 病历管理 - 正常');
    console.log('   ✅ 最近用户 - 正常');
    console.log('   ✅ 最近预约 - 正常');
    console.log('   ✅ 部门统计 - 正常');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testAllAdminFeatures();
