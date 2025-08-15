# 医疗预约系统 CI/CD 指南

## 概述

本项目的 CI/CD 流程基于 GitHub Actions 实现，支持自动化测试、构建和部署。

## 流程架构

### 1. 触发条件
- **Push 到 main 分支**: 触发生产环境部署
- **Push 到 develop 分支**: 触发测试环境部署
- **Pull Request**: 触发代码质量检查和测试

### 2. 工作流程阶段

#### 2.1 代码质量检查 (Code Quality)
- **ESLint 检查**: 代码规范检查
- **Prettier 检查**: 代码格式检查
- **运行环境**: Ubuntu Latest

#### 2.2 测试阶段 (Testing)
- **后端测试**: 
  - 使用 MongoDB 测试数据库
  - 运行 Mocha 测试套件
  - 生成测试覆盖率报告
- **前端测试**:
  - 运行 Jest 测试
  - 生成测试覆盖率报告
- **并行执行**: 前后端测试同时进行

#### 2.3 构建阶段 (Build)
- **依赖安装**: 使用 `npm ci` 确保一致性
- **前端构建**: 生成生产环境静态文件
- **构建产物**: 上传到 GitHub Actions Artifacts

#### 2.4 安全扫描 (Security Scan)
- **npm audit**: 检查依赖安全漏洞
- **Snyk 扫描**: 深度安全扫描
- **阈值**: 中等及以上级别漏洞

#### 2.5 部署阶段 (Deployment)
- **测试环境部署**: develop 分支自动部署
- **生产环境部署**: main 分支自动部署
- **健康检查**: 部署后自动验证服务状态

## 环境配置

### GitHub Secrets 配置

在 GitHub 仓库设置中添加以下 Secrets:

```bash
# 环境变量
STAGING_ENV=          # 测试环境配置
PRODUCTION_ENV=       # 生产环境配置
REACT_APP_API_URL=    # 前端 API 地址

# 服务器配置
PRODUCTION_SERVER=192.168.0.202    # 生产环境服务器IP
STAGING_SERVER=192.168.0.201       # 测试环境服务器IP
DEPLOY_USER=deploy                  # 部署用户

# 安全扫描
SNYK_TOKEN=           # Snyk 安全扫描 Token

# 通知配置
SLACK_WEBHOOK=        # Slack 通知 Webhook
DINGTALK_WEBHOOK=     # 钉钉通知 Webhook

# 数据库配置
MONGODB_URI=          # MongoDB 连接字符串
JWT_SECRET=           # JWT 密钥
```

### 环境变量示例

#### 测试环境 (.env.staging)
```bash
NODE_ENV=staging
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr_staging
JWT_SECRET=staging_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

#### 生产环境 (.env.production)
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-mongodb:27017/emr
JWT_SECRET=your-super-secret-production-jwt-key
CORS_ORIGIN=https://your-domain.com
```

## 部署方式

### 1. 自动部署 (推荐)
- 推送代码到对应分支即可触发自动部署
- 需要在目标服务器上配置 GitHub Actions Runner
- 服务器配置: 192.168.0.202 (生产环境)

### 2. 手动部署到指定服务器
使用服务器部署脚本:

```bash
# 部署到测试环境服务器
./scripts/deploy-to-server.sh staging

# 部署到生产环境服务器
./scripts/deploy-to-server.sh production
```

### 3. 本地部署
使用本地部署脚本:

```bash
# 部署到测试环境
./scripts/deploy.sh staging

# 部署到生产环境
./scripts/deploy.sh production
```

### 3. 本地部署
```bash
# 启动后端服务
cd backend && npm start

# 启动前端服务
cd frontend && npm start
```

## 监控和日志

### PM2 管理
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs healthcare-backend-prod
pm2 logs healthcare-frontend-prod

# 重启服务
pm2 restart healthcare-backend-prod

# 停止服务
pm2 stop healthcare-backend-prod
```

### 健康检查
- **后端**: `http://localhost:3001/api/health`
- **前端**: `http://localhost/health`

### 日志文件位置
- **PM2 日志**: `./logs/`
- **应用日志**: 通过 PM2 管理

## 故障排除

### 常见问题

#### 1. 构建失败
- 检查 Node.js 版本兼容性
- 验证依赖包版本
- 查看构建日志

#### 2. 测试失败
- 检查测试数据库连接
- 验证测试环境变量
- 查看测试覆盖率报告

#### 3. 部署失败
- 检查服务器 PM2 状态
- 验证环境变量配置
- 查看部署日志

#### 4. 健康检查失败
- 检查服务端口占用
- 验证数据库连接
- 查看服务日志

### 回滚策略
```bash
# 使用 PM2 回滚
pm2 restart healthcare-backend-prod

# 使用备份恢复
cp -r backup/backend-20231201_120000 backend/
./scripts/deploy.sh production
```

## 最佳实践

### 1. 代码管理
- 使用 feature 分支开发
- 通过 Pull Request 合并代码
- 保持提交信息清晰

### 2. 测试策略
- 编写单元测试和集成测试
- 保持测试覆盖率 > 80%
- 定期更新测试用例

### 3. 安全考虑
- 定期更新依赖包
- 使用环境变量管理敏感信息
- 启用安全扫描

### 4. 监控告警
- 配置服务监控
- 设置异常告警
- 定期检查日志

## 扩展功能

### 1. 多环境支持
可以添加更多环境:
- `feature/*` → 功能测试环境
- `hotfix/*` → 热修复环境

### 2. 蓝绿部署
实现零停机部署:
- 部署新版本到备用环境
- 切换流量到新版本
- 保留旧版本作为回滚

### 3. 自动化测试
- 端到端测试 (E2E)
- 性能测试
- 安全测试

### 4. 通知集成
- Slack 通知
- 钉钉通知
- 邮件通知
- 短信通知

## 联系支持

如有问题，请联系开发团队或查看项目文档。
