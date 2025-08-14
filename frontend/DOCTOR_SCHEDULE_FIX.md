# 医生排班表保存错误修复说明

## 问题描述

医生端在保存排班表时报错，无法正常保存排班信息。

## 问题原因分析

1. **数据格式不匹配**: 前端发送的数据格式与后端期望的格式不一致
2. **缺少更新API**: 后端缺少更新排班的路由
3. **日期格式处理**: 日期格式在不同地方的处理不一致
4. **字段映射错误**: 前端字段名与后端模型字段名不匹配

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

### 2. 添加更新排班API

**文件**: `backend/controllers/doctorController.js`

**新增函数**: `updateDoctorSchedule`
- 验证医生权限
- 检查排班是否存在且属于当前医生
- 更新排班信息

**文件**: `backend/routes/doctorRoutes.js`

**新增路由**: `PUT /doctors/schedule/:id`
- 添加更新排班的路由
- 使用医生权限中间件保护

### 3. 修复编辑功能

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

### 4. 改进错误处理

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

### 5. 修复日期格式处理

**问题**: 日期在不同地方的处理不一致

**修复**: 在`getScheduleForDate`函数中添加日期格式兼容处理

```javascript
const getScheduleForDate = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return schedules.find(s => {
    const scheduleDate = typeof s.date === 'string' ? s.date : format(new Date(s.date), 'yyyy-MM-dd');
    return scheduleDate === dateStr;
  });
};
```

## 修复的文件

1. `frontend/src/pages/DoctorSchedule.jsx` - 修复前端数据格式和错误处理
2. `backend/controllers/doctorController.js` - 添加更新排班控制器
3. `backend/routes/doctorRoutes.js` - 添加更新排班路由

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
