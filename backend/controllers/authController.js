
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, role, phone, address, dateOfBirth, gender, specialization, department } = req.body;
    
    try {
        // 验证必填字段
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required' 
            });
        }

        // 验证密码长度
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // 验证角色
        if (role && !['patient', 'doctor', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid user role' });
        }

        const userData = {
            name,
            email,
            password,
            role: role || 'patient',
            phone,
            address,
            dateOfBirth,
            gender,
            specialization,
            department
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
            gender: user.gender,
            specialization: user.specialization,
            department: user.department
        };

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token: generateToken(user._id),
            user: userResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // 验证必填字段
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
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
                success: true,
                message: 'Admin login successful (temporary mode)',
                token: generateToken(adminUser.id),
                user: adminUser
            });
            return;
        }

        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is disabled' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
            success: true,
            message: 'Login successful',
            token: generateToken(user._id),
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

        res.status(200).json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // 验证新密码长度
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters long' 
            });
        }
        
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    getProfile,
    changePassword
};
