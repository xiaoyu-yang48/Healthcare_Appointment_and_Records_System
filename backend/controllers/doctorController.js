const User = require('../models/User');
const Appointment = require('../models/Appointment');
const DoctorSchedule = require('../models/DoctorSchedule');

// 获取医生列表
const getDoctors = async (req, res) => {
    try {
        const { department, specialization, search } = req.query;
        let query = { role: 'doctor', isActive: true };

        if (department) {
            query.department = { $regex: department, $options: 'i' };
        }

        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await User.find(query)
            .select('name specialization department experience education bio avatar')
            .sort({ name: 1 });

        res.json(doctors);
    } catch (error) {
        console.error('获取医生列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生详情
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('getDoctorById called with id:', id);

        const doctor = await User.findOne({ _id: id, role: 'doctor', isActive: true })
            .select('-password');

        if (!doctor) {
            return res.status(404).json({ message: '医生不存在' });
        }

        res.json(doctor);
    } catch (error) {
        console.error('获取医生详情错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生排班
const getDoctorSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, startDate, endDate } = req.query;

        console.log('getDoctorSchedule called with params:', { id, date, startDate, endDate });
        console.log('req.user:', req.user);

        // 如果没有id参数，使用当前登录用户的ID（医生查看自己的排班）
        const doctorId = id || req.user.id;
        console.log('Using doctorId:', doctorId);
        let query = { doctor: doctorId };

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);
            query.date = { $gte: targetDate, $lt: nextDate };
        } else if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            query.date = { $gte: start, $lt: end };
            console.log('Date range query:', { startDate, endDate, start, end, query });
        } else {
            // 默认返回未来7天的排班
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            query.date = { $gte: today, $lt: nextWeek };
        }

        const schedules = await DoctorSchedule.find(query)
            .sort({ date: 1 });

        console.log('Found schedules:', schedules.length);
        schedules.forEach((schedule, index) => {
            console.log(`Schedule ${index}:`, {
                id: schedule._id,
                date: schedule.date,
                doctor: schedule.doctor,
                isWorkingDay: schedule.isWorkingDay
            });
        });

        // 如果查询特定日期，返回单个排班记录
        if (date) {
            const schedule = schedules[0];
            if (schedule) {
                res.json(schedule);
            } else {
                            // 如果没有排班记录，返回默认的空排班
            res.json({
                doctor: doctorId,
                date: new Date(date),
                timeSlots: [],
                isWorkingDay: false
            });
            }
        } else {
            res.json(schedules);
        }
    } catch (error) {
        console.error('获取医生排班错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 设置医生排班
const setDoctorSchedule = async (req, res) => {
    try {
        const { date, timeSlots, isWorkingDay, notes, maxAppointments } = req.body;

        // 验证是否为医生
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: '只有医生可以设置排班' });
        }

        const scheduleData = {
            doctor: req.user.id,
            date: new Date(date),
            timeSlots,
            isWorkingDay,
            notes,
            maxAppointments
        };

        // 使用 upsert 操作，如果存在则更新，不存在则创建
        const schedule = await DoctorSchedule.findOneAndUpdate(
            { doctor: req.user.id, date: new Date(date) },
            scheduleData,
            { new: true, upsert: true }
        );

        res.json({
            message: '排班设置成功',
            schedule
        });
    } catch (error) {
        console.error('设置医生排班错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新医生排班
const updateDoctorSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlots, isWorkingDay, notes, maxAppointments } = req.body;

        // 验证是否为医生
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: '只有医生可以更新排班' });
        }

        // 检查排班是否存在且属于当前医生
        const existingSchedule = await DoctorSchedule.findById(id);
        if (!existingSchedule) {
            return res.status(404).json({ message: '排班不存在' });
        }

        if (existingSchedule.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '只能更新自己的排班' });
        }

        const scheduleData = {
            date: new Date(date),
            timeSlots,
            isWorkingDay,
            notes,
            maxAppointments
        };

        const schedule = await DoctorSchedule.findByIdAndUpdate(
            id,
            scheduleData,
            { new: true }
        );

        res.json({
            message: '排班更新成功',
            schedule
        });
    } catch (error) {
        console.error('更新医生排班错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生统计信息
const getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // 获取今日预约数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.countDocuments({
            doctor: doctorId,
            date: { $gte: today, $lt: tomorrow }
        });

        // 获取本周预约数
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const weekAppointments = await Appointment.countDocuments({
            doctor: doctorId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });

        // 获取本月预约数
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const monthAppointments = await Appointment.countDocuments({
            doctor: doctorId,
            date: { $gte: startOfMonth, $lt: endOfMonth }
        });

        // 获取预约状态统计
        const statusStats = await Appointment.aggregate([
            { $match: { doctor: doctorId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 获取最近的患者
        const recentPatients = await Appointment.find({ doctor: doctorId })
            .populate('patient', 'name phone')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            todayAppointments,
            weekAppointments,
            monthAppointments,
            statusStats,
            recentPatients
        });
    } catch (error) {
        console.error('获取医生统计错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生的患者列表
const getDoctorPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // 获取该医生的所有预约，并关联患者信息
        const appointments = await Appointment.find({ doctor: doctorId })
            .populate('patient', 'name email phone dateOfBirth gender address isActive')
            .sort({ createdAt: -1 });

        // 去重患者，并添加最后就诊时间
        const patientMap = new Map();
        
        appointments.forEach(appointment => {
            const patientId = appointment.patient._id.toString();
            if (!patientMap.has(patientId)) {
                const patient = appointment.patient.toObject();
                patient.lastVisit = appointment.date;
                patient.lastAppointmentId = appointment._id;
                patient.appointmentCount = 1;
                patientMap.set(patientId, patient);
            } else {
                const existingPatient = patientMap.get(patientId);
                if (appointment.date > existingPatient.lastVisit) {
                    existingPatient.lastVisit = appointment.date;
                    existingPatient.lastAppointmentId = appointment._id;
                }
                existingPatient.appointmentCount++;
            }
        });

        const patients = Array.from(patientMap.values());

        res.json(patients);
    } catch (error) {
        console.error('获取医生患者列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取可用时间段
const getAvailableTimeSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({ message: '医生ID和日期是必需的' });
        }

        // 获取医生当天的排班
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const schedule = await DoctorSchedule.findOne({
            doctor: doctorId,
            date: { $gte: targetDate, $lt: nextDate }
        });

        if (!schedule || !schedule.isWorkingDay) {
            return res.json({ availableSlots: [] });
        }

        // 获取已预约的时间段
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            date: { $gte: targetDate, $lt: nextDate },
            status: { $in: ['pending', 'confirmed'] }
        });

        const bookedTimeSlots = bookedAppointments.map(apt => apt.timeSlot);

        // 过滤出可用的时间段
        const availableSlots = schedule.timeSlots
            .filter(slot => slot.isAvailable && !bookedTimeSlots.includes(slot.time))
            .map(slot => slot.time);

        res.json({ availableSlots });
    } catch (error) {
        console.error('获取可用时间段错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    getDoctorSchedule,
    setDoctorSchedule,
    updateDoctorSchedule,
    getDoctorStats,
    getDoctorPatients,
    getAvailableTimeSlots
}; 