# 服务器配置和部署指南

## 服务器信息

### 生产环境服务器
- **IP地址**: 192.168.0.202
- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **用途**: 生产环境部署

### 测试环境服务器 (可选)
- **IP地址**: 192.168.0.201 (或其他可用IP)
- **操作系统**: Linux
- **用途**: 测试环境部署

## 1. 服务器环境准备

### 1.1 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Git
sudo apt install git -y

# 安装 Docker (可选，用于容器化部署)
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Nginx (可选，用于反向代理)
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# 安装 MongoDB (如果使用本地数据库)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

### 1.2 创建部署用户

```bash
# 创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy

# 设置密码
sudo passwd deploy

# 切换到部署用户
su - deploy
```

### 1.3 创建项目目录

```bash
# 创建项目目录
mkdir -p /home/deploy/healthcare-app
cd /home/deploy/healthcare-app

# 创建日志目录
mkdir -p logs
mkdir -p backup
```

## 2. 配置 GitHub Actions Runner

### 2.1 下载并配置 Runner

```bash
# 切换到部署用户
su - deploy

# 创建 runner 目录
mkdir -p /home/deploy/actions-runner
cd /home/deploy/actions-runner

# 下载最新版本的 runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# 解压
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# 配置 runner (需要从 GitHub 仓库获取 token)
./config.sh --url https://github.com/YOUR_USERNAME/HealthcareAppointmentandRecordsSystem --token YOUR_RUNNER_TOKEN --labels production-server
```

### 2.2 安装 Runner 服务

```bash
# 安装 runner 服务
sudo ./svc.sh install deploy

# 启动服务
sudo ./svc.sh start

# 检查状态
sudo ./svc.sh status
```

### 2.3 配置 Runner 标签

在 GitHub 仓库设置中为 runner 添加标签：
- `production-server` - 生产环境
- `staging-server` - 测试环境

## 3. 环境变量配置

### 3.1 创建环境变量文件

```bash
# 生产环境配置
sudo nano /home/deploy/healthcare-app/.env.production
```

```bash
# 生产环境配置内容
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr
JWT_SECRET=your-super-secret-production-jwt-key-change-this
CORS_ORIGIN=http://192.168.0.202
```

```bash
# 测试环境配置
sudo nano /home/deploy/healthcare-app/.env.staging
```

```bash
# 测试环境配置内容
NODE_ENV=staging
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr_staging
JWT_SECRET=staging-jwt-secret-key
CORS_ORIGIN=http://192.168.0.202:3000
```

### 3.2 配置 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加：

```bash
# 生产环境变量
PRODUCTION_ENV=NODE_ENV=production\nPORT=3001\nMONGODB_URI=mongodb://localhost:27017/emr\nJWT_SECRET=your-super-secret-production-jwt-key\nCORS_ORIGIN=http://192.168.0.202

# 测试环境变量
STAGING_ENV=NODE_ENV=staging\nPORT=3001\nMONGODB_URI=mongodb://localhost:27017/emr_staging\nJWT_SECRET=staging-jwt-secret-key\nCORS_ORIGIN=http://192.168.0.202:3000

# 前端API地址
REACT_APP_API_URL=http://192.168.0.202:3001/api
```

## 4. 防火墙配置

```bash
# 开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # 后端API
sudo ufw allow 3000/tcp  # 前端开发
sudo ufw allow 27017/tcp # MongoDB

# 启用防火墙
sudo ufw enable
```

## 5. Nginx 反向代理配置 (推荐)

### 5.1 创建 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/healthcare-app
```

```nginx
server {
    listen 80;
    server_name 192.168.0.202;

    # 前端静态文件
    location / {
        root /home/deploy/healthcare-app/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5.2 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/healthcare-app /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 6. 部署脚本配置

### 6.1 修改部署脚本以支持指定服务器

```bash
# 编辑部署脚本
nano /home/deploy/healthcare-app/scripts/deploy.sh
```

在脚本开头添加服务器配置：

```bash
#!/bin/bash

# 服务器配置
PRODUCTION_SERVER="192.168.0.202"
STAGING_SERVER="192.168.0.201"  # 如果有测试服务器

# 根据环境选择服务器
if [ "$ENVIRONMENT" = "production" ]; then
    SERVER_IP=$PRODUCTION_SERVER
    PORT=80
else
    SERVER_IP=$STAGING_SERVER
    PORT=3000
fi
```

## 7. 监控和日志

### 7.1 配置日志轮转

```bash
sudo nano /etc/logrotate.d/healthcare-app
```

```
/home/deploy/healthcare-app/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.2 设置监控脚本

```bash
nano /home/deploy/healthcare-app/scripts/monitor.sh
```

```bash
#!/bin/bash

# 检查服务状态
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "后端服务异常，正在重启..."
    pm2 restart healthcare-backend-prod
fi

if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "前端服务异常，正在重启..."
    pm2 restart healthcare-frontend-prod
fi
```

```bash
chmod +x /home/deploy/healthcare-app/scripts/monitor.sh

# 添加到 crontab
crontab -e
# 添加以下行
*/5 * * * * /home/deploy/healthcare-app/scripts/monitor.sh
```

## 8. 安全配置

### 8.1 SSH 密钥认证

```bash
# 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "deploy@192.168.0.202"

# 将公钥添加到 authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 8.2 数据库安全

```bash
# 配置 MongoDB 认证
sudo nano /etc/mongod.conf
```

```yaml
security:
  authorization: enabled
```

```bash
# 创建管理员用户
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

## 9. 备份策略

### 9.1 数据库备份

```bash
nano /home/deploy/healthcare-app/scripts/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mongodump --db emr --out $BACKUP_DIR/emr_$DATE

# 压缩备份
tar -czf $BACKUP_DIR/emr_$DATE.tar.gz -C $BACKUP_DIR emr_$DATE

# 删除临时文件
rm -rf $BACKUP_DIR/emr_$DATE

# 保留最近30天的备份
find $BACKUP_DIR -name "emr_*.tar.gz" -mtime +30 -delete
```

```bash
chmod +x /home/deploy/healthcare-app/scripts/backup.sh

# 添加到 crontab (每天凌晨2点备份)
crontab -e
# 添加以下行
0 2 * * * /home/deploy/healthcare-app/scripts/backup.sh
```

## 10. 测试部署

### 10.1 手动测试部署

```bash
# 克隆项目
cd /home/deploy/healthcare-app
git clone https://github.com/YOUR_USERNAME/HealthcareAppointmentandRecordsSystem.git .

# 运行部署脚本
./scripts/deploy.sh production
```

### 10.2 验证部署

```bash
# 检查服务状态
pm2 status

# 检查端口
netstat -tlnp | grep -E ':(80|3001|27017)'

# 测试健康检查
curl http://192.168.0.202/health
curl http://192.168.0.202:3001/api/health
```

## 11. 故障排除

### 常见问题

1. **Runner 连接失败**
   - 检查网络连接
   - 验证 token 是否正确
   - 检查防火墙设置

2. **部署失败**
   - 检查 PM2 状态
   - 查看日志文件
   - 验证环境变量

3. **服务无法访问**
   - 检查端口是否开放
   - 验证 Nginx 配置
   - 检查服务状态

### 日志位置

- **PM2 日志**: `/home/deploy/healthcare-app/logs/`
- **Nginx 日志**: `/var/log/nginx/`
- **MongoDB 日志**: `/var/log/mongodb/`
- **系统日志**: `/var/log/syslog`

## 12. 维护命令

```bash
# 查看服务状态
pm2 status
pm2 logs

# 重启服务
pm2 restart all

# 更新代码
cd /home/deploy/healthcare-app
git pull origin main
./scripts/deploy.sh production

# 查看系统资源
htop
df -h
free -h
```

