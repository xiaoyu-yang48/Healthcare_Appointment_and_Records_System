# 医疗预约系统 API 文档

## 基础信息

- **基础URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证相关 API

### 用户注册
```
POST /auth/register
```

**请求体**:
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "13800138000",
  "address": "北京市朝阳区",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

**响应**:
```json
{
  "message": "注册成功",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "patient"
  }
}
```

### 用户登录
```
POST /auth/login
```

**请求体**:
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "message": "登录成功",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "张三",
    "email": "zhangsan@example.com",
    "role": "patient"
  }
}
```

### 获取用户资料
```
GET /auth/profile
Authorization: Bearer <token>
```

### 更新用户资料
```
PUT /auth/profile
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区"
}
```

### 修改密码
```
PUT /auth/change-password
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## 预约相关 API

### 获取患者预约列表
```
GET /appointments/patient
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "appointment_id",
    "doctor": {
      "id": "doctor_id",
      "name": "李医生",
      "specialization": "内科",
      "department": "内科"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "timeSlot": "09:00",
    "status": "confirmed",
    "type": "consultation",
    "symptoms": "头痛、发烧"
  }
]
```

### 创建预约
```
POST /appointments
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "doctorId": "doctor_id_here",
  "date": "2024-01-15",
  "timeSlot": "09:00",
  "symptoms": "头痛、发烧",
  "type": "consultation"
}
```

### 获取医生预约列表
```
GET /appointments/doctor?status=confirmed&date=2024-01-15
Authorization: Bearer <token>
```

### 获取今日预约
```
GET /appointments/doctor/today
Authorization: Bearer <token>
```

### 更新预约状态
```
PUT /appointments/:id/status
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "status": "confirmed",
  "notes": "预约确认"
}
```

### 取消预约
```
PUT /appointments/:id/cancel
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "reason": "临时有事"
}
```

### 获取预约详情
```
GET /appointments/:id
Authorization: Bearer <token>
```

## 医生相关 API

### 获取医生列表
```
GET /doctors?department=内科&specialization=心血管&search=李医生
```

**响应**:
```json
[
  {
    "id": "doctor_id",
    "name": "李医生",
    "specialization": "心血管内科",
    "department": "内科",
    "experience": 10,
    "education": "医学博士",
    "bio": "专业从事心血管疾病诊疗...",
    "avatar": "avatar_url"
  }
]
```

### 获取医生详情
```
GET /doctors/:id
```

### 获取医生排班
```
GET /doctors/:id/schedule?date=2024-01-15
```

**响应**:
```json
{
  "doctor": "doctor_id",
  "date": "2024-01-15T00:00:00.000Z",
  "timeSlots": [
    {
      "time": "09:00",
      "isAvailable": true
    },
    {
      "time": "09:30",
      "isAvailable": false,
      "appointmentId": "appointment_id"
    }
  ],
  "isWorkingDay": true
}
```

### 设置医生排班
```
POST /doctors/schedule
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "date": "2024-01-15",
  "timeSlots": [
    {"time": "09:00", "isAvailable": true},
    {"time": "09:30", "isAvailable": true},
    {"time": "10:00", "isAvailable": true}
  ],
  "isWorkingDay": true,
  "notes": "正常上班",
  "maxAppointments": 20
}
```

### 获取医生统计
```
GET /doctors/stats
Authorization: Bearer <token>
```

**响应**:
```json
{
  "todayAppointments": 5,
  "weekAppointments": 25,
  "monthAppointments": 100,
  "statusStats": [
    {"_id": "confirmed", "count": 80},
    {"_id": "pending", "count": 15},
    {"_id": "completed", "count": 5}
  ],
  "recentPatients": [
    {
      "patient": {
        "id": "patient_id",
        "name": "张三",
        "phone": "13800138000"
      }
    }
  ]
}
```

### 获取可用时间段
```
GET /doctors/available-slots?doctorId=doctor_id&date=2024-01-15
```

**响应**:
```json
{
  "availableSlots": ["09:00", "09:30", "10:00", "10:30"]
}
```

## 病历相关 API

### 获取患者病历
```
GET /medical-records/patient
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "record_id",
    "doctor": {
      "id": "doctor_id",
      "name": "李医生",
      "specialization": "内科",
      "department": "内科"
    },
    "visitDate": "2024-01-15T00:00:00.000Z",
    "symptoms": "头痛、发烧",
    "diagnosis": "感冒",
    "treatment": "多休息，多喝水",
    "prescription": {
      "medications": [
        {
          "name": "布洛芬",
          "dosage": "400mg",
          "frequency": "每8小时一次",
          "duration": "3天"
        }
      ]
    }
  }
]
```

### 获取医生创建的病历
```
GET /medical-records/doctor?patientId=patient_id&date=2024-01-15
Authorization: Bearer <token>
```

### 创建病历
```
POST /medical-records
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "patientId": "patient_id_here",
  "appointmentId": "appointment_id_here",
  "symptoms": "头痛、发烧",
  "diagnosis": "感冒",
  "treatment": "多休息，多喝水",
  "prescription": {
    "medications": [
      {
        "name": "布洛芬",
        "dosage": "400mg",
        "frequency": "每8小时一次",
        "duration": "3天",
        "instructions": "饭后服用"
      }
    ]
  },
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 75,
    "temperature": 37.2,
    "weight": 65,
    "height": 170
  },
  "labResults": [
    {
      "testName": "血常规",
      "result": "正常",
      "normalRange": "正常范围",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ],
  "notes": "患者恢复良好",
  "followUpDate": "2024-01-22",
  "followUpNotes": "一周后复查"
}
```

### 更新病历
```
PUT /medical-records/:id
Authorization: Bearer <token>
```

### 获取病历详情
```
GET /medical-records/:id
Authorization: Bearer <token>
```

### 删除病历
```
DELETE /medical-records/:id
Authorization: Bearer <token>
```

### 获取患者病历统计
```
GET /medical-records/patient/stats
Authorization: Bearer <token>
```

**响应**:
```json
{
  "totalRecords": 10,
  "thisYearRecords": 5,
  "thisMonthRecords": 2,
  "recentRecords": [
    {
      "doctor": {
        "id": "doctor_id",
        "name": "李医生",
        "specialization": "内科",
        "department": "内科"
      }
    }
  ]
}
```

### 上传病历附件
```
POST /medical-records/:recordId/attachments
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "fileName": "检查报告.pdf",
  "filePath": "/uploads/reports/report.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000
}
```

## 消息相关 API

### 获取对话列表
```
GET /messages/conversations
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "user": {
      "id": "user_id",
      "name": "李医生",
      "avatar": "avatar_url",
      "role": "doctor"
    },
    "lastMessage": {
      "content": "您好，我想咨询一下我的病情",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "isRead": false
    },
    "unreadCount": 2
  }
]
```

### 获取对话消息
```
GET /messages/conversation/:userId
Authorization: Bearer <token>
```

**响应**:
```json
[
  {
    "id": "message_id",
    "sender": {
      "id": "sender_id",
      "name": "张三",
      "avatar": "avatar_url",
      "role": "patient"
    },
    "recipient": {
      "id": "recipient_id",
      "name": "李医生",
      "avatar": "avatar_url",
      "role": "doctor"
    },
    "content": "您好，我想咨询一下我的病情",
    "messageType": "text",
    "isRead": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### 发送消息
```
POST /messages
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "recipientId": "recipient_id_here",
  "content": "您好，我想咨询一下我的病情",
  "messageType": "text",
  "attachments": []
}
```

### 标记消息为已读
```
PUT /messages/:messageId/read
Authorization: Bearer <token>
```

### 标记所有消息为已读
```
PUT /messages/conversation/:userId/read-all
Authorization: Bearer <token>
```

### 删除消息
```
DELETE /messages/:messageId
Authorization: Bearer <token>
```

### 获取未读消息数量
```
GET /messages/unread/count
Authorization: Bearer <token>
```

**响应**:
```json
{
  "unreadCount": 5
}
```

### 发送系统消息
```
POST /messages/system
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "recipientId": "recipient_id_here",
  "content": "您的预约已确认，请按时就诊",
  "relatedAppointment": "appointment_id_here",
  "relatedMedicalRecord": "record_id_here"
}
```

## 管理员相关 API

### 获取系统统计
```
GET /admin/stats
Authorization: Bearer <token>
```

**响应**:
```json
{
  "users": {
    "total": 100,
    "patients": 80,
    "doctors": 15,
    "active": 95
  },
  "appointments": {
    "total": 500,
    "today": 25,
    "byStatus": [
      {"_id": "confirmed", "count": 300},
      {"_id": "pending", "count": 150},
      {"_id": "completed", "count": 50}
    ]
  },
  "records": {
    "total": 400,
    "thisMonth": 50
  },
  "messages": {
    "total": 1000,
    "unread": 25
  },
  "recentUsers": [
    {
      "id": "user_id",
      "name": "新用户",
      "email": "newuser@example.com",
      "role": "patient",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "recentAppointments": [
    {
      "patient": {
        "id": "patient_id",
        "name": "张三"
      },
      "doctor": {
        "id": "doctor_id",
        "name": "李医生"
      }
    }
  ]
}
```

### 获取用户列表
```
GET /admin/users?role=patient&search=张三&page=1&limit=10
Authorization: Bearer <token>
```

**响应**:
```json
{
  "users": [
    {
      "id": "user_id",
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "patient",
      "phone": "13800138000",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "totalUsers": 50
  }
}
```

### 更新用户状态
```
PUT /admin/users/:id/status
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "isActive": false
}
```

### 删除用户
```
DELETE /admin/users/:id
Authorization: Bearer <token>
```

### 获取预约列表
```
GET /admin/appointments?status=confirmed&doctorId=doctor_id&patientId=patient_id&date=2024-01-15&page=1&limit=10
Authorization: Bearer <token>
```

### 获取病历列表
```
GET /admin/medical-records?doctorId=doctor_id&patientId=patient_id&date=2024-01-15&page=1&limit=10
Authorization: Bearer <token>
```

### 获取部门统计
```
GET /admin/stats/departments
Authorization: Bearer <token>
```

**响应**:
```json
{
  "departments": [
    {"_id": "内科", "count": 8},
    {"_id": "外科", "count": 5},
    {"_id": "儿科", "count": 3}
  ],
  "specializations": [
    {"_id": "心血管内科", "count": 3},
    {"_id": "消化内科", "count": 2},
    {"_id": "神经内科", "count": 2}
  ]
}
```

## 错误响应格式

所有API在发生错误时都返回统一的格式：

```json
{
  "message": "错误描述",
  "error": "详细错误信息（开发环境）"
}
```

## HTTP 状态码

- **200**: 成功
- **201**: 创建成功
- **400**: 请求参数错误
- **401**: 未认证
- **403**: 无权限
- **404**: 资源不存在
- **500**: 服务器错误

## 认证说明

除了注册和登录接口，所有其他接口都需要在请求头中包含JWT token：

```
Authorization: Bearer <your_jwt_token>
```

## 分页说明

支持分页的接口使用以下查询参数：
- `page`: 页码（从1开始）
- `limit`: 每页数量（默认10）

响应中包含分页信息：
```json
{
  "data": [...],
  "pagination": {
    "current": 1,
    "total": 5,
    "totalItems": 50
  }
}
```

## 时间格式

所有时间字段使用ISO 8601格式：`YYYY-MM-DDTHH:mm:ss.sssZ`

## 文件上传

文件上传接口需要先上传文件到文件服务器，然后调用API接口传递文件信息。 