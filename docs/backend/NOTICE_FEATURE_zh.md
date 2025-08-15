# NOTICE_FEATURE (中文版)

> 注意：这是英文文档的中文翻译版本。如有疑问，请参考英文原版。

# 预约提醒功能说明

## 功能概述

本系统实现了完整的站内消息通知功能，包括预约提醒、病历通知、消息提醒等，确保医生和患者能够及时收到相关通知。

## 功能特性

### 1. 通知类型

- **预约请求通知** (`appointment_request`): 患者提交预约后，医生收到通知
- **预约确认通知** (`appointment_confirmed`): 医生确认预约后，患者收到通知
- **预约取消通知** (`appointment_cancelled`): 预约被取消时，相关方收到通知
- **病历添加通知** (`medical_record_added`): 医生添加病历时，患者收到通知
- **新消息通知** (`new_message`): 收到新消息时的通知
- **系统通知** (`system_notice`): 管理员发送的系统级通知

### 2. 通知管理

- 用户可查看自己的通知列表
- 支持标记通知为已读/未读
- 支持删除通知
- 支持分页查询
- 支持按类型筛选
- 管理员可管理所有通知

### 3. 系统设置

- 管理员可配置通知开关
- 支持邮件通知设置
- 支持短信通知设置
- 支持站内通知设置

## API 接口

### 用户通知接口

#### 获取通知列表
```
GET /api/notices?page=1&limit=10&unreadOnly=false
```

#### 获取未读通知数量
```
GET /api/notices/unread-count
```

#### 标记通知为已读
```
PUT /api/notices/:noticeId/read
```

#### 标记所有通知为已读
```
PUT /api/notices/mark-all-read
```

#### 删除通知
```
DELETE /api/notices/:noticeId
```

### 管理员通知接口

#### 获取所有通知
```
GET /api/notices/admin/all?page=1&limit=20&userId=&type=
```

#### 删除通知
```
DELETE /api/notices/admin/:noticeId
```

#### 发送系统通知
```
POST /api/notices/admin/send-system
{
  "recipientIds": ["userId1", "userId2"],
  "title": "系统维护通知",
  "content": "系统将于今晚进行维护"
}
```

### 系统设置接口

#### 获取通知设置
```
GET /api/settings/notifications
```

#### 更新通知设置
```
PUT /api/settings/notifications
{
  "notifications": {
    "appointmentReminders": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "inAppNotifications": true
  }
}
```

## 数据模型

### Notice 模型

```javascript
{
  recipientId: ObjectId,    // 接收者ID
  senderId: ObjectId,       // 发送者ID
  type: String,             // 通知类型
  title: String,            // 通知标题
  content: String,          // 通知内容
  relatedId: ObjectId,      // 相关记录ID
  relatedType: String,      // 相关记录类型
  isRead: Boolean,          // 是否已读
  isActive: Boolean,        // 是否有效
  createdAt: Date,          // 创建时间
  updatedAt: Date           // 更新时间
}
```

### SystemSettings 模型

```javascript
{
  notifications: {
    appointmentReminders: Boolean,    // 预约提醒
    emailNotifications: Boolean,      // 邮件通知
    smsNotifications: Boolean,        // 短信通知
    inAppNotifications: Boolean       // 站内通知
  },
  appointment: {
    autoConfirm: Boolean,             // 自动确认
    reminderHours: Number,            // 提醒小时数
    maxAdvanceDays: Number            // 最大提前天数
  },
  system: {
    maintenanceMode: Boolean,         // 维护模式
    maxFileSize: Number,              // 最大文件大小
    sessionTimeout: Number            // 会话超时
  }
}
```

## 自动通知触发

### 1. 预约相关通知

- **创建预约**: 自动向医生发送预约请求通知
- **确认预约**: 自动向患者发送预约确认通知
- **取消预约**: 自动向相关方发送取消通知

### 2. 病历相关通知

- **添加病历**: 自动向患者发送病历添加通知

### 3. 消息相关通知

- **发送消息**: 自动向接收者发送新消息通知

## 测试

运行测试命令：

```bash
# 运行所有测试
npm test

# 运行特定测试
npm run test:auth
npm run test:admin
npm run test:appointment
npm run test:medical-record
npm run test:notice
```

## 使用示例

### 前端集成示例

```javascript
// 获取用户通知
const getNotices = async () => {
  const response = await api.get('/api/notices');
  return response.data;
};

// 标记通知为已读
const markAsRead = async (noticeId) => {
  const response = await api.put(`/api/notices/${noticeId}/read`);
  return response.data;
};

// 获取未读数量
const getUnreadCount = async () => {
  const response = await api.get('/api/notices/unread-count');
  return response.data.unreadCount;
};
```

### 实时通知集成

```javascript
// 使用 WebSocket 或轮询获取实时通知
const pollNotices = () => {
  setInterval(async () => {
    const unreadCount = await getUnreadCount();
    if (unreadCount > 0) {
      // 显示通知徽章
      showNotificationBadge(unreadCount);
    }
  }, 30000); // 每30秒检查一次
};
```

## 注意事项

1. 通知创建失败不会影响主要业务流程
2. 通知支持软删除，不会真正删除数据
3. 管理员可以管理所有通知
4. 通知支持分页和筛选
5. 系统设置支持动态配置

## 扩展功能

- 邮件通知集成
- 短信通知集成
- 推送通知集成
- 通知模板管理
- 通知统计分析
