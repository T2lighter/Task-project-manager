# 个人任务管理Web应用 - MVP架构设计

## 1. 整体架构模式

采用**前后端分离架构**结合**分层架构模式**，聚焦MVP核心功能，确保快速开发和稳定运行。


### 架构特点
- **前后端分离**：前端专注UI，后端专注业务逻辑
- **分层清晰**：表示层、业务逻辑层、数据访问层分离
- **轻量级**：选择最小化技术栈，降低复杂度
- **MVP聚焦**：仅包含核心功能，避免过度设计

## 2. 技术栈选择

### 2.1 前端技术栈
| 技术 | 用途 | 选择理由 |
|------|------|----------|
| React 18 | UI框架 | 组件化开发，快速构建界面 |
| TypeScript | 开发语言 | 类型安全，减少错误 |
| Vite | 构建工具 | 快速开发体验，适合小型项目 |
| Zustand | 状态管理 | 轻量级，无需复杂配置 |
| Tailwind CSS | 样式框架 | 快速构建美观UI，无需额外CSS |

### 2.2 后端技术栈
| 技术 | 用途 | 选择理由 |
|------|------|----------|
| Node.js | 运行环境 | JavaScript全栈，降低学习成本 |
| Express | Web框架 | 轻量级，易于上手 |
| TypeScript | 开发语言 | 类型安全，提高代码质量 |
| Prisma | ORM工具 | 简化数据库操作，支持多种数据库 |
| JWT | 身份认证 | 无状态认证，适合前后端分离 |

### 2.3 数据库
| 技术 | 用途 | 选择理由 |
|------|------|----------|
| SQLite | 数据存储 | 无需额外部署，文件存储，适合个人使用 |

## 3. MVP核心功能模块

### 3.1 用户模块
- 用户注册
- 用户登录
- 个人信息管理

### 3.2 个人页面
- 个人信息展示和编辑
- 任务完成情况概览
- 近期任务提醒
- 分类统计概览

### 3.3 任务页面（四象限原则）
- 四象限任务展示（基于紧急程度和重要程度）
  - 象限1：紧急且重要
  - 象限2：重要但不紧急
  - 象限3：紧急但不重要
  - 象限4：不重要且不紧急
- 任务创建（支持设置紧急程度、重要程度）
- 任务编辑（可拖拽调整象限）
- 任务删除
- 任务状态更新（待办/进行中/已完成）

### 3.4 分类管理模块
- 任务分类创建
- 分类编辑
- 分类删除
- 按分类筛选任务

## 4. 数据模型设计

### 4.1 用户表 (User)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
  categories Category[]
}
```

### 4.2 任务表 (Task)
```prisma
model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      String     @default("pending") // pending, in_progress, completed
  urgency     Boolean    @default(false)      // 是否紧急
  importance  Boolean    @default(false)      // 是否重要
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      Int
  user        User       @relation(fields: [userId], references: [id])
  categoryId  Int?
  category    Category?  @relation(fields: [categoryId], references: [id])
}
```

### 4.3 分类表 (Category)
```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String
  color     String   @default("#3b82f6")
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 5. 项目结构

### 5.1 前端项目结构
```
frontend/
├── src/
│   ├── components/        # 通用组件
│   │   ├── TaskItem.tsx   # 任务项组件
│   │   ├── TaskForm.tsx   # 任务表单组件
│   │   ├── CategorySelect.tsx # 分类选择组件
│   │   ├── Quadrant.tsx   # 四象限组件
│   │   └── StatsCard.tsx  # 统计卡片组件
│   ├── pages/             # 页面组件
│   │   ├── LoginPage.tsx  # 登录页
│   │   ├── RegisterPage.tsx # 注册页
│   │   ├── ProfilePage.tsx # 个人页面
│   │   └── TasksPage.tsx  # 任务页面（四象限）
│   ├── store/             # 状态管理
│   │   ├── authStore.ts   # 认证状态
│   │   └── taskStore.ts   # 任务状态
│   ├── services/          # API服务
│   │   └── api.ts         # API请求封装
│   ├── types/             # TypeScript类型
│   │   └── index.ts       # 类型定义
│   ├── App.tsx            # 应用入口组件
│   └── main.tsx           # 应用入口文件
```

### 5.2 后端项目结构
```
backend/
├── src/
│   ├── controllers/       # 控制器
│   │   ├── authController.ts # 认证控制器
│   │   ├── taskController.ts # 任务控制器
│   │   └── categoryController.ts # 分类控制器
│   ├── services/          # 业务逻辑
│   │   ├── authService.ts # 认证服务
│   │   ├── taskService.ts # 任务服务
│   │   └── categoryService.ts # 分类服务
│   ├── middlewares/       # 中间件
│   │   └── authMiddleware.ts # 认证中间件
│   ├── routes/            # 路由
│   │   ├── authRoutes.ts  # 认证路由
│   │   ├── taskRoutes.ts  # 任务路由
│   │   └── categoryRoutes.ts # 分类路由
│   ├── utils/             # 工具函数
│   │   ├── jwt.ts         # JWT工具
│   │   └── prisma.ts      # Prisma客户端
│   └── index.ts           # 应用入口
├── prisma/                # Prisma配置
│   └── schema.prisma      # 数据库模式
└── .env                   # 环境变量
```

## 6. API接口设计

### 6.1 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 6.2 任务接口
- `GET /api/tasks` - 获取任务列表（支持按象限筛选）
- `POST /api/tasks` - 创建任务（包含urgency和importance字段）
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `GET /api/tasks/quadrants` - 获取四象限任务统计

### 6.3 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

## 7. 部署方案

### 7.1 开发环境
- 前端：`npm run dev` (端口3000)
- 后端：`npm run dev` (端口5000)
- 数据库：SQLite文件存储

### 7.2 生产环境
- 前端：构建静态文件部署到Vercel/Netlify
- 后端：部署到Render/Heroku等PaaS平台
- 数据库：可迁移到PostgreSQL (推荐Neon.tech)

## 8. MVP开发优先级

1. **核心功能**：用户认证、基础任务CRUD
2. **四象限功能**：任务象限划分、拖拽调整
3. **页面开发**：登录/注册页、个人页面、任务页面
4. **增强功能**：任务统计、分类管理
5. **UI优化**：响应式设计、拖拽体验优化

## 9. 扩展性考虑

虽然当前设计聚焦MVP，但预留了扩展点：
- 支持标签系统（可在后续版本添加）
- 支持任务提醒功能
- 支持数据导入导出
- 支持多设备同步

这个架构设计严格遵循MVP原则，仅包含个人任务管理的核心功能，同时保持了良好的代码结构和扩展性，为后续功能迭代奠定了基础。