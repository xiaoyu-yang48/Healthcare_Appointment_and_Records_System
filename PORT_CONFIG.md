# 端口配置说明

## 端口分配

### 后端服务 (Backend)
- **开发环境**: 5001
- **测试环境**: 5001  
- **生产环境**: 5001
- **本地**: 5001

### 前端服务 (Frontend)
- **开发环境**: 3000 (React默认)
- **测试环境**: 3000
- **生产环境**: 80
- **本地**: 3000

### 数据库 (MongoDB)
- **开发/测试/生产**: 27017

## 配置文件端口设置

### 1. 后端配置

#### backend/server.js
```javascript
const PORT = process.env.PORT || 5001;
```

#### backend/healthcheck.js
```javascript
port: process.env.PORT || 5001
```

#### ecosystem.config.js
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5001,
},
env_staging: {
  NODE_ENV: 'staging', 
  PORT: 5001,
}
```

### 2. 前端配置

#### frontend/src/axiosConfig.jsx
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

#### frontend/package.json
```json
{
  "scripts": {
    "start": "react-scripts start"  // 默认端口3000
  }
}
```

### 3. 本地配置

#### 后端启动
```bash
cd backend
npm install
npm start
```

#### 前端启动
```bash
cd frontend
npm install
npm start
```

#### MongoDB连接
```bash
# 使用内网测试服务器
# 地址: 192.168.0.202:27017
# 连接字符串: mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin
```

### 4. CI/CD配置

#### .github/workflows/ci.yml
```yaml
# 测试环境
- echo "PORT=5001" >> .env.test
- pm2 serve build 3000 --spa --name healthcare-frontend-staging
- curl -f http://localhost:5001/api/health
- curl -f http://localhost:3000

# 生产环境  
- pm2 serve build 80 --spa --name healthcare-frontend-prod
- curl -f http://localhost:5001/api/health
- curl -f http://localhost:80
```

### 5. 部署脚本

#### scripts/deploy.sh
```bash
# 生产环境
if [ "$ENVIRONMENT" = "production" ]; then
    PORT=80
else
    PORT=3000
fi

# 健康检查
curl -f http://localhost:5001/api/health
curl -f $FRONTEND_URL
```

## 环境变量配置

### 开发环境
```bash
# 后端
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# 前端
REACT_APP_API_URL=http://localhost:5001/api
```

### 测试环境
```bash
# 后端
NODE_ENV=staging
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# 前端
REACT_APP_API_URL=http://localhost:5001/api
```

### 生产环境
```bash
# 后端
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# 前端
REACT_APP_API_URL=https://your-domain.com/api
```

## 端口映射总结

| 服务 | 内部端口 | 外部端口 | 说明 |
|------|----------|----------|------|
| 后端开发 | 5001 | 5001 | 开发服务器 |
| 后端测试 | 5001 | 5001 | 测试服务器 |
| 后端生产 | 5001 | 5001 | 生产服务器 |
| 前端开发 | 3000 | 3000 | React开发服务器 |
| 前端测试 | 3000 | 3000 | 测试环境 |
| 前端生产 | 80 | 80 | 生产环境 |
| MongoDB | 27017 | 27017 | 数据库 |

## 注意事项

1. **端口冲突**: 确保端口5001和3000在本地开发时没有被其他服务占用
2. **防火墙**: 生产环境需要开放相应端口
3. **反向代理**: 生产环境建议使用Nginx反向代理
4. **SSL**: 生产环境建议配置HTTPS
5. **环境变量**: 确保各环境的REACT_APP_API_URL配置正确
