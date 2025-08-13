const express = require('express');
const {
    getConversations,
    getConversationMessages,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
    getUnreadCount,
    sendSystemMessage
} = require('../controllers/messageController');
const { protect, doctorOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 消息管理路由
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getConversationMessages);
router.post('/', sendMessage);
router.put('/:messageId/read', markMessageAsRead);
router.put('/conversation/:userId/read-all', markAllMessagesAsRead);
router.delete('/:messageId', deleteMessage);
router.get('/unread/count', getUnreadCount);

// 系统消息路由（需要医生或管理员权限）
router.post('/system', doctorOrAdmin, sendSystemMessage);

module.exports = router; 