import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import categoryRoutes from './routes/categoryRoutes';
import statsRoutes from './routes/statsRoutes';
import projectRoutes from './routes/projectRoutes';
import projectNoteRoutes from './routes/projectNoteRoutes';

// 配置环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', projectNoteRoutes); // 项目记录路由

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器已启动`);
  console.log(`📍 监听地址: http://localhost:${PORT}`);
  console.log(`📡 API路由:`);
  console.log(`   - 认证: /api/auth`);
  console.log(`   - 任务: /api/tasks`);
  console.log(`   - 分类: /api/categories`);
  console.log(`   - 统计: /api/stats`);
  console.log(`   - 项目: /api/projects`);
  console.log(`   - 项目记录: /api/projects/:id/notes`);
  console.log(`   - 健康检查: /api/health`);
});