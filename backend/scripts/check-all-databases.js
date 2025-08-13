const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// 可能的数据库连接字符串
const possibleConnections = [
  {
    name: '当前.env配置',
    uri: process.env.MONGO_URI || '未设置'
  },
  {
    name: '本地默认',
    uri: 'mongodb://localhost:27017/healthcare_appointment_system'
  },
  {
    name: '本地test数据库',
    uri: 'mongodb://localhost:27017/test'
  },
  {
    name: 'Docker配置',
    uri: 'mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin'
  },
  {
    name: '本地emr数据库',
    uri: 'mongodb://localhost:27017/emr'
  }
];

async function checkAllDatabases() {
  console.log('🔍 检查所有可能的数据库连接...\n');

  for (const connection of possibleConnections) {
    console.log(`📋 测试连接: ${connection.name}`);
    console.log(`   URI: ${connection.uri}`);
    
    if (connection.uri === '未设置') {
      console.log('   ❌ 未配置');
      console.log('');
      continue;
    }

    try {
      // 尝试连接
      await mongoose.connect(connection.uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000
      });

      const db = mongoose.connection;
      console.log('   ✅ 连接成功!');
      console.log(`   数据库名称: ${db.name}`);
      console.log(`   数据库主机: ${db.host}`);
      console.log(`   数据库端口: ${db.port}`);

      // 检查用户数量
      try {
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        console.log(`   用户数量: ${userCount}`);
        
        if (userCount > 0) {
          const users = await User.find({}).select('name email role createdAt').limit(3);
          console.log('   用户列表:');
          users.forEach(user => {
            console.log(`     - ${user.name} (${user.email}) - ${user.role}`);
          });
        }
      } catch (modelError) {
        console.log('   ⚠️  无法查询用户数据:', modelError.message);
      }

      // 断开连接
      await mongoose.disconnect();
      console.log('   🔌 连接已关闭');
      
    } catch (error) {
      console.log(`   ❌ 连接失败: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎯 建议:');
  console.log('1. 确保.env文件中的MONGO_URI指向正确的数据库');
  console.log('2. 如果用户在不同数据库中，需要统一数据库配置');
  console.log('3. 建议使用同一个数据库进行开发和测试');
}

// 运行检查
checkAllDatabases();
