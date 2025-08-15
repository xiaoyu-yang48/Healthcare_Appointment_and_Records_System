# 医生排班表保存错误修复说明

## 问题描述

医生端在保存排班表时报错，无法正常保存排班信息。

## 问题原因分析

1. **数据格式不匹配**: 前端发送的数据格式与后端期望的格式不一致
2. **缺少更新API**: 后端缺少更新排班的路由
3. **日期格式处理**: 日期格式在不同地方的处理不一致
4. **字段映射错误**: 前端字段名与后端模型字段名不匹配
5. **路由顺序错误**: 具体路径被参数路径错误匹配，导致"schedule"被当作ID处理

## 修复内容

### 1. 修复数据格式不匹配问题

**问题**: 前端发送的`timeSlots`是字符串数组，但后端期望的是对象数组

**前端发送格式**:
```javascript
{
  date: "2024-01-01",
  timeSlots: ["09:00-09:30", "09:30-10:00"],
  isAvailable: true
}
```

**后端期望格式**:
```javascript
{
  date: "2024-01-01",
  timeSlots: [
    { time: "09:00-09:30", isAvailable: true },
    { time: "09:30-10:00", isAvailable: true }
  ],
  isWorkingDay: true,
  notes: "",
  maxAppointments: 20
}
```

**修复**: 在`handleSaveSchedule`函数中添加数据格式转换

```javascript
const scheduleData = {
  date: formData.date,
  timeSlots: formData.timeSlots.map(slot => ({
    time: slot,
    isAvailable: true
  })),
  isWorkingDay: formData.isAvailable,
  notes: formData.notes || '',
  maxAppointments: formData.maxAppointments || 20
};
```

### 2. 修复路由顺序问题

**问题**: 路由顺序错误导致`/schedule`被错误匹配到`/:id`路由

**错误的路由顺序**:
```javascript
router.get('/:id', getDoctorById);           // 会匹配 /schedule
router.get('/:id/schedule', getDoctorSchedule); // 会匹配 /schedule
router.get('/available-slots', getAvailableTimeSlots);
```

**修复后的路由顺序**:
```javascript
router.get('/available-slots', getAvailableTimeSlots); // 具体路径在前
router.get('/schedule', doctorOnly, getDoctorSchedule); // 具体路径在前
router.get('/:id', getDoctorById);           // 参数路径在后
router.get('/:id/schedule', getDoctorSchedule); // 参数路径在后
```

### 3. 修复getDoctorSchedule函数

**问题**: 函数期望从`req.params.id`获取医生ID，但`/schedule`路由没有id参数

**修复**: 添加逻辑处理两种情况
```javascript
// 如果没有id参数，使用当前登录用户的ID（医生查看自己的排班）
const doctorId = id || req.user.id;
let query = { doctor: doctorId };
```

### 4. 添加更新排班API

**文件**: `backend/controllers/doctorController.js`

**新增函数**: `updateDoctorSchedule`
- 验证医生权限
- 检查排班是否存在且属于当前医生
- 更新排班信息

**文件**: `backend/routes/doctorRoutes.js`

**新增路由**: `PUT /doctors/schedule/:id`
- 添加更新排班的路由
- 使用医生权限中间件保护

### 5. 修复编辑功能

**文件**: `frontend/src/pages/DoctorSchedule.jsx`

**修复内容**:
- 修改`handleEditSchedule`函数，正确处理后端返回的数据格式
- 添加缺失的字段（notes, maxAppointments）
- 修复日期格式处理

```javascript
const handleEditSchedule = (schedule) => {
  setEditingSchedule(schedule);
  setFormData({
    date: schedule.date,
    timeSlots: schedule.timeSlots ? schedule.timeSlots.map(slot => slot.time) : [],
    isAvailable: schedule.isWorkingDay,
    notes: schedule.notes || '',
    maxAppointments: schedule.maxAppointments || 20,
  });
  setOpenDialog(true);
};
```

### 6. 改进错误处理

**修复内容**:
- 添加详细的错误日志
- 显示后端返回的具体错误信息
- 改进日期格式处理

```javascript
} catch (error) {
  console.error('Failed to save schedule:', error);
  console.error('错误详情:', error.response?.data);
  toast.error(error.response?.data?.message || t('save_schedule_failed'));
}
```

### 7. 修复日期格式处理

**问题**: 日期在不同地方的处理不一致

**修复**: 在`getScheduleForDate`函数中添加日期格式兼容处理

```javascript
const getScheduleForDate = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const schedule = schedules.find(s => {
    const scheduleDate = typeof s.date === 'string' ? s.date : format(new Date(s.date), 'yyyy-MM-dd');
    return scheduleDate === dateStr;
  });
  console.log('Schedule for date', dateStr, ':', schedule);
  return schedule;
};
```

### 8. 修复前端显示问题

**问题**: 前端不显示已排好的班

**原因分析**:
1. 字段名不匹配：前端检查`isAvailable`，后端返回`isWorkingDay`
2. 时间槽格式不匹配：后端返回对象数组，前端期望字符串数组
3. 缺少调试信息

**修复内容**:

1. **修复字段名匹配**:
```javascript
// 修复前
label={schedule.isAvailable ? t('available') : t('unavailable')}
{schedule.isAvailable && schedule.timeSlots && schedule.timeSlots.length > 0 && (

// 修复后
label={schedule.isWorkingDay ? t('available') : t('unavailable')}
{schedule.isWorkingDay && schedule.timeSlots && schedule.timeSlots.length > 0 && (
```

2. **修复时间槽显示**:
```javascript
// 修复前
label={slot}

// 修复后
label={slot.time || slot}
```

3. **添加调试日志**:
```javascript
console.log('Fetching schedules for:', startDate, 'to', endDate);
console.log('Schedules received:', response.data);
console.log('Schedule for date', dateStr, ':', schedule);
```

4. **修复后端默认值**:
```javascript
// 修复前
res.json({
  doctor: doctorId,
  date: new Date(date),
  timeSlots: [],
  isWorkingDay: false,
  isAvailable: false  // 多余的字段
});

// 修复后
res.json({
  doctor: doctorId,
  date: new Date(date),
  timeSlots: [],
  isWorkingDay: false
});
```

## 修复的文件

1. `frontend/src/pages/DoctorSchedule.jsx` - 修复前端数据格式和错误处理
2. `backend/controllers/doctorController.js` - 修复getDoctorSchedule函数，添加更新排班控制器
3. `backend/routes/doctorRoutes.js` - 修复路由顺序，添加更新排班路由
4. `backend/scripts/test-doctor-schedule.js` - 新增测试脚本

## 数据流程

### 创建排班
1. 前端选择日期和时间段
2. 转换数据格式为后端期望的格式
3. 发送POST请求到`/doctors/schedule`
4. 后端使用upsert操作创建或更新排班

### 编辑排班
1. 前端加载现有排班数据
2. 转换后端数据格式为前端格式
3. 用户修改排班信息
4. 转换数据格式并发送PUT请求到`/doctors/schedule/:id`
5. 后端验证权限并更新排班

## 测试步骤

1. **创建排班测试**:
   - 点击"添加排班"按钮
   - 选择日期和时间段
   - 点击保存
   - 验证排班是否成功创建

2. **编辑排班测试**:
   - 点击现有排班的编辑按钮
   - 修改时间段
   - 点击保存
   - 验证排班是否成功更新

3. **错误处理测试**:
   - 尝试保存无效数据
   - 验证错误信息是否正确显示

## 验证清单

- [ ] 医生可以正常创建排班
- [ ] 医生可以正常编辑排班
- [ ] 数据格式转换正确
- [ ] 错误处理正常工作
- [ ] 日期格式处理正确
- [ ] 权限验证正常工作

## 相关文件

- `frontend/src/pages/DoctorSchedule.jsx` - 医生排班页面
- `backend/controllers/doctorController.js` - 医生控制器
- `backend/routes/doctorRoutes.js` - 医生路由
- `backend/models/DoctorSchedule.js` - 医生排班模型

## 后续改进

1. **添加批量操作**: 支持批量创建和编辑排班
2. **添加复制功能**: 支持复制某天的排班到其他日期
3. **添加模板功能**: 支持保存和加载排班模板
4. **改进时间选择**: 支持更灵活的时间段选择
5. **添加冲突检测**: 检测排班时间冲突

## 环境配置

### MongoDB配置
- **服务器地址**: 192.168.0.202:27017
- **用户名**: admin
- **密码**: 123123
- **数据库**: emr
- **连接字符串**: `mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin`

### 启动服务
```bash
# 使用简化启动脚本
./start-services.sh

# 或手动启动
cd backend && npm start
cd frontend && npm start
```

