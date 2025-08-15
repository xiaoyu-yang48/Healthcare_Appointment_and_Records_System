const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorSchedule = require('../models/DoctorSchedule');
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

// 生成时间槽
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        isAvailable: true
      });
    }
  }
  return slots;
};

// 初始化医生排班
const initDoctorSchedules = async () => {
  try {
    // 获取所有医生
    const doctors = await User.find({ role: 'doctor', isActive: true });
    
    if (doctors.length === 0) {
      console.log('没有找到医生用户，请先创建医生账户');
      return;
    }

    console.log(`找到 ${doctors.length} 个医生`);

    // 为每个医生创建未来7天的排班
    const today = new Date();
    const timeSlots = generateTimeSlots();

    for (const doctor of doctors) {
      console.log(`为医生 ${doctor.name} 创建排班...`);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);

        // 检查是否已存在排班
        const existingSchedule = await DoctorSchedule.findOne({
          doctor: doctor._id,
          date: date
        });

        if (!existingSchedule) {
          // 创建新排班
          const schedule = new DoctorSchedule({
            doctor: doctor._id,
            date: date,
            timeSlots: timeSlots,
            isWorkingDay: true,
            notes: '自动生成的排班',
            maxAppointments: 20
          });

          await schedule.save();
          console.log(`  - 创建了 ${date.toISOString().split('T')[0]} 的排班`);
        } else {
          console.log(`  - ${date.toISOString().split('T')[0]} 的排班已存在`);
        }
      }
    }

    console.log('医生排班初始化完成！');
  } catch (error) {
    console.error('初始化医生排班失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await initDoctorSchedules();
  await mongoose.connection.close();
  console.log('脚本执行完成');
};

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { initDoctorSchedules };
