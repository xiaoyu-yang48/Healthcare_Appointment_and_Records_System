# 多语言设置说明

## 功能概述

本应用支持中英文双语切换，默认语言为英文。

## 语言切换方式

### 1. 登录/注册页面
- 在登录和注册页面的右上角有语言切换按钮
- 点击按钮可以在中英文之间切换

### 2. 导航栏
- 登录后，在导航栏右侧有语言切换按钮
- 点击按钮可以切换语言

### 3. 测试页面
- 访问 `/test-language` 可以查看语言切换测试页面

## 语言文件位置

- 英文翻译：`src/utils/locales/en.json`
- 中文翻译：`src/utils/locales/zh.json`

## 添加新翻译

1. 在 `en.json` 中添加英文翻译
2. 在 `zh.json` 中添加对应的中文翻译
3. 在代码中使用 `t('key')` 函数获取翻译

## 示例

```javascript
import { t } from '../utils/i18n';

// 使用翻译
<Typography>{t('login')}</Typography>
```

## 语言持久化

- 语言选择会保存在浏览器的 localStorage 中
- 刷新页面后会保持选择的语言
- 默认语言为英文 ('en')

## 测试

访问以下页面测试语言切换功能：
- `/login` - 登录页面
- `/register` - 注册页面  
- `/test-language` - 语言测试页面
