#!/bin/bash

echo "医疗预约系统后端启动脚本"
echo "=========================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm，请先安装npm"
    exit 1
fi

# 检查MongoDB是否运行
if ! command -v mongod &> /dev/null; then
    echo "警告: 未找到MongoDB，请确保MongoDB服务正在运行"
else
    echo "MongoDB检查通过"
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo "创建.env文件..."
    cat > .env << EOF
# 服务器配置
PORT=5000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/healthcare_appointment_system

# JWT配置
JWT_SECRET=healthcare_appointment_system_secret_key_2024

# 跨域配置
CORS_ORIGIN=http://localhost:3000
EOF
    echo ".env文件已创建"
else
    echo ".env文件已存在"
fi

# 安装依赖
echo "安装依赖..."
npm install

# 启动服务
echo "启动后端服务..."
echo "服务将在 http://localhost:3001 运行"
echo "健康检查: http://localhost:3001/api/health"
echo ""
echo "按 Ctrl+C 停止服务"
echo "=========================="

npm run dev 