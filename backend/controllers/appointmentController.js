const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorSchedule = require('../models/DoctorSchedule');
const Notice = require('../models/Notice');
const { getUserLanguage } = require('../utils/i18n');

// 获取患者预约列表
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user.id })
            .populate('doctor', 'name specialization department')
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        console.error('获取患者预约错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生预约列表
const getDoctorAppointments = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = { doctor: req.user.id };

        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name phone')
            .sort({ date: 1, timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('获取医生预约错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取今日预约
const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.find({
            doctor: req.user.id,
            date: { $gte: today, $lt: tomorrow }
        })
        .populate('patient', 'name phone')
        .sort({ timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        console.error('获取今日预约错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 创建预约
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, symptoms, type } = req.body;

        // 验证医生是否存在
        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
        if (!doctor) {
            return res.status(404).json({ message: '医生不存在' });
        }

        // 检查预约时间是否可用
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: '该时间段已被预约' });
        }

        // 检查患者是否在同一时间段有其他预约
        const patientConflict = await Appointment.findOne({
            patient: req.user.id,
            date: new Date(date),
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (patientConflict) {
            return res.status(400).json({ message: '您在该时间段已有其他预约' });
        }

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            symptoms,
            type: type || 'consultation'
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctor', 'name specialization department')
            .populate('patient', 'name phone');

        // 创建预约请求通知给医生
        try {
            const language = getUserLanguage(req);
            await Notice.createAppointmentRequest(
                doctorId,
                req.user.id,
                appointment._id,
                req.user.name,
                language
            );
        } catch (noticeError) {
            console.error('创建预约通知失败:', noticeError);
            // 通知失败不影响预约创建
        }

        res.status(201).json({
            message: '预约创建成功',
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error('创建预约错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新预约状态
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: '预约不存在' });
        }

        // 验证权限
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限操作此预约' });
        }

        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限操作此预约' });
        }

        appointment.status = status;
        if (notes) appointment.notes = notes;

        if (status === 'cancelled') {
            appointment.cancelledBy = req.user.id;
            appointment.cancelledAt = new Date();
        }

        await appointment.save();

        const updatedAppointment = await Appointment.findById(id)
            .populate('doctor', 'name specialization department')
            .populate('patient', 'name phone');

        // 如果状态更新为确认，创建确认通知给患者
        if (status === 'confirmed') {
            try {
                const language = getUserLanguage(req);
                await Notice.createAppointmentConfirmed(
                    appointment.patient,
                    req.user.id,
                    appointment._id,
                    req.user.name,
                    language
                );
            } catch (noticeError) {
                console.error('创建确认通知失败:', noticeError);
                // 通知失败不影响状态更新
            }
        }

        res.json({
            message: '预约状态更新成功',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('更新预约状态错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 取消预约
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: '预约不存在' });
        }

        // 验证权限
        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限操作此预约' });
        }

        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限操作此预约' });
        }

        // 检查是否可以取消
        if (appointment.status === 'cancelled' || appointment.status === 'completed') {
            return res.status(400).json({ message: '该预约无法取消' });
        }

        appointment.status = 'cancelled';
        appointment.cancellationReason = reason;
        appointment.cancelledBy = req.user.id;
        appointment.cancelledAt = new Date();

        await appointment.save();

        // 创建取消通知
        try {
            const recipientId = req.user.role === 'doctor' ? appointment.patient : appointment.doctor;
            await Notice.createAppointmentCancelled(
                recipientId,
                req.user.id,
                appointment._id,
                req.user.name
            );
        } catch (noticeError) {
            console.error('创建取消通知失败:', noticeError);
            // 通知失败不影响取消操作
        }

        res.json({ message: '预约取消成功' });
    } catch (error) {
        console.error('取消预约错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取预约详情
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('doctor', 'name specialization department phone')
            .populate('patient', 'name phone address');

        if (!appointment) {
            return res.status(404).json({ message: '预约不存在' });
        }

        // 验证权限
        if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限查看此预约' });
        }

        if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限查看此预约' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('获取预约详情错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = {
    getPatientAppointments,
    getDoctorAppointments,
    getTodayAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentById
}; 