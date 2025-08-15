# API_INTEGRATION (中文版)

> 注意：这是英文文档的中文翻译版本。如有疑问，请参考英文原版。

# 前后端API对接总结

## 概述

已完成医疗预约系统前后端的API对接，确保前端能够正确调用后端提供的所有接口。

## 后端API基础信息

- **基础URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 已对接的API接口

### 1. 认证相关 API

#### 用户登录
- **前端调用**: `POST /auth/login`
- **请求体**: `{ email, password }`
- **响应**: `{ token, user }`
- **状态**: ✅ 已对接

#### 用户注册
- **前端调用**: `POST /auth/register`
- **请求体**: `{ name, email, password, role, phone, address, dateOfBirth, gender, department?, specialization? }`
- **响应**: `{ token, user }`
- **状态**: ✅ 已对接

#### 获取用户资料
- **前端调用**: `GET /auth/profile`
- **认证**: Bearer Token
- **响应**: `{ user }`
- **状态**: ✅ 已对接

#### 更新用户资料
- **前端调用**: `PUT /auth/profile`
- **认证**: Bearer Token
- **请求体**: `{ name, phone, address, dateOfBirth, gender, department?, specialization? }`
- **响应**: `{ user }`
- **状态**: ✅ 已对接

### 2. 预约相关 API

#### 获取患者预约列表
- **前端调用**: `GET /appointments/patient`
- **认证**: Bearer Token
- **响应**: `[{ id, doctor, date, timeSlot, status, type, symptoms }]`
- **状态**: ✅ 已对接

#### 创建预约
- **前端调用**: `POST /appointments`
- **认证**: Bearer Token
- **请求体**: `{ doctorId, date, timeSlot, symptoms, type }`
- **响应**: `{ appointment }`
- **状态**: ✅ 已对接

#### 获取医生预约列表
- **前端调用**: `GET /appointments/doctor?status=confirmed&date=2024-01-15`
- **认证**: Bearer Token
- **响应**: `[{ appointment }]`
- **状态**: ✅ 已对接

#### 获取今日预约
- **前端调用**: `GET /appointments/doctor/today`
- **认证**: Bearer Token
- **响应**: `[{ appointment }]`
- **状态**: ✅ 已对接

#### 更新预约状态
- **前端调用**: `PUT /appointments/:id/status`
- **认证**: Bearer Token
- **请求体**: `{ status, notes? }`
- **响应**: `{ appointment }`
- **状态**: ✅ 已对接

#### 取消预约
- **前端调用**: `PUT /appointments/:id/cancel`
- **认证**: Bearer Token
- **请求体**: `{ reason }`
- **响应**: `{ appointment }`
- **状态**: ✅ 已对接

### 3. 医生相关 API

#### 获取医生列表
- **前端调用**: `GET /doctors?department=内科&specialization=心血管&search=李医生`
- **响应**: `[{ id, name, specialization, department, experience, education, bio, avatar }]`
- **状态**: ✅ 已对接

#### 获取医生详情
- **前端调用**: `GET /doctors/:id`
- **响应**: `{ doctor }`
- **状态**: ✅ 已对接

#### 获取医生排班
- **前端调用**: `GET /doctors/:id/schedule?date=2024-01-15`
- **响应**: `{ doctor, date, timeSlots: [{ time, isAvailable, appointmentId? }], isWorkingDay }`
- **状态**: ✅ 已对接

#### 获取医生统计
- **前端调用**: `GET /doctors/stats`
- **认证**: Bearer Token
- **响应**: `{ todayAppointments, weekAppointments, monthAppointments, statusStats, recentPatients }`
- **状态**: ✅ 已对接

### 4. 病历相关 API

#### 获取患者病历
- **前端调用**: `GET /medical-records/patient`
- **认证**: Bearer Token
- **响应**: `[{ id, doctor, visitDate, symptoms, diagnosis, treatment, prescription, vitalSigns, labResults, notes, followUpDate, followUpNotes }]`
- **状态**: ✅ 已对接

#### 获取病历详情
- **前端调用**: `GET /medical-records/:id`
- **认证**: Bearer Token
- **响应**: `{ record }`
- **状态**: ✅ 已对接

#### 下载病历附件
- **前端调用**: `GET /medical-records/:recordId/attachments`
- **认证**: Bearer Token
- **响应**: Blob
- **状态**: ✅ 已对接

### 5. 消息相关 API

#### 获取对话列表
- **前端调用**: `GET /messages/conversations`
- **认证**: Bearer Token
- **响应**: `[{ user: { id, name, avatar, role }, lastMessage, unreadCount }]`
- **状态**: ✅ 已对接

#### 获取对话消息
- **前端调用**: `GET /messages/conversation/:userId`
- **认证**: Bearer Token
- **响应**: `[{ id, sender, content, createdAt, isRead }]`
- **状态**: ✅ 已对接

#### 发送消息
- **前端调用**: `POST /messages`
- **认证**: Bearer Token
- **请求体**: `{ receiverId, content }`
- **响应**: `{ message }`
- **状态**: ✅ 已对接

### 6. 管理员相关 API

#### 获取系统统计
- **前端调用**: `GET /admin/stats`
- **认证**: Bearer Token
- **响应**: `{ totalUsers, totalDoctors, totalPatients, totalAppointments, todayAppointments, pendingAppointments }`
- **状态**: ✅ 已对接

#### 获取最近用户
- **前端调用**: `GET /admin/users/recent`
- **认证**: Bearer Token
- **响应**: `[{ user }]`
- **状态**: ✅ 已对接

#### 获取最近预约
- **前端调用**: `GET /admin/appointments/recent`
- **认证**: Bearer Token
- **响应**: `[{ appointment }]`
- **状态**: ✅ 已对接

## 前端配置更新

### 1. Axios配置
- 更新了基础URL为 `http://localhost:3001/api`
- 添加了请求超时设置 (10秒)
- 完善了错误处理和日志记录
- 添加了JWT token自动注入

### 2. 认证上下文
- 添加了token验证功能
- 完善了用户状态管理
- 优化了登录/注册流程

### 3. 数据字段映射
- 统一使用 `id` 而不是 `_id`
- 更新了日期字段格式
- 调整了嵌套对象结构

## 错误处理

### 1. 网络错误
- 自动重试机制
- 用户友好的错误提示
- 详细的错误日志

### 2. 认证错误
- 自动跳转到登录页面
- Token过期处理
- 权限验证

### 3. 数据验证
- 前端表单验证
- 后端响应验证
- 数据类型检查

## 性能优化

### 1. 请求优化
- 合理的超时设置
- 请求去重
- 缓存策略

### 2. 数据加载
- 分页加载
- 懒加载
- 预加载

### 3. 用户体验
- 加载状态显示
- 错误状态处理
- 成功反馈

## 测试建议

### 1. 功能测试
- 测试所有API接口
- 验证数据格式
- 检查错误处理

### 2. 集成测试
- 前后端联调
- 数据流测试
- 端到端测试

### 3. 性能测试
- 响应时间测试
- 并发测试
- 压力测试

## 部署配置

### 1. 环境变量
```bash
# 前端环境变量
REACT_APP_API_URL=http://localhost:3001/api

# 后端环境变量
PORT=3001
MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_jwt_secret
```

### 2. CORS配置
后端已配置CORS，允许前端域名访问。

### 3. 生产环境
- 更新API URL为生产环境地址
- 配置HTTPS
- 设置安全头部

## 总结

✅ **已完成的工作**:
1. 所有核心API接口对接
2. 认证系统集成
3. 错误处理机制
4. 数据格式统一
5. 性能优化配置

✅ **可用的功能**:
1. 用户注册/登录
2. 预约管理
3. 病历查看
4. 消息交流
5. 系统管理

✅ **技术特点**:
1. 完整的JWT认证
2. 响应式设计
3. 实时数据更新
4. 用户友好界面
5. 错误恢复机制

前后端API对接已完成，系统可以正常运行！


