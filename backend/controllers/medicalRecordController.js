const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// 获取患者病历列表
const getPatientRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.user.id, isActive: true })
            .populate('doctor', 'name specialization department')
            .populate('appointment', 'date timeSlot')
            .sort({ visitDate: -1 });

        res.json(records);
    } catch (error) {
        console.error('获取患者病历错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取医生创建的病历列表
const getDoctorRecords = async (req, res) => {
    try {
        const { patientId, date } = req.query;
        let query = { doctor: req.user.id, isActive: true };

        if (patientId) {
            query.patient = patientId;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.visitDate = { $gte: startDate, $lt: endDate };
        }

        const records = await MedicalRecord.find(query)
            .populate('patient', 'name phone dateOfBirth gender')
            .populate('appointment', 'date timeSlot')
            .sort({ visitDate: -1 });

        res.json(records);
    } catch (error) {
        console.error('获取医生病历错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 创建病历
const createMedicalRecord = async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            symptoms,
            diagnosis,
            treatment,
            prescription,
            vitalSigns,
            labResults,
            notes,
            followUpDate,
            followUpNotes
        } = req.body;

        // 验证患者是否存在
        const patient = await User.findOne({ _id: patientId, role: 'patient' });
        if (!patient) {
            return res.status(404).json({ message: '患者不存在' });
        }

        // 验证预约是否存在（如果提供了预约ID）
        if (appointmentId) {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: '预约不存在' });
            }
        }

        const medicalRecord = await MedicalRecord.create({
            patient: patientId,
            doctor: req.user.id,
            appointment: appointmentId,
            symptoms,
            diagnosis,
            treatment,
            prescription,
            vitalSigns,
            labResults,
            notes,
            followUpDate,
            followUpNotes
        });

        const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
            .populate('patient', 'name phone dateOfBirth gender')
            .populate('doctor', 'name specialization department')
            .populate('appointment', 'date timeSlot');

        res.status(201).json({
            message: '病历创建成功',
            record: populatedRecord
        });
    } catch (error) {
        console.error('创建病历错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新病历
const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const record = await MedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({ message: '病历不存在' });
        }

        // 验证权限
        if (record.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限修改此病历' });
        }

        // 更新病历
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                record[key] = updateData[key];
            }
        });

        await record.save();

        const updatedRecord = await MedicalRecord.findById(id)
            .populate('patient', 'name phone dateOfBirth gender')
            .populate('doctor', 'name specialization department')
            .populate('appointment', 'date timeSlot');

        res.json({
            message: '病历更新成功',
            record: updatedRecord
        });
    } catch (error) {
        console.error('更新病历错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取病历详情
const getMedicalRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await MedicalRecord.findById(id)
            .populate('patient', 'name phone dateOfBirth gender address')
            .populate('doctor', 'name specialization department phone')
            .populate('appointment', 'date timeSlot symptoms');

        if (!record) {
            return res.status(404).json({ message: '病历不存在' });
        }

        // 验证权限
        if (req.user.role === 'patient' && record.patient._id.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限查看此病历' });
        }

        if (req.user.role === 'doctor' && record.doctor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限查看此病历' });
        }

        res.json(record);
    } catch (error) {
        console.error('获取病历详情错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 删除病历（软删除）
const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await MedicalRecord.findById(id);
        if (!record) {
            return res.status(404).json({ message: '病历不存在' });
        }

        // 验证权限
        if (record.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限删除此病历' });
        }

        record.isActive = false;
        await record.save();

        res.json({ message: '病历删除成功' });
    } catch (error) {
        console.error('删除病历错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取患者病历统计
const getPatientRecordStats = async (req, res) => {
    try {
        const patientId = req.user.id;

        const totalRecords = await MedicalRecord.countDocuments({
            patient: patientId,
            isActive: true
        });

        const thisYearRecords = await MedicalRecord.countDocuments({
            patient: patientId,
            isActive: true,
            visitDate: {
                $gte: new Date(new Date().getFullYear(), 0, 1),
                $lt: new Date(new Date().getFullYear() + 1, 0, 1)
            }
        });

        const thisMonthRecords = await MedicalRecord.countDocuments({
            patient: patientId,
            isActive: true,
            visitDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        });

        // 获取最近的病历
        const recentRecords = await MedicalRecord.find({
            patient: patientId,
            isActive: true
        })
        .populate('doctor', 'name specialization department')
        .sort({ visitDate: -1 })
        .limit(5);

        res.json({
            totalRecords,
            thisYearRecords,
            thisMonthRecords,
            recentRecords
        });
    } catch (error) {
        console.error('获取患者病历统计错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 上传病历附件
const uploadAttachment = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { fileName, filePath, fileType, fileSize } = req.body;

        const record = await MedicalRecord.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: '病历不存在' });
        }

        // 验证权限
        if (record.doctor.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权限修改此病历' });
        }

        record.attachments.push({
            fileName,
            filePath,
            fileType,
            fileSize
        });

        await record.save();

        res.json({
            message: '附件上传成功',
            attachment: record.attachments[record.attachments.length - 1]
        });
    } catch (error) {
        console.error('上传附件错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = {
    getPatientRecords,
    getDoctorRecords,
    createMedicalRecord,
    updateMedicalRecord,
    getMedicalRecordById,
    deleteMedicalRecord,
    getPatientRecordStats,
    uploadAttachment
}; 