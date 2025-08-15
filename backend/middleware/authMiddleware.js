
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key');
            
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
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ success: false, message: 'Account is disabled' });
            }

            next();
        } catch (error) {
            // Only log error in non-test environments
            if (process.env.NODE_ENV !== 'test') {
                console.error('Token verification error:', error);
            }
            res.status(401).json({ success: false, message: 'Authentication failed, please login again' });
        }
    } else {
        res.status(401).json({ success: false, message: 'No authentication token provided' });
    }
};

// 角色权限中间件
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Please login first' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Requires ${roles.join(' or ')} permissions to access this feature` 
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
