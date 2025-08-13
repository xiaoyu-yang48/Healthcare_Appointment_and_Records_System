const fs = require('fs');
const path = require('path');

// 目标数据库配置
const targetDatabase = {
  name: 'emr',
  uri: 'mongodb://admin:123123@192.168.0.202:27017/emr?authSource=admin'
};

function fixDatabaseConfig() {
  console.log('🔧 修复数据库配置...\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  // 1. 检查.env文件是否存在
  if (!fs.existsSync(envPath)) {
    console.log('1. 创建.env文件...');
    const envContent = `# 数据库配置
MONGO_URI=${targetDatabase.uri}

# 服务器配置
PORT=5001
NODE_ENV=development

# JWT配置
JWT_SECRET=healthcare_appointment_system_secret_key_2024

# 跨域配置
CORS_ORIGIN=http://localhost:3000
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env文件已创建');
  } else {
    console.log('1. 更新.env文件...');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // 更新MONGO_URI
    if (envContent.includes('MONGO_URI=')) {
      envContent = envContent.replace(/MONGO_URI=.*/g, `MONGO_URI=${targetDatabase.uri}`);
    } else {
      envContent += `\nMONGO_URI=${targetDatabase.uri}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env文件已更新');
  }

  console.log(`\n📋 当前数据库配置:`);
  console.log(`   数据库名称: ${targetDatabase.name}`);
  console.log(`   连接URI: ${targetDatabase.uri}`);
  
  console.log('\n💡 下一步操作:');
  console.log('1. 重启后端服务以应用新配置');
  console.log('2. 运行 node check-database.js 验证连接');
  console.log('3. 运行 node create-admin.js 在正确数据库中创建admin用户');
  console.log('4. 测试登录功能');
}

// 运行修复
fixDatabaseConfig();
