const Message = require('../models/Message');
const User = require('../models/User');
const Notice = require('../models/Notice');

// 获取用户的所有对话
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // 获取所有与当前用户相关的消息
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        })
        .populate('sender', 'name avatar role')
        .populate('recipient', 'name avatar role')
        .sort({ createdAt: -1 });

        // 组织对话
        const conversations = {};
        messages.forEach(message => {
            const otherUserId = message.sender._id.toString() === userId 
                ? message.recipient._id.toString() 
                : message.sender._id.toString();
            
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    user: message.sender._id.toString() === userId 
                        ? message.recipient 
                        : message.sender,
                    lastMessage: message,
                    unreadCount: 0
                };
            }

            // 计算未读消息数
            if (message.recipient._id.toString() === userId && !message.isRead) {
                conversations[otherUserId].unreadCount++;
            }

            // 更新最后一条消息
            if (!conversations[otherUserId].lastMessage || 
                message.createdAt > conversations[otherUserId].lastMessage.createdAt) {
                conversations[otherUserId].lastMessage = message;
            }
        });

        const conversationsList = Object.values(conversations)
            .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

        res.json(conversationsList);
    } catch (error) {
        console.error('获取对话列表错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取与特定用户的对话消息
const getConversationMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // 验证用户是否存在
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 获取双方之间的所有消息
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        })
        .populate('sender', 'name avatar role')
        .populate('recipient', 'name avatar role')
        .sort({ createdAt: 1 });

        // 标记消息为已读
        await Message.updateMany(
            {
                sender: userId,
                recipient: currentUserId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json(messages);
    } catch (error) {
        console.error('获取对话消息错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 发送消息
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content, messageType, attachments } = req.body;

        // 验证接收者是否存在
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: '接收者不存在' });
        }

        // 验证发送者和接收者不是同一个人
        if (recipientId === req.user._id) {
            return res.status(400).json({ message: '不能给自己发送消息' });
        }

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content,
            messageType: messageType || 'text',
            attachments: attachments || []
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar role')
            .populate('recipient', 'name avatar role');

        // 创建新消息通知给接收者
        try {
            await Notice.createNewMessage(
                recipientId,
                req.user._id,
                message._id,
                req.user.name
            );
        } catch (noticeError) {
            console.error('创建消息通知失败:', noticeError);
            // 通知失败不影响消息发送
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('发送消息错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 标记消息为已读
const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: '消息不存在' });
        }

        // 验证权限
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权限操作此消息' });
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        res.json({ message: '消息已标记为已读' });
    } catch (error) {
        console.error('标记消息已读错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 标记所有消息为已读
const markAllMessagesAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Message.updateMany(
            {
                sender: userId,
                recipient: req.user._id,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json({ message: '所有消息已标记为已读' });
    } catch (error) {
        console.error('标记所有消息已读错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 删除消息
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: '消息不存在' });
        }

        // 验证权限（只有发送者可以删除消息）
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: '无权限删除此消息' });
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ message: '消息删除成功' });
    } catch (error) {
        console.error('删除消息错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取未读消息数量
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error('获取未读消息数量错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 发送系统消息
const sendSystemMessage = async (req, res) => {
    try {
        const { recipientId, content, relatedAppointment, relatedMedicalRecord } = req.body;

        // 验证权限（只有管理员和医生可以发送系统消息）
        if (!['admin', 'doctor'].includes(req.user.role)) {
            return res.status(403).json({ message: '无权限发送系统消息' });
        }

        const message = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            content,
            messageType: 'system',
            isSystemMessage: true,
            relatedAppointment,
            relatedMedicalRecord
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar role')
            .populate('recipient', 'name avatar role');

        res.status(201).json({
            message: '系统消息发送成功',
            data: populatedMessage
        });
    } catch (error) {
        console.error('发送系统消息错误:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

module.exports = {
    getConversations,
    getConversationMessages,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteMessage,
    getUnreadCount,
    sendSystemMessage
}; 