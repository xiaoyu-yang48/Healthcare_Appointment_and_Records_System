#!/bin/bash

# 服务器部署脚本
# 用于部署到指定的服务器 (192.168.0.202)

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

# 服务器配置
PRODUCTION_SERVER="192.168.0.202"
STAGING_SERVER="192.168.0.201"  # 如果有测试服务器
DEPLOY_USER="deploy"
PROJECT_PATH="/home/deploy/healthcare-app"

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

# 根据环境选择服务器
if [ "$ENVIRONMENT" = "production" ]; then
    SERVER_IP=$PRODUCTION_SERVER
    PORT=80
    log_info "部署到生产环境服务器: $SERVER_IP"
else
    SERVER_IP=$STAGING_SERVER
    PORT=3000
    log_info "部署到测试环境服务器: $SERVER_IP"
fi

# 检查服务器连接
check_server_connection() {
    log_info "检查服务器连接..."
    
    if ! ping -c 1 $SERVER_IP > /dev/null 2>&1; then
        log_error "无法连接到服务器 $SERVER_IP"
        exit 1
    fi
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $DEPLOY_USER@$SERVER_IP exit 2>/dev/null; then
        log_error "无法通过SSH连接到服务器 $SERVER_IP"
        log_warn "请确保SSH密钥已配置"
        exit 1
    fi
    
    log_success "服务器连接正常"
}

# 备份当前版本
backup_current() {
    log_info "备份当前版本..."
    
    ssh $DEPLOY_USER@$SERVER_IP << EOF
        cd $PROJECT_PATH
        if [ -d "backup" ]; then
            rm -rf backup
        fi
        
        mkdir -p backup
        cp -r backend backup/backend-\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
        cp -r frontend/build backup/frontend-\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
EOF
    
    log_success "备份完成"
}

# 同步代码到服务器
sync_code() {
    log_info "同步代码到服务器..."
    
    # 使用rsync同步代码
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'logs' \
        --exclude 'backup' \
        --exclude '.env*' \
        ./ $DEPLOY_USER@$SERVER_IP:$PROJECT_PATH/
    
    log_success "代码同步完成"
}

# 在服务器上安装依赖
install_dependencies() {
    log_info "在服务器上安装依赖..."
    
    ssh $DEPLOY_USER@$SERVER_IP << EOF
        cd $PROJECT_PATH
        
        # 安装后端依赖
        cd backend
        npm ci --only=production
        cd ..
        
        # 安装前端依赖并构建
        cd frontend
        npm ci
        npm run build
        cd ..
EOF
    
    log_success "依赖安装完成"
}

# 部署服务
deploy_services() {
    log_info "部署服务到 $ENVIRONMENT 环境..."
    
    ssh $DEPLOY_USER@$SERVER_IP << EOF
        cd $PROJECT_PATH
        
        # 停止现有服务
        pm2 stop healthcare-backend-$ENVIRONMENT 2>/dev/null || true
        pm2 stop healthcare-frontend-$ENVIRONMENT 2>/dev/null || true
        
        # 启动后端服务
        cd backend
        pm2 start server.js --name healthcare-backend-$ENVIRONMENT --env $ENVIRONMENT
        cd ..
        
        # 启动前端服务
        pm2 serve frontend/build $PORT --spa --name healthcare-frontend-$ENVIRONMENT
        
        # 保存 PM2 配置
        pm2 save
EOF
    
    log_success "服务部署完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查后端健康状态
    if ssh $DEPLOY_USER@$SERVER_IP "curl -f http://localhost:3001/api/health > /dev/null 2>&1"; then
        log_success "后端服务健康检查通过"
    else
        log_error "后端服务健康检查失败"
        return 1
    fi
    
    # 检查前端健康状态
    if [ "$ENVIRONMENT" = "production" ]; then
        FRONTEND_URL="http://$SERVER_IP"
    else
        FRONTEND_URL="http://$SERVER_IP:$PORT"
    fi
    
    if curl -f $FRONTEND_URL > /dev/null 2>&1; then
        log_success "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        return 1
    fi
    
    log_success "所有服务健康检查通过"
}

# 清理旧版本
cleanup() {
    log_info "清理旧版本..."
    
    ssh $DEPLOY_USER@$SERVER_IP << EOF
        cd $PROJECT_PATH/backup
        if [ -d "backup" ]; then
            cd backup
            ls -t | tail -n +6 | xargs -r rm -rf
            cd ..
        fi
EOF
    
    log_success "清理完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message="医疗预约系统 $ENVIRONMENT 环境部署到 $SERVER_IP $status"
    
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

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "🚀 部署信息"
    echo "=========="
    echo "环境: $ENVIRONMENT"
    echo "服务器: $SERVER_IP"
    echo "端口: $PORT"
    echo "项目路径: $PROJECT_PATH"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 访问地址:"
        echo "前端: http://$SERVER_IP"
        echo "后端API: http://$SERVER_IP:3001/api"
        echo "健康检查: http://$SERVER_IP/health"
    else
        echo "🌐 访问地址:"
        echo "前端: http://$SERVER_IP:$PORT"
        echo "后端API: http://$SERVER_IP:3001/api"
        echo "健康检查: http://$SERVER_IP:3001/api/health"
    fi
    echo ""
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    log_info "=== 医疗预约系统服务器部署开始 ==="
    log_info "部署环境: $ENVIRONMENT"
    log_info "目标服务器: $SERVER_IP"
    log_info "部署时间: $(date)"
    
    show_deployment_info
    
    # 执行部署步骤
    check_server_connection
    backup_current
    sync_code
    install_dependencies
    deploy_services
    health_check
    
    # 计算部署时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "=== 部署完成 ==="
    log_info "部署耗时: ${duration}秒"
    
    # 发送成功通知
    send_notification "成功"
    
    # 清理旧版本
    cleanup
    
    log_success "部署脚本执行完成"
}

# 错误处理
trap 'log_error "部署过程中发生错误，正在回滚..."; send_notification "失败"; exit 1' ERR

# 执行主函数
main "$@"

