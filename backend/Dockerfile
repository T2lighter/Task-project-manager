# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生成Prisma客户端
RUN npx prisma generate

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 复制package文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建结果
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 创建数据目录
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
CMD ["npm", "start"]