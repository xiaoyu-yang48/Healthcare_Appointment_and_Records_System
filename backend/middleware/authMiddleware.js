
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 临时管理员处理（仅用于调试）
            if (decoded.id === 'temp-admin-id') {
                req.user = {
                    _id: 'temp-admin-id',
                    name: '系统管理员',
                    email: 'admin@healthcare.com',
                    role: 'admin',
                    phone: '13800000000',
                    isActive: true
                };
                return next();
            }
            
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: '用户不存在' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: '账户已被禁用' });
            }

            next();
        } catch (error) {
            console.error('Token验证错误:', error);
            res.status(401).json({ message: '认证失败，请重新登录' });
        }
    } else {
        res.status(401).json({ message: '未提供认证令牌' });
    }
};

// 角色权限中间件
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: '请先登录' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `需要 ${roles.join(' 或 ')} 权限才能访问此功能` 
            });
        }

        next();
    };
};

// 患者权限
const patientOnly = authorize('patient');

// 医生权限
const doctorOnly = authorize('doctor');

// 管理员权限
const adminOnly = authorize('admin');

// 医生或管理员权限
const doctorOrAdmin = authorize('doctor', 'admin');

// 患者或医生权限
const patientOrDoctor = authorize('patient', 'doctor');

module.exports = { 
    protect, 
    authorize, 
    patientOnly, 
    doctorOnly, 
    adminOnly, 
    doctorOrAdmin, 
    patientOrDoctor 
};
