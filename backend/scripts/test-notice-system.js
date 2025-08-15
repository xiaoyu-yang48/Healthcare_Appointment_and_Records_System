const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5001/api';

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

// 创建测试用户
async function createTestUsers() {
    try {
        const User = require('../models/User');
        
        // 创建测试医生
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

        // 创建测试患者
        let testPatient = await User.findOne({ email: 'testpatient@example.com' });
        if (!testPatient) {
            testPatient = new User({
                name: '测试患者',
                email: 'testpatient@example.com',
                password: 'password123',
                role: 'patient',
                phone: '13900139001',
                dateOfBirth: '1990-01-01',
                gender: 'male',
                address: '北京市朝阳区'
            });
            await testPatient.save();
            console.log('测试患者创建成功:', testPatient._id);
        } else {
            console.log('测试患者已存在:', testPatient._id);
        }

        return { testDoctor, testPatient };
    } catch (error) {
        console.error('创建测试用户失败:', error);
        throw error;
    }
}

// 测试用户登录
async function loginUser(email, password) {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });
        console.log(`${email} 登录成功`);
        return response.data.token;
    } catch (error) {
        console.error(`${email} 登录失败:`, error.response?.data || error.message);
        throw error;
    }
}

// 测试创建预约（应该触发通知）
async function testCreateAppointment(patientToken, doctorId) {
    try {
        console.log('\n=== 测试创建预约 ===');
        
        const headers = { Authorization: `Bearer ${patientToken}` };
        
        const appointmentData = {
            doctorId,
            date: '2025-08-20',
            timeSlot: '09:00-09:30',
            type: 'consultation',
            symptoms: '头痛',
            notes: '测试预约'
        };
        
        const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, { headers });
        
        console.log('预约创建成功:', response.data.appointment._id);
        return response.data.appointment._id;
    } catch (error) {
        console.error('创建预约失败:', error.response?.data || error.message);
        throw error;
    }
}

// 测试获取通知
async function testGetNotices(token, userType) {
    try {
        console.log(`\n=== 测试获取${userType}通知 ===`);
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // 获取通知列表
        const noticesResponse = await axios.get(`${API_BASE_URL}/notices`, { headers });
        console.log(`${userType}通知列表:`, noticesResponse.data.notices.length, '条');
        
        noticesResponse.data.notices.forEach((notice, index) => {
            console.log(`${index + 1}. ${notice.title} - ${notice.content}`);
            console.log(`   类型: ${notice.type}, 已读: ${notice.isRead}`);
        });

        // 获取未读数量
        const unreadResponse = await axios.get(`${API_BASE_URL}/notices/unread-count`, { headers });
        console.log(`${userType}未读通知数量:`, unreadResponse.data.unreadCount);
        
        return noticesResponse.data.notices;
    } catch (error) {
        console.error(`获取${userType}通知失败:`, error.response?.data || error.message);
        throw error;
    }
}

// 测试标记通知为已读
async function testMarkAsRead(token, noticeId) {
    try {
        console.log('\n=== 测试标记通知为已读 ===');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.put(`${API_BASE_URL}/notices/${noticeId}/read`, {}, { headers });
        console.log('通知已标记为已读');
    } catch (error) {
        console.error('标记通知已读失败:', error.response?.data || error.message);
        throw error;
    }
}

// 测试确认预约（应该触发确认通知）
async function testConfirmAppointment(doctorToken, appointmentId) {
    try {
        console.log('\n=== 测试确认预约 ===');
        
        const headers = { Authorization: `Bearer ${doctorToken}` };
        
        const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
            status: 'confirmed',
            notes: '预约已确认'
        }, { headers });
        
        console.log('预约确认成功');
    } catch (error) {
        console.error('确认预约失败:', error.response?.data || error.message);
        throw error;
    }
}

// 主测试函数
async function runTests() {
    try {
        await connectDB();
        
        // 创建测试用户
        const { testDoctor, testPatient } = await createTestUsers();
        
        // 登录用户
        const doctorToken = await loginUser('testdoctor@example.com', 'password123');
        const patientToken = await loginUser('testpatient@example.com', 'password123');
        
        // 测试初始通知状态
        console.log('\n=== 初始通知状态 ===');
        await testGetNotices(doctorToken, '医生');
        await testGetNotices(patientToken, '患者');
        
        // 测试创建预约（应该给医生发送通知）
        const appointmentId = await testCreateAppointment(patientToken, testDoctor._id);
        
        // 等待一下让通知创建完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 检查医生是否收到预约通知
        console.log('\n=== 创建预约后的通知状态 ===');
        const doctorNotices = await testGetNotices(doctorToken, '医生');
        
        // 如果有未读通知，标记第一个为已读
        if (doctorNotices.length > 0 && !doctorNotices[0].isRead) {
            await testMarkAsRead(doctorToken, doctorNotices[0]._id);
        }
        
        // 测试确认预约（应该给患者发送通知）
        await testConfirmAppointment(doctorToken, appointmentId);
        
        // 等待一下让通知创建完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 检查患者是否收到确认通知
        console.log('\n=== 确认预约后的通知状态 ===');
        await testGetNotices(patientToken, '患者');
        
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
