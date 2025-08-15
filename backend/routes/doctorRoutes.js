const express = require('express');
const {
    getDoctors,
    getDoctorById,
    getDoctorSchedule,
    setDoctorSchedule,
    updateDoctorSchedule,
    getDoctorStats,
    getDoctorPatients,
    getAvailableTimeSlots
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 公开路由（获取医生列表和详情）
router.get('/', getDoctors);
router.get('/available-slots', getAvailableTimeSlots);

// 需要医生权限的路由
router.use(protect);
router.get('/schedule', doctorOnly, getDoctorSchedule);
router.post('/schedule', doctorOnly, setDoctorSchedule);
router.put('/schedule/:id', doctorOnly, updateDoctorSchedule);
router.get('/stats', doctorOnly, getDoctorStats);
router.get('/patients', doctorOnly, getDoctorPatients);

// 参数路由（必须放在具体路径之后）
router.get('/:id', getDoctorById);
router.get('/:id/schedule', getDoctorSchedule);

module.exports = router; 