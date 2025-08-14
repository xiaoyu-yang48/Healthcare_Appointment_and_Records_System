const express = require('express');
const {
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
    getDepartmentStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要管理员权限
router.use(protect);
router.use(adminOnly);

// 系统统计
router.get('/stats', getSystemStats);
router.get('/stats/departments', getDepartmentStats);

// 用户管理
router.get('/users', getUsers);
router.get('/users/recent', getRecentUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// 预约管理
router.get('/appointments', getAppointments);
router.get('/appointments/recent', getRecentAppointments);

// 病历管理
router.get('/medical-records', getMedicalRecords);

module.exports = router; 