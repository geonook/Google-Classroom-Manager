#!/usr/bin/env node

/**
 * Google Classroom Manager Pro 設定腳本
 * 自動化初始設定流程
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Google Classroom Manager Pro 設定開始...\n');

/**
 * 檢查前置需求
 */
function checkPrerequisites() {
  console.log('📋 檢查前置需求...');
  
  try {
    // 檢查 Node.js 版本
    const nodeVersion = process.version;
    console.log(`✅ Node.js 版本: ${nodeVersion}`);
    
    // 檢查 npm 版本
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm 版本: ${npmVersion}`);
    
    // 檢查 clasp 是否安裝
    try {
      const claspVersion = execSync('clasp --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Google Apps Script CLI: ${claspVersion}`);
    } catch (error) {
      console.log('❌ Google Apps Script CLI (clasp) 未安裝');
      console.log('請執行: npm install -g @google/clasp');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 前置需求檢查失敗:', error.message);
    process.exit(1);
  }
  
  console.log('✅ 前置需求檢查通過\n');
}

/**
 * 初始化專案結構
 */
function initializeProject() {
  console.log('📁 初始化專案結構...');
  
  const directories = [
    'src',
    'tests',
    'tests/unit',
    'tests/integration',
    'tests/performance',
    'docs/api',
    'scripts'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 建立目錄: ${dir}`);
    }
  });
  
  console.log('✅ 專案結構初始化完成\n');
}

/**
 * 設定 Git 版本控制
 */
function setupGit() {
  console.log('🔧 設定 Git 版本控制...');
  
  try {
    // 檢查是否已經是 Git 儲存庫
    if (!fs.existsSync('.git')) {
      execSync('git init', { stdio: 'inherit' });
      console.log('✅ Git 儲存庫初始化完成');
    } else {
      console.log('✅ Git 儲存庫已存在');
    }
    
    // 建立 .gitignore 如果不存在
    if (!fs.existsSync('.gitignore')) {
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Build output
dist/
build/
coverage/

# Logs
logs/
*.log

# Google Apps Script
.clasp.json
*.backup

# Temporary files
tmp/
temp/
`;
      
      fs.writeFileSync('.gitignore', gitignoreContent);
      console.log('✅ .gitignore 檔案已建立');
    }
    
  } catch (error) {
    console.warn('⚠️ Git 設定失敗:', error.message);
  }
  
  console.log('✅ Git 設定完成\n');
}

/**
 * 設定 Google Apps Script CLI
 */
function setupClasp() {
  console.log('🔧 設定 Google Apps Script CLI...');
  
  try {
    // 檢查是否已登入
    try {
      execSync('clasp list', { stdio: 'pipe' });
      console.log('✅ 已登入 Google Apps Script');
    } catch (error) {
      console.log('❌ 尚未登入 Google Apps Script');
      console.log('請執行: clasp login');
      console.log('然後重新執行此設定腳本');
      return;
    }
    
    // 檢查 .clasp.json
    if (fs.existsSync('.clasp.json')) {
      const claspConfig = JSON.parse(fs.readFileSync('.clasp.json', 'utf8'));
      if (!claspConfig.scriptId) {
        console.log('⚠️ .clasp.json 中未設定 scriptId');
        console.log('請手動設定或執行: clasp create --type standalone --title "Classroom Manager Pro"');
      } else {
        console.log('✅ clasp 配置已存在');
      }
    }
    
  } catch (error) {
    console.warn('⚠️ clasp 設定檢查失敗:', error.message);
  }
  
  console.log('✅ clasp 設定檢查完成\n');
}

/**
 * 安裝依賴
 */
function installDependencies() {
  console.log('📦 安裝專案依賴...');
  
  try {
    if (fs.existsSync('package.json')) {
      console.log('正在安裝 npm 依賴...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ npm 依賴安裝完成');
    } else {
      console.log('❌ package.json 不存在');
    }
  } catch (error) {
    console.error('❌ 依賴安裝失敗:', error.message);
    process.exit(1);
  }
  
  console.log('✅ 依賴安裝完成\n');
}

/**
 * 建立範例配置
 */
function createSampleConfig() {
  console.log('⚙️ 建立範例配置...');
  
  // 建立 .env.example
  const envExample = `# Google Apps Script 配置
SCRIPT_ID=your_script_id_here
DEPLOYMENT_ID=your_deployment_id_here

# 開發設定
DEBUG_MODE=false
LOG_LEVEL=info

# API 設定
CLASSROOM_API_VERSION=v1
RATE_LIMIT_PER_MINUTE=50
CACHE_TIMEOUT_MS=300000

# 測試設定
TEST_SCRIPT_ID=your_test_script_id_here
TEST_SHEET_ID=your_test_sheet_id_here
`;
  
  if (!fs.existsSync('.env.example')) {
    fs.writeFileSync('.env.example', envExample);
    console.log('✅ .env.example 檔案已建立');
  }
  
  // 建立開發配置
  const devConfig = {
    apiVersion: 'v1',
    testMode: true,
    debugMode: true,
    rateLimit: 10,
    cacheTimeout: 60000
  };
  
  if (!fs.existsSync('config/development.json')) {
    if (!fs.existsSync('config')) {
      fs.mkdirSync('config');
    }
    fs.writeFileSync('config/development.json', JSON.stringify(devConfig, null, 2));
    console.log('✅ 開發配置檔案已建立');
  }
  
  console.log('✅ 範例配置建立完成\n');
}

/**
 * 顯示後續步驟
 */
function showNextSteps() {
  console.log('🎉 設定完成！\n');
  console.log('📝 後續步驟:');
  console.log('1. 登入 Google Apps Script:');
  console.log('   clasp login\n');
  console.log('2. 建立新專案或連接現有專案:');
  console.log('   clasp create --type standalone --title "Classroom Manager Pro"');
  console.log('   或更新 .clasp.json 中的 scriptId\n');
  console.log('3. 推送程式碼到 Google Apps Script:');
  console.log('   npm run push\n');
  console.log('4. 部署應用程式:');
  console.log('   npm run deploy\n');
  console.log('5. 開始開發:');
  console.log('   npm run dev\n');
  console.log('📚 更多資訊請參考: docs/installation.md');
}

/**
 * 主執行函數
 */
function main() {
  try {
    checkPrerequisites();
    initializeProject();
    setupGit();
    setupClasp();
    installDependencies();
    createSampleConfig();
    showNextSteps();
  } catch (error) {
    console.error('❌ 設定過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 執行設定
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  initializeProject,
  setupGit,
  setupClasp,
  installDependencies,
  createSampleConfig
};