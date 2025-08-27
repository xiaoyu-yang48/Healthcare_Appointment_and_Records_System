# 日期选择器语言修复说明

## 问题描述

用户报告项目中部分日期选择器默认显示中文，需要统一设置为英文。

## 问题分析

项目中使用了两种类型的日期选择器：

1. **react-datepicker** - 在 `PatientAppointments.jsx` 中使用
2. **HTML5 date input** - 在多个页面中使用

这些组件会根据浏览器的语言设置显示不同的语言，导致界面不一致。

## 修复内容

### 1. react-datepicker 修复

**文件**: `frontend/src/pages/PatientAppointments.jsx`

**修改**:
- 导入 `registerLocale` 和英文locale
- 注册英文locale
- 为DatePicker组件添加 `locale="en"` 属性

```javascript
import { registerLocale } from 'react-datepicker';
import en from 'date-fns/locale/en-US';

// 注册英文locale
registerLocale('en', en);

// 在DatePicker组件中添加locale属性
<DatePicker
  selected={selectedDate}
  onChange={handleDateChange}
  minDate={new Date()}
  dateFormat="yyyy-MM-dd"
  locale="en"  // 新增
  customInput={
    <TextField
      fullWidth
      variant="outlined"
      size="small"
    />
  }
/>
```

### 2. HTML5 date input 修复

为所有使用 `type="date"` 的TextField组件添加 `inputProps={{ lang: 'en' }}` 属性：

**文件**: `frontend/src/pages/DoctorSchedule.jsx`
```javascript
<TextField
  fullWidth
  type="date"
  label={t('date')}
  value={formData.date}
  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
  margin="normal"
  InputLabelProps={{ shrink: true }}
  inputProps={{ lang: 'en' }}  // 新增
/>
```

**文件**: `frontend/src/pages/Profile.jsx`
```javascript
<TextField
  fullWidth
  label={t('profile_config.dateOfBirth')}
  name="dateOfBirth"
  type="date"
  value={formData.dateOfBirth}
  onChange={handleChange}
  disabled={!editing}
  InputLabelProps={{
    shrink: true,
  }}
  inputProps={{ lang: 'en' }}  // 新增
/>
```

**文件**: `frontend/src/pages/DoctorAppointments.jsx`
```javascript
<TextField
  type="date"
  label={t('date_filter')}
  variant="outlined"
  size="small"
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  InputLabelProps={{ shrink: true }}
  inputProps={{ lang: 'en' }}  // 新增
/>
```

**文件**: `frontend/src/pages/AdminAppointments.jsx`
```javascript
<TextField
  fullWidth
  label={t('date')}
  type="date"
  value={editFormData.date}
  onChange={(e) => handleEditChange('date', e.target.value)}
  InputLabelProps={{ shrink: true }}
  inputProps={{ lang: 'en' }}  // 新增
  required
/>
```

**文件**: `frontend/src/pages/DoctorRecords.jsx`
```javascript
<TextField
  fullWidth
  type="date"
  label={t('follow_up_date')}
  value={formData.followUpDate}
  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
  margin="normal"
  InputLabelProps={{ shrink: true }}
  inputProps={{ lang: 'en' }}  // 新增
/>
```

## 修复效果

1. **react-datepicker**: 现在会显示英文的月份名称、星期名称等
2. **HTML5 date input**: 现在会使用英文格式显示日期（MM/DD/YYYY）
3. **一致性**: 所有日期选择器现在都使用英文，与项目的默认语言设置保持一致

## 技术说明

- **react-datepicker**: 通过 `locale` 属性强制使用英文
- **HTML5 date input**: 通过 `lang` 属性设置输入框的语言
- **兼容性**: 这些修改不会影响功能，只是改变了显示语言

## 测试建议

1. 在不同语言设置的浏览器中测试
2. 确认所有日期选择器都显示英文
3. 验证日期格式的一致性
4. 检查日期选择功能是否正常工作
