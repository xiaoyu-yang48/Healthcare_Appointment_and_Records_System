// 后端国际化工具函数

// 默认语言为英语
const DEFAULT_LANGUAGE = 'en';

// 通知相关的翻译
const NOTICE_TRANSLATIONS = {
  en: {
    appointment_request: {
      title: 'New Appointment Request',
      content: 'Patient {patientName} has submitted a new appointment request. Please review and respond promptly.'
    },
    appointment_confirmed: {
      title: 'Appointment Confirmed',
      content: 'Your appointment has been confirmed by Dr. {doctorName}.'
    },
    appointment_cancelled: {
      title: 'Appointment Cancelled',
      content: '{senderName} has cancelled the appointment.'
    },
    medical_record_added: {
      title: 'New Medical Record',
      content: 'Dr. {doctorName} has added a new medical record for you.'
    },
    new_message: {
      title: 'New Message',
      content: 'You have received a new message from {senderName}.'
    },
    system_notice: {
      title: 'System Notice',
      content: 'System notification'
    }
  },
  zh: {
    appointment_request: {
      title: '新的预约请求',
      content: '患者 {patientName} 提交了新的预约请求，请及时处理。'
    },
    appointment_confirmed: {
      title: '预约已确认',
      content: '您的预约已被 {doctorName} 医生确认。'
    },
    appointment_cancelled: {
      title: '预约已取消',
      content: '{senderName} 取消了预约。'
    },
    medical_record_added: {
      title: '新的病历记录',
      content: '{doctorName} 医生为您添加了新的病历记录。'
    },
    new_message: {
      title: '新消息',
      content: '您收到了来自 {senderName} 的新消息。'
    },
    system_notice: {
      title: '系统通知',
      content: '系统通知'
    }
  }
};

// 获取翻译文本
function getNoticeText(type, language = DEFAULT_LANGUAGE, params = {}) {
  const translations = NOTICE_TRANSLATIONS[language] || NOTICE_TRANSLATIONS[DEFAULT_LANGUAGE];
  const translation = translations[type];
  
  if (!translation) {
    console.warn(`Translation not found for type: ${type}, language: ${language}`);
    return {
      title: type,
      content: 'Notification'
    };
  }

  // 替换参数
  let title = translation.title;
  let content = translation.content;

  Object.keys(params).forEach(key => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, params[key]);
    content = content.replace(placeholder, params[key]);
  });

  return { title, content };
}

// 获取用户语言偏好（可以从用户设置或请求头获取）
function getUserLanguage(req) {
  // 优先从用户设置获取
  if (req.user && req.user.language) {
    return req.user.language;
  }
  
  // 从请求头获取
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.includes('zh')) {
      return 'zh';
    }
  }
  
  // 默认返回英语
  return DEFAULT_LANGUAGE;
}

module.exports = {
  getNoticeText,
  getUserLanguage,
  DEFAULT_LANGUAGE
};
