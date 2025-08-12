const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    attachments: [{
        fileName: { type: String },
        filePath: { type: String },
        fileType: { type: String },
        fileSize: { type: Number }
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    isSystemMessage: {
        type: Boolean,
        default: false
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    relatedMedicalRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
    }
}, {
    timestamps: true
});

// 索引优化查询性能
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema); 