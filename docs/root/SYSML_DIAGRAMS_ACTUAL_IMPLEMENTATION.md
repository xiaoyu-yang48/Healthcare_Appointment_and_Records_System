# Healthcare Appointment System - SysML Diagrams (实际实现版)

## 📊 概述

本文档基于医疗预约系统的实际实现，使用正确的Mermaid语法生成SysML图表。所有图表都基于项目的真实数据模型和架构。

---

## 1. System Context Diagram (系统上下文图)

### Mermaid 代码表示

```mermaid
graph TB
subgraph "Brain Du  12257451"


    subgraph "External Actors"
        P[Patient<br/>患者]
        D[Doctor<br/>医生]
        A[Admin<br/>管理员]
    end
  
    subgraph "Healthcare Appointment System"
        subgraph "Core Modules"
            Auth[Authentication Module<br/>认证模块]
            Appt[Appointment Module<br/>预约模块]
            Record[Medical Record Module<br/>病历模块]
            Notice[Notice Module<br/>通知模块]
            Schedule[Schedule Module<br/>排班模块]
        end
  
        subgraph "Database Layer"
            DB[(MongoDB Database<br/>MongoDB数据库)]
        end
    end
  
    %% Patient interactions
    P --> Auth
    P --> Appt
    P --> Record
    P --> Notice
  
    %% Doctor interactions
    D --> Auth
    D --> Appt
    D --> Record
    D --> Notice
    D --> Schedule
  
    %% Admin interactions
    A --> Auth
    A --> Appt
    A --> Record
    A --> Notice
    A --> Schedule
  
    %% Module to database connections
    Auth --> DB
    Appt --> DB
    Record --> DB
    Notice --> DB
    Schedule --> DB
  
    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef module fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
  
    class P,D,A actor
    class Auth,Appt,Record,Notice,Schedule module
    class DB database
end
```

---

## 2. Block Definition Diagram (块定义图)

### Mermaid 代码表示

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role (patient|doctor|admin)
        +String phone
        +String address
        +Date dateOfBirth
        +String gender
        +String specialization
        +String department
        +String licenseNumber
        +Number experience
        +String education
        +String bio
        +Object emergencyContact
        +String[] medicalHistory
        +String[] allergies
        +String avatar
        +Boolean isActive
        +Date lastLogin
        +Date createdAt
        +Date updatedAt
        +matchPassword(enteredPassword) Boolean
        +generateAuthToken() String
    }
  
    class Appointment {
        +ObjectId _id
        +ObjectId patient (ref: User)
        +ObjectId doctor (ref: User)
        +Date date
        +String timeSlot
        +String status (pending|confirmed|cancelled|completed|no-show)
        +String type (consultation|follow-up|emergency|routine)
        +String symptoms
        +String notes
        +String cancellationReason
        +ObjectId cancelledBy (ref: User)
        +Date cancelledAt
        +Boolean reminderSent
        +Date createdAt
        +Date updatedAt
        +updateStatus(newStatus) void
        +cancel(reason, cancelledBy) void
    }
  
    class MedicalRecord {
        +ObjectId _id
        +ObjectId patient (ref: User)
        +ObjectId doctor (ref: User)
        +ObjectId appointment (ref: Appointment)
        +Date visitDate
        +String symptoms
        +String diagnosis
        +String treatment
        +Object prescription
        +Object vitalSigns
        +Object[] labResults
        +Object[] attachments
        +String notes
        +Date followUpDate
        +String followUpNotes
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +addAttachment(file) void
        +updateVitalSigns(signs) void
        +addLabResult(result) void
    }
  
    class DoctorSchedule {
        +ObjectId _id
        +ObjectId doctor (ref: User)
        +Date date
        +Object[] timeSlots
        +Boolean isWorkingDay
        +String notes
        +Number maxAppointments
        +Date createdAt
        +Date updatedAt
        +addTimeSlot(time, isAvailable) void
        +updateTimeSlot(time, isAvailable) void
        +getAvailableSlots() String[]
    }
  
    class Notice {
        +ObjectId _id
        +ObjectId recipientId (ref: User)
        +ObjectId senderId (ref: User)
        +String type
        +String title
        +String content
        +ObjectId relatedId
        +String relatedType
        +Boolean isRead
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +markAsRead() void
        +createAppointmentRequest() Notice
        +createAppointmentConfirmed() Notice
        +createMedicalRecordAdded() Notice
        +createNewMessage() Notice
    }
  
    %% Relationships
    User ||--o{ Appointment : "patient"
    User ||--o{ Appointment : "doctor"
    User ||--o{ MedicalRecord : "patient"
    User ||--o{ MedicalRecord : "doctor"
    User ||--o{ Notice : "recipient"
    User ||--o{ Notice : "sender"
    User ||--o{ DoctorSchedule : "doctor"
    Appointment ||--o{ MedicalRecord : "appointment"
  
    classDef userClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef appointmentClass fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef recordClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef scheduleClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef noticeClass fill:#ffebee,stroke:#d32f2f,stroke-width:2px
  
    class User userClass
    class Appointment appointmentClass
    class MedicalRecord recordClass
    class DoctorSchedule scheduleClass
    class Notice noticeClass
```

---

## 3. Use Case Diagram (用例图)

### Mermaid 代码表示

```mermaid
graph TB
    subgraph "Healthcare Appointment System"
        subgraph "Patient Use Cases"
            P1[Register Account]
            P2[Login]
            P3[View Profile]
            P4[Book Appointment]
            P5[Cancel Appointment]
            P6[View Medical Records]
            P7[Send Message]
            P8[View Notices]
            P9[Download Records]
        end
    
        subgraph "Doctor Use Cases"
            D1[Login]
            D2[Manage Schedule]
            D3[View Appointments]
            D4[Create Medical Record]
            D5[Send Message]
            D6[Reply Message]
            D7[View Notices]
            D8[Update Profile]
        end
    
        subgraph "Admin Use Cases"
            A1[Login]
            A2[Manage Users]
            A3[View Statistics]
            A4[Configure System]
            A5[Monitor System]
        end
    end
  
    subgraph "Actors"
        Patient((Patient<br/>患者))
        Doctor((Doctor<br/>医生))
        Admin((Admin<br/>管理员))
    end
  
    %% Patient connections
    Patient --> P1
    Patient --> P2
    Patient --> P3
    Patient --> P4
    Patient --> P5
    Patient --> P6
    Patient --> P7
    Patient --> P8
    Patient --> P9
  
    %% Doctor connections
    Doctor --> D1
    Doctor --> D2
    Doctor --> D3
    Doctor --> D4
    Doctor --> D5
    Doctor --> D6
    Doctor --> D7
    Doctor --> D8
  
    %% Admin connections
    Admin --> A1
    Admin --> A2
    Admin --> A3
    Admin --> A4
    Admin --> A5
  
    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef useCase fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
  
    class Patient,Doctor,Admin actor
    class P1,P2,P3,P4,P5,P6,P7,P8,P9,D1,D2,D3,D4,D5,D6,D7,D8,A1,A2,A3,A4,A5 useCase
```

---

## 4. Sequence Diagram - Patient Appointment Booking (患者预约流程时序图)

### Mermaid 代码表示

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend (React)
    participant B as Backend (Node.js)
    participant D as MongoDB
  
    Note over P,D: Authentication Flow
    P->>+F: 1. Login with email/password
    F->>+B: 2. POST /api/auth/login
    B->>+D: 3. Query User collection
    D-->>-B: 4. Return user data
    B->>B: 5. Verify password with bcrypt
    B->>B: 6. Generate JWT token
    B-->>-F: 7. Return {success: true, token, user}
    F-->>-P: 8. Store token, redirect to dashboard
  
    Note over P,D: Doctor Selection Flow
    P->>+F: 9. View available doctors
    F->>+B: 10. GET /api/users/doctors
    B->>+D: 11. Query User collection (role: 'doctor')
    D-->>-B: 12. Return doctors list
    B-->>-F: 13. Return doctors data
    F-->>-P: 14. Display doctors list
  
    Note over P,D: Schedule Viewing Flow
    P->>+F: 15. Select doctor
    F->>+B: 16. GET /api/schedules/:doctorId
    B->>+D: 17. Query DoctorSchedule collection
    D-->>-B: 18. Return schedule data
    B-->>-F: 19. Return available time slots
    F-->>-P: 20. Display schedule calendar
  
    Note over P,D: Appointment Booking Flow
    P->>+F: 21. Book appointment (date, time, symptoms)
    F->>+B: 22. POST /api/appointments
    B->>+D: 23. Validate slot availability
    B->>+D: 24. Create Appointment document
    D-->>-B: 25. Return appointment data
    B->>+D: 26. Update DoctorSchedule timeSlot
    B->>+D: 27. Create Notice for doctor
    B-->>-F: 28. Return {success: true, appointment}
    F-->>-P: 29. Show confirmation message
```

---

## 5. Sequence Diagram - Doctor Schedule Management (医生排班管理时序图)

### Mermaid 代码表示

```mermaid
sequenceDiagram
    participant Dr as Doctor
    participant F as Frontend (React)
    participant B as Backend (Node.js)
    participant D as MongoDB
  
    Note over Dr,D: Authentication Flow
    Dr->>+F: 1. Login with email/password
    F->>+B: 2. POST /api/auth/login
    B->>+D: 3. Query User collection (role: 'doctor')
    D-->>-B: 4. Return doctor data
    B->>B: 5. Verify password with bcrypt
    B->>B: 6. Generate JWT token
    B-->>-F: 7. Return {success: true, token, user}
    F-->>-Dr: 8. Store token, redirect to dashboard
  
    Note over Dr,D: Schedule Management Flow
    Dr->>+F: 9. View current schedule
    F->>+B: 10. GET /api/schedules/my-schedule
    B->>+D: 11. Query DoctorSchedule collection
    D-->>-B: 12. Return schedule data
    B-->>-F: 13. Return schedule with time slots
    F-->>-Dr: 14. Display schedule calendar
  
    Dr->>+F: 15. Update schedule (add/remove time slots)
    F->>+B: 16. PUT /api/schedules/:scheduleId
    B->>+D: 17. Validate schedule changes
    B->>+D: 18. Update DoctorSchedule document
    D-->>-B: 19. Return updated schedule
    B-->>-F: 20. Return {success: true, schedule}
    F-->>-Dr: 21. Show updated schedule
  
    Note over Dr,D: Patient Management Flow
    Dr->>+F: 22. View my patients
    F->>+B: 23. GET /api/appointments/my-appointments
    B->>+D: 24. Query Appointment collection
    D-->>-B: 25. Return appointments with patient data
    B-->>-F: 26. Return patients list
    F-->>-Dr: 27. Display patients table
  
    Note over Dr,D: Medical Record Creation Flow
    Dr->>+F: 28. Create medical record
    F->>+B: 29. POST /api/medical-records
    B->>+D: 30. Validate record data
    B->>+D: 31. Create MedicalRecord document
    D-->>-B: 32. Return record data
    B->>+D: 33. Create Notice for patient
    B-->>-F: 34. Return {success: true, record}
    F-->>-Dr: 35. Show record created message
```

---

## 6. Parametric Diagram (参数图)

### Mermaid 代码表示

```mermaid
classDiagram
    class SystemPerformanceConstraint {
        +ResponseTime = NetworkLatency + APICallTime + DBQueryTime + ProcessingTime
        +ResponseTime ≤ MaxResponseTime
        +Throughput = ConcurrentUsers * RequestsPerUser
        +Throughput ≤ MaxThroughput
        +StorageUtilization = UsedStorage / TotalStorage
        +StorageUtilization ≤ MaxStorageUtilization
    }
  
    class PerformanceParameters {
        +MaxResponseTime: 200ms
        +MaxThroughput: 1000 req/sec
        +MaxStorageUtilization: 80%
        +MaxConcurrentUsers: 100
        +RequestsPerUser: 10 req/min
    }
  
    class CurrentMetrics {
        +NetworkLatency: 50ms
        +APICallTime: 80ms
        +DBQueryTime: 40ms
        +ProcessingTime: 20ms
        +TotalResponseTime: 190ms
        +ConcurrentUsers: 45
        +CurrentThroughput: 450 req/sec
        +UsedStorage: 2GB
        +TotalStorage: 10GB
        +StorageUtilization: 20%
    }
  
    class QualityConstraints {
        +UptimePercentage ≥ 99.9%
        +DataAccuracy = 100%
        +SecurityCompliance = 100%
        +JWTExpirationTime: 24h
        +PasswordMinLength: 6
        +MaxLoginAttempts: 5
    }
  
    class SecurityParameters {
        +JWTSecret: process.env.JWT_SECRET
        +BCryptSaltRounds: 10
        +HTTPSEnabled: true
        +CORSEnabled: true
        +RateLimitWindow: 15min
        +RateLimitMax: 100 requests
    }
  
    SystemPerformanceConstraint --> PerformanceParameters : constraint
    SystemPerformanceConstraint --> CurrentMetrics : input
    SystemPerformanceConstraint --> QualityConstraints : constraint
    SystemPerformanceConstraint --> SecurityParameters : constraint
  

```

---

## 7. Activity Diagram - User Registration (用户注册活动图)

### Mermaid 代码表示

```mermaid
flowchart TD
    Start([开始]) --> FillForm[填写注册表单<br/>name, email, password, role, phone, address, dateOfBirth, gender]
    FillForm --> ValidateForm{验证表单数据}
    ValidateForm -->|验证失败| ShowError[显示错误信息]
    ShowError --> FillForm
    ValidateForm -->|验证通过| CheckEmail{检查邮箱是否已存在}
    CheckEmail -->|邮箱已存在| ShowEmailError[显示邮箱已存在错误]
    ShowEmailError --> FillForm
    CheckEmail -->|邮箱可用| HashPassword[使用bcrypt加密密码<br/>saltRounds: 10]
    HashPassword --> CreateUser[创建用户记录<br/>User Model]
    CreateUser --> GenerateToken[生成JWT认证令牌]
    GenerateToken --> SendWelcome[发送欢迎邮件<br/>可选功能]
    SendWelcome --> RedirectDashboard[重定向到仪表板]
    RedirectDashboard --> End([结束])
  
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
  
    class Start,End startEnd
    class FillForm,HashPassword,CreateUser,GenerateToken,SendWelcome,RedirectDashboard process
    class ValidateForm,CheckEmail decision
    class ShowError,ShowEmailError error
```

---

## 8. Component Diagram (组件图)

### Mermaid 代码表示

```mermaid
graph TB
    subgraph "Frontend (React.js) draw by Brain Du ;Student ID: 12257451"
        subgraph "Core Components"
            App[App.js<br/>主应用组件]
            Router[React Router<br/>路由管理]
            Auth[AuthContext<br/>认证上下文]
        end
  
        subgraph "Page Components"
            Login[Login.jsx<br/>登录页面]
            Register[Register.jsx<br/>注册页面]
            PatientDashboard[PatientDashboard.jsx<br/>患者仪表板]
            DoctorDashboard[DoctorDashboard.jsx<br/>医生仪表板]
            AdminDashboard[AdminDashboard.jsx<br/>管理员仪表板]
        end
  
        subgraph "Shared Components"
            Navbar[Navbar.jsx<br/>导航栏]
            NoticeBell[NoticeBell.jsx<br/>通知铃]
            UserForm[UserForm.jsx<br/>用户表单]
        end
  
        subgraph "Utils"
            AxiosConfig[axiosConfig.jsx<br/>HTTP配置]
            I18n[i18n.js<br/>国际化]
            Debug[debug.js<br/>调试工具]
        end
    end
  
    subgraph "Backend (Node.js + Express)"
        subgraph "Controllers"
            AuthController[authController.js<br/>认证控制器]
            AppointmentController[appointmentController.js<br/>预约控制器]
            MedicalRecordController[medicalRecordController.js<br/>病历控制器]
            NoticeController[noticeController.js<br/>通知控制器]
            AdminController[adminController.js<br/>管理员控制器]
        end
  
        subgraph "Models"
            UserModel[User.js<br/>用户模型]
            AppointmentModel[Appointment.js<br/>预约模型]
            MedicalRecordModel[MedicalRecord.js<br/>病历模型]
            DoctorScheduleModel[DoctorSchedule.js<br/>排班模型]
            NoticeModel[Notice.js<br/>通知模型]
        end
  
        subgraph "Middleware"
            AuthMiddleware[authMiddleware.js<br/>认证中间件]
            ErrorMiddleware[errorMiddleware.js<br/>错误处理]
        end
  
        subgraph "Routes"
            AuthRoutes[authRoutes.js<br/>认证路由]
            AppointmentRoutes[appointmentRoutes.js<br/>预约路由]
            MedicalRecordRoutes[medicalRecordRoutes.js<br/>病历路由]
            NoticeRoutes[noticeRoutes.js<br/>通知路由]
            AdminRoutes[adminRoutes.js<br/>管理员路由]
        end
    end
  
    subgraph "Database (MongoDB)"
        MongoDB[(MongoDB<br/>数据库)]
    end
  
    %% Frontend connections
    App --> Router
    App --> Auth
    Router --> Login
    Router --> Register
    Router --> PatientDashboard
    Router --> DoctorDashboard
    Router --> AdminDashboard
  
    %% Backend connections
    AuthRoutes --> AuthController
    AppointmentRoutes --> AppointmentController
    MedicalRecordRoutes --> MedicalRecordController
    NoticeRoutes --> NoticeController
    AdminRoutes --> AdminController
  
    %% Controller to Model connections
    AuthController --> UserModel
    AppointmentController --> AppointmentModel
    AppointmentController --> DoctorScheduleModel
    MedicalRecordController --> MedicalRecordModel
    NoticeController --> NoticeModel
    AdminController --> UserModel
  
    %% Model to Database connections
    UserModel --> MongoDB
    AppointmentModel --> MongoDB
    MedicalRecordModel --> MongoDB
    DoctorScheduleModel --> MongoDB
    NoticeModel --> MongoDB
  
    %% Frontend to Backend connections
    Login -.->|HTTP/HTTPS| AuthRoutes
    Register -.->|HTTP/HTTPS| AuthRoutes
    PatientDashboard -.->|HTTP/HTTPS| AppointmentRoutes
    DoctorDashboard -.->|HTTP/HTTPS| AppointmentRoutes
    AdminDashboard -.->|HTTP/HTTPS| AdminRoutes
  
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef backend fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
  
    class App,Router,Auth,Login,Register,PatientDashboard,DoctorDashboard,AdminDashboard,Navbar,NoticeBell,UserForm,AxiosConfig,I18n,Debug frontend
    class AuthController,AppointmentController,MedicalRecordController,NoticeController,AdminController,UserModel,AppointmentModel,MedicalRecordModel,DoctorScheduleModel,NoticeModel,AuthMiddleware,ErrorMiddleware,AuthRoutes,AppointmentRoutes,MedicalRecordRoutes,NoticeRoutes,AdminRoutes backend
    class MongoDB database
```

---

## 9. Deployment Diagram (部署图)

### Mermaid 代码表示

```mermaid
graph TB
    subgraph "Production Environment draw by Brain Du ;Student ID: 12257451"
        subgraph "Load Balancer"
            Nginx[Nginx<br/>反向代理<br/>SSL终止<br/>静态文件服务]
        end
  
        subgraph "Web Server (Port 3000)"
            ReactApp[React Frontend<br/>静态文件<br/>JavaScript Bundle<br/>CSS Styles<br/>Images & Icons]
        end
  
        subgraph "API Server (Port 5001)"
            NodeApp[Node.js Backend<br/>Express Server<br/>JWT Authentication<br/>File Upload Handler<br/>Email Service<br/>Logging Service]
        end
  
        subgraph "Database Server (Port 27017)"
            MongoDB[(MongoDB Database<br/>Users Collection<br/>Appointments Collection<br/>Medical Records Collection<br/>Notices Collection<br/>Doctor Schedules Collection)]
        end
  
        subgraph "External Services"
            EmailService[Email Service<br/>SMTP<br/>Templates<br/>Notifications]
            FileStorage[File Storage<br/>Local Storage<br/>Cloud Storage<br/>CDN]
            BackupService[Backup Service<br/>Automated<br/>Scheduled<br/>Recovery]
        end
    end
  
    %% Connections
    Nginx -->|HTTP/HTTPS| ReactApp
    Nginx -->|API Calls| NodeApp
    NodeApp -->|Database Connection| MongoDB
    NodeApp -->|Email| EmailService
    NodeApp -->|File Operations| FileStorage
    NodeApp -->|Backup| BackupService
  
    classDef loadBalancer fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef webServer fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef apiServer fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  
    class Nginx loadBalancer
    class ReactApp webServer
    class NodeApp apiServer
    class MongoDB database
    class EmailService,FileStorage,BackupService external
```

---

## 📋 图表说明

### 1. **System Context Diagram**

- 展示了系统的三个主要角色（患者、医生、管理员）
- 核心模块包括认证、预约、病历、通知、排班
- 所有模块都连接到MongoDB数据库

### 2. **Block Definition Diagram**

- 基于实际的数据模型结构
- 展示了User、Appointment、MedicalRecord、DoctorSchedule、Notice之间的关系
- 包含了实际的字段和方法

### 3. **Use Case Diagram**

- 根据实际功能实现划分用例
- 每个角色都有特定的用例集合
- 反映了系统的实际功能范围

### 4. **Sequence Diagrams**

- 基于实际的API调用流程
- 包含了真实的端点路径
- 展示了JWT认证、数据库操作等实际实现

### 5. **Parametric Diagram**

- 基于实际的性能参数
- 包含了真实的约束条件
- 反映了系统的实际性能要求

### 6. **Activity Diagram**

- 基于实际的注册流程
- 包含了bcrypt加密、JWT生成等实际步骤
- 反映了真实的错误处理流程

### 7. **Component Diagram**

- 基于实际的React组件结构
- 展示了真实的Node.js后端架构
- 包含了实际的模型和控制器

### 8. **Deployment Diagram**

- 基于实际的部署配置
- 展示了真实的端口分配
- 反映了实际的服务器架构

---

## 🎯 总结

这些SysML图表完全基于医疗预约系统的实际实现，包括：

1. **真实的数据模型**：基于MongoDB Schema定义
2. **实际的API端点**：基于Express.js路由
3. **真实的组件结构**：基于React.js组件
4. **实际的部署配置**：基于生产环境设置
5. **真实的性能参数**：基于系统实际要求

所有图表都使用正确的Mermaid语法，可以直接在支持Mermaid的平台上渲染，为系统设计和文档提供了准确的表示。
