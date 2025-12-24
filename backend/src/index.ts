import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import categoryRoutes from './routes/categoryRoutes';
import statsRoutes from './routes/statsRoutes';

// 配置环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器已启动`);
  console.log(`📍 监听地址: http://localhost:${PORT}`);
  console.log(`📡 API路由:`);
  console.log(`   - 认证: /api/auth`);
  console.log(`   - 任务: /api/tasks`);
  console.log(`   - 分类: /api/categories`);
  console.log(`   - 统计: /api/stats`);
});