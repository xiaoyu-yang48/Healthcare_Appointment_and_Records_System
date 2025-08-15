# Port Configuration Guide

## Port Allocation

### Backend Service
- **Development Environment**: 5001
- **Test Environment**: 5001  
- **Production Environment**: 5001
- **Local**: 5001

### Frontend Service
- **Development Environment**: 3000 (React default)
- **Test Environment**: 3000
- **Production Environment**: 80
- **Local**: 3000

### Database (MongoDB)
- **Development/Test/Production**: 27017

## Configuration File Port Settings

### 1. Backend Configuration

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

### 2. Frontend Configuration

#### frontend/src/axiosConfig.jsx
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

#### frontend/package.json
```json
{
  "scripts": {
    "start": "react-scripts start"  // Default port 3000
  }
}
```

### 3. Local Configuration

#### Backend Startup
```bash
cd backend
npm install
npm start
```

#### Frontend Startup
```bash
cd frontend
npm install
npm start
```

#### MongoDB Connection
```bash
# Use intranet test server
# Address: 192.168.0.202:27017
# Connection string: mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin
```

### 4. CI/CD Configuration

#### .github/workflows/ci.yml
```yaml
# Test environment
- echo "PORT=5001" >> .env.test
- pm2 serve build 3000 --spa --name healthcare-frontend-staging
- curl -f http://localhost:5001/api/health
- curl -f http://localhost:3000

# Production environment  
- pm2 serve build 80 --spa --name healthcare-frontend-prod
- curl -f http://localhost:5001/api/health
- curl -f http://localhost:80
```

### 5. Deployment Scripts

#### scripts/deploy.sh
```bash
# Production environment
if [ "$ENVIRONMENT" = "production" ]; then
    PORT=80
else
    PORT=3000
fi

# Health check
curl -f http://localhost:5001/api/health
curl -f $FRONTEND_URL
```

## Environment Variable Configuration

### Development Environment
```bash
# Backend
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# Frontend
REACT_APP_API_URL=http://localhost:5001/api
```

### Test Environment
```bash
# Backend
NODE_ENV=staging
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# Frontend
REACT_APP_API_URL=http://localhost:5001/api
```

### Production Environment
```bash
# Backend
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin

# Frontend
REACT_APP_API_URL=https://your-domain.com/api
```

## Port Mapping Summary

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Backend Development | 5001 | 5001 | Development server |
| Backend Test | 5001 | 5001 | Test server |
| Backend Production | 5001 | 5001 | Production server |
| Frontend Development | 3000 | 3000 | React development server |
| Frontend Test | 3000 | 3000 | Test environment |
| Frontend Production | 80 | 80 | Production environment |
| MongoDB | 27017 | 27017 | Database |

## Important Notes

1. **Port Conflicts**: Ensure ports 5001 and 3000 are not occupied by other services during local development
2. **Firewall**: Production environment needs to open corresponding ports
3. **Reverse Proxy**: Production environment recommends using Nginx reverse proxy
4. **SSL**: Production environment recommends configuring HTTPS
5. **Environment Variables**: Ensure REACT_APP_API_URL is correctly configured for each environment
