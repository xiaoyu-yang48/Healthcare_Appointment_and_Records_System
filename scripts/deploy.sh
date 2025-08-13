#!/bin/bash

# 医疗预约系统部署脚本
# 使用方法: ./scripts/deploy.sh [staging|production]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    log_error "请指定部署环境: staging 或 production"
    echo "使用方法: $0 [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "无效的环境参数: $ENVIRONMENT"
    echo "支持的环境: staging, production"
    exit 1
fi

log_info "开始部署到 $ENVIRONMENT 环境..."

# 检查必要工具
check_requirements() {
    log_info "检查部署要求..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2 未安装，正在安装..."
        npm install -g pm2
    fi
    
    log_info "部署要求检查完成"
}

# 备份当前版本
backup_current() {
    log_info "备份当前版本..."
    
    if [ -d "backup" ]; then
        rm -rf backup
    fi
    
    mkdir -p backup
    cp -r backend backup/backend-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    cp -r frontend/build backup/frontend-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    
    log_info "备份完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 安装后端依赖
    cd backend
    npm ci --only=production
    cd ..
    
    # 安装前端依赖并构建
    cd frontend
    npm ci
    npm run build
    cd ..
    
    log_info "依赖安装完成"
}

# 部署服务
deploy_services() {
    log_info "部署服务到 $ENVIRONMENT 环境..."
    
    # 停止现有服务
    pm2 stop healthcare-backend-$ENVIRONMENT 2>/dev/null || true
    pm2 stop healthcare-frontend-$ENVIRONMENT 2>/dev/null || true
    
    # 启动后端服务
    cd backend
    pm2 start server.js --name healthcare-backend-$ENVIRONMENT --env $ENVIRONMENT
    cd ..
    
    # 启动前端服务
    if [ "$ENVIRONMENT" = "production" ]; then
        PORT=80
    else
        PORT=3000
    fi
    
    pm2 serve frontend/build $PORT --spa --name healthcare-frontend-$ENVIRONMENT
    
    # 保存 PM2 配置
    pm2 save
    
    log_info "服务部署完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查后端健康状态
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_info "后端服务健康检查通过"
    else
        log_error "后端服务健康检查失败"
        return 1
    fi
    
    # 检查前端健康状态
    if [ "$ENVIRONMENT" = "production" ]; then
        FRONTEND_URL="http://localhost"
    else
        FRONTEND_URL="http://localhost:3000"
    fi
    
    if curl -f $FRONTEND_URL > /dev/null 2>&1; then
        log_info "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        return 1
    fi
    
    log_info "所有服务健康检查通过"
}

# 清理旧版本
cleanup() {
    log_info "清理旧版本..."
    
    # 保留最近5个备份
    if [ -d "backup" ]; then
        cd backup
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
    fi
    
    log_info "清理完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message="医疗预约系统 $ENVIRONMENT 环境部署$status"
    
    log_info "发送部署通知: $message"
    
    # 这里可以集成各种通知方式
    # 例如: Slack, 钉钉, 邮件等
    
    # Slack 通知示例
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #          --data "{\"text\":\"$message\"}" \
    #          $SLACK_WEBHOOK_URL
    # fi
    
    # 钉钉通知示例
    # if [ -n "$DINGTALK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #          --data "{\"msgtype\":\"text\",\"text\":{\"content\":\"$message\"}}" \
    #          $DINGTALK_WEBHOOK_URL
    # fi
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    log_info "=== 医疗预约系统部署开始 ==="
    log_info "部署环境: $ENVIRONMENT"
    log_info "部署时间: $(date)"
    
    # 执行部署步骤
    check_requirements
    backup_current
    install_dependencies
    deploy_services
    health_check
    
    # 计算部署时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_info "=== 部署完成 ==="
    log_info "部署耗时: ${duration}秒"
    
    # 发送成功通知
    send_notification "成功"
    
    # 清理旧版本
    cleanup
    
    log_info "部署脚本执行完成"
}

# 错误处理
trap 'log_error "部署过程中发生错误，正在回滚..."; send_notification "失败"; exit 1' ERR

# 执行主函数
main "$@"
