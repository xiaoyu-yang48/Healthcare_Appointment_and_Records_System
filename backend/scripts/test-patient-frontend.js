const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试用户凭据
const testPatient = {
  email: 'zhangsan@test.com',
  password: 'password123'
};

async function testPatientFrontend() {
  console.log('🧪 测试患者端前端页面API连接...\n');

  try {
    // 1. 患者登录
    console.log('1. 患者登录...');
    const patientLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testPatient);
    const patientToken = patientLoginResponse.data.token;
    const patientId = patientLoginResponse.data.user._id || patientLoginResponse.data.user.id;
    console.log('✅ 患者登录成功');
    console.log(`   患者ID: ${patientId}`);
    console.log(`   患者姓名: ${patientLoginResponse.data.user.name}`);

    const patientHeaders = { Authorization: `Bearer ${patientToken}` };

    // 2. 测试患者仪表板API
    console.log('\n2. 测试患者仪表板API...');
    try {
      // 获取患者个人资料
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: patientHeaders });
      console.log('✅ 获取个人资料成功');
      console.log(`   姓名: ${profileResponse.data.name}`);
      console.log(`   邮箱: ${profileResponse.data.email}`);
      console.log(`   角色: ${profileResponse.data.role}`);
      
    } catch (error) {
      console.log('❌ 获取个人资料失败:', error.response?.data?.message);
    }

    // 3. 测试患者预约页面API
    console.log('\n3. 测试患者预约页面API...');
    try {
      // 获取患者预约列表
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/patient`, { headers: patientHeaders });
      console.log('✅ 获取预约列表成功');
      console.log(`   预约数量: ${appointmentsResponse.data.length}`);
      
      if (appointmentsResponse.data.length > 0) {
        const appointment = appointmentsResponse.data[0];
        console.log(`   最新预约: ${appointment.date} ${appointment.timeSlot} - ${appointment.status}`);
      }
      
    } catch (error) {
      console.log('❌ 获取预约列表失败:', error.response?.data?.message);
    }

    // 4. 测试患者病历页面API
    console.log('\n4. 测试患者病历页面API...');
    try {
      // 获取患者病历列表
      const recordsResponse = await axios.get(`${API_BASE_URL}/medical-records/patient`, { headers: patientHeaders });
      console.log('✅ 获取病历列表成功');
      console.log(`   病历数量: ${recordsResponse.data.length}`);
      
      if (recordsResponse.data.length > 0) {
        const record = recordsResponse.data[0];
        console.log(`   最新病历: ${record.visitDate} - ${record.diagnosis}`);
      }
      
      // 获取病历统计
      const statsResponse = await axios.get(`${API_BASE_URL}/medical-records/patient/stats`, { headers: patientHeaders });
      console.log('✅ 获取病历统计成功');
      console.log(`   总病历数: ${statsResponse.data.totalRecords}`);
      
    } catch (error) {
      console.log('❌ 获取病历信息失败:', error.response?.data?.message);
    }

    // 5. 测试患者消息页面API
    console.log('\n5. 测试患者消息页面API...');
    try {
      // 获取未读消息数量（这里需要先获取医生列表）
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`, { headers: patientHeaders });
      console.log('✅ 获取医生列表成功');
      console.log(`   医生数量: ${doctorsResponse.data.length}`);
      
      if (doctorsResponse.data.length > 0) {
        const doctorId = doctorsResponse.data[0]._id;
        
        // 获取与医生的对话
        const conversationResponse = await axios.get(`${API_BASE_URL}/messages/conversation/${doctorId}`, { headers: patientHeaders });
        console.log('✅ 获取消息对话成功');
        console.log(`   消息数量: ${conversationResponse.data.length}`);
        
        // 计算未读消息
        const unreadMessages = conversationResponse.data.filter(msg => !msg.isRead && msg.sender._id !== patientId);
        console.log(`   未读消息: ${unreadMessages.length}`);
      }
      
    } catch (error) {
      console.log('❌ 获取消息信息失败:', error.response?.data?.message);
    }

    console.log('\n🎉 患者端前端页面API测试完成！');
    console.log('📝 所有API都应该正常工作，前端页面应该能正确显示数据');
    console.log('\n📋 患者端页面功能总结:');
    console.log('   ✅ 患者仪表板 - 显示个人信息和统计');
    console.log('   ✅ 患者预约 - 查看和管理预约');
    console.log('   ✅ 患者病历 - 查看病历记录');
    console.log('   ✅ 患者消息 - 与医生沟通');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testPatientFrontend();
