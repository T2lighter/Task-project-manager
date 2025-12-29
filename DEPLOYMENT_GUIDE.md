# 项目部署指南

## 📦 项目打包和发布指南

本指南详细介绍如何构建、打包和部署个人任务管理应用到生产环境。

---

## 🏗️ 构建准备

### 环境要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Git**: 用于版本控制

### 检查环境
```bash
node --version  # 应该 >= 18.0.0
npm --version   # 应该 >= 8.0.0
```

---

## 🔧 本地构建

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd task-manager
```

### 2. 安装依赖

#### 后端依赖安装
```bash
cd backend
npm install
```

#### 前端依赖安装
```bash
cd ../frontend
npm install
```

### 3. 环境配置

#### 后端环境配置
创建 `backend/.env` 文件：
```env
# 数据库配置
DATABASE_URL="file:./prod.db"

# JWT配置
JWT_SECRET="your-super-secure-jwt-secret-key-for-production"

# 服务器配置
PORT=5000
NODE_ENV=production

# CORS配置
FRONTEND_URL="https://your-domain.com"
```

#### 前端环境配置
创建 `frontend/.env.production` 文件：
```env
# 生产环境API地址
VITE_API_URL=https://your-api-domain.com/api
```

### 4. 数据库准备

#### 生成Prisma客户端
```bash
cd backend
npx prisma generate
```

#### 运行数据库迁移
```bash
npx prisma migrate deploy
```

---

## 📦 项目构建

### 1. 构建后端
```bash
cd backend

# TypeScript编译
npm run build

# 验证构建结果
ls -la dist/
```

构建后的文件结构：
```
backend/
├── dist/           # 编译后的JavaScript文件
│   ├── index.js
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   └── ...
├── prisma/         # 数据库文件和配置
├── node_modules/   # 依赖包
└── package.json
```

### 2. 构建前端
```bash
cd frontend

# TypeScript检查 + Vite构建
npm run build

# 验证构建结果
ls -la dist/
```

构建后的文件结构：
```
frontend/
├── dist/           # 构建后的静态文件
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   ├── index-[hash].css
│   │   └── ...
│   └── ...
└── ...
```

### 3. 预览构建结果
```bash
# 前端预览
cd frontend
npm run preview

# 后端测试
cd backend
npm start
```

---

## 🚀 部署方案

### 方案一：传统服务器部署

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2（进程管理器）
sudo npm install -g pm2

# 安装Nginx（反向代理）
sudo apt install nginx -y
```

#### 2. 部署后端
```bash
# 创建应用目录
sudo mkdir -p /var/www/task-manager
sudo chown $USER:$USER /var/www/task-manager

# 上传后端文件
cd /var/www/task-manager
# 上传 backend/ 目录的所有文件

# 安装生产依赖
npm install --production

# 配置PM2
pm2 start dist/index.js --name "task-manager-api"
pm2 startup
pm2 save
```

#### 3. 部署前端
```bash
# 上传前端构建文件到Nginx目录
sudo cp -r frontend/dist/* /var/www/html/

# 或者创建专用目录
sudo mkdir -p /var/www/task-manager-frontend
sudo cp -r frontend/dist/* /var/www/task-manager-frontend/
```

#### 4. 配置Nginx
创建 `/etc/nginx/sites-available/task-manager`：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/task-manager-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 方案二：Docker部署

#### 1. 创建Dockerfile

**后端Dockerfile** (`backend/Dockerfile`)：
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production

# 生成Prisma客户端
RUN npx prisma generate

# 复制构建后的代码
COPY dist ./dist

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["npm", "start"]
```

**前端Dockerfile** (`frontend/Dockerfile`)：
```dockerfile
FROM nginx:alpine

# 复制构建后的文件
COPY dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**前端Nginx配置** (`frontend/nginx.conf`)：
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. 创建docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: task-manager-api
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prod.db
      - JWT_SECRET=${JWT_SECRET}
      - PORT=5000
    volumes:
      - ./backend/prisma:/app/prisma
      - backend_data:/app/data
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: task-manager-web
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend_data:
```

#### 3. Docker部署命令
```bash
# 构建和启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方案三：云平台部署

#### Vercel部署（前端）
1. 在项目根目录创建 `vercel.json`：
```json
{
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

2. 部署命令：
```bash
npm install -g vercel
vercel --prod
```

#### Railway部署（后端）
1. 在 `backend/` 目录创建 `railway.toml`：
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

2. 连接GitHub仓库并自动部署

#### Heroku部署
1. 创建 `Procfile`：
```
web: cd backend && npm start
```

2. 部署命令：
```bash
heroku create your-app-name
git push heroku main
```

---

## 🔒 生产环境优化

### 1. 安全配置

#### 后端安全
```typescript
// backend/src/index.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use('/api', limiter);
```

#### 环境变量安全
- 使用强密码作为JWT_SECRET
- 不要在代码中硬编码敏感信息
- 使用HTTPS协议

### 2. 性能优化

#### 前端优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### 后端优化
- 启用gzip压缩
- 配置缓存策略
- 数据库连接池
- 静态文件CDN

### 3. 监控和日志

#### PM2监控
```bash
# 监控应用状态
pm2 monit

# 查看日志
pm2 logs task-manager-api

# 重启应用
pm2 restart task-manager-api
```

#### 日志配置
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 🔄 CI/CD自动化

### GitHub Actions配置
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci
    
    - name: Build Backend
      run: |
        cd backend
        npm run build
    
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build Frontend
      run: |
        cd frontend
        npm run build
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/task-manager
          git pull origin main
          cd backend && npm ci --production && npm run build
          cd ../frontend && npm ci && npm run build
          pm2 restart task-manager-api
          sudo cp -r frontend/dist/* /var/www/task-manager-frontend/
```

---

## 📋 部署检查清单

### 部署前检查
- [ ] 所有环境变量已配置
- [ ] 数据库迁移已完成
- [ ] 前后端构建成功
- [ ] 安全配置已启用
- [ ] SSL证书已配置

### 部署后验证
- [ ] 前端页面正常加载
- [ ] API接口正常响应
- [ ] 用户注册登录功能正常
- [ ] 数据库连接正常
- [ ] 静态资源加载正常

### 监控设置
- [ ] 应用性能监控
- [ ] 错误日志监控
- [ ] 服务器资源监控
- [ ] 数据库性能监控

---

## 🆘 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. 数据库连接问题
```bash
# 检查数据库文件权限
ls -la backend/prisma/
chmod 644 backend/prisma/prod.db
```

#### 3. 前端路由404
确保Nginx配置了正确的try_files规则：
```nginx
try_files $uri $uri/ /index.html;
```

#### 4. API跨域问题
检查后端CORS配置：
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 日志查看
```bash
# PM2日志
pm2 logs task-manager-api

# Nginx日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
journalctl -u nginx -f
```

---

## 📈 性能监控

### 关键指标
- **响应时间**: API响应时间 < 200ms
- **可用性**: 服务可用性 > 99.9%
- **错误率**: 错误率 < 0.1%
- **资源使用**: CPU < 80%, 内存 < 80%

### 监控工具推荐
- **应用监控**: PM2 Monitor, New Relic
- **服务器监控**: Grafana + Prometheus
- **日志分析**: ELK Stack
- **错误追踪**: Sentry

---

## 🎉 部署完成

恭喜！您的个人任务管理应用已成功部署到生产环境。

### 下一步
1. 配置域名和SSL证书
2. 设置定期备份
3. 配置监控告警
4. 准备扩容方案

### 维护建议
- 定期更新依赖包
- 监控应用性能
- 备份重要数据
- 关注安全更新

---

**部署状态**: ✅ 生产就绪  
**最后更新**: 2024年12月28日  
**版本**: v1.0.0