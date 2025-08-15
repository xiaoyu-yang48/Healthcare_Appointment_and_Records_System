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

// 创建测试医生和患者
async function createTestData() {
    try {
        const User = require('../models/User');
        const Appointment = require('../models/Appointment');
        
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

        // 创建测试患者
        const testPatients = [
            {
                name: '张三',
                email: 'zhangsan@example.com',
                password: 'password123',
                role: 'patient',
                phone: '13900139001',
                dateOfBirth: '1990-01-01',
                gender: 'male',
                address: '北京市朝阳区'
            },
            {
                name: '李四',
                email: 'lisi@example.com',
                password: 'password123',
                role: 'patient',
                phone: '13900139002',
                dateOfBirth: '1985-05-15',
                gender: 'female',
                address: '上海市浦东新区'
            },
            {
                name: '王五',
                email: 'wangwu@example.com',
                password: 'password123',
                role: 'patient',
                phone: '13900139003',
                dateOfBirth: '1995-12-20',
                gender: 'male',
                address: '广州市天河区'
            }
        ];

        const createdPatients = [];
        for (const patientData of testPatients) {
            let patient = await User.findOne({ email: patientData.email });
            
            if (!patient) {
                patient = new User(patientData);
                await patient.save();
                console.log('测试患者创建成功:', patient.name, patient._id);
            } else {
                console.log('测试患者已存在:', patient.name, patient._id);
            }
            createdPatients.push(patient);
        }

        // 创建测试预约
        const testAppointments = [
            {
                patient: createdPatients[0]._id,
                doctor: testDoctor._id,
                date: new Date('2025-08-10'),
                timeSlot: '09:00-09:30',
                type: 'consultation',
                status: 'completed',
                symptoms: '头痛',
                notes: '患者反映经常头痛'
            },
            {
                patient: createdPatients[1]._id,
                doctor: testDoctor._id,
                date: new Date('2025-08-12'),
                timeSlot: '10:00-10:30',
                type: 'follow-up',
                status: 'confirmed',
                symptoms: '咳嗽',
                notes: '感冒后遗症'
            },
            {
                patient: createdPatients[2]._id,
                doctor: testDoctor._id,
                date: new Date('2025-08-15'),
                timeSlot: '14:00-14:30',
                type: 'consultation',
                status: 'pending',
                symptoms: '腹痛',
                notes: '需要进一步检查'
            },
            {
                patient: createdPatients[0]._id,
                doctor: testDoctor._id,
                date: new Date('2025-07-20'),
                timeSlot: '09:30-10:00',
                type: 'consultation',
                status: 'completed',
                symptoms: '发烧',
                notes: '感冒发烧'
            }
        ];

        for (const appointmentData of testAppointments) {
            const existingAppointment = await Appointment.findOne({
                patient: appointmentData.patient,
                doctor: appointmentData.doctor,
                date: appointmentData.date,
                timeSlot: appointmentData.timeSlot
            });

            if (!existingAppointment) {
                const appointment = new Appointment(appointmentData);
                await appointment.save();
                console.log('测试预约创建成功:', appointment._id);
            } else {
                console.log('测试预约已存在:', existingAppointment._id);
            }
        }

        return { testDoctor, createdPatients };
    } catch (error) {
        console.error('创建测试数据失败:', error);
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

// 测试获取患者列表
async function testGetPatients(token) {
    try {
        console.log('\n=== 测试获取患者列表 ===');
        
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(`${API_BASE_URL}/doctors/patients`, { headers });
        
        console.log('获取患者列表成功');
        console.log('患者数量:', response.data.length);
        
        response.data.forEach((patient, index) => {
            console.log(`${index + 1}. ${patient.name} (${patient.email})`);
            console.log(`   最后就诊: ${patient.lastVisit ? new Date(patient.lastVisit).toISOString().split('T')[0] : '无'}`);
            console.log(`   预约次数: ${patient.appointmentCount || 0}`);
            console.log(`   状态: ${patient.isActive ? '活跃' : '非活跃'}`);
        });
        
        return response.data;
    } catch (error) {
        console.error('获取患者列表失败:', error.response?.data || error.message);
        throw error;
    }
}

// 主测试函数
async function runTests() {
    try {
        await connectDB();
        
        // 创建测试数据
        const { testDoctor, createdPatients } = await createTestData();
        
        // 登录医生
        const token = await loginDoctor(testDoctor);
        
        // 测试获取患者列表
        await testGetPatients(token);
        
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
