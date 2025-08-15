# SYSML 图表更新总结

## 📋 更新概述

已根据项目实际情况更新了SYSML图表，提供了详细的字符图和draw.io绘制说明。

## 🎯 更新的图表类型

### 1. 系统上下文图 (System Context Diagram)
- **目的**：展示系统与外部角色的交互
- **主要元素**：患者、医生、管理员、核心系统模块
- **颜色方案**：
  - 患者：浅蓝色 (#E3F2FD)
  - 医生：浅绿色 (#E8F5E8)
  - 管理员：浅橙色 (#FFF3E0)

### 2. 用例图 (Use Case Diagram)
- **目的**：描述系统功能需求
- **主要用例**：
  - 患者：注册、登录、预约挂号、查看病历、发送消息
  - 医生：管理排班、查看预约、创建病历、回复消息
  - 管理员：管理用户、查看统计、配置系统

### 3. 类图 (Class Diagram)
- **目的**：展示数据模型和关系
- **主要类**：
  - User (用户)
  - Appointment (预约)
  - MedicalRecord (病历)
  - Message (消息)
  - DoctorSchedule (医生排班)
  - Notice (通知)

### 4. 时序图 (Sequence Diagram)
- **目的**：展示预约流程的交互时序
- **参与者**：患者、前端、后端、数据库
- **主要流程**：登录 → 查看医生 → 选择医生 → 查看排班 → 预约 → 确认

### 5. 活动图 (Activity Diagram)
- **目的**：展示用户注册的业务流程
- **主要活动**：填写表单 → 验证数据 → 创建用户 → 发送邮件 → 跳转仪表板

### 6. 组件图 (Component Diagram)
- **目的**：展示系统架构组件
- **主要组件**：
  - 前端：React模块 (认证、患者、医生、管理、共享组件、工具)
  - 后端：Node.js控制器 (认证、预约、病历、消息、通知、管理)
  - 数据库：MongoDB集合 (用户、预约、病历、消息、通知、排班)

### 7. 部署图 (Deployment Diagram)
- **目的**：展示系统部署架构
- **主要节点**：
  - 负载均衡器 (Nginx)
  - 网页服务器 (React前端)
  - API服务器 (Node.js后端)
  - 数据库服务器 (MongoDB)
  - 外部服务 (邮件、文件存储、备份)

## 🎨 Draw.io 绘制指南

### 基本图形规范
- **矩形**：类、组件、活动
- **圆角矩形**：用例、组件
- **椭圆**：用例
- **菱形**：决策点
- **圆形**：开始/结束点
- **立方体**：节点/设备
- **圆柱**：数据库
- **云形**：网络/外部系统

### 连接线规范
- **实线箭头**：关联关系、同步消息
- **虚线箭头**：依赖关系、异步消息、返回消息
- **空心菱形箭头**：聚合关系
- **实心菱形箭头**：组合关系
- **空心三角形箭头**：继承关系

### 颜色方案
- **蓝色系**：前端相关 (#E3F2FD, #2196F3)
- **绿色系**：后端相关 (#E8F5E8, #4CAF50)
- **橙色系**：数据库相关 (#FFF3E0, #FF9800)
- **紫色系**：外部服务 (#F3E5F5, #9C27B0)
- **灰色系**：基础设施 (#F5F5F5, #757575)

### 字体规范
- **标题**：16pt, 粗体
- **类名/组件名**：14pt, 粗体
- **属性/方法**：12pt, 常规
- **注释**：10pt, 斜体

## 📊 项目实际数据模型

### 核心实体关系
1. **User** (用户)
   - 角色：patient, doctor, admin
   - 医生特有：specialization, department, licenseNumber
   - 患者特有：emergencyContact, medicalHistory, allergies

2. **Appointment** (预约)
   - 状态：pending, confirmed, cancelled, completed, no-show
   - 类型：consultation, follow-up, emergency, routine
   - 关联：patient, doctor

3. **MedicalRecord** (病历)
   - 包含：symptoms, diagnosis, treatment, prescription
   - 附件：vitalSigns, labResults, attachments
   - 关联：patient, doctor, appointment

4. **Message** (消息)
   - 类型：text, image, file, system
   - 状态：isRead, readAt
   - 关联：sender, recipient, appointment, medicalRecord

5. **DoctorSchedule** (医生排班)
   - 时间槽：timeSlots (time, isAvailable)
   - 工作日：isWorkingDay
   - 限制：maxAppointments

6. **Notice** (通知)
   - 类型：appointment_request, appointment_confirmed, medical_record_added, new_message
   - 国际化：支持中英文
   - 关联：recipientId, senderId, relatedId

## 🔧 技术架构特点

### 前端 (React)
- 模块化设计：按角色分离 (患者、医生、管理)
- 共享组件：Navbar, NoticeBell, Forms, Tables
- 工具模块：i18n, axios, debug, date-fns

### 后端 (Node.js)
- 控制器模式：按功能分离
- 中间件：认证、角色验证、错误处理、日志
- 工具模块：国际化、验证、数据库、备份

### 数据库 (MongoDB)
- 集合设计：按业务实体分离
- 索引优化：查询性能优化
- 关系处理：通过ObjectId引用

## 📝 绘制建议

1. **使用draw.io**：选择UML模板开始绘制
2. **分层绘制**：先绘制主要元素，再添加细节
3. **颜色统一**：按照颜色方案保持一致性
4. **注释清晰**：添加必要的说明文字
5. **版本控制**：保存不同版本的图表

## ✅ 完成状态

- ✅ 系统上下文图 - 字符图完成
- ✅ 用例图 - 字符图完成
- ✅ 类图 - 字符图完成
- ✅ 时序图 - 字符图完成
- ✅ 活动图 - 字符图完成
- ✅ 组件图 - 字符图完成
- ✅ 部署图 - 字符图完成
- ✅ 绘制指南 - 详细说明完成
- ✅ 图例说明 - 完整规范完成

所有图表都已根据项目实际情况更新，可以直接在draw.io中绘制使用。
