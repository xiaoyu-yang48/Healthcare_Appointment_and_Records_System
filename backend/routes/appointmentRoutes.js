const express = require('express');
const {
    getPatientAppointments,
    getDoctorAppointments,
    getTodayAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentById
} = require('../controllers/appointmentController');
const { protect, patientOnly, doctorOnly, patientOrDoctor } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 患者预约路由
router.get('/patient', patientOnly, getPatientAppointments);
router.post('/', patientOnly, createAppointment);
router.put('/:id/cancel', patientOrDoctor, cancelAppointment);

// 医生预约路由
router.get('/doctor', doctorOnly, getDoctorAppointments);
router.get('/doctor/today', doctorOnly, getTodayAppointments);
router.put('/:id/status', doctorOnly, updateAppointmentStatus);

// 通用路由
router.get('/:id', patientOrDoctor, getAppointmentById);

module.exports = router; 