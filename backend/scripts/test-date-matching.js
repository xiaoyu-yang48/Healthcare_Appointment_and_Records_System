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

// 测试日期匹配
async function testDateMatching() {
    try {
        const DoctorSchedule = require('../models/DoctorSchedule');
        const { format } = require('date-fns');

        // 测试日期范围查询
        const startDate = '2025-08-10';
        const endDate = '2025-08-16';
        
        console.log('Testing date range query:', { startDate, endDate });
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        
        console.log('Query dates:', { start, end });
        
        const schedules = await DoctorSchedule.find({
            date: { $gte: start, $lt: end }
        }).sort({ date: 1 });

        console.log('Found schedules:', schedules.length);

        // 测试前端日期匹配逻辑
        schedules.forEach((schedule, index) => {
            console.log(`\nSchedule ${index}:`);
            console.log('  Original date:', schedule.date);
            console.log('  Date type:', typeof schedule.date);
            
            // 模拟前端日期匹配逻辑
            const frontendDate = '2025-08-10';
            let scheduleDate;
            
            if (typeof schedule.date === 'string') {
                scheduleDate = schedule.date.split('T')[0];
            } else {
                scheduleDate = format(new Date(schedule.date), 'yyyy-MM-dd');
            }
            
            console.log('  Frontend date:', frontendDate);
            console.log('  Schedule date:', scheduleDate);
            console.log('  Match:', frontendDate === scheduleDate);
        });

        // 测试特定日期的匹配
        const testDate = new Date('2025-08-10');
        const testDateStr = format(testDate, 'yyyy-MM-dd');
        console.log(`\nTesting specific date: ${testDateStr}`);
        
        const matchingSchedule = schedules.find(s => {
            let scheduleDate;
            if (typeof s.date === 'string') {
                scheduleDate = s.date.split('T')[0];
            } else {
                scheduleDate = format(new Date(s.date), 'yyyy-MM-dd');
            }
            return scheduleDate === testDateStr;
        });
        
        if (matchingSchedule) {
            console.log('Found matching schedule:', matchingSchedule._id);
        } else {
            console.log('No matching schedule found');
        }

    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 主函数
async function main() {
    try {
        await connectDB();
        await testDateMatching();
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

module.exports = { testDateMatching };
