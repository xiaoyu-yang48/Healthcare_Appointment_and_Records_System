const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 临时管理员凭据
const tempAdmin = {
  email: 'admin@healthcare.com',
  password: 'admin123'
};

async function testUserManagement() {
  console.log('🧪 测试用户管理功能...\n');

  try {
    // 1. 登录获取token
    console.log('1. 管理员登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, tempAdmin);
    const token = loginResponse.data.token;
    console.log('✅ 登录成功，获取token');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. 测试获取用户列表
    console.log('\n2. 测试获取用户列表...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, { headers });
      console.log('✅ 获取用户列表成功');
      console.log(`   用户数量: ${usersResponse.data.users.length}`);
      console.log(`   分页信息: ${usersResponse.data.pagination.totalUsers} 总用户`);
    } catch (error) {
      console.log('❌ 获取用户列表失败:', error.response?.data?.message);
    }

    // 3. 测试创建用户
    console.log('\n3. 测试创建用户...');
    try {
      const createUserData = {
        name: 'API测试用户',
        email: 'api-test@example.com',
        password: 'password123',
        role: 'patient',
        phone: '13800138005'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/admin/users`, createUserData, { headers });
      console.log('✅ 创建用户成功');
      console.log(`   新用户ID: ${createResponse.data.user._id}`);
      console.log(`   用户名: ${createResponse.data.user.name}`);
      
      const newUserId = createResponse.data.user._id;
      
      // 4. 测试编辑用户
      console.log('\n4. 测试编辑用户...');
      try {
        const updateUserData = {
          name: 'API测试用户-已更新',
          email: 'api-test@example.com',
          role: 'patient',
          phone: '13800138005',
          isActive: true
        };
        
        const updateResponse = await axios.put(`${API_BASE_URL}/admin/users/${newUserId}`, updateUserData, { headers });
        console.log('✅ 编辑用户成功');
        console.log(`   更新后用户名: ${updateResponse.data.user.name}`);
      } catch (error) {
        console.log('❌ 编辑用户失败:', error.response?.data?.message);
      }
      
      // 5. 测试用户状态更新
      console.log('\n5. 测试用户状态更新...');
      try {
        const statusResponse = await axios.put(`${API_BASE_URL}/admin/users/${newUserId}/status`, { isActive: false }, { headers });
        console.log('✅ 用户状态更新成功');
        console.log(`   状态: ${statusResponse.data.user.isActive ? '启用' : '禁用'}`);
      } catch (error) {
        console.log('❌ 用户状态更新失败:', error.response?.data?.message);
      }
      
      // 6. 测试删除用户
      console.log('\n6. 测试删除用户...');
      try {
        const deleteResponse = await axios.delete(`${API_BASE_URL}/admin/users/${newUserId}`, { headers });
        console.log('✅ 删除用户成功');
        console.log(`   消息: ${deleteResponse.data.message}`);
      } catch (error) {
        console.log('❌ 删除用户失败:', error.response?.data?.message);
      }
      
    } catch (error) {
      console.log('❌ 创建用户失败:', error.response?.data?.message);
    }

    console.log('\n🎉 用户管理功能测试完成！');
    console.log('📝 所有API都应该正常工作，前端页面应该能正确显示数据');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testUserManagement();
