const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

async function listUsers() {
  try {
    console.log('🔍 连接数据库...');
    await connectDB();
    
    console.log('\n📋 数据库中的所有用户:');
    console.log('='.repeat(60));
    
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('❌ 数据库中没有用户');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户信息:`);
      console.log(`   姓名: ${user.name}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   状态: ${user.isActive ? '启用' : '禁用'}`);
      console.log(`   创建时间: ${user.createdAt}`);
      console.log(`   最后登录: ${user.lastLogin || '从未登录'}`);
      console.log('');
    });
    
    // 统计信息
    const patientCount = users.filter(u => u.role === 'patient').length;
    const doctorCount = users.filter(u => u.role === 'doctor').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    
    console.log('📊 用户统计:');
    console.log(`   患者: ${patientCount} 人`);
    console.log(`   医生: ${doctorCount} 人`);
    console.log(`   管理员: ${adminCount} 人`);
    console.log(`   总计: ${users.length} 人`);
    
    if (adminCount === 0) {
      console.log('\n⚠️  没有找到管理员用户！');
      console.log('💡 建议运行 create-admin.js 创建管理员用户');
    }
    
  } catch (error) {
    console.error('❌ 查询用户失败:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers();
