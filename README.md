# 个人任务管理应用

一个基于React、TypeScript、Express和Prisma的现代化个人任务管理Web应用，使用艾森豪威尔矩阵（四象限法则）来帮助用户高效管理任务，支持多种视图模式和丰富的数据统计功能。

## ✨ 功能特性

### 🔐 用户认证系统
- 用户注册与登录
- JWT令牌认证
- 安全的密码加密存储

### 📊 个人主页仪表盘
- **用户信息展示**：用户名、邮箱等基本信息
- **任务统计卡片**：总任务数、完成率、逾期任务、今日到期等8个核心指标
- **任务活动热力图**：GitHub风格的年度任务活动可视化
  - 支持日、周、月时间周期选择
  - 显示创建和完成任务的活动强度
  - 包含完成率和活跃天数统计
- **多维度图表分析**：
  - 任务状态分布饼图
  - 四象限分布饼图
  - 分类统计柱状图

### 📋 双模式任务管理
#### 🎯 四象限展示模式
- **紧急且重要** (红色)：需要立即处理的任务
- **重要但不紧急** (蓝色)：需要计划安排的任务
- **紧急但不重要** (黄色)：可以委托处理的任务
- **既不紧急也不重要** (灰色)：可以推迟的任务
- 每个象限显示任务数量统计
- 支持拖拽在象限间移动任务

#### 📌 看板展示模式
- **待办**、**进行中**、**已完成** 三列布局
- 支持拖拽改变任务状态
- 紧凑的任务卡片设计
- 优先级标签显示

### 🏷️ 任务功能
- **完整的CRUD操作**：创建、编辑、删除、状态更新
- **优先级管理**：重要性和紧急性双维度设置
- **状态管理**：待办、进行中、已完成三种状态
- **分类系统**：支持任务分类管理
- **截止日期**：任务到期提醒
- **优先级标签**：直观的图标和颜色标识
- **智能筛选**：按状态、分类等多维度筛选

### 📈 数据统计与分析
- **实时统计**：任务完成率、各状态任务数量
- **时间序列分析**：支持日、周、月维度的数据查看
- **热力图可视化**：年度任务活动热力图
- **多图表展示**：饼图、柱状图等多种可视化方式
- **缓存优化**：智能数据缓存，提升加载速度

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Zustand** - 轻量级状态管理
- **React Router** - 客户端路由
- **Axios** - HTTP请求库
- **date-fns** - 日期处理库
- **Recharts** - 图表可视化库

### 后端技术
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **TypeScript** - 类型安全开发
- **Prisma** - 现代化ORM框架
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

## 📁 项目结构

```
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React组件
│   │   │   ├── TaskCard.tsx          # 任务卡片组件
│   │   │   ├── TaskForm.tsx          # 任务表单组件
│   │   │   ├── Quadrant.tsx          # 四象限组件
│   │   │   ├── KanbanBoard.tsx       # 看板组件
│   │   │   ├── TaskTrendOverview.tsx # 热力图组件
│   │   │   ├── StatsCard.tsx         # 统计卡片组件
│   │   │   └── ...                   # 其他组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── ProfilePage.tsx       # 个人主页
│   │   │   └── TasksPage.tsx         # 任务管理页
│   │   ├── store/            # 状态管理
│   │   │   ├── authStore.ts          # 认证状态
│   │   │   ├── taskStore.ts          # 任务状态
│   │   │   └── statsStore.ts         # 统计状态
│   │   ├── services/         # API服务
│   │   │   ├── api.ts                # 基础API配置
│   │   │   ├── authService.ts        # 认证服务
│   │   │   ├── taskService.ts        # 任务服务
│   │   │   └── statsService.ts       # 统计服务
│   │   ├── types/            # TypeScript类型
│   │   └── App.tsx           # 应用入口
│   ├── tailwind.config.js    # Tailwind配置
│   └── vite.config.ts        # Vite配置
└── backend/                  # 后端应用
    ├── src/
    │   ├── controllers/      # API控制器
    │   │   ├── authController.ts     # 认证控制器
    │   │   ├── taskController.ts     # 任务控制器
    │   │   ├── categoryController.ts # 分类控制器
    │   │   └── statsController.ts    # 统计控制器
    │   ├── services/         # 业务逻辑层
    │   │   ├── authService.ts        # 认证服务
    │   │   ├── taskService.ts        # 任务服务
    │   │   ├── categoryService.ts    # 分类服务
    │   │   └── statsService.ts       # 统计服务
    │   ├── routes/           # 路由配置
    │   │   ├── authRoutes.ts         # 认证路由
    │   │   ├── taskRoutes.ts         # 任务路由
    │   │   ├── categoryRoutes.ts     # 分类路由
    │   │   └── statsRoutes.ts        # 统计路由
    │   ├── middleware/       # 中间件
    │   │   └── auth.ts               # 认证中间件
    │   ├── utils/            # 工具函数
    │   └── index.ts          # 应用入口
    ├── prisma/               # 数据库配置
    │   ├── schema.prisma             # 数据库模式
    │   └── migrations/               # 数据库迁移
    └── .env                  # 环境变量
```

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 8+
- Git

### 安装步骤

#### 1. 克隆项目
```bash
git clone <repository-url>
cd task-manager
```

#### 2. 后端设置
```bash
cd backend
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET 等配置

# 初始化数据库
npx prisma generate
npx prisma migrate dev

# 启动后端服务
npm run dev
```

#### 3. 前端设置
```bash
cd ../frontend
npm install

# 启动前端服务
npm run dev
```

#### 4. 访问应用
- 前端应用：http://localhost:5173
- 后端API：http://localhost:5000

## 📋 环境配置

### 后端环境变量 (.env)
```env
# 数据库连接
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key"

# 服务器配置
PORT=5000
NODE_ENV=development
```

### 前端环境变量 (.env)
```env
# API基础URL
VITE_API_URL=http://localhost:5000/api
```

## 🔌 API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 任务接口
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 统计接口
- `GET /api/stats/tasks` - 获取任务统计
- `GET /api/stats/quadrants` - 获取四象限统计
- `GET /api/stats/categories` - 获取分类统计
- `GET /api/stats/time-series` - 获取时间序列数据
- `GET /api/stats/time-series-year` - 获取年度热力图数据

## 🎯 使用指南

### 1. 注册与登录
- 首次使用需要注册新账号
- 使用用户名和密码登录系统

### 2. 个人主页
- 查看任务统计概览
- 使用热力图查看任务活动情况
- 通过时间周期选择器切换视图
- 点击统计卡片快速跳转到任务管理

### 3. 任务管理
- **添加任务**：点击"添加任务"按钮创建新任务
- **编辑任务**：点击任务卡片上的编辑按钮
- **删除任务**：点击任务卡片上的删除按钮
- **切换视图**：使用"四象限展示"和"看板展示"按钮切换视图模式
- **拖拽操作**：
  - 四象限模式：拖拽任务改变优先级
  - 看板模式：拖拽任务改变状态
- **筛选任务**：使用左侧筛选按钮按状态查看任务

### 4. 优先级管理
- 根据艾森豪威尔矩阵原则设置任务优先级
- 重要且紧急的任务优先处理
- 重要但不紧急的任务需要规划
- 紧急但不重要的任务可以委托
- 既不紧急也不重要的任务可以推迟

## 🎨 界面特色

### 现代化设计
- 简洁的Material Design风格
- 响应式布局，支持各种设备
- 统一的蓝色主题色彩
- 流畅的动画和过渡效果

### 交互体验
- 直观的拖拽操作
- 实时的数据更新
- 优雅的加载状态
- 丰富的视觉反馈

### 数据可视化
- GitHub风格的活动热力图
- 多种图表类型支持
- 颜色编码的优先级标识
- 清晰的数据统计展示

## 🔧 开发说明

### 代码规范
- 使用TypeScript确保类型安全
- 遵循ESLint和Prettier配置
- 组件采用函数式组件 + Hooks
- 使用Zustand进行状态管理

### 数据库设计
- 用户表：存储用户基本信息
- 任务表：存储任务详情和优先级
- 分类表：支持任务分类管理
- 包含创建时间和更新时间字段

### 性能优化
- 前端组件懒加载
- API请求缓存机制
- 数据库查询优化
- 图片和资源压缩

## 📈 未来规划

- [ ] 任务提醒功能
- [ ] 数据导入导出
- [ ] 多主题支持
- [ ] 移动端适配优化
- [ ] 团队协作功能
- [ ] 更多图表类型
- [ ] 任务模板功能
- [ ] 数据备份与同步

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：
- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至：your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！