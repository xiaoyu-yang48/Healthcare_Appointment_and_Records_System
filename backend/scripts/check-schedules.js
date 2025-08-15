const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
async function connectDB() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin';
        console.log('连接数据库:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
        process.exit(1);
    }
}

// 检查排班数据
async function checkSchedules() {
    try {
        const DoctorSchedule = require('../models/DoctorSchedule');
        const User = require('../models/User');

        // 获取所有医生
        const doctors = await User.find({ role: 'doctor' }).select('_id name email');
        console.log('医生列表:', doctors);

        // 获取所有排班
        const schedules = await DoctorSchedule.find().populate('doctor', 'name email');
        console.log('排班总数:', schedules.length);

        if (schedules.length > 0) {
            console.log('排班详情:');
            schedules.forEach((schedule, index) => {
                console.log(`${index + 1}. 医生: ${schedule.doctor.name} (${schedule.doctor.email})`);
                console.log(`   日期: ${schedule.date}`);
                console.log(`   是否工作日: ${schedule.isWorkingDay}`);
                console.log(`   时间段: ${schedule.timeSlots.length} 个`);
                schedule.timeSlots.forEach(slot => {
                    console.log(`     - ${slot.time} (可用: ${slot.isAvailable})`);
                });
                console.log('');
            });
        } else {
            console.log('没有找到排班数据');
        }

        // 检查特定日期范围的排班
        const startDate = new Date('2025-08-10');
        const endDate = new Date('2025-08-16');
        endDate.setDate(endDate.getDate() + 1);

        const weekSchedules = await DoctorSchedule.find({
            date: { $gte: startDate, $lt: endDate }
        }).populate('doctor', 'name email');

        console.log(`\n${startDate.toISOString().split('T')[0]} 到 ${endDate.toISOString().split('T')[0]} 的排班:`);
        console.log('找到排班数量:', weekSchedules.length);

        weekSchedules.forEach((schedule, index) => {
            console.log(`${index + 1}. ${schedule.doctor.name} - ${schedule.date.toISOString().split('T')[0]} - 工作日: ${schedule.isWorkingDay}`);
        });

    } catch (error) {
        console.error('检查排班失败:', error);
    }
}

// 主函数
async function main() {
    try {
        await connectDB();
        await checkSchedules();
    } catch (error) {
        console.error('执行失败:', error);
    } finally {
        await mongoose.disconnect();
        console.log('数据库连接已关闭');
    }
}

// 运行
if (require.main === module) {
    main();
}

module.exports = { checkSchedules };
