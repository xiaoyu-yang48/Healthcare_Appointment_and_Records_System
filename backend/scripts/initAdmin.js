// /backend/scripts/initAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('正在连接数据库...');
    await connectDB();
    
    const adminData = {
      name: '系统管理员',
      email: process.env.ADMIN_EMAIL || 'admin@healthcare.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin',
      phone: process.env.ADMIN_PHONE || '13800000000',
      isActive: true
    };

    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⏩ 管理员账号已存在:');
      console.log(`  邮箱: ${existingAdmin.email}`);
      console.log(`  角色: ${existingAdmin.role}`);
      process.exit(0);
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    const admin = await User.create(adminData);
    
    console.log('✅ 管理员账号创建成功:');
    console.log(`  邮箱: ${admin.email}`);
    console.log(`  初始密码: ${process.env.ADMIN_PASSWORD || 'Admin@1234'}`);
    console.log('⚠️ 请务必在首次登录后修改密码！');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化管理员失败:');
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();