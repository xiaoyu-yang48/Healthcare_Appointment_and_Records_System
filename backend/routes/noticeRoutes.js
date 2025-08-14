const express = require('express');
const {
  getUserNotices,
  markNoticeAsRead,
  markAllNoticesAsRead,
  deleteNotice,
  getUnreadCount,
  getAllNotices,
  adminDeleteNotice,
  sendSystemNotice
} = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 用户通知路由（需要认证）
router.use(protect);

// 获取用户通知列表
router.get('/', getUserNotices);

// 获取未读通知数量
router.get('/unread-count', getUnreadCount);

// 标记通知为已读
router.put('/:noticeId/read', markNoticeAsRead);

// 标记所有通知为已读
router.put('/mark-all-read', markAllNoticesAsRead);

// 删除通知
router.delete('/:noticeId', deleteNotice);

// 管理员路由（需要管理员权限）
router.use(adminOnly);

// 获取所有通知（管理员）
router.get('/admin/all', getAllNotices);

// 删除通知（管理员）
router.delete('/admin/:noticeId', adminDeleteNotice);

// 发送系统通知（管理员）
router.post('/admin/send-system', sendSystemNotice);

module.exports = router;
