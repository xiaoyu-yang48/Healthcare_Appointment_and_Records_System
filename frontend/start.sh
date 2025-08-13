#!/bin/bash

# 医疗预约系统前端启动脚本

echo "🚀 启动医疗预约系统前端..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
    echo "✅ 环境变量文件已创建"
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
npm start 