# Server Configuration and Deployment Guide

## Server Information

### Production Environment Server
- **IP Address**: 192.168.0.202
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Purpose**: Production environment deployment

### Test Environment Server (Optional)
- **IP Address**: 192.168.0.201 (or other available IP)
- **Operating System**: Linux
- **Purpose**: Test environment deployment

## 1. Server Environment Preparation

### 1.1 Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Install Docker (optional, for containerized deployment)
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Install MongoDB (if using local database)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

### 1.2 Create Deployment User

```bash
# Create deployment user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy

# Set password
sudo passwd deploy

# Switch to deployment user
su - deploy
```

### 1.3 Create Project Directory

```bash
# Create project directory
mkdir -p /home/deploy/healthcare-app
cd /home/deploy/healthcare-app

# Create log directory
mkdir -p logs
mkdir -p backup
```

## 2. Configure GitHub Actions Runner

### 2.1 Download and Configure Runner

```bash
# Switch to deployment user
su - deploy

# Create runner directory
mkdir -p /home/deploy/actions-runner
cd /home/deploy/actions-runner

# Download latest runner version
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure runner (need token from GitHub repository)
./config.sh --url https://github.com/YOUR_USERNAME/HealthcareAppointmentandRecordsSystem --token YOUR_RUNNER_TOKEN --labels production-server
```

### 2.2 Install Runner Service

```bash
# Install runner service
sudo ./svc.sh install deploy

# Start service
sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### 2.3 Configure Runner Labels

Add labels to runner in GitHub repository settings:
- `production-server` - Production environment
- `staging-server` - Test environment

## 3. Environment Variable Configuration

### 3.1 Create Environment Variable Files

```bash
# Production environment configuration
sudo nano /home/deploy/healthcare-app/.env.production
```

```bash
# Production environment configuration content
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr
JWT_SECRET=your-super-secret-production-jwt-key-change-this
CORS_ORIGIN=http://192.168.0.202
```

```bash
# Test environment configuration
sudo nano /home/deploy/healthcare-app/.env.staging
```

```bash
# Test environment configuration content
NODE_ENV=staging
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr_staging
JWT_SECRET=staging-jwt-secret-key
CORS_ORIGIN=http://192.168.0.202:3000
```

### 3.2 Configure GitHub Secrets

Add in GitHub repository Settings > Secrets and variables > Actions:

```bash
# Production environment variables
PRODUCTION_ENV=NODE_ENV=production\nPORT=3001\nMONGODB_URI=mongodb://localhost:27017/emr\nJWT_SECRET=your-super-secret-production-jwt-key\nCORS_ORIGIN=http://192.168.0.202

# Test environment variables
STAGING_ENV=NODE_ENV=staging\nPORT=3001\nMONGODB_URI=mongodb://localhost:27017/emr_staging\nJWT_SECRET=staging-jwt-secret-key\nCORS_ORIGIN=http://192.168.0.202:3000

# Frontend API address
REACT_APP_API_URL=http://192.168.0.202:3001/api
```

## 4. Firewall Configuration

```bash
# Open necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Backend API
sudo ufw allow 3000/tcp  # Frontend development
sudo ufw allow 27017/tcp # MongoDB

# Enable firewall
sudo ufw enable
```

## 5. Nginx Reverse Proxy Configuration (Recommended)

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/healthcare-app
```

```nginx
server {
    listen 80;
    server_name 192.168.0.202;

    # Frontend static files
    location / {
        root /home/deploy/healthcare-app/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static resources
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy to backend
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

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5.2 Enable Configuration

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/healthcare-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 6. Deployment Script Configuration

### 6.1 Modify Deployment Script to Support Specified Server

```bash
# Edit deployment script
nano /home/deploy/healthcare-app/scripts/deploy.sh
```

Add server configuration at the beginning of the script:

```bash
#!/bin/bash

# Server configuration
PRODUCTION_SERVER="192.168.0.202"
STAGING_SERVER="192.168.0.201"  # If test server exists

# Select server based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    SERVER_IP=$PRODUCTION_SERVER
    PORT=80
else
    SERVER_IP=$STAGING_SERVER
    PORT=3000
fi
```

## 7. Monitoring and Logging

### 7.1 Configure Log Rotation

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

### 7.2 Set Up Monitoring Script

```bash
nano /home/deploy/healthcare-app/scripts/monitor.sh
```

```bash
#!/bin/bash

# Check service status
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "Backend service abnormal, restarting..."
    pm2 restart healthcare-backend-prod
fi

if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "Frontend service abnormal, restarting..."
    pm2 restart healthcare-frontend-prod
fi
```

```bash
chmod +x /home/deploy/healthcare-app/scripts/monitor.sh

# Add to crontab
crontab -e
# Add the following line
*/5 * * * * /home/deploy/healthcare-app/scripts/monitor.sh
```

## 8. Security Configuration

### 8.1 SSH Key Authentication

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "deploy@192.168.0.202"

# Add public key to authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 8.2 Database Security

```bash
# Configure MongoDB authentication
sudo nano /etc/mongod.conf
```

```yaml
security:
  authorization: enabled
```

```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

## 9. Backup Strategy

### 9.1 Database Backup

```bash
nano /home/deploy/healthcare-app/scripts/backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --db emr --out $BACKUP_DIR/emr_$DATE

# Compress backup
tar -czf $BACKUP_DIR/emr_$DATE.tar.gz -C $BACKUP_DIR emr_$DATE

# Delete temporary files
rm -rf $BACKUP_DIR/emr_$DATE

# Keep recent 30 days of backups
find $BACKUP_DIR -name "emr_*.tar.gz" -mtime +30 -delete
```

```bash
chmod +x /home/deploy/healthcare-app/scripts/backup.sh

# Add to crontab (backup at 2 AM daily)
crontab -e
# Add the following line
0 2 * * * /home/deploy/healthcare-app/scripts/backup.sh
```

## 10. Test Deployment

### 10.1 Manual Test Deployment

```bash
# Clone project
cd /home/deploy/healthcare-app
git clone https://github.com/YOUR_USERNAME/HealthcareAppointmentandRecordsSystem.git .

# Run deployment script
./scripts/deploy.sh production
```

### 10.2 Verify Deployment

```bash
# Check service status
pm2 status

# Check ports
netstat -tlnp | grep -E ':(80|3001|27017)'

# Test health check
curl http://192.168.0.202/health
curl http://192.168.0.202:3001/api/health
```

## 11. Troubleshooting

### Common Issues

1. **Runner Connection Failed**
   - Check network connection
   - Verify token is correct
   - Check firewall settings

2. **Deployment Failed**
   - Check PM2 status
   - View log files
   - Verify environment variables

3. **Service Unreachable**
   - Check if ports are open
   - Verify Nginx configuration
   - Check service status

### Log Locations

- **PM2 Logs**: `/home/deploy/healthcare-app/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **MongoDB Logs**: `/var/log/mongodb/`
- **System Logs**: `/var/log/syslog`

## 12. Maintenance Commands

```bash
# View service status
pm2 status
pm2 logs

# Restart services
pm2 restart all

# Update code
cd /home/deploy/healthcare-app
git pull origin main
./scripts/deploy.sh production

# View system resources
htop
df -h
free -h
```

