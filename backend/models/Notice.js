const mongoose = require('mongoose');

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
noticeSchema.statics.createAppointmentRequest = function(doctorId, patientId, appointmentId, patientName) {
  return this.create({
    recipientId: doctorId,
    senderId: patientId,
    type: 'appointment_request',
    title: '新的预约请求',
    content: `患者 ${patientName} 提交了新的预约请求，请及时处理。`,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建预约确认通知
noticeSchema.statics.createAppointmentConfirmed = function(patientId, doctorId, appointmentId, doctorName) {
  return this.create({
    recipientId: patientId,
    senderId: doctorId,
    type: 'appointment_confirmed',
    title: '预约已确认',
    content: `您的预约已被 ${doctorName} 医生确认。`,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建预约取消通知
noticeSchema.statics.createAppointmentCancelled = function(recipientId, senderId, appointmentId, senderName) {
  return this.create({
    recipientId,
    senderId,
    type: 'appointment_cancelled',
    title: '预约已取消',
    content: `${senderName} 取消了预约。`,
    relatedId: appointmentId,
    relatedType: 'appointment'
  });
};

// 静态方法：创建病历添加通知
noticeSchema.statics.createMedicalRecordAdded = function(patientId, doctorId, recordId, doctorName) {
  return this.create({
    recipientId: patientId,
    senderId: doctorId,
    type: 'medical_record_added',
    title: '新的病历记录',
    content: `${doctorName} 医生为您添加了新的病历记录。`,
    relatedId: recordId,
    relatedType: 'medical_record'
  });
};

// 静态方法：创建新消息通知
noticeSchema.statics.createNewMessage = function(recipientId, senderId, messageId, senderName) {
  return this.create({
    recipientId,
    senderId,
    type: 'new_message',
    title: '新消息',
    content: `您收到了来自 ${senderName} 的新消息。`,
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
