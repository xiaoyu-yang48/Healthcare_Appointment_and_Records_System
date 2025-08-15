const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  notifications: {
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    inAppNotifications: {
      type: Boolean,
      default: true
    }
  },
  appointment: {
    autoConfirm: {
      type: Boolean,
      default: false
    },
    reminderHours: {
      type: Number,
      default: 24
    },
    maxAdvanceDays: {
      type: Number,
      default: 30
    }
  },
  system: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maxFileSize: {
      type: Number,
      default: 10 // MB
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    }
  }
}, {
  timestamps: true
});

// 确保只有一个系统设置实例
systemSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// 更新设置
systemSettingsSchema.statics.updateSettings = async function(updates) {
  const settings = await this.getInstance();
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      settings[key] = updates[key];
    }
  });
  return await settings.save();
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
