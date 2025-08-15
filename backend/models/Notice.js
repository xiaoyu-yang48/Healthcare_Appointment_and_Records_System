const mongoose = require('mongoose');
const { getNoticeText } = require('../utils/i18n');

const noticeSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['appointment_request', 'appointment_confirmed', 'appointment_cancelled', 'medical_record_added', 'new_message', 'system_notice'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // 可以是 Appointment, MedicalRecord, Message 等的 ID
  },
  relatedType: {
    type: String,
    enum: ['appointment', 'medical_record', 'message', 'system']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 索引优化
noticeSchema.index({ recipientId: 1, isRead: 1 });
noticeSchema.index({ recipientId: 1, createdAt: -1 });
noticeSchema.index({ type: 1, relatedId: 1 });

// 静态方法：创建预约请求通知
noticeSchema.statics.createAppointmentRequest = function(doctorId, patientId, appointmentId, patientName, language = 'en') {
  const { title, content } = getNoticeText('appointment_request', language, { patientName });
  return this.create({
    recipientId: doctorId,
    senderId: patientId,
    type: 'appointment_request',
    title,
    content,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建预约确认通知
noticeSchema.statics.createAppointmentConfirmed = function(patientId, doctorId, appointmentId, doctorName, language = 'en') {
  const { title, content } = getNoticeText('appointment_confirmed', language, { doctorName });
  return this.create({
    recipientId: patientId,
    senderId: doctorId,
    type: 'appointment_confirmed',
    title,
    content,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建预约取消通知
noticeSchema.statics.createAppointmentCancelled = function(recipientId, senderId, appointmentId, senderName, language = 'en') {
  const { title, content } = getNoticeText('appointment_cancelled', language, { senderName });
  return this.create({
    recipientId,
    senderId,
    type: 'appointment_cancelled',
    title,
    content,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建病历添加通知
noticeSchema.statics.createMedicalRecordAdded = function(patientId, doctorId, recordId, doctorName, language = 'en') {
  const { title, content } = getNoticeText('medical_record_added', language, { doctorName });
  return this.create({
    recipientId: patientId,
    senderId: doctorId,
    type: 'medical_record_added',
    title,
    content,
    relatedId: recordId,
    relatedType: 'medical_record'
  });
};

// 静态方法：创建新消息通知
noticeSchema.statics.createNewMessage = function(recipientId, senderId, messageId, senderName, language = 'en') {
  const { title, content } = getNoticeText('new_message', language, { senderName });
  return this.create({
    recipientId,
    senderId,
    type: 'new_message',
    title,
    content,
    relatedId: messageId,
    relatedType: 'message'
  });
};

// 静态方法：创建系统通知
noticeSchema.statics.createSystemNotice = function(recipientId, title, content) {
  return this.create({
    recipientId,
    type: 'system_notice',
    title,
    content,
    relatedType: 'system'
  });
};

module.exports = mongoose.model('Notice', noticeSchema);
