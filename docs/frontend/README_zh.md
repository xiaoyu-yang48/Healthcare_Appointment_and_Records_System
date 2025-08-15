# 说明文档 (中文版)

> 注意：这是英文文档的中文翻译版本。如有疑问，请参考英文原版。

# 医疗预约系统 - 前端

这是医疗预约系统的前端部分，基于 React.js 和 Material-UI 构建。

## 功能特性

### 用户角色
- **患者**: 预约挂号、查看病历、消息交流
- **医生**: 管理排班、查看预约、创建病历、回复消息
- **管理员**: 用户管理、系统设置、数据统计

### 主要功能

#### 患者功能
- 用户注册和登录
- 查看医生列表和排班
- 预约挂号（选择医生、日期、时间）
- 查看个人预约记录
- 查看电子病历
- 与医生进行消息交流
- 个人资料管理

#### 医生功能
- 管理个人排班
- 查看患者预约
- 创建和编辑病历
- 回复患者消息
- 个人资料管理

#### 管理员功能
- 用户管理（患者、医生）
- 系统数据统计
- 预约管理
- 系统设置

## 技术栈

- **React 18**: 前端框架
- **Material-UI (MUI)**: UI组件库
- **React Router**: 路由管理
- **Axios**: HTTP客户端
- **React Hot Toast**: 消息提示
- **React DatePicker**: 日期选择器
- **date-fns**: 日期处理

## 安装和运行

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── components/          # 公共组件
│   └── Navbar.jsx      # 导航栏
├── context/            # React Context
│   └── AuthContext.js  # 认证上下文
├── pages/              # 页面组件
│   ├── Login.jsx       # 登录页面
│   ├── Register.jsx    # 注册页面
│   ├── Profile.jsx     # 个人资料
│   ├── PatientDashboard.jsx    # 患者仪表板
│   ├── PatientAppointments.jsx # 患者预约
│   ├── PatientRecords.jsx      # 患者病历
│   ├── PatientMessages.jsx     # 患者消息
│   ├── DoctorDashboard.jsx     # 医生仪表板
│   └── AdminDashboard.jsx      # 管理员仪表板
├── App.js              # 主应用组件
├── index.js            # 入口文件
├── index.css           # 全局样式
└── axiosConfig.jsx     # Axios配置
```

## 路由结构

### 公共路由
- `/login` - 登录页面
- `/register` - 注册页面

### 患者路由
- `/patient/dashboard` - 患者仪表板
- `/patient/appointments` - 预约管理
- `/patient/records` - 病历查看
- `/patient/messages` - 消息中心

### 医生路由
- `/doctor/dashboard` - 医生仪表板
- `/doctor/schedule` - 排班管理
- `/doctor/patients` - 患者管理
- `/doctor/records` - 病历管理
- `/doctor/messages` - 消息中心

### 管理员路由
- `/admin/dashboard` - 管理员仪表板
- `/admin/users` - 用户管理
- `/admin/appointments` - 预约管理
- `/admin/settings` - 系统设置

## 环境变量

创建 `.env` 文件并配置以下变量：

```
REACT_APP_API_URL=http://localhost:3001/api
```

## 主要组件说明

### AuthContext
提供全局认证状态管理，包括：
- 用户登录/注册
- 用户信息管理
- 角色权限控制
- Token管理

### Navbar
响应式导航栏，根据用户角色显示不同的导航项。

### 页面组件
每个页面都包含：
- 数据获取和状态管理
- 错误处理
- 加载状态
- 响应式设计

## 样式主题

使用 Material-UI 主题系统，主要颜色：
- 主色: #1976d2 (蓝色)
- 次色: #dc004e (红色)
- 背景: #f5f5f5 (浅灰)

## 响应式设计

- 移动端优先设计
- 支持平板和桌面端
- 自适应布局

## 错误处理

- 全局错误边界
- API错误处理
- 用户友好的错误提示
- 网络错误重试机制

## 性能优化

- 组件懒加载
- 图片优化
- 代码分割
- 缓存策略

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发指南

### 添加新页面
1. 在 `pages/` 目录创建新组件
2. 在 `App.js` 中添加路由
3. 在 `Navbar.jsx` 中添加导航项（如需要）

### 添加新组件
1. 在 `components/` 目录创建组件
2. 使用 Material-UI 组件
3. 添加适当的类型检查

### API集成
1. 在 `axiosConfig.jsx` 中配置API
2. 在组件中使用 `api` 实例
3. 处理加载状态和错误

## 部署

### 构建
```bash
npm run build
```

### 部署到服务器
将 `build/` 目录的内容部署到Web服务器。

### 环境配置
确保生产环境的API地址正确配置。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
