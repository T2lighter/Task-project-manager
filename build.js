#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, cwd = process.cwd()) {
  log(`执行命令: ${command}`, 'cyan');
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`命令执行失败: ${error.message}`, 'red');
    return false;
  }
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log(`Node.js 版本过低: ${nodeVersion}，需要 18.0.0 或更高版本`, 'red');
    process.exit(1);
  }
  
  log(`Node.js 版本检查通过: ${nodeVersion}`, 'green');
}

function checkDirectories() {
  const requiredDirs = ['backend', 'frontend'];
  
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`缺少必要目录: ${dir}`, 'red');
      process.exit(1);
    }
  }
  
  log('目录结构检查通过', 'green');
}

function buildBackend() {
  log('开始构建后端...', 'blue');
  
  const backendDir = path.join(process.cwd(), 'backend');
  
  // 安装依赖
  if (!execCommand('npm ci', backendDir)) {
    log('后端依赖安装失败', 'red');
    return false;
  }
  
  // 生成Prisma客户端
  if (!execCommand('npx prisma generate', backendDir)) {
    log('Prisma客户端生成失败', 'red');
    return false;
  }
  
  // 构建TypeScript
  if (!execCommand('npm run build', backendDir)) {
    log('后端构建失败', 'red');
    return false;
  }
  
  log('后端构建完成', 'green');
  return true;
}

function buildFrontend() {
  log('开始构建前端...', 'blue');
  
  const frontendDir = path.join(process.cwd(), 'frontend');
  
  // 安装依赖
  if (!execCommand('npm ci', frontendDir)) {
    log('前端依赖安装失败', 'red');
    return false;
  }
  
  // 代码检查
  if (!execCommand('npm run lint', frontendDir)) {
    log('前端代码检查失败', 'red');
    return false;
  }
  
  // 构建项目
  if (!execCommand('npm run build', frontendDir)) {
    log('前端构建失败', 'red');
    return false;
  }
  
  log('前端构建完成', 'green');
  return true;
}

function createProductionEnv() {
  const envExample = path.join(process.cwd(), '.env.example');
  const envProd = path.join(process.cwd(), '.env.production');
  
  if (fs.existsSync(envExample) && !fs.existsSync(envProd)) {
    fs.copyFileSync(envExample, envProd);
    log('已创建 .env.production 文件，请检查并修改配置', 'yellow');
  }
}

function generateBuildInfo() {
  const buildInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: process.env.NODE_ENV || 'production'
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  log('构建信息已生成', 'green');
}

function main() {
  log('=== 任务管理应用构建脚本 ===', 'magenta');
  log(`开始时间: ${new Date().toLocaleString()}`, 'cyan');
  
  // 检查环境
  checkNodeVersion();
  checkDirectories();
  
  // 创建生产环境配置
  createProductionEnv();
  
  // 构建项目
  const backendSuccess = buildBackend();
  const frontendSuccess = buildFrontend();
  
  if (backendSuccess && frontendSuccess) {
    generateBuildInfo();
    log('=== 构建完成 ===', 'green');
    log('后续步骤:', 'yellow');
    log('1. 检查 .env.production 配置', 'yellow');
    log('2. 运行数据库迁移: cd backend && npx prisma migrate deploy', 'yellow');
    log('3. 启动生产服务: npm start (在backend目录)', 'yellow');
    log('4. 部署前端文件: frontend/dist/ 目录', 'yellow');
  } else {
    log('=== 构建失败 ===', 'red');
    process.exit(1);
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  log(`未捕获的异常: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`未处理的Promise拒绝: ${reason}`, 'red');
  process.exit(1);
});

// 执行主函数
main();