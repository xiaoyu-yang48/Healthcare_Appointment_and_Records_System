const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

// 测试用户凭据
const testPatient = {
  email: 'zhangsan@test.com',
  password: 'password123'
};

async function testPatientAppointment() {
  console.log('🧪 测试患者预约功能...\n');

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

    // 2. 获取医生列表
    console.log('\n2. 获取医生列表...');
    try {
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`, { headers: patientHeaders });
      console.log('✅ 获取医生列表成功');
      console.log(`   医生数量: ${doctorsResponse.data.length}`);
      
      doctorsResponse.data.forEach((doctor, index) => {
        console.log(`   医生${index + 1}: ${doctor.name} - ${doctor.department} - ${doctor.specialization}`);
      });
      
      if (doctorsResponse.data.length === 0) {
        console.log('❌ 没有可用的医生');
        return;
      }
      
      const selectedDoctor = doctorsResponse.data[0];
      console.log(`   选择医生: ${selectedDoctor.name} (ID: ${selectedDoctor._id})`);
      
    } catch (error) {
      console.log('❌ 获取医生列表失败:', error.response?.data?.message);
      return;
    }

    // 3. 测试创建预约
    console.log('\n3. 测试创建预约...');
    try {
      const appointmentData = {
        doctorId: doctorsResponse.data[0]._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7天后
        timeSlot: '09:00-10:00',
        reason: '常规体检',
        symptoms: '无特殊症状',
        type: 'consultation'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, { headers: patientHeaders });
      console.log('✅ 创建预约成功');
      console.log(`   预约ID: ${createResponse.data.appointment._id}`);
      console.log(`   预约时间: ${createResponse.data.appointment.date} ${createResponse.data.appointment.timeSlot}`);
      console.log(`   预约状态: ${createResponse.data.appointment.status}`);
      
      const appointmentId = createResponse.data.appointment._id;
      
      // 4. 获取患者预约列表
      console.log('\n4. 获取患者预约列表...');
      try {
        const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/patient`, { headers: patientHeaders });
        console.log('✅ 获取预约列表成功');
        console.log(`   预约数量: ${appointmentsResponse.data.length}`);
        
        appointmentsResponse.data.forEach((appointment, index) => {
          console.log(`   预约${index + 1}: ${appointment.doctor?.name} - ${appointment.date} ${appointment.timeSlot} - ${appointment.status}`);
        });
        
      } catch (error) {
        console.log('❌ 获取预约列表失败:', error.response?.data?.message);
      }
      
      // 5. 测试取消预约
      console.log('\n5. 测试取消预约...');
      try {
        const cancelResponse = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {}, { headers: patientHeaders });
        console.log('✅ 取消预约成功');
        console.log(`   新状态: ${cancelResponse.data.status}`);
        
      } catch (error) {
        console.log('❌ 取消预约失败:', error.response?.data?.message);
      }
      
    } catch (error) {
      console.log('❌ 创建预约失败:', error.response?.data?.message);
    }

    console.log('\n🎉 患者预约功能测试完成！');
    console.log('📝 预约功能应该正常工作');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testPatientAppointment();
