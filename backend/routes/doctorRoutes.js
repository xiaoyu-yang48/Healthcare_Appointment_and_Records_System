const express = require('express');
const {
    getDoctors,
    getDoctorById,
    getDoctorSchedule,
    setDoctorSchedule,
    getDoctorStats,
    getAvailableTimeSlots
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 公开路由（获取医生列表和详情）
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/schedule', getDoctorSchedule);
router.get('/available-slots', getAvailableTimeSlots);

// 需要医生权限的路由
router.use(protect);
router.post('/schedule', doctorOnly, setDoctorSchedule);
router.get('/stats', doctorOnly, getDoctorStats);

module.exports = router; 