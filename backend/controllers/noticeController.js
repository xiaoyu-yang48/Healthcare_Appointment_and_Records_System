const Notice = require('../models/Notice');
const User = require('../models/User');

// 获取用户的通知列表
const getUserNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const userId = req.user.id;

    // 构建查询条件
    const query = { recipientId: userId, isActive: true };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notices = await Notice.find(query)
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const totalNotices = await Notice.countDocuments(query);
    const totalPages = Math.ceil(totalNotices / parseInt(limit));

    // 获取未读数量
    const unreadCount = await Notice.countDocuments({
      recipientId: userId,
      isRead: false,
      isActive: true
    });

    res.json({
      success: true,
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalNotices,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知列表失败'
    });
  }
};

// 标记通知为已读
const markNoticeAsRead = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user.id;

    const notice = await Notice.findOneAndUpdate(
      { _id: noticeId, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      notice
    });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记通知已读失败'
    });
  }
};

// 标记所有通知为已读
const markAllNoticesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notice.updateMany(
      { recipientId: userId, isRead: false, isActive: true },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `已标记 ${result.modifiedCount} 条通知为已读`
    });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记所有通知已读失败'
    });
  }
};

// 删除通知
const deleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const userId = req.user.id;

    const notice = await Notice.findOneAndUpdate(
      { _id: noticeId, recipientId: userId },
      { isActive: false },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      message: '通知已删除'
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({
      success: false,
      message: '删除通知失败'
    });
  }
};

// 获取未读通知数量
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notice.countDocuments({
      recipientId: userId,
      isRead: false,
      isActive: true
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读通知数量失败'
    });
  }
};

// 管理员：获取所有通知（用于管理）
const getAllNotices = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, type } = req.query;

    // 构建查询条件
    const query = { isActive: true };
    if (userId) query.recipientId = userId;
    if (type) query.type = type;

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notices = await Notice.find(query)
      .populate('senderId', 'name email role')
      .populate('recipientId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const totalNotices = await Notice.countDocuments(query);
    const totalPages = Math.ceil(totalNotices / parseInt(limit));

    res.json({
      success: true,
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalNotices,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('获取所有通知失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有通知失败'
    });
  }
};

// 管理员：删除通知
const adminDeleteNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const notice = await Notice.findByIdAndUpdate(
      noticeId,
      { isActive: false },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: '通知不存在'
      });
    }

    res.json({
      success: true,
      message: '通知已删除'
    });
  } catch (error) {
    console.error('管理员删除通知失败:', error);
    res.status(500).json({
      success: false,
      message: '删除通知失败'
    });
  }
};

// 管理员：发送系统通知
const sendSystemNotice = async (req, res) => {
  try {
    const { recipientIds, title, content } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择接收用户'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    // 批量创建系统通知
    const notices = [];
    for (const recipientId of recipientIds) {
      const notice = await Notice.createSystemNotice(recipientId, title, content);
      notices.push(notice);
    }

    res.json({
      success: true,
      message: `已向 ${notices.length} 个用户发送系统通知`,
      notices
    });
  } catch (error) {
    console.error('发送系统通知失败:', error);
    res.status(500).json({
      success: false,
      message: '发送系统通知失败'
    });
  }
};

module.exports = {
  getUserNotices,
  markNoticeAsRead,
  markAllNoticesAsRead,
  deleteNotice,
  getUnreadCount,
  getAllNotices,
  adminDeleteNotice,
  sendSystemNotice
};
