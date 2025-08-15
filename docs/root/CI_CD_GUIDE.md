# Healthcare Appointment System CI/CD Guide

## Overview

This project's CI/CD pipeline is implemented based on GitHub Actions, supporting automated testing, building, and deployment.

## Pipeline Architecture

### 1. Trigger Conditions
- **Push to main branch**: Triggers production environment deployment
- **Push to develop branch**: Triggers test environment deployment
- **Pull Request**: Triggers code quality checks and testing

### 2. Workflow Stages

#### 2.1 Code Quality Check
- **ESLint Check**: Code style verification
- **Prettier Check**: Code formatting verification
- **Runtime Environment**: Ubuntu Latest

#### 2.2 Testing Stage
- **Backend Testing**: 
  - Uses MongoDB test database
  - Runs Mocha test suite
  - Generates test coverage reports
- **Frontend Testing**:
  - Runs Jest tests
  - Generates test coverage reports
- **Parallel Execution**: Frontend and backend tests run simultaneously

#### 2.3 Build Stage
- **Dependency Installation**: Uses `npm ci` to ensure consistency
- **Frontend Build**: Generates production static files
- **Build Artifacts**: Uploads to GitHub Actions Artifacts

#### 2.4 Security Scan
- **npm audit**: Checks dependency security vulnerabilities
- **Snyk Scan**: Deep security scanning
- **Threshold**: Medium and above level vulnerabilities

#### 2.5 Deployment Stage
- **Test Environment Deployment**: Automatic deployment for develop branch
- **Production Environment Deployment**: Automatic deployment for main branch
- **Health Check**: Automatic service status verification after deployment

## Environment Configuration

### GitHub Secrets Configuration

Add the following secrets in GitHub repository settings:

```bash
# Environment variables
STAGING_ENV=          # Test environment configuration
PRODUCTION_ENV=       # Production environment configuration
REACT_APP_API_URL=    # Frontend API address

# Server configuration
PRODUCTION_SERVER=192.168.0.202    # Production server IP
STAGING_SERVER=192.168.0.201       # Test server IP
DEPLOY_USER=deploy                  # Deployment user

# Security scan
SNYK_TOKEN=           # Snyk security scan token

# Notification configuration
SLACK_WEBHOOK=        # Slack notification webhook
DINGTALK_WEBHOOK=     # DingTalk notification webhook

# Database configuration
MONGODB_URI=          # MongoDB connection string
JWT_SECRET=           # JWT secret key
```

### Environment Variable Examples

#### Test Environment (.env.staging)
```bash
NODE_ENV=staging
PORT=3001
MONGODB_URI=mongodb://localhost:27017/emr_staging
JWT_SECRET=staging_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

#### Production Environment (.env.production)
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-mongodb:27017/emr
JWT_SECRET=your-super-secret-production-jwt-key
CORS_ORIGIN=https://your-domain.com
```

## Deployment Methods

### 1. Automatic Deployment (Recommended)
- Push code to corresponding branch to trigger automatic deployment
- Requires GitHub Actions Runner configuration on target server
- Server configuration: 192.168.0.202 (production environment)

### 2. Manual Deployment to Specified Server
Use server deployment script:

```bash
# Deploy to test environment server
./scripts/deploy-to-server.sh staging

# Deploy to production environment server
./scripts/deploy-to-server.sh production
```

### 3. Local Deployment
Use local deployment script:

```bash
# Deploy to test environment
./scripts/deploy.sh staging

# Deploy to production environment
./scripts/deploy.sh production
```

### 4. Local Development
```bash
# Start backend service
cd backend && npm start

# Start frontend service
cd frontend && npm start
```

## Monitoring and Logging

### PM2 Management
```bash
# View service status
pm2 status

# View logs
pm2 logs healthcare-backend-prod
pm2 logs healthcare-frontend-prod

# Restart service
pm2 restart healthcare-backend-prod

# Stop service
pm2 stop healthcare-backend-prod
```

### Health Check
- **Backend**: `http://localhost:3001/api/health`
- **Frontend**: `http://localhost/health`

### Log File Locations
- **PM2 Logs**: `./logs/`
- **Application Logs**: Managed through PM2

## Troubleshooting

### Common Issues

#### 1. Build Failure
- Check Node.js version compatibility
- Verify dependency package versions
- View build logs

#### 2. Test Failure
- Check test database connection
- Verify test environment variables
- View test coverage reports

#### 3. Deployment Failure
- Check server PM2 status
- Verify environment variable configuration
- View deployment logs

#### 4. Health Check Failure
- Check service port occupancy
- Verify database connection
- View service logs

### Rollback Strategy
```bash
# Use PM2 rollback
pm2 restart healthcare-backend-prod

# Use backup recovery
cp -r backup/backend-20231201_120000 backend/
./scripts/deploy.sh production
```

## Best Practices

### 1. Code Management
- Use feature branches for development
- Merge code through Pull Requests
- Keep commit messages clear

### 2. Testing Strategy
- Write unit tests and integration tests
- Maintain test coverage > 80%
- Regularly update test cases

### 3. Security Considerations
- Regularly update dependency packages
- Use environment variables to manage sensitive information
- Enable security scanning

### 4. Monitoring and Alerting
- Configure service monitoring
- Set up exception alerts
- Regularly check logs

## Extended Features

### 1. Multi-Environment Support
Can add more environments:
- `feature/*` → Feature test environment
- `hotfix/*` → Hotfix environment

### 2. Blue-Green Deployment
Implement zero-downtime deployment:
- Deploy new version to standby environment
- Switch traffic to new version
- Keep old version for rollback

### 3. Automated Testing
- End-to-end testing (E2E)
- Performance testing
- Security testing

### 4. Notification Integration
- Slack notifications
- DingTalk notifications
- Email notifications
- SMS notifications

## Support Contact

For issues, please contact the development team or refer to project documentation.
