const express = require('express');
const {
  getSystemSettings,
  updateSystemSettings,
  getNotificationSettings,
  updateNotificationSettings,
  toggleMaintenanceMode
} = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要管理员权限
router.use(protect);
router.use(adminOnly);

// 系统设置
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);

// 通知设置
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

// 维护模式
router.put('/maintenance-mode', toggleMaintenanceMode);

module.exports = router;
