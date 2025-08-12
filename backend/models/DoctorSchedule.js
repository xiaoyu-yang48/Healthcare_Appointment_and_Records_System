const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlots: [{
        time: { type: String, required: true }, // 例如: "09:00", "09:30"
        isAvailable: { type: Boolean, default: true },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        }
    }],
    isWorkingDay: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String
    },
    maxAppointments: {
        type: Number,
        default: 20
    }
}, {
    timestamps: true
});

// 复合索引确保每个医生每天只有一个排班记录
doctorScheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });
doctorScheduleSchema.index({ date: 1, 'timeSlots.isAvailable': 1 });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema); 