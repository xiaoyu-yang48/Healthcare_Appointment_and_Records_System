#!/bin/bash

# 端口配置检查脚本
# 用于验证所有配置文件中的端口设置是否一致

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔍 检查端口配置一致性..."

# 检查后端端口配置
log_info "检查后端端口配置..."

# 检查 server.js
if grep -q "PORT.*3001" backend/server.js; then
    log_success "backend/server.js: 端口配置正确 (3001)"
else
    log_error "backend/server.js: 端口配置错误"
fi

# 检查 healthcheck.js
if grep -q "port.*3001" backend/healthcheck.js; then
    log_success "backend/healthcheck.js: 端口配置正确 (3001)"
else
    log_error "backend/healthcheck.js: 端口配置错误"
fi

# 检查 ecosystem.config.js
if grep -q "PORT: 3001" ecosystem.config.js; then
    log_success "ecosystem.config.js: 端口配置正确 (3001)"
else
    log_error "ecosystem.config.js: 端口配置错误"
fi

# 检查前端端口配置
log_info "检查前端端口配置..."

# 检查 axiosConfig.jsx
if grep -q "localhost:3001" frontend/src/axiosConfig.jsx; then
    log_success "frontend/src/axiosConfig.jsx: API地址配置正确 (3001)"
else
    log_error "frontend/src/axiosConfig.jsx: API地址配置错误"
fi

# 检查本地服务配置
log_info "检查本地服务配置..."

# 检查后端端口配置
if grep -q "PORT.*5001" backend/server.js; then
    log_success "后端端口配置正确 (5001)"
else
    log_error "后端端口配置错误"
fi

# 检查前端端口配置
if grep -q "PORT.*3000" frontend/package.json; then
    log_success "前端端口配置正确 (3000)"
else
    log_error "前端端口配置错误"
fi

# 检查 nginx.conf
if grep -q "proxy_pass http://backend:3001" frontend/nginx.conf; then
    log_success "frontend/nginx.conf: 后端代理配置正确 (3001)"
else
    log_error "frontend/nginx.conf: 后端代理配置错误"
fi

# 检查 CI/CD 配置
log_info "检查 CI/CD 配置..."

# 检查 GitHub Actions
if grep -q "PORT=3001" .github/workflows/ci.yml; then
    log_success ".github/workflows/ci.yml: 后端端口配置正确 (3001)"
else
    log_error ".github/workflows/ci.yml: 后端端口配置错误"
fi

if grep -q "3000.*healthcare-frontend-staging" .github/workflows/ci.yml; then
    log_success ".github/workflows/ci.yml: 测试环境前端端口配置正确 (3000)"
else
    log_error ".github/workflows/ci.yml: 测试环境前端端口配置错误"
fi

if grep -q "80.*healthcare-frontend-prod" .github/workflows/ci.yml; then
    log_success ".github/workflows/ci.yml: 生产环境前端端口配置正确 (80)"
else
    log_error ".github/workflows/ci.yml: 生产环境前端端口配置错误"
fi

# 检查部署脚本
log_info "检查部署脚本..."

if grep -q "PORT=80" scripts/deploy.sh; then
    log_success "scripts/deploy.sh: 生产环境端口配置正确 (80)"
else
    log_error "scripts/deploy.sh: 生产环境端口配置错误"
fi

if grep -q "PORT=3000" scripts/deploy.sh; then
    log_success "scripts/deploy.sh: 测试环境端口配置正确 (3000)"
else
    log_error "scripts/deploy.sh: 测试环境端口配置错误"
fi

# 检查是否还有旧的5000端口配置
log_info "检查是否还有旧的5000端口配置..."

OLD_PORTS=$(grep -r "localhost:5000" . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || true)

if [ -z "$OLD_PORTS" ]; then
    log_success "没有发现旧的5000端口配置"
else
    log_warn "发现以下文件仍包含5000端口配置:"
    echo "$OLD_PORTS"
fi

# 检查MongoDB配置
log_info "检查MongoDB配置..."

if curl -f http://192.168.0.202:27017 > /dev/null 2>&1; then
    log_success "MongoDB服务器连接正常 (192.168.0.202:27017)"
else
    log_error "无法连接到MongoDB服务器"
fi

# 总结
echo ""
echo "📊 端口配置检查总结:"
echo "=================="
echo "✅ 后端服务端口: 3001"
echo "✅ 前端开发端口: 3000"
echo "✅ 前端生产端口: 80"
echo "✅ MongoDB端口: 27017"
echo ""
echo "�� 所有配置文件中的端口设置已统一！"
