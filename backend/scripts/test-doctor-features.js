const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试用户凭据
const testDoctor = {
  email: 'doctor.li@test.com',
  password: 'password123'
};

const testPatient = {
  email: 'zhangsan@test.com',
  password: 'password123'
};

async function testDoctorFeatures() {
  console.log('🧪 测试医生端功能...\n');

  try {
    // 1. 医生登录
    console.log('1. 医生登录...');
    const doctorLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testDoctor);
    const doctorToken = doctorLoginResponse.data.token;
    const doctorId = doctorLoginResponse.data.user._id || doctorLoginResponse.data.user.id;
    console.log('✅ 医生登录成功');
    console.log(`   医生ID: ${doctorId}`);
    console.log(`   医生姓名: ${doctorLoginResponse.data.user.name}`);
    console.log(`   科室: ${doctorLoginResponse.data.user.department}`);
    console.log(`   专业: ${doctorLoginResponse.data.user.specialization}`);

    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };

    // 2. 患者登录（用于创建预约）
    console.log('\n2. 患者登录...');
    const patientLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testPatient);
    const patientToken = patientLoginResponse.data.token;
    const patientId = patientLoginResponse.data.user._id || patientLoginResponse.data.user.id;
    console.log('✅ 患者登录成功');
    console.log(`   患者ID: ${patientId}`);
    console.log(`   患者姓名: ${patientLoginResponse.data.user.name}`);

    const patientHeaders = { Authorization: `Bearer ${patientToken}` };

    // 3. 测试医生仪表板功能
    console.log('\n3. 测试医生仪表板功能...');
    try {
      // 3.1 获取医生统计
      console.log('   3.1 获取医生统计...');
      const statsResponse = await axios.get(`${API_BASE_URL}/doctors/stats`, { headers: doctorHeaders });
      console.log('   ✅ 获取医生统计成功');
      console.log(`   统计信息:`, statsResponse.data);
      
    } catch (error) {
      console.log('   ❌ 获取医生统计失败:', error.response?.data?.message);
    }

    // 4. 测试医生预约管理功能
    console.log('\n4. 测试医生预约管理功能...');
    try {
      // 4.1 患者创建预约
      console.log('   4.1 患者创建预约...');
      const appointmentData = {
        doctorId: doctorId,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明天
        timeSlot: '10:00-11:00',
        reason: '医生端测试预约',
        symptoms: '测试症状',
        type: 'consultation'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, { headers: patientHeaders });
      console.log('   ✅ 患者创建预约成功');
      console.log(`   预约ID: ${createResponse.data.appointment._id}`);
      
      const appointmentId = createResponse.data.appointment._id;
      
      // 4.2 医生获取今日预约
      console.log('   4.2 医生获取今日预约...');
      const todayResponse = await axios.get(`${API_BASE_URL}/appointments/doctor/today`, { headers: doctorHeaders });
      console.log('   ✅ 获取今日预约成功');
      console.log(`   今日预约数量: ${todayResponse.data.length}`);
      
      // 4.3 医生获取所有预约
      console.log('   4.3 医生获取所有预约...');
      const allAppointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/doctor`, { headers: doctorHeaders });
      console.log('   ✅ 获取所有预约成功');
      console.log(`   总预约数量: ${allAppointmentsResponse.data.length}`);
      
      // 4.4 医生更新预约状态
      console.log('   4.4 医生更新预约状态...');
      const updateResponse = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/status`, { 
        status: 'confirmed' 
      }, { headers: doctorHeaders });
      console.log('   ✅ 更新预约状态成功');
      console.log(`   新状态: ${updateResponse.data.status}`);
      
      // 4.5 医生完成预约
      console.log('   4.5 医生完成预约...');
      const completeResponse = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/status`, { 
        status: 'completed' 
      }, { headers: doctorHeaders });
      console.log('   ✅ 完成预约成功');
      console.log(`   最终状态: ${completeResponse.data.status}`);
      
    } catch (error) {
      console.log('   ❌ 预约管理功能测试失败:', error.response?.data?.message);
    }

    // 5. 测试医生病历管理功能
    console.log('\n5. 测试医生病历管理功能...');
    try {
      // 5.1 医生创建病历
      console.log('   5.1 医生创建病历...');
      const recordData = {
        patientId: patientId,
        visitDate: new Date().toISOString().split('T')[0],
        diagnosis: '医生端测试诊断',
        symptoms: '测试症状描述',
        treatment: '测试治疗方案',
        prescription: {
          medications: [
            {
              name: '测试药物',
              dosage: '1片/次',
              frequency: '每日3次',
              duration: '7天'
            }
          ]
        },
        notes: '医生端测试病历记录'
      };
      
      const createRecordResponse = await axios.post(`${API_BASE_URL}/medical-records`, recordData, { headers: doctorHeaders });
      console.log('   ✅ 创建病历成功');
      console.log(`   病历ID: ${createRecordResponse.data.record._id}`);
      
      const recordId = createRecordResponse.data.record._id;
      
      // 5.2 医生获取病历列表
      console.log('   5.2 医生获取病历列表...');
      const recordsResponse = await axios.get(`${API_BASE_URL}/medical-records/doctor`, { headers: doctorHeaders });
      console.log('   ✅ 获取病历列表成功');
      console.log(`   病历数量: ${recordsResponse.data.length}`);
      
      // 5.3 医生更新病历
      console.log('   5.3 医生更新病历...');
      const updateRecordData = {
        diagnosis: '更新后的诊断',
        treatment: '更新后的治疗方案',
        notes: '更新后的病历记录'
      };
      
      const updateRecordResponse = await axios.put(`${API_BASE_URL}/medical-records/${recordId}`, updateRecordData, { headers: doctorHeaders });
      console.log('   ✅ 更新病历成功');
      console.log(`   更新后诊断: ${updateRecordResponse.data.record.diagnosis}`);
      
    } catch (error) {
      console.log('   ❌ 病历管理功能测试失败:', error.response?.data?.message);
    }

    // 6. 测试医生消息功能
    console.log('\n6. 测试医生消息功能...');
    try {
      // 6.1 医生发送消息给患者
      console.log('   6.1 医生发送消息给患者...');
      const messageData = {
        recipientId: patientId,
        content: '医生端测试消息：请按时服药，注意休息。',
        type: 'text'
      };
      
      const sendMessageResponse = await axios.post(`${API_BASE_URL}/messages`, messageData, { headers: doctorHeaders });
      console.log('   ✅ 医生发送消息成功');
      console.log(`   消息ID: ${sendMessageResponse.data.data._id}`);
      
      // 6.2 医生获取与患者的对话
      console.log('   6.2 医生获取与患者的对话...');
      const conversationResponse = await axios.get(`${API_BASE_URL}/messages/conversation/${patientId}`, { headers: doctorHeaders });
      console.log('   ✅ 获取对话成功');
      console.log(`   消息数量: ${conversationResponse.data.length}`);
      
      // 6.3 医生发送系统消息
      console.log('   6.3 医生发送系统消息...');
      const systemMessageData = {
        recipientId: patientId,
        content: '系统消息：您的预约已确认，请准时到达。',
        type: 'system'
      };
      
      const systemMessageResponse = await axios.post(`${API_BASE_URL}/messages/system`, systemMessageData, { headers: doctorHeaders });
      console.log('   ✅ 发送系统消息成功');
      
    } catch (error) {
      console.log('   ❌ 消息功能测试失败:', error.response?.data?.message);
    }

    // 7. 测试医生排班功能
    console.log('\n7. 测试医生排班功能...');
    try {
      // 7.1 医生设置排班
      console.log('   7.1 医生设置排班...');
      const scheduleData = {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 后天
        timeSlots: [
          { time: '09:00-10:00', isAvailable: true, maxAppointments: 3 },
          { time: '10:00-11:00', isAvailable: true, maxAppointments: 3 },
          { time: '14:00-15:00', isAvailable: true, maxAppointments: 3 },
          { time: '15:00-16:00', isAvailable: true, maxAppointments: 3 }
        ],
        isWorkingDay: true,
        notes: '正常工作日'
      };
      
      const scheduleResponse = await axios.post(`${API_BASE_URL}/doctors/schedule`, scheduleData, { headers: doctorHeaders });
      console.log('   ✅ 设置排班成功');
      
      // 7.2 医生获取排班
      console.log('   7.2 医生获取排班...');
      const getScheduleResponse = await axios.get(`${API_BASE_URL}/doctors/${doctorId}/schedule`, { 
        params: { date: scheduleData.date },
        headers: doctorHeaders 
      });
      console.log('   ✅ 获取排班成功');
      console.log(`   排班记录数量: ${getScheduleResponse.data.length}`);
      
    } catch (error) {
      console.log('   ❌ 排班功能测试失败:', error.response?.data?.message);
    }

    console.log('\n🎉 医生端功能测试完成！');
    console.log('📝 所有医生端API都应该正常工作');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testDoctorFeatures();
