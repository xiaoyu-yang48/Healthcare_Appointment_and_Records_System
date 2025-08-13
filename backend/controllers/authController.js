
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, role, phone, address, dateOfBirth, gender } = req.body;
    
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: '用户已存在' });
        }

        // 验证角色
        if (role && !['patient', 'doctor', 'admin'].includes(role)) {
            return res.status(400).json({ message: '无效的用户角色' });
        }

        const userData = {
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            address,
            dateOfBirth,
            gender
        };

        const user = await User.create(userData);
        
        // 更新最后登录时间
        user.lastLogin = new Date();
        await user.save();

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender
        };

        res.status(201).json({
            message: '注册成功',
            token: generateToken(user._id),
            user: userResponse
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 临时固定密码管理员登录（仅用于调试）
        if (email === 'admin@healthcare.com' && password === 'admin123') {
            const adminUser = {
                id: 'temp-admin-id',
                name: '系统管理员',
                email: 'admin@healthcare.com',
                role: 'admin',
                phone: '13800000000',
                address: '',
                dateOfBirth: null,
                gender: null,
                specialization: null,
                department: null,
                avatar: null
            };

            res.json({
                message: '管理员登录成功（临时模式）',
                token: generateToken(adminUser.id),
                user: adminUser
            });
            return;
        }

        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: '账户已被禁用' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: '邮箱或密码错误' });
        }

        // 更新最后登录时间
        user.lastLogin = new Date();
        await user.save();

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            specialization: user.specialization,
            department: user.department,
            avatar: user.avatar
        };

        res.json({
            message: '登录成功',
            token: generateToken(user._id),
            user: userResponse
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        // 临时管理员处理（仅用于调试）
        if (req.user._id === 'temp-admin-id') {
            const tempAdminResponse = {
                id: 'temp-admin-id',
                name: '系统管理员',
                email: 'admin@healthcare.com',
                role: 'admin',
                phone: '13800000000',
                address: '',
                dateOfBirth: null,
                gender: null,
                specialization: null,
                department: null,
                licenseNumber: null,
                experience: null,
                education: null,
                bio: null,
                emergencyContact: null,
                medicalHistory: [],
                allergies: [],
                avatar: null,
                lastLogin: new Date()
            };
            return res.status(200).json(tempAdminResponse);
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            specialization: user.specialization,
            department: user.department,
            licenseNumber: user.licenseNumber,
            experience: user.experience,
            education: user.education,
            bio: user.bio,
            emergencyContact: user.emergencyContact,
            medicalHistory: user.medicalHistory,
            allergies: user.allergies,
            avatar: user.avatar,
            lastLogin: user.lastLogin
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('获取用户资料错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const {
            name, email, phone, address, dateOfBirth, gender,
            specialization, department, licenseNumber, experience, education, bio,
            emergencyContact, medicalHistory, allergies
        } = req.body;

        // 更新基本信息
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;

        // 更新医生特有信息
        if (user.role === 'doctor') {
            if (specialization) user.specialization = specialization;
            if (department) user.department = department;
            if (licenseNumber) user.licenseNumber = licenseNumber;
            if (experience) user.experience = experience;
            if (education) user.education = education;
            if (bio) user.bio = bio;
        }

        // 更新患者特有信息
        if (user.role === 'patient') {
            if (emergencyContact) user.emergencyContact = emergencyContact;
            if (medicalHistory) user.medicalHistory = medicalHistory;
            if (allergies) user.allergies = allergies;
        }

        const updatedUser = await user.save();

        const userResponse = {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            dateOfBirth: updatedUser.dateOfBirth,
            gender: updatedUser.gender,
            specialization: updatedUser.specialization,
            department: updatedUser.department,
            licenseNumber: updatedUser.licenseNumber,
            experience: updatedUser.experience,
            education: updatedUser.education,
            bio: updatedUser.bio,
            emergencyContact: updatedUser.emergencyContact,
            medicalHistory: updatedUser.medicalHistory,
            allergies: updatedUser.allergies,
            avatar: updatedUser.avatar
        };

        res.json({
            message: '资料更新成功',
            user: userResponse
        });
    } catch (error) {
        console.error('更新用户资料错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: '当前密码错误' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: '密码修改成功' });
    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    getProfile,
    changePassword
};
