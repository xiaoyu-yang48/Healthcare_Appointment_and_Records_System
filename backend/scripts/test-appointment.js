const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorSchedule = require('../models/DoctorSchedule');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare');
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 测试预约功能
const testAppointment = async () => {
  try {
    console.log('开始测试预约功能...');

    // 1. 检查是否有医生
    const doctors = await User.find({ role: 'doctor', isActive: true });
    console.log(`找到 ${doctors.length} 个医生`);

    if (doctors.length === 0) {
      console.log('没有找到医生，请先创建医生账户');
      return;
    }

    // 2. 检查是否有患者
    const patients = await User.find({ role: 'patient', isActive: true });
    console.log(`找到 ${patients.length} 个患者`);

    if (patients.length === 0) {
      console.log('没有找到患者，请先创建患者账户');
      return;
    }

    // 3. 检查医生排班
    const doctor = doctors[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const schedule = await DoctorSchedule.findOne({
      doctor: doctor._id,
      date: { $gte: today }
    });

    if (!schedule) {
      console.log(`医生 ${doctor.name} 没有排班记录`);
      console.log('请运行 npm run init-schedules 来初始化排班');
      return;
    }

    console.log(`医生 ${doctor.name} 的排班:`, {
      date: schedule.date,
      timeSlots: schedule.timeSlots.length,
      availableSlots: schedule.timeSlots.filter(slot => slot.isAvailable).length
    });

    // 4. 检查现有预约
    const existingAppointments = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: today }
    });

    console.log(`医生 ${doctor.name} 有 ${existingAppointments.length} 个预约`);

    // 5. 测试创建预约
    const patient = patients[0];
    const availableSlot = schedule.timeSlots.find(slot => slot.isAvailable);
    
    if (!availableSlot) {
      console.log('没有可用的时间段');
      return;
    }

    console.log(`测试为患者 ${patient.name} 创建预约...`);
    console.log(`医生: ${doctor.name}`);
    console.log(`时间: ${schedule.date.toISOString().split('T')[0]} ${availableSlot.time}`);

    // 检查是否已有相同预约
    const existingAppointment = await Appointment.findOne({
      doctor: doctor._id,
      patient: patient._id,
      date: schedule.date,
      timeSlot: availableSlot.time
    });

    if (existingAppointment) {
      console.log('该时间段已有预约，跳过创建');
    } else {
      const appointment = new Appointment({
        patient: patient._id,
        doctor: doctor._id,
        date: schedule.date,
        timeSlot: availableSlot.time,
        symptoms: '测试预约',
        type: 'consultation',
        status: 'pending'
      });

      await appointment.save();
      console.log('预约创建成功！');
    }

    console.log('预约功能测试完成！');
  } catch (error) {
    console.error('测试预约功能失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await testAppointment();
  await mongoose.connection.close();
  console.log('脚本执行完成');
};

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAppointment };
