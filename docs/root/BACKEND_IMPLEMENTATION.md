// ...existing code...

## 概述

根据前端实现的需求和API接口，我已经完成了医疗预约系统的完整后端实现。后端采用 Node.js + Express + MongoDB 技术栈，提供了完整的医疗预约管理功能。

## 已实现的功能

### 1. 用户管理系统
- ✅ 用户注册（患者、医生）
- ✅ 用户登录（患者、医生、管理员）
- ✅ JWT认证和授权
- ✅ 角色权限控制（患者、医生、管理员）
- ✅ 用户资料管理
- ✅ 密码修改
- ✅ 用户状态管理（启用/禁用）

### 2. 预约管理系统
- ✅ 患者预约挂号
- ✅ 医生排班管理
- ✅ 预约状态更新（待确认、已确认、已取消、已完成）
- ✅ 预约冲突检测
- ✅ 预约查询和筛选
- ✅ 今日预约查看
- ✅ 预约统计信息

### 3. 医生管理系统
- ✅ 医生信息管理
- ✅ 医生排班设置
- ✅ 可用时间段查询
- ✅ 医生统计信息
- ✅ 医生搜索和筛选

### 4. 病历管理系统
- ✅ 电子病历创建
- ✅ 病历查看和更新
- ✅ 处方管理
- ✅ 检查报告管理
- ✅ 病历附件上传
- ✅ 病历统计信息

### 5. 消息系统
- ✅ 医患消息交流
- ✅ 对话管理
- ✅ 消息状态管理（已读/未读）
- ✅ 系统消息推送
- ✅ 未读消息提醒

### 6. 管理员功能
- ✅ 系统统计信息
- ✅ 用户管理
- ✅ 预约管理
- ✅ 病历管理
- ✅ 部门统计

## SysML 设计图说明

### 1. Requirements Diagram
后端需求包括用户管理、预约管理、病历管理、消息系统、安全性等。

### 2. Block Definition Diagram (BDD)
后端主要模块：User、Appointment、DoctorSchedule、MedicalRecord、Message，模块间通过 ObjectId 关联。

### 3. Parametric Diagram
描述预约流程、病历创建流程等关键业务逻辑的参数约束。

（建议将实际绘制的 SysML 图以图片形式插入此处，或在报告中附上截图）

---

## CI/CD 流程说明

### 1. 代码托管与分支管理
- GitHub 主分支为生产分支，功能开发采用 feature 分支，PR 审核合并。

### 2. 自动化测试
- 可选：每次提交或 PR 时自动运行单元测试。

### 3. 自动化部署
- 使用 GitHub Actions 实现 CI/CD：
	- 后端推送到 AWS EC2，自动重启服务。

### 4. 工作流示例
```yaml
name: Backend CI/CD Pipeline
on:
	push:
		branches: [ main ]
	pull_request:
		branches: [ main ]
jobs:
	build-and-deploy:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v3
			- name: Set up Node.js
				uses: actions/setup-node@v3
				with:
					node-version: '18'
			- name: Install dependencies
				run: npm install
			- name: Run tests
				run: npm test
			- name: Deploy to AWS EC2
				run: |
					# SSH 到 EC2 并执行部署脚本
					# ...
```

---

### 技术栈
- **Node.js**: 运行环境
- **Express**: Web框架
- **MongoDB**: 数据库
- **Mongoose**: ODM
- **JWT**: 认证
- **bcrypt**: 密码加密
- **CORS**: 跨域处理

### 项目结构
```
backend/
├── config/                 # 配置文件
│   └── db.js              # 数据库连接
├── controllers/           # 控制器
│   ├── authController.js  # 认证控制器
│   ├── appointmentController.js # 预约控制器
│   ├── doctorController.js # 医生控制器
│   ├── medicalRecordController.js # 病历控制器
│   ├── messageController.js # 消息控制器
│   └── adminController.js # 管理员控制器
├── middleware/            # 中间件
│   └── authMiddleware.js  # 认证和权限中间件
├── models/               # 数据模型
│   ├── User.js           # 用户模型
│   ├── Appointment.js    # 预约模型
│   ├── MedicalRecord.js  # 病历模型
│   ├── Message.js        # 消息模型
│   └── DoctorSchedule.js # 医生排班模型
├── routes/               # 路由
│   ├── authRoutes.js     # 认证路由
│   ├── appointmentRoutes.js # 预约路由
│   ├── doctorRoutes.js   # 医生路由
│   ├── medicalRecordRoutes.js # 病历路由
│   ├── messageRoutes.js  # 消息路由
│   └── adminRoutes.js    # 管理员路由
├── server.js             # 主服务器文件
├── package.json          # 项目配置
├── README.md             # 项目说明
├── API_DOCUMENTATION.md  # API文档
└── start.sh              # 启动脚本
```

### 数据模型设计

#### User 模型
- 支持患者、医生、管理员三种角色
- 包含基本信息、医生特有信息、患者特有信息
- 密码加密存储
- 用户状态管理

#### Appointment 模型
- 患者和医生关联
- 预约时间和状态管理
- 预约类型和症状记录
- 取消原因和操作记录

#### MedicalRecord 模型
- 完整的病历信息
- 处方和检查结果管理
- 附件上传支持
- 随访记录

#### Message 模型
- 消息发送和接收
- 消息类型支持（文本、图片、文件、系统）
- 已读状态管理
- 关联预约和病历

#### DoctorSchedule 模型
- 医生排班管理
- 时间段可用性控制
- 最大预约数限制

## API 接口

### 认证相关 (5个接口)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料
- `PUT /api/auth/profile` - 更新用户资料
- `PUT /api/auth/change-password` - 修改密码

### 预约相关 (7个接口)
- `GET /api/appointments/patient` - 获取患者预约
- `POST /api/appointments` - 创建预约
- `GET /api/appointments/doctor` - 获取医生预约
- `GET /api/appointments/doctor/today` - 获取今日预约
- `PUT /api/appointments/:id/status` - 更新预约状态
- `PUT /api/appointments/:id/cancel` - 取消预约
- `GET /api/appointments/:id` - 获取预约详情

### 医生相关 (6个接口)
- `GET /api/doctors` - 获取医生列表
- `GET /api/doctors/:id` - 获取医生详情
- `GET /api/doctors/:id/schedule` - 获取医生排班
- `POST /api/doctors/schedule` - 设置医生排班
- `GET /api/doctors/stats` - 获取医生统计
- `GET /api/doctors/available-slots` - 获取可用时间段

### 病历相关 (8个接口)
- `GET /api/medical-records/patient` - 获取患者病历
- `GET /api/medical-records/doctor` - 获取医生病历
- `POST /api/medical-records` - 创建病历
- `PUT /api/medical-records/:id` - 更新病历
- `GET /api/medical-records/:id` - 获取病历详情
- `DELETE /api/medical-records/:id` - 删除病历
- `GET /api/medical-records/patient/stats` - 获取患者病历统计
- `POST /api/medical-records/:recordId/attachments` - 上传附件

### 消息相关 (8个接口)
- `GET /api/messages/conversations` - 获取对话列表
- `GET /api/messages/conversation/:userId` - 获取对话消息
- `POST /api/messages` - 发送消息
- `PUT /api/messages/:messageId/read` - 标记消息已读
- `PUT /api/messages/conversation/:userId/read-all` - 标记所有消息已读
- `DELETE /api/messages/:messageId` - 删除消息
- `GET /api/messages/unread/count` - 获取未读消息数量
- `POST /api/messages/system` - 发送系统消息

### 管理员相关 (7个接口)
- `GET /api/admin/stats` - 获取系统统计
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/:id/status` - 更新用户状态
- `DELETE /api/admin/users/:id` - 删除用户
- `GET /api/admin/appointments` - 获取预约列表
- `GET /api/admin/medical-records` - 获取病历列表
- `GET /api/admin/stats/departments` - 获取部门统计

## 安全特性

### 1. 认证和授权
- JWT token认证
- 角色权限控制
- 路由保护中间件
- 密码加密存储

### 2. 数据验证
- 输入参数验证
- 用户权限验证
- 数据完整性检查
- 错误处理机制

### 3. 安全措施
- CORS跨域配置
- 错误信息过滤
- 用户状态检查
- 操作权限验证

## 性能优化

### 1. 数据库优化
- 索引设计
- 查询优化
- 关联查询优化
- 分页支持

### 2. 代码优化
- 异步处理
- 错误处理
- 日志记录
- 内存管理

## 安装和运行

### 1. 环境要求
- Node.js 14+
- MongoDB 4+
- npm 或 yarn

### 2. 安装步骤
```bash
cd backend
npm install
```

### 3. 环境配置
创建 `.env` 文件：
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthcare_appointment_system
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start

# 或使用启动脚本
./start.sh
```

### 5. 健康检查
访问 `http://localhost:3001/api/health` 检查服务状态。

## 测试

### 1. 单元测试
```bash
npm test
```

### 2. API测试
使用 Postman 或类似工具测试API接口。

## 部署

### 1. 生产环境配置
- 设置 `NODE_ENV=production`
- 配置生产数据库
- 设置强密码的 JWT_SECRET
- 配置反向代理

### 2. 本地部署
提供本地启动脚本，支持直接运行。

## 文档

### 1. API文档
完整的API文档，包含所有接口的详细说明。

### 2. 数据库设计
详细的数据库模型设计文档。

### 3. 部署指南
完整的部署和运维指南。

## 与前端集成

后端API完全匹配前端需求：

### 1. 认证集成
- 支持前端登录/注册功能
- JWT token管理
- 用户角色权限控制

### 2. 预约功能集成
- 患者预约挂号
- 医生预约管理
- 预约状态更新

### 3. 病历功能集成
- 患者病历查看
- 医生病历创建
- 附件上传支持

### 4. 消息功能集成
- 医患消息交流
- 系统消息推送
- 未读消息提醒

### 5. 管理员功能集成
- 系统统计信息
- 用户管理功能
- 数据管理功能

## 总结

后端实现完全符合前端需求，提供了：

1. **完整的API接口**: 41个API接口覆盖所有功能
2. **完善的数据模型**: 5个核心数据模型
3. **安全的认证授权**: JWT + 角色权限控制
4. **良好的性能**: 数据库优化和代码优化
5. **详细的文档**: API文档和部署指南
6. **易于部署**: 支持多种部署方式

后端已经准备就绪，可以与前端进行完整的集成测试。 