// ...existing code...

### **1. System Goal**  
Develop a healthcare appointment system based on the **MERN stack** (MongoDB + Express + React + Node.js), supporting patient registration, doctor scheduling, electronic medical record management, and basic doctor-patient communication.  

---

### **2. Core Functional Requirements**  

#### **(1) User Management**  
| Role | Functionality |  
|------|---------------|  
| **Patient** | Registration/Login, Appointment Booking, View Medical Records, Send Messages |  
| **Doctor** | Manage Schedule, View Appointments, Create Medical Records, Reply to Messages |  
| **Admin** | Manage Doctor/Patient Accounts, Adjust System Settings |  

#### **(2) Appointment Management**  
- **Patient Side**  
  - View Doctor Schedules (filtered by department, date)  
  - Select time for appointment (can cancel/edit)  
- **Doctor Side**  
  - Set available appointment times (working days/holidays)  
  - View their own appointment list  
- **Admin Side**  
  - Manage doctor information (CRUD)  
  - Adjust appointment rules (e.g., max 2 appointments per day per patient)  

#### **(3) Electronic Medical Records (EMR)**  
- Doctors can:  
  - Create, view, modify patient medical records (symptoms, diagnosis, prescription)  
  - Upload examination reports (PDF/images)  
- Patients can:  
  - View their own medical records (read-only)  
  - Download reports  

#### **(4) Doctor-Patient Communication**  
- Patients and doctors can send **in-app messages** (e.g., inquiries, follow-up reminders)  
- Doctors can send **follow-up reminders** (automated messages)  

---

### **3. Technical Implementation Plan**  

#### **(1) Backend (Node.js + Express + MongoDB)**  
- **API Design (RESTful)**  
  - `POST /api/auth/login` (User login)  
  - `GET /api/doctors` (Get list of doctors)  
  - `POST /api/appointments` (Create appointment)  
  - `GET /api/medical-records/:patientId` (Get medical record)  
  - `POST /api/messages` (Send message)  

- **Database (MongoDB)**  
```javascript
// User model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String, // "patient", "doctor", "admin"
});

// Appointment model
const AppointmentSchema = new mongoose.Schema({
  patientId: mongoose.ObjectId,
  doctorId: mongoose.ObjectId,
  date: Date,
  status: String, // "pending", "completed", "cancelled"
});

// Medical record model
const MedicalRecordSchema = new mongoose.Schema({
  patientId: mongoose.ObjectId,
  doctorId: mongoose.ObjectId,
  diagnosis: String,
  prescription: String,
  attachments: [String], // store file paths
});
```  

#### **(2) Frontend (React.js)**  
- **Main Pages**  
  - **Login/Register Page** (different entrance for patient, doctor, admin)  
  - **Patient Homepage** (appointment booking, view medical records, messages)  
  - **Doctor Homepage** (manage schedule, view appointments, fill medical records)  
  - **Admin Dashboard** (manage users, adjust system settings)  

- **Additional Tech Stack**  
  - **UI Library**: Material-UI or Ant Design  
  - **State Management**: Redux or Context API  
  - **Routing**: React Router  

---

### **4. Non-Functional Requirements**  
- **Security**: JWT authentication, password encryption (bcrypt)  
- **Performance**: API response time ≤ 500ms  
- **Data Storage**: MongoDB Atlas (cloud) or local MongoDB  

---

### **5. SysML 设计图说明**

#### 1. Requirements Diagram
展示系统的主要需求，包括用户管理、预约管理、病历管理、消息系统、安全性等。

#### 2. Block Definition Diagram (BDD)
定义系统的主要模块（User、Appointment、DoctorSchedule、MedicalRecord、Message），以及它们之间的关系。

#### 3. Parametric Diagram
描述预约流程、病历创建流程等关键业务逻辑的参数约束。

（建议将实际绘制的 SysML 图以图片形式插入此处，或在报告中附上截图）

---

### **6. CI/CD 流程说明**

#### 1. 代码托管与分支管理
- 所有代码托管在 GitHub，主分支为生产分支，功能开发采用 feature 分支，PR 审核合并。

#### 2. 自动化测试
- 可选：每次提交或 PR 时自动运行单元测试，确保代码质量。

#### 3. 自动化部署
- 使用 GitHub Actions 实现 CI/CD：
  - 后端推送到 AWS EC2，自动重启服务。
  - 前端推送到 AWS EC2，自动构建并部署静态文件。

#### 4. 工作流示例
```yaml
name: CI/CD Pipeline
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
1. **Requirements Document** (This document)  
2. **Database Design** (MongoDB Schema)  
3. **API Documentation** (Postman or Swagger)  
4. **Core Function Demo** (e.g., appointment booking, medical record management)  


