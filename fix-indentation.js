const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'frontend/src/App.js',
  'frontend/src/components/Navbar.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
  'frontend/src/pages/DoctorDashboard.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/PatientAppointments.jsx',
  'frontend/src/pages/PatientDashboard.jsx',
  'frontend/src/pages/PatientRecords.jsx',
  'frontend/src/pages/Profile.jsx',
  'frontend/src/pages/Register.jsx'
];

function fixIndentation(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 将制表符替换为2个空格
    content = content.replace(/\t/g, '  ');
    
    // 确保switch语句的case缩进正确
    content = content.replace(/^\s{6}case\s/gm, '      case ');
    content = content.replace(/^\s{8}case\s/gm, '        case ');
    content = content.replace(/^\s{10}case\s/gm, '          case ');
    content = content.replace(/^\s{12}case\s/gm, '            case ');
    
    // 确保return语句缩进正确
    content = content.replace(/^\s{6}return\s/gm, '      return ');
    content = content.replace(/^\s{8}return\s/gm, '        return ');
    content = content.replace(/^\s{10}return\s/gm, '          return ');
    content = content.replace(/^\s{12}return\s/gm, '            return ');
    
    // 确保default语句缩进正确
    content = content.replace(/^\s{6}default\s/gm, '      default ');
    content = content.replace(/^\s{8}default\s/gm, '        default ');
    content = content.replace(/^\s{10}default\s/gm, '          default ');
    content = content.replace(/^\s{12}default\s/gm, '            default ');
    
    // 确保break语句缩进正确
    content = content.replace(/^\s{8}break\s/gm, '        break ');
    content = content.replace(/^\s{10}break\s/gm, '          break ');
    content = content.replace(/^\s{12}break\s/gm, '            break ');
    content = content.replace(/^\s{14}break\s/gm, '              break ');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
  } catch (error) {
    console.error(`❌ 修复失败: ${filePath}`, error.message);
  }
}

console.log('🔧 开始修复缩进问题...\n');

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixIndentation(file);
  } else {
    console.log(`⚠️  文件不存在: ${file}`);
  }
});

console.log('\n🎉 缩进修复完成！');
console.log('💡 请重启前端开发服务器以应用更改');
