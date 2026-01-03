# 个人任务管理系统 - 静默启动脚本
# 双击运行或右键 -> 使用 PowerShell 运行

$ErrorActionPreference = "SilentlyContinue"

Write-Host "========================================"
Write-Host "   个人任务管理系统 - 一键启动"
Write-Host "========================================"
Write-Host ""

# 检查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[错误] 未检测到 Node.js" -ForegroundColor Red
    Read-Host "按 Enter 退出"
    exit 1
}

# 切换到脚本目录
Set-Location $PSScriptRoot

# 检查并安装依赖
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "[信息] 安装后端依赖..."
    Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory "backend" -NoNewWindow -Wait
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[信息] 安装前端依赖..."
    Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory "frontend" -NoNewWindow -Wait
}

# 静默启动后端
Write-Host "[启动] 后端服务..."
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "backend" -WindowStyle Hidden

Start-Sleep -Seconds 2

# 静默启动前端
Write-Host "[启动] 前端服务..."
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================"
Write-Host "   启动完成！" -ForegroundColor Green
Write-Host "========================================"
Write-Host "   前端: http://localhost:5173"
Write-Host "   后端: http://localhost:5000"
Write-Host "========================================"
Write-Host ""
Write-Host "服务已在后台运行，可关闭此窗口"
Write-Host "停止服务请运行 stop.bat"
Start-Sleep -Seconds 3
