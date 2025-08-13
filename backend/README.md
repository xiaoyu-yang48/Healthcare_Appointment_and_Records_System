# 医疗预约系统后端

## 概述

这是医疗预约系统的后端服务，基于 Node.js + Express + MongoDB 构建，提供完整的医疗预约管理功能。

## 功能特性

### 用户管理
- 患者、医生、管理员三种角色
- JWT认证和授权
- 用户资料管理
- 密码修改

### 预约管理
- 患者预约挂号
- 医生排班管理
- 预约状态更新
- 预约冲突检测

### 病历管理
- 电子病历创建和查看
- 处方管理
- 检查报告上传
- 病历统计

### 消息系统
- 医患消息交流
- 系统消息推送
- 未读消息提醒

### 管理员功能
- 系统统计信息
- 用户管理
- 预约管理
- 病历管理

## 技术栈

- **Node.js**: 运行环境
- **Express**: Web框架
- **MongoDB**: 数据库
- **Mongoose**: ODM
- **JWT**: 认证
- **bcrypt**: 密码加密
- **CORS**: 跨域处理

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env` 文件：

```env
# 服务器配置
PORT=5000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/healthcare_appointment_system

# JWT配置
JWT_SECRET=your_jwt_secret_key_here

# 跨域配置
CORS_ORIGIN=http://localhost:3000
```

### 3. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

### 4. 健康检查

访问 `http://localhost:3001/api/health` 检查服务状态。

## API 文档

### 认证相关

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "13800138000",
  "address": "北京市朝阳区"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

#### 获取用户资料
```
GET /api/auth/profile
Authorization: Bearer <token>
```

#### 更新用户资料
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区"
}
```

### 预约相关

#### 获取患者预约列表
```
GET /api/appointments/patient
Authorization: Bearer <token>
```

#### 创建预约
```
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor_id_here",
  "date": "2024-01-15",
  "timeSlot": "09:00",
  "symptoms": "头痛、发烧",
  "type": "consultation"
}
```

#### 获取医生预约列表
```
GET /api/appointments/doctor
Authorization: Bearer <token>
```

#### 更新预约状态
```
PUT /api/appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "预约确认"
}
```

### 医生相关

#### 获取医生列表
```
GET /api/doctors
```

#### 获取医生详情
```
GET /api/doctors/:id
```

#### 获取医生排班
```
GET /api/doctors/:id/schedule?date=2024-01-15
```

#### 设置医生排班
```
POST /api/doctors/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "timeSlots": [
    {"time": "09:00", "isAvailable": true},
    {"time": "09:30", "isAvailable": true}
  ],
  "isWorkingDay": true
}
```

### 病历相关

#### 获取患者病历
```
GET /api/medical-records/patient
Authorization: Bearer <token>
```

#### 创建病历
```
POST /api/medical-records
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_id_here",
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
```

### 消息相关

#### 获取对话列表
```
GET /api/messages/conversations
Authorization: Bearer <token>
```

#### 获取对话消息
```
GET /api/messages/conversation/:userId
Authorization: Bearer <token>
```

#### 发送消息
```
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "recipient_id_here",
  "content": "您好，我想咨询一下我的病情"
}
```

### 管理员相关

#### 获取系统统计
```
GET /api/admin/stats
Authorization: Bearer <token>
```

#### 获取用户列表
```
GET /api/admin/users?role=patient&page=1&limit=10
Authorization: Bearer <token>
```

#### 更新用户状态
```
PUT /api/admin/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false
}
```

## 数据库模型

### User 模型
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String, // 'patient', 'doctor', 'admin'
  phone: String,
  address: String,
  dateOfBirth: Date,
  gender: String,
  specialization: String, // 医生专长
  department: String, // 医生科室
  isActive: Boolean,
  lastLogin: Date
}
```

### Appointment 模型
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  date: Date,
  timeSlot: String,
  status: String, // 'pending', 'confirmed', 'cancelled', 'completed'
  type: String, // 'consultation', 'follow-up', 'emergency'
  symptoms: String,
  notes: String
}
```

### MedicalRecord 模型
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  appointment: ObjectId,
  visitDate: Date,
  symptoms: String,
  diagnosis: String,
  treatment: String,
  prescription: Object,
  vitalSigns: Object,
  attachments: Array
}
```

### Message 模型
```javascript
{
  sender: ObjectId,
  recipient: ObjectId,
  content: String,
  messageType: String, // 'text', 'image', 'file', 'system'
  isRead: Boolean,
  isSystemMessage: Boolean
}
```

## 错误处理

所有API都返回统一的错误格式：

```json
{
  "message": "错误描述",
  "error": "详细错误信息（开发环境）"
}
```

常见HTTP状态码：
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 500: 服务器错误

## 开发指南

### 添加新的控制器

1. 在 `controllers/` 目录下创建新文件
2. 实现控制器函数
3. 在 `routes/` 目录下创建路由文件
4. 在 `server.js` 中注册路由

### 添加新的中间件

1. 在 `middleware/` 目录下创建新文件
2. 实现中间件函数
3. 在路由中使用中间件

### 数据库操作

使用 Mongoose 进行数据库操作，所有模型都在 `models/` 目录下。

## 测试

运行测试：
```bash
npm test
```

## 部署

### 生产环境配置

1. 设置 `NODE_ENV=production`
2. 配置生产数据库
3. 设置强密码的 JWT_SECRET
4. 配置反向代理（如 Nginx）
5. 使用 PM2 管理进程

### Docker 部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 许可证

ISC License 