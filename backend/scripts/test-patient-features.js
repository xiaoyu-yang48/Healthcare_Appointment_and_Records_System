const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试用户凭据
const testPatient = {
  email: 'zhangsan@test.com',
  password: 'password123'
};

const testDoctor = {
  email: 'doctor.li@test.com',
  password: 'password123'
};

async function testPatientFeatures() {
  console.log('🧪 测试患者端功能...\n');

  try {
    // 1. 患者登录
    console.log('1. 患者登录...');
    const patientLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testPatient);
    const patientToken = patientLoginResponse.data.token;
    const patientId = patientLoginResponse.data.user.id;
    console.log('✅ 患者登录成功');
    console.log(`   患者ID: ${patientId}`);
    console.log(`   患者姓名: ${patientLoginResponse.data.user.name}`);

    const patientHeaders = { Authorization: `Bearer ${patientToken}` };

    // 2. 医生登录（用于创建预约和病历）
    console.log('\n2. 医生登录...');
    const doctorLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testDoctor);
    const doctorToken = doctorLoginResponse.data.token;
    const doctorId = doctorLoginResponse.data.user.id;
    console.log('✅ 医生登录成功');
    console.log(`   医生ID: ${doctorId}`);
    console.log(`   医生姓名: ${doctorLoginResponse.data.user.name}`);

    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };

    // 3. 测试患者预约功能
    console.log('\n3. 测试患者预约功能...');
    try {
      // 3.1 创建预约
      console.log('   3.1 创建预约...');
      const appointmentData = {
        doctorId: doctorId,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7天后
        timeSlot: '09:00-10:00',
        reason: '常规体检',
        symptoms: '无特殊症状'
      };
      
      const createAppointmentResponse = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, { headers: patientHeaders });
      console.log('   ✅ 创建预约成功');
      console.log(`   预约ID: ${createAppointmentResponse.data.appointment._id}`);
      
      const appointmentId = createAppointmentResponse.data.appointment._id;
      
      // 3.2 获取患者预约列表
      console.log('   3.2 获取患者预约列表...');
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/patient`, { headers: patientHeaders });
      console.log('   ✅ 获取预约列表成功');
      console.log(`   预约数量: ${appointmentsResponse.data.appointments.length}`);
      
      // 3.3 取消预约
      console.log('   3.3 取消预约...');
      const cancelResponse = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {}, { headers: patientHeaders });
      console.log('   ✅ 取消预约成功');
      console.log(`   状态: ${cancelResponse.data.appointment.status}`);
      
    } catch (error) {
      console.log('   ❌ 预约功能测试失败:', error.response?.data?.message);
    }

    // 4. 测试患者病历功能
    console.log('\n4. 测试患者病历功能...');
    try {
      // 4.1 医生创建病历
      console.log('   4.1 医生创建病历...');
      const recordData = {
        patientId: patientId,
        visitDate: new Date().toISOString().split('T')[0],
        diagnosis: '健康体检',
        symptoms: '无特殊症状',
        treatment: '建议定期体检',
        prescription: '无需用药',
        notes: '患者身体状况良好'
      };
      
      const createRecordResponse = await axios.post(`${API_BASE_URL}/medical-records`, recordData, { headers: doctorHeaders });
      console.log('   ✅ 创建病历成功');
      console.log(`   病历ID: ${createRecordResponse.data.record._id}`);
      
      // 4.2 患者获取病历列表
      console.log('   4.2 患者获取病历列表...');
      const recordsResponse = await axios.get(`${API_BASE_URL}/medical-records/patient`, { headers: patientHeaders });
      console.log('   ✅ 获取病历列表成功');
      console.log(`   病历数量: ${recordsResponse.data.records.length}`);
      
      // 4.3 患者获取病历统计
      console.log('   4.3 患者获取病历统计...');
      const statsResponse = await axios.get(`${API_BASE_URL}/medical-records/patient/stats`, { headers: patientHeaders });
      console.log('   ✅ 获取病历统计成功');
      console.log(`   总病历数: ${statsResponse.data.stats.totalRecords}`);
      
    } catch (error) {
      console.log('   ❌ 病历功能测试失败:', error.response?.data?.message);
    }

    // 5. 测试患者消息功能
    console.log('\n5. 测试患者消息功能...');
    try {
      // 5.1 患者发送消息给医生
      console.log('   5.1 患者发送消息给医生...');
      const messageData = {
        recipientId: doctorId,
        content: '医生您好，我想咨询一下体检相关的问题。',
        type: 'text'
      };
      
      const sendMessageResponse = await axios.post(`${API_BASE_URL}/messages`, messageData, { headers: patientHeaders });
      console.log('   ✅ 发送消息成功');
      console.log(`   消息ID: ${sendMessageResponse.data.message._id}`);
      
      // 5.2 患者获取与医生的对话
      console.log('   5.2 患者获取与医生的对话...');
      const conversationResponse = await axios.get(`${API_BASE_URL}/messages/conversation/${doctorId}`, { headers: patientHeaders });
      console.log('   ✅ 获取对话成功');
      console.log(`   消息数量: ${conversationResponse.data.messages.length}`);
      
      // 5.3 医生回复消息
      console.log('   5.3 医生回复消息...');
      const replyData = {
        recipientId: patientId,
        content: '您好，关于体检的问题我可以为您详细解答。',
        type: 'text'
      };
      
      const replyResponse = await axios.post(`${API_BASE_URL}/messages`, replyData, { headers: doctorHeaders });
      console.log('   ✅ 医生回复成功');
      
      // 5.4 患者标记消息为已读
      console.log('   5.4 患者标记消息为已读...');
      const markReadResponse = await axios.put(`${API_BASE_URL}/messages/${replyResponse.data.message._id}/read`, {}, { headers: patientHeaders });
      console.log('   ✅ 标记已读成功');
      
    } catch (error) {
      console.log('   ❌ 消息功能测试失败:', error.response?.data?.message);
    }

    // 6. 测试患者个人资料
    console.log('\n6. 测试患者个人资料...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: patientHeaders });
      console.log('✅ 获取个人资料成功');
      console.log(`   姓名: ${profileResponse.data.name}`);
      console.log(`   邮箱: ${profileResponse.data.email}`);
      console.log(`   角色: ${profileResponse.data.role}`);
      
    } catch (error) {
      console.log('❌ 获取个人资料失败:', error.response?.data?.message);
    }

    console.log('\n🎉 患者端功能测试完成！');
    console.log('📝 所有患者端API都应该正常工作');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testPatientFeatures();
