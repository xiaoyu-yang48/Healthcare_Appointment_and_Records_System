const mongoose = require('mongoose');
const connectDB = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

async function checkDatabase() {
  console.log('🔍 检查数据库配置...\n');

  // 1. 显示环境变量
  console.log('1. 环境变量配置:');
  console.log('   NODE_ENV:', process.env.NODE_ENV || '未设置');
  console.log('   MONGO_URI:', process.env.MONGO_URI || '未设置');
  console.log('   PORT:', process.env.PORT || '未设置');
  console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
  console.log('');

  // 2. 尝试连接数据库
  console.log('2. 尝试连接数据库...');
  try {
    await connectDB();
    
    // 获取数据库信息
    const db = mongoose.connection;
    console.log('✅ 数据库连接成功!');
    console.log('   数据库名称:', db.name);
    console.log('   数据库主机:', db.host);
    console.log('   数据库端口:', db.port);
    console.log('   连接状态:', db.readyState === 1 ? '已连接' : '未连接');
    console.log('');

    // 3. 检查集合
    console.log('3. 检查数据库集合...');
    const collections = await db.db.listCollections().toArray();
    console.log('   集合列表:');
    collections.forEach(collection => {
      console.log(`     - ${collection.name}`);
    });
    console.log('');

    // 4. 检查用户数量
    console.log('4. 检查用户数据...');
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`   用户总数: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}).select('name email role createdAt').limit(5);
      console.log('   最近用户:');
      users.forEach(user => {
        console.log(`     - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    console.log('');

    // 5. 数据库统计
    console.log('5. 数据库统计信息:');
    const stats = await db.db.stats();
    console.log(`   数据库大小: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   集合数量: ${stats.collections}`);
    console.log(`   索引数量: ${stats.indexes}`);
    console.log('');

  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('');
    console.log('💡 可能的解决方案:');
    console.log('   1. 检查MONGO_URI环境变量是否正确设置');
    console.log('   2. 确认MongoDB服务是否正在运行');
    console.log('   3. 检查网络连接和防火墙设置');
    console.log('   4. 验证用户名和密码是否正确');
  } finally {
    // 关闭连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行检查
checkDatabase();
