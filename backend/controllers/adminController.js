const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Message = require('../models/Message');

// Get system statistics
const getSystemStats = async (req, res) => {
    try {
        // Verify admin permission
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        // User statistics
        const totalUsers = await User.countDocuments();
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const activeUsers = await User.countDocuments({ isActive: true });

        // Appointment statistics
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

        // Medical record statistics
        const totalRecords = await MedicalRecord.countDocuments({ isActive: true });
        const thisMonthRecords = await MedicalRecord.countDocuments({
            isActive: true,
            visitDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        });

        // Message statistics
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ isRead: false });

        // Recently registered users
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent appointments
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
        console.error('stats error:', error);
        res.status(500).json({ message: 'Service error', error: error.message });
    }
};

// Get recent appointments
const getRecentAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { limit = 10 } = req.query;
        
        const recentAppointments = await Appointment.find()
            .populate('patient', 'name email')
            .populate('doctor', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            appointments: recentAppointments,
            total: recentAppointments.length
        });
    } catch (error) {
        console.error('recent appointments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get recent users
const getRecentUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { limit = 10 } = req.query;
        
        const recentUsers = await User.find()
            .select('name email role createdAt isActive')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            users: recentUsers,
            total: recentUsers.length
        });
    } catch (error) {
        console.error('recent users error:', error);
        res.status(500).json({ message: 'Service error', error: error.message });
    }
};

// Get user list
const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
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
        console.error('recent users error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cannot disable yourself
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot disable your own account' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: `User ${isActive ? 'enabled' : 'disabled'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { id } = req.params;

        // Cannot delete yourself
        if (id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has related data
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
                message: 'User has related data and cannot be deleted. It is recommended to disable the account instead of deleting.' 
            });
        }

        await User.findByIdAndDelete(id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get appointment list
const getAppointments = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
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
        console.error('Get appointment list error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get medical record list
const getMedicalRecords = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
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
        console.error('Get medical record list error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create user
const createUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { name, email, password, role, phone, specialization, department } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required fields' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            role,
            phone,
            specialization,
            department,
            isActive: true
        });

        await user.save();

        // Return user info (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user info
const updateUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { id } = req.params;
        const { name, email, role, phone, specialization, department, isActive } = req.body;

        // Validate required fields
        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Name, email, and role are required fields' });
        }

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is used by another user
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already used by another user' });
        }

        // Update user info
        user.name = name;
        user.email = email;
        user.role = role;
        user.phone = phone;
        user.specialization = specialization;
        user.department = department;
        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        await user.save();

        // Return user info (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'User information updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get department statistics
const getDepartmentStats = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
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
        console.error('Get department statistics error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update appointment info
const updateAppointment = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No permission to access admin features' });
        }

        const { id } = req.params;
        const { date, timeSlot, type, status, symptoms, notes } = req.body;

        // Validate required fields
        if (!date || !timeSlot) {
            return res.status(400).json({ message: 'Date and time slot are required fields' });
        }

        // Check if appointment exists
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update appointment info
        appointment.date = new Date(date);
        appointment.timeSlot = timeSlot;
        appointment.type = type || appointment.type;
        appointment.status = status || appointment.status;
        appointment.symptoms = symptoms || appointment.symptoms;
        appointment.notes = notes || appointment.notes;

        await appointment.save();

        // Return updated appointment info
        const updatedAppointment = await Appointment.findById(id)
            .populate('patient', 'name email phone')
            .populate('doctor', 'name email department');

        res.json({
            message: 'Appointment information updated successfully',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getSystemStats,
    getRecentUsers,
    getRecentAppointments,
    getUsers,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    getAppointments,
    getMedicalRecords,
    getDepartmentStats,
    updateAppointment
};