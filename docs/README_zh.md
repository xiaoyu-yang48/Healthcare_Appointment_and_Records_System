# 医疗预约系统文档

本目录包含按类别组织的所有项目文档。

## 📁 目录结构

### 📂 根目录文档 (`docs/root/`)
通用项目文档和指南。

| 文档 | 英文版 | 中文版 |
|------|--------|--------|
| 说明文档 | [README.md](root/README.md) | [README_zh.md](root/README_zh.md) |
| 服务器配置 | [SERVER_SETUP.md](root/SERVER_SETUP.md) | [SERVER_SETUP_zh.md](root/SERVER_SETUP_zh.md) |
| 端口配置 | [PORT_CONFIG.md](root/PORT_CONFIG.md) | [PORT_CONFIG_zh.md](root/PORT_CONFIG_zh.md) |
| CI/CD 指南 | [CI_CD_GUIDE.md](root/CI_CD_GUIDE.md) | [CI_CD_GUIDE_zh.md](root/CI_CD_GUIDE_zh.md) |
| 后端实现 | [BACKEND_IMPLEMENTATION.md](root/BACKEND_IMPLEMENTATION.md) | [BACKEND_IMPLEMENTATION_zh.md](root/BACKEND_IMPLEMENTATION_zh.md) |
| 前端实现 | [FRONTEND_IMPLEMENTATION.md](root/FRONTEND_IMPLEMENTATION.md) | [FRONTEND_IMPLEMENTATION_zh.md](root/FRONTEND_IMPLEMENTATION_zh.md) |
| API 集成 | [API_INTEGRATION.md](root/API_INTEGRATION.md) | [API_INTEGRATION_zh.md](root/API_INTEGRATION_zh.md) |
| 前端修复 | [FRONTEND_FIXES.md](root/FRONTEND_FIXES.md) | [FRONTEND_FIXES_zh.md](root/FRONTEND_FIXES_zh.md) |
| SYSML 图表 | [SYSML_DIAGRAMS.md](root/SYSML_DIAGRAMS.md) | [SYSML_DIAGRAMS_zh.md](root/SYSML_DIAGRAMS_zh.md) |

### 📂 后端文档 (`docs/backend/`)
后端特定文档和实现细节。

| 文档 | 英文版 | 中文版 |
|------|--------|--------|
| 说明文档 | [README.md](backend/README.md) | [README_zh.md](backend/README_zh.md) |
| API 文档 | [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) | [API_DOCUMENTATION_zh.md](backend/API_DOCUMENTATION_zh.md) |
| 预约修复 | [APPOINTMENT_FIX.md](backend/APPOINTMENT_FIX.md) | [APPOINTMENT_FIX_zh.md](backend/APPOINTMENT_FIX_zh.md) |
| 通知功能 | [NOTICE_FEATURE.md](backend/NOTICE_FEATURE.md) | [NOTICE_FEATURE_zh.md](backend/NOTICE_FEATURE_zh.md) |

### 📂 前端文档 (`docs/frontend/`)
前端特定文档和实现细节。

| 文档 | 英文版 | 中文版 |
|------|--------|--------|
| 说明文档 | [README.md](frontend/README.md) | [README_zh.md](frontend/README_zh.md) |
| 通知系统修复 | [NOTICE_SYSTEM_FIX.md](frontend/NOTICE_SYSTEM_FIX.md) | [NOTICE_SYSTEM_FIX_zh.md](frontend/NOTICE_SYSTEM_FIX_zh.md) |
| 医生患者修复 | [DOCTOR_PATIENTS_FIX.md](frontend/DOCTOR_PATIENTS_FIX.md) | [DOCTOR_PATIENTS_FIX_zh.md](frontend/DOCTOR_PATIENTS_FIX_zh.md) |
| 医生排班修复 | [DOCTOR_SCHEDULE_FIX.md](frontend/DOCTOR_SCHEDULE_FIX.md) | [DOCTOR_SCHEDULE_FIX_zh.md](frontend/DOCTOR_SCHEDULE_FIX_zh.md) |
| 医生登录修复 | [DOCTOR_LOGIN_FIX.md](frontend/DOCTOR_LOGIN_FIX.md) | [DOCTOR_LOGIN_FIX_zh.md](frontend/DOCTOR_LOGIN_FIX_zh.md) |
| 预约按钮修复 | [APPOINTMENT_BUTTONS_FIX.md](frontend/APPOINTMENT_BUTTONS_FIX.md) | [APPOINTMENT_BUTTONS_FIX_zh.md](frontend/APPOINTMENT_BUTTONS_FIX_zh.md) |
| 翻译修复 | [TRANSLATION_FIX.md](frontend/TRANSLATION_FIX.md) | [TRANSLATION_FIX_zh.md](frontend/TRANSLATION_FIX_zh.md) |
| 语言设置 | [LANGUAGE_SETUP.md](frontend/LANGUAGE_SETUP.md) | [LANGUAGE_SETUP_zh.md](frontend/LANGUAGE_SETUP_zh.md) |

## 🌍 语言约定

- **英文文档** 为默认版本（无后缀）
- **中文文档** 以 `_zh.md` 结尾
- 所有文档都提供中英文版本以便更好地访问

## 📋 快速开始

1. **新用户？** 从 [README.md](root/README.md) 开始
2. **设置服务器？** 查看 [SERVER_SETUP.md](root/SERVER_SETUP.md)
3. **配置端口？** 参见 [PORT_CONFIG.md](root/PORT_CONFIG.md)
4. **部署？** 按照 [CI_CD_GUIDE.md](root/CI_CD_GUIDE.md)

## 🔧 开发

- **后端开发：** 参见 [backend/README.md](backend/README.md)
- **前端开发：** 参见 [frontend/README.md](frontend/README.md)
- **API 参考：** 查看 [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

## 🐛 故障排除

- **前端问题：** 查看 [frontend/](frontend/) 目录中的具体修复
- **后端问题：** 查看 [backend/](backend/) 目录中的具体修复
- **通用修复：** 参见 [root/FRONTEND_FIXES.md](root/FRONTEND_FIXES.md)

## 📝 贡献

添加新文档时：
1. 首先创建英文版本（默认）
2. 创建中文版本，使用 `_zh.md` 后缀
3. 更新此索引文件
4. 遵循现有的命名约定

---

*最后更新：$(date)*
