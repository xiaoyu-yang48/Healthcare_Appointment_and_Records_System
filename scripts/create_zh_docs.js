const fs = require('fs');
const path = require('path');

// 需要创建中文版本的英文文档列表
const docsToTranslate = [
  'docs/root/API_INTEGRATION.md',
  'docs/root/FRONTEND_FIXES.md',
  'docs/root/SYSML_DIAGRAMS.md',
  'docs/backend/README.md',
  'docs/backend/API_DOCUMENTATION.md',
  'docs/backend/APPOINTMENT_FIX.md',
  'docs/backend/NOTICE_FEATURE.md',
  'docs/frontend/README.md',
  'docs/frontend/NOTICE_SYSTEM_FIX.md',
  'docs/frontend/DOCTOR_PATIENTS_FIX.md',
  'docs/frontend/DOCTOR_SCHEDULE_FIX.md',
  'docs/frontend/DOCTOR_LOGIN_FIX.md',
  'docs/frontend/APPOINTMENT_BUTTONS_FIX.md',
  'docs/frontend/TRANSLATION_FIX.md',
  'docs/frontend/LANGUAGE_SETUP.md'
];

// 简单的翻译映射（这里只是示例，实际需要更完整的翻译）
const translations = {
  'API Integration': 'API 集成',
  'Frontend Fixes': '前端修复',
  'SYSML Diagrams': 'SYSML 图表',
  'Backend Implementation': '后端实现',
  'Frontend Implementation': '前端实现',
  'Server Setup': '服务器配置',
  'Port Configuration': '端口配置',
  'CI/CD Guide': 'CI/CD 指南',
  'Notice System Fix': '通知系统修复',
  'Doctor Patients Fix': '医生患者修复',
  'Doctor Schedule Fix': '医生排班修复',
  'Doctor Login Fix': '医生登录修复',
  'Appointment Buttons Fix': '预约按钮修复',
  'Translation Fix': '翻译修复',
  'Language Setup': '语言设置',
  'API Documentation': 'API 文档',
  'Appointment Fix': '预约修复',
  'Notice Feature': '通知功能',
  'README': '说明文档'
};

function createChineseVersion(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.md');
    const zhFilePath = filePath.replace('.md', '_zh.md');
    
    // 简单的翻译处理（这里只是示例）
    let zhContent = content;
    
    // 替换标题
    Object.keys(translations).forEach(eng => {
      const zh = translations[eng];
      zhContent = zhContent.replace(new RegExp(eng, 'g'), zh);
    });
    
    // 添加中文说明
    zhContent = `# ${translations[fileName] || fileName} (中文版)

> 注意：这是英文文档的中文翻译版本。如有疑问，请参考英文原版。

${zhContent}`;
    
    fs.writeFileSync(zhFilePath, zhContent, 'utf8');
    console.log(`✅ 已创建: ${zhFilePath}`);
  } catch (error) {
    console.error(`❌ 创建失败: ${filePath}`, error.message);
  }
}

// 创建所有中文版本
docsToTranslate.forEach(doc => {
  if (fs.existsSync(doc)) {
    createChineseVersion(doc);
  } else {
    console.log(`⚠️  文件不存在: ${doc}`);
  }
});

console.log('\n📝 文档整理完成！');
console.log('📁 所有文档已整理到 docs/ 目录');
console.log('🌍 英文文档为默认版本，中文文档以 _zh.md 结尾');
