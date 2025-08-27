# 完整的类图 (Complete Class Diagram)

## 字符图表示

```
┌─────────────────────────────────────────────────────────────────┐
│                           User                                  │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - name: String (required)                                       │
│ - email: String (required, unique)                              │
│ - password: String (required, encrypted)                        │
│ - role: String (patient|doctor|admin, required)                 │
│ - phone: String                                                 │
│ - address: String                                               │
│ - dateOfBirth: Date                                             │
│ - gender: String (male|female|other)                            │
│ - specialization: String (doctor only)                          │
│ - department: String (doctor only)                              │
│ - licenseNumber: String (doctor only)                           │
│ - experience: Number (doctor only)                              │
│ - education: String (doctor only)                               │
│ - bio: String (doctor only)                                     │
│ - emergencyContact: Object (patient only)                       │
│ - medicalHistory: [String] (patient only)                       │
│ - allergies: [String] (patient only)                            │
│ - avatar: String                                                │
│ - isActive: Boolean (default: true)                             │
│ - lastLogin: Date                                               │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + matchPassword(enteredPassword): Boolean                       │
│ + generateAuthToken(): String                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       Appointment                               │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - patient: ObjectId (ref: User, required)                       │
│ - doctor: ObjectId (ref: User, required)                        │
│ - date: Date (required)                                         │
│ - timeSlot: String (required)                                   │
│ - status: String (pending|confirmed|cancelled|completed|no-show)│
│ - type: String (consultation|follow-up|emergency|routine)       │
│ - symptoms: String                                              │
│ - notes: String                                                 │
│ - cancellationReason: String                                   │
│ - cancelledBy: ObjectId (ref: User)                             │
│ - cancelledAt: Date                                             │
│ - reminderSent: Boolean (default: false)                        │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + updateStatus(newStatus): void                                 │
│ + cancel(reason, cancelledBy): void                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    MedicalRecord                                │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - patient: ObjectId (ref: User, required)                       │
│ - doctor: ObjectId (ref: User, required)                        │
│ - appointment: ObjectId (ref: Appointment)                      │
│ - visitDate: Date (required, default: Date.now)                 │
│ - symptoms: String (required)                                   │
│ - diagnosis: String (required)                                  │
│ - treatment: String (required)                                  │
│ - prescription: Object                                          │
│ - vitalSigns: Object                                            │
│ - labResults: [Object]                                          │
│ - attachments: [Object]                                         │
│ - notes: String                                                 │
│ - followUpDate: Date                                            │
│ - followUpNotes: String                                         │
│ - isActive: Boolean (default: true)                             │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + addAttachment(file): void                                     │
│ + updateVitalSigns(signs): void                                 │
│ + addLabResult(result): void                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         Message                                 │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - sender: ObjectId (ref: User, required)                        │
│ - recipient: ObjectId (ref: User, required)                     │
│ - content: String (required)                                    │
│ - messageType: String (text|image|file|system, default: text)   │
│ - attachments: [Object]                                         │
│ - isRead: Boolean (default: false)                              │
│ - readAt: Date                                                  │
│ - isSystemMessage: Boolean (default: false)                     │
│ - relatedAppointment: ObjectId (ref: Appointment)               │
│ - relatedMedicalRecord: ObjectId (ref: MedicalRecord)           │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + markAsRead(): void                                            │
│ + addAttachment(file): void                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      DoctorSchedule                             │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - doctor: ObjectId (ref: User, required)                        │
│ - date: Date (required)                                         │
│ - timeSlots: [Object]                                           │
│   ├── time: String (required)                                   │
│   ├── isAvailable: Boolean (default: true)                      │
│   └── appointmentId: ObjectId (ref: Appointment)                │
│ - isWorkingDay: Boolean (default: true)                         │
│ - notes: String                                                 │
│ - maxAppointments: Number (default: 20)                         │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + addTimeSlot(time, isAvailable): void                          │
│ + updateTimeSlot(time, isAvailable): void                       │
│ + getAvailableSlots(): [String]                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         Notice                                  │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - recipientId: ObjectId (ref: User, required)                   │
│ - senderId: ObjectId (ref: User)                                │
│ - type: String (appointment_request|appointment_confirmed|      │
│   appointment_cancelled|medical_record_added|new_message|       │
│   system_notice, required)                                      │
│ - title: String (required)                                      │
│ - content: String (required)                                    │
│ - relatedId: ObjectId                                           │
│ - relatedType: String (appointment|medical_record|message|      │
│   system)                                                       │
│ - isRead: Boolean (default: false)                              │
│ - isActive: Boolean (default: true)                             │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + markAsRead(): void                                            │
│ + createAppointmentRequest(): Notice                            │
│ + createAppointmentConfirmed(): Notice                          │
│ + createMedicalRecordAdded(): Notice                            │
│ + createNewMessage(): Notice                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         Task                                   │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - userId: ObjectId (ref: User, required)                        │
│ - title: String (required)                                      │
│ - description: String                                           │
│ - completed: Boolean (default: false)                           │
│ - deadline: Date                                                │
├─────────────────────────────────────────────────────────────────┤
│ + markAsCompleted(): void                                       │
│ + updateDeadline(date): void                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      SystemSettings                             │
├─────────────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                                 │
│ - notifications: Object                                         │
│   ├── appointmentReminders: Boolean (default: true)             │
│   ├── emailNotifications: Boolean (default: true)               │
│   ├── smsNotifications: Boolean (default: false)                │
│   └── inAppNotifications: Boolean (default: true)               │
│ - appointment: Object                                           │
│   ├── autoConfirm: Boolean (default: false)                     │
│   ├── reminderHours: Number (default: 24)                       │
│   └── maxAdvanceDays: Number (default: 30)                      │
│ - system: Object                                                │
│   ├── maintenanceMode: Boolean (default: false)                 │
│   ├── maxFileSize: Number (default: 10)                         │
│   └── sessionTimeout: Number (default: 30)                      │
│ - createdAt: Date                                               │
│ - updatedAt: Date                                               │
├─────────────────────────────────────────────────────────────────┤
│ + getInstance(): SystemSettings                                 │
│ + updateSettings(updates): SystemSettings                       │
└─────────────────────────────────────────────────────────────────┘
```

## 关系说明

### 主要关系
1. **User** (1) ←→ (0..*) **Appointment** - 一个用户可以创建多个预约
2. **User** (1) ←→ (0..*) **MedicalRecord** - 一个用户可以有多份病历
3. **User** (1) ←→ (0..*) **Message** - 一个用户可以发送/接收多条消息
4. **User** (1) ←→ (0..*) **DoctorSchedule** - 一个医生可以有多个排班
5. **User** (1) ←→ (0..*) **Notice** - 一个用户可以接收多个通知
6. **User** (1) ←→ (0..*) **Task** - 一个用户可以有多个任务

### 关联关系
1. **Appointment** (1) ←→ (0..1) **MedicalRecord** - 一个预约可以关联一份病历
2. **Appointment** (1) ←→ (0..*) **Message** - 一个预约可以关联多条消息
3. **MedicalRecord** (1) ←→ (0..*) **Message** - 一份病历可以关联多条消息
4. **DoctorSchedule** (1) ←→ (0..*) **Appointment** - 一个排班可以关联多个预约

### 系统级关系
1. **SystemSettings** (1) - 全局系统设置，单例模式

## Draw.io 绘制指南

### 颜色方案
- **User**: 蓝色 (#E3F2FD)
- **Appointment**: 绿色 (#E8F5E8)
- **MedicalRecord**: 橙色 (#FFF3E0)
- **Message**: 紫色 (#F3E5F5)
- **Notice**: 红色 (#FFEBEE)
- **DoctorSchedule**: 青色 (#E0F2F1)
- **Task**: 灰色 (#F5F5F5)
- **SystemSettings**: 棕色 (#EFEBE9)

### 关系线样式
- **实线箭头**: 关联关系
- **虚线箭头**: 依赖关系
- **空心菱形**: 聚合关系
- **实心菱形**: 组合关系

### 多重性标注
- **1**: 一对一
- **0..1**: 零对一
- **0..***: 零对多
- **1..***: 一对多
- ***..***: 多对多
