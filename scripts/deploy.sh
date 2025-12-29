#!/bin/bash

# 项目部署脚本
# 使用方法: ./scripts/deploy.sh [环境]
# 环境选项: local, staging, production

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
ENVIRONMENT=${1:-local}
if [[ ! "$ENVIRONMENT" =~ ^(local|staging|production)$ ]]; then
    log_error "无效的环境参数: $ENVIRONMENT"
    log_info "使用方法: $0 [local|staging|production]"
    exit 1
fi

log_info "开始部署到 $ENVIRONMENT 环境..."

# 检查必要工具
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 18.0.0 或更高版本"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 检查Docker（如果是容器部署）
    if [ "$ENVIRONMENT" != "local" ]; then
        if ! command -v docker &> /dev/null; then
            log_error "Docker 未安装"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            log_error "Docker Compose 未安装"
            exit 1
        fi
    fi
    
    log_success "系统要求检查通过"
}

# 环境配置
setup_environment() {
    log_info "配置 $ENVIRONMENT 环境..."
    
    # 复制环境配置文件
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "已创建 .env 文件，请检查并修改配置"
        else
            log_error ".env.example 文件不存在"
            exit 1
        fi
    fi
    
    # 根据环境设置不同的配置
    case $ENVIRONMENT in
        local)
            export NODE_ENV=development
            export FRONTEND_PORT=5173
            export BACKEND_PORT=5000
            ;;
        staging)
            export NODE_ENV=staging
            export FRONTEND_PORT=3000
            export BACKEND_PORT=5000
            ;;
        production)
            export NODE_ENV=production
            export FRONTEND_PORT=80
            export BACKEND_PORT=5000
            ;;
    esac
    
    log_success "环境配置完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    
    # 后端依赖
    log_info "安装后端依赖..."
    cd backend
    npm ci
    cd ..
    
    # 前端依赖
    log_info "安装前端依赖..."
    cd frontend
    npm ci
    cd ..
    
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 构建后端
    log_info "构建后端..."
    cd backend
    npm run build
    
    # 生成Prisma客户端
    npx prisma generate
    cd ..
    
    # 构建前端
    log_info "构建前端..."
    cd frontend
    npm run build
    cd ..
    
    log_success "项目构建完成"
}

# 数据库迁移
migrate_database() {
    log_info "执行数据库迁移..."
    
    cd backend
    if [ "$ENVIRONMENT" = "production" ]; then
        npx prisma migrate deploy
    else
        npx prisma migrate dev
    fi
    cd ..
    
    log_success "数据库迁移完成"
}

# 本地部署
deploy_local() {
    log_info "启动本地开发服务器..."
    
    # 启动后端
    log_info "启动后端服务..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 5
    
    # 启动前端
    log_info "启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_success "本地服务启动完成"
    log_info "前端地址: http://localhost:5173"
    log_info "后端地址: http://localhost:5000"
    log_info "按 Ctrl+C 停止服务"
    
    # 等待用户中断
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
}

# Docker部署
deploy_docker() {
    log_info "使用Docker部署..."
    
    # 停止现有服务
    if docker-compose ps | grep -q "Up"; then
        log_info "停止现有服务..."
        docker-compose down
    fi
    
    # 构建并启动服务
    log_info "构建并启动Docker服务..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 健康检查
    log_info "执行健康检查..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        docker-compose logs frontend
        exit 1
    fi
    
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_success "后端服务健康检查通过"
    else
        log_error "后端服务健康检查失败"
        docker-compose logs backend
        exit 1
    fi
    
    log_success "Docker部署完成"
    log_info "前端地址: http://localhost"
    log_info "后端地址: http://localhost:5000"
}

# 部署后验证
post_deploy_verification() {
    log_info "执行部署后验证..."
    
    # 检查服务状态
    case $ENVIRONMENT in
        local)
            # 本地验证逻辑
            ;;
        staging|production)
            # 检查Docker服务
            if ! docker-compose ps | grep -q "Up"; then
                log_error "Docker服务未正常运行"
                docker-compose ps
                exit 1
            fi
            ;;
    esac
    
    log_success "部署后验证通过"
}

# 清理函数
cleanup() {
    log_info "执行清理..."
    
    # 清理临时文件
    rm -rf /tmp/task-manager-*
    
    # Docker清理
    if [ "$ENVIRONMENT" != "local" ]; then
        docker system prune -f
    fi
    
    log_success "清理完成"
}

# 主函数
main() {
    log_info "=== 任务管理应用部署脚本 ==="
    log_info "环境: $ENVIRONMENT"
    log_info "时间: $(date)"
    
    # 执行部署步骤
    check_requirements
    setup_environment
    install_dependencies
    build_project
    migrate_database
    
    # 根据环境选择部署方式
    case $ENVIRONMENT in
        local)
            deploy_local
            ;;
        staging|production)
            deploy_docker
            ;;
    esac
    
    post_deploy_verification
    cleanup
    
    log_success "=== 部署完成 ==="
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"; cleanup; exit 1' ERR

# 执行主函数
main "$@"