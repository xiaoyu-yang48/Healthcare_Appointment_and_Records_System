const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5001/api';

// 连接数据库
async function connectDB() {
    try {
        // 使用本地MongoDB配置
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin';
        console.log('连接数据库:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
        console.log('请确保本地MongoDB服务正在运行');
        console.log('启动MongoDB: sudo systemctl start mongod');
        process.exit(1);
    }
}

// 创建测试医生
async function createTestDoctor() {
    try {
        const User = require('../models/User');
        
        // 检查是否已存在测试医生
        let testDoctor = await User.findOne({ email: 'testdoctor@example.com' });
        
        if (!testDoctor) {
            testDoctor = new User({
                name: '测试医生',
                email: 'testdoctor@example.com',
                password: 'password123',
                role: 'doctor',
                phone: '13800138000',
                department: '内科',
                specialization: '心血管疾病'
            });
            
            await testDoctor.save();
            console.log('测试医生创建成功:', testDoctor._id);
        } else {
            console.log('测试医生已存在:', testDoctor._id);
        }
        
        return testDoctor;
    } catch (error) {
        console.error('创建测试医生失败:', error);
        throw error;
    }
}

// 测试医生登录
async function loginDoctor(doctor) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: doctor.email,
            password: 'password123'
        });
        
        console.log('医生登录成功');
        return response.data.token;
    } catch (error) {
        console.error('医生登录失败:', error.response?.data || error.message);
        throw error;
    }
}

// 测试获取医生排班
async function testGetSchedule(token) {
    try {
        console.log('\n=== 测试获取医生排班 ===');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // 测试获取当前周的排班
        const startDate = '2025-08-10';
        const endDate = '2025-08-16';
        
        console.log(`获取排班: ${startDate} 到 ${endDate}`);
        
        const response = await axios.get(`${API_BASE_URL}/doctors/schedule`, {
            headers,
            params: { startDate, endDate }
        });
        
        console.log('获取排班成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('获取排班失败:', error.response?.data || error.message);
        throw error;
    }
}

// 测试创建排班
async function testCreateSchedule(token) {
    try {
        console.log('\n=== 测试创建排班 ===');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        const scheduleData = {
            date: '2025-08-12',
            timeSlots: [
                { time: '09:00-09:30', isAvailable: true },
                { time: '09:30-10:00', isAvailable: true },
                { time: '10:00-10:30', isAvailable: true }
            ],
            isWorkingDay: true,
            notes: '测试排班',
            maxAppointments: 10
        };
        
        console.log('创建排班数据:', scheduleData);
        
        const response = await axios.post(`${API_BASE_URL}/doctors/schedule`, scheduleData, { headers });
        
        console.log('创建排班成功:', response.data);
        return response.data.schedule;
    } catch (error) {
        console.error('创建排班失败:', error.response?.data || error.message);
        throw error;
    }
}

// 测试更新排班
async function testUpdateSchedule(token, scheduleId) {
    try {
        console.log('\n=== 测试更新排班 ===');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        const updateData = {
            date: '2025-08-12',
            timeSlots: [
                { time: '09:00-09:30', isAvailable: true },
                { time: '09:30-10:00', isAvailable: true },
                { time: '10:00-10:30', isAvailable: true },
                { time: '14:00-14:30', isAvailable: true }
            ],
            isWorkingDay: true,
            notes: '更新后的测试排班',
            maxAppointments: 15
        };
        
        console.log('更新排班数据:', updateData);
        
        const response = await axios.put(`${API_BASE_URL}/doctors/schedule/${scheduleId}`, updateData, { headers });
        
        console.log('更新排班成功:', response.data);
        return response.data.schedule;
    } catch (error) {
        console.error('更新排班失败:', error.response?.data || error.message);
        throw error;
    }
}

// 主测试函数
async function runTests() {
    try {
        await connectDB();
        
        // 创建测试医生
        const doctor = await createTestDoctor();
        
        // 登录医生
        const token = await loginDoctor(doctor);
        
        // 测试获取排班
        await testGetSchedule(token);
        
        // 测试创建排班
        const createdSchedule = await testCreateSchedule(token);
        
        // 测试更新排班
        if (createdSchedule && createdSchedule._id) {
            await testUpdateSchedule(token, createdSchedule._id);
        }
        
        // 再次测试获取排班，查看更新后的结果
        await testGetSchedule(token);
        
        console.log('\n=== 所有测试完成 ===');
        
    } catch (error) {
        console.error('测试失败:', error);
    } finally {
        await mongoose.disconnect();
        console.log('数据库连接已关闭');
    }
}

// 运行测试
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
