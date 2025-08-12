const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Message = require('../models/Message');

// 获取系统统计信息
const getSystemStats = async (req, res) => {
    try {
        // 验证管理员权限
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        // 用户统计
        const totalUsers = await User.countDocuments();
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const activeUsers = await User.countDocuments({ isActive: true });

        // 预约统计
        const totalAppointments = await Appointment.countDocuments();
        const todayAppointments = await Appointment.countDocuments({
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
        });

        const appointmentStats = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 病历统计
        const totalRecords = await MedicalRecord.countDocuments({ isActive: true });
        const thisMonthRecords = await MedicalRecord.countDocuments({
            isActive: true,
            visitDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        });

        // 消息统计
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ isRead: false });

        // 最近注册的用户
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // 最近的预约
        const recentAppointments = await Appointment.find()
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            users: {
                total: totalUsers,
                patients: totalPatients,
                doctors: totalDoctors,
                active: activeUsers
            },
            appointments: {
                total: totalAppointments,
                today: todayAppointments,
                byStatus: appointmentStats
            },
            records: {
                total: totalRecords,
                thisMonth: thisMonthRecords
            },
            messages: {
                total: totalMessages,
                unread: unreadMessages
            },
            recentUsers,
            recentAppointments
        });
    } catch (error) {
        console.error('获取系统统计错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取用户列表
const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const { role, search, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                totalUsers: total
            }
        });
    } catch (error) {
        console.error('获取用户列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新用户状态
const updateUserStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 不能禁用自己
        if (id === req.user.id) {
            return res.status(400).json({ message: '不能禁用自己的账户' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: `用户${isActive ? '启用' : '禁用'}成功`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('更新用户状态错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 删除用户
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const { id } = req.params;

        // 不能删除自己
        if (id === req.user.id) {
            return res.status(400).json({ message: '不能删除自己的账户' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 检查用户是否有关联数据
        const hasAppointments = await Appointment.findOne({
            $or: [{ patient: id }, { doctor: id }]
        });

        const hasRecords = await MedicalRecord.findOne({
            $or: [{ patient: id }, { doctor: id }]
        });

        const hasMessages = await Message.findOne({
            $or: [{ sender: id }, { recipient: id }]
        });

        if (hasAppointments || hasRecords || hasMessages) {
            return res.status(400).json({ 
                message: '该用户有关联数据，无法删除。建议禁用账户而不是删除。' 
            });
        }

        await User.findByIdAndDelete(id);

        res.json({ message: '用户删除成功' });
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取预约列表
const getAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const { status, doctorId, patientId, date, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;
        if (doctorId) query.doctor = doctorId;
        if (patientId) query.patient = patientId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name phone')
            .populate('doctor', 'name specialization department')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(query);

        res.json({
            appointments,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                totalAppointments: total
            }
        });
    } catch (error) {
        console.error('获取预约列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取病历列表
const getMedicalRecords = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const { doctorId, patientId, date, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        if (doctorId) query.doctor = doctorId;
        if (patientId) query.patient = patientId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.visitDate = { $gte: startDate, $lt: endDate };
        }

        const records = await MedicalRecord.find(query)
            .populate('patient', 'name phone')
            .populate('doctor', 'name specialization department')
            .sort({ visitDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await MedicalRecord.countDocuments(query);

        res.json({
            records,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                totalRecords: total
            }
        });
    } catch (error) {
        console.error('获取病历列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取部门统计
const getDepartmentStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '无权限访问管理员功能' });
        }

        const departmentStats = await User.aggregate([
            { $match: { role: 'doctor' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const specializationStats = await User.aggregate([
            { $match: { role: 'doctor' } },
            { $group: { _id: '$specialization', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            departments: departmentStats,
            specializations: specializationStats
        });
    } catch (error) {
        console.error('获取部门统计错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = {
    getSystemStats,
    getUsers,
    updateUserStatus,
    deleteUser,
    getAppointments,
    getMedicalRecords,
    getDepartmentStats
}; 