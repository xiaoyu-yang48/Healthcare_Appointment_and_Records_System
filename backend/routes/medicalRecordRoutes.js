const express = require('express');
const {
    getPatientRecords,
    getDoctorRecords,
    createMedicalRecord,
    updateMedicalRecord,
    getMedicalRecordById,
    deleteMedicalRecord,
    getPatientRecordStats,
    uploadAttachment
} = require('../controllers/medicalRecordController');
const { protect, patientOnly, doctorOnly, patientOrDoctor } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 患者路由
router.get('/patient', patientOnly, getPatientRecords);
router.get('/patient/stats', patientOnly, getPatientRecordStats);

// 医生路由
router.get('/doctor', doctorOnly, getDoctorRecords);
router.post('/', doctorOnly, createMedicalRecord);
router.put('/:id', doctorOnly, updateMedicalRecord);
router.delete('/:id', doctorOnly, deleteMedicalRecord);
router.post('/:recordId/attachments', doctorOnly, uploadAttachment);

// 通用路由
router.get('/:id', patientOrDoctor, getMedicalRecordById);

module.exports = router; 