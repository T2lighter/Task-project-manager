# 个人任务管理应用

一个基于React、TypeScript、Express和Prisma的现代化个人任务管理Web应用，使用艾森豪威尔矩阵（四象限法则）来帮助用户高效管理任务，支持多种视图模式、完整的项目管理、甘特图展示、OKR目标管理和丰富的数据统计功能。

## ✨ 功能特性

### 🔐 用户认证系统
- 用户注册与登录
- JWT令牌认证
- 安全的密码加密存储
- 退出登录功能

### 📊 个人主页仪表盘
- **用户信息展示**：用户名、邮箱等基本信息
- **任务统计卡片**：总任务数、完成率、逾期任务、今日到期等8个核心指标
- **项目统计卡片**：项目总数、处理中项目、完成率等项目维度统计
- **任务活动热力图**：GitHub风格的年度任务活动可视化
  - 支持日、周、月时间周期选择
  - 显示创建和完成任务的活动强度
  - 包含完成率和活跃天数统计
- **多维度图表分析**：
  - 任务状态分布饼图
  - 四象限分布饼图
  - 分类统计柱状图
  - 项目任务分布图表

### 🏗️ 完整项目管理系统
#### 📋 项目管理
- **完整的项目CRUD**：创建、编辑、删除项目
- **项目状态管理**：规划中、处理中、已完成、暂停、已取消
- **项目进度跟踪**：基于关联任务的完成情况自动计算
- **项目统计分析**：任务分布、完成率、进度趋势
- **项目搜索功能**：支持按项目名称、描述、状态搜索

#### 📝 项目记录与总结
- **Markdown编辑器**：支持实时预览的专业Markdown编辑
- **多种记录类型**：记录、总结、会议、问题、里程碑、反思
- **智能模板系统**：每种类型提供专业模板，快速创建
- **完整的CRUD操作**：创建、编辑、删除项目记录
- **Zhihu风格展示**：默认显示标题和目录，点击展开详情

#### 📊 甘特图视图
- **精确时间轴展示**：横向时间轴展示任务时间线
- **智能时间计算**：根据创建时间和截止时间智能计算任务持续时间
- **状态颜色编码**：不同状态用不同颜色表示
- **优先级边框标识**：高优先级任务有特殊边框
- **进度可视化**：任务完成进度实时显示
- **中文化界面**：星期显示为中文，用户体验友好
- **视图切换**：列表视图 ↔ 甘特图视图无缝切换

#### 🔗 智能任务关联
- **智能任务分配**：将现有任务分配到项目
- **项目内创建任务**：直接在项目中创建新任务
- **批量添加功能**：批量添加现有任务到项目
- **智能筛选选择**：未分配、其他项目、全部任务筛选

### 🎯 OKR目标管理系统
#### 📈 目标与关键结果
- **目标管理**：创建、编辑、跟踪项目目标
- **关键结果**：量化的、可衡量的结果指标
- **进度跟踪**：实时跟踪目标和关键结果的完成进度
- **状态管理**：草稿、处理中、已完成、已取消

####  四个平级组件
- **关键结果**：描述、状态、进度跟踪
- **资源需求**：资源类型、详细描述、状态管理
- **执行计划**：阶段名称、详细描述
- **行动检查**：可编辑的checklist格式，支持JSON存储

### 📋 双模式任务管理
#### 🎯 四象限展示模式
- **紧急且重要** (红色)：需要立即处理的任务
- **重要但不紧急** (蓝色)：需要计划安排的任务
- **紧急但不重要** (黄色)：可以委托处理的任务
- **既不紧急也不重要** (灰色)：可以推迟的任务
- 每个象限显示任务数量统计
- 支持拖拽在象限间移动任务

#### 📌 看板展示模式
- **待办**、**处理中**、**已完成** 三列布局
- 支持拖拽改变任务状态
- 紧凑的任务卡片设计
- 优先级标签显示

### 🌳 子任务系统
- **任务层次化管理**：支持在主任务下创建子任务
- **智能显示规则**：子任务只在父任务中显示，不单独展示
- **完成状态优化**：已完成子任务显示删除线并排在末尾
- **进度统计**：显示子任务完成进度（完成数/总数）
- **防止过度嵌套**：子任务不能再添加子任务，保持结构清晰

### 📅 日程管理
- **月视图日历**：直观的月度任务展示
- **任务按日期分组**：每日任务清晰展示
- **优先级排序**：任务按重要性和紧急性排序
- **快速操作**：
  - 点击日期创建任务
  - 点击任务编辑或删除
  - 月份导航和今天快速跳转
- **任务状态标识**：不同颜色区分任务状态和优先级
- **任务数量限制**：每日最多显示3个任务，超出显示"更多"提示

### 🏷️ 任务功能
- **完整的CRUD操作**：创建、编辑、删除、状态更新
- **优先级管理**：重要性和紧急性双维度设置
- **状态管理**：待办、处理中、已完成三种状态
- **分类系统**：支持任务分类管理
- **截止日期**：任务到期提醒
- **项目关联**：任务可关联到具体项目
- **任务复制**：快速复制任务及其子任务
- **智能筛选**：按状态、分类、项目等多维度筛选

### 📈 数据统计与分析
- **实时统计**：任务完成率、各状态任务数量
- **项目统计**：项目进度、任务分布、完成情况
- **时间序列分析**：支持日、周、月维度的数据查看
- **热力图可视化**：年度任务活动热力图
- **多图表展示**：饼图、柱状图等多种可视化方式
- **缓存优化**：智能数据缓存，提升加载速度

## 🎨 界面设计优化

### 统一的标签颜色系统
- **优先级标签**：
  - 紧急重要: 红色 (`bg-red-100 text-red-800`)
  - 重要: 蓝色 (`bg-blue-100 text-blue-800`)
  - 紧急: 黄色 (`bg-yellow-100 text-yellow-800`)
  - 普通: 灰色 (`bg-gray-100 text-gray-800`)
- **状态标签**：
  - 已完成: 绿色 (`bg-green-100 text-green-800`)
  - 处理中: 靛蓝 (`bg-indigo-100 text-indigo-800`)
  - 待办: 石板灰 (`bg-slate-100 text-slate-800`)
- **项目标签**: 橙色 (`bg-orange-100 text-orange-800`)
- **分类标签**: 紫色 (`bg-purple-100 text-purple-800`)

### 简洁的设计理念
- 移除了冗余的图标，保持界面简洁统一
- 专注于内容本身，减少视觉干扰
- 统一的确认对话框和交互模式
- 响应式设计，适配各种设备

## 🛠️ 技术栈

### 前端技术
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **@tailwindcss/typography** - Markdown样式支持 🆕
- **Zustand** - 轻量级状态管理
- **React Router** - 客户端路由
- **Axios** - HTTP请求库
- **date-fns** - 日期处理库
- **Recharts** - 图表可视化库
- **marked** - Markdown解析器 🆕
- **@uiw/react-md-editor** - 专业Markdown编辑器 🆕
- **lunar-javascript** - 农历日期处理 🆕

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
│   │   │   ├── CalendarGrid.tsx      # 日历网格组件
│   │   │   ├── CalendarDay.tsx       # 日历日期组件
│   │   │   ├── CalendarHeader.tsx    # 日历头部组件
│   │   │   ├── ProjectForm.tsx       # 项目表单组件 🆕
│   │   │   ├── ProjectCard.tsx       # 项目卡片组件 🆕
│   │   │   ├── ProjectNotes.tsx      # 项目记录组件 🆕
│   │   │   ├── GanttChart.tsx        # 甘特图组件 🆕
│   │   │   ├── SubtaskList.tsx       # 子任务列表组件 🆕
│   │   │   ├── SubtaskModal.tsx      # 子任务模态框组件 🆕
│   │   │   ├── TaskSelector.tsx      # 任务选择器组件 🆕
│   │   │   ├── AlertDialog.tsx       # 提示对话框组件 🆕
│   │   │   ├── ProjectOKR.tsx        # OKR管理组件 🆕
│   │   │   ├── ObjectiveForm.tsx     # 目标表单组件 🆕
│   │   │   ├── KeyResultForm.tsx     # 关键结果表单组件 🆕
│   │   │   └── ...                   # 其他组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── ProfilePage.tsx       # 个人主页
│   │   │   ├── TasksPage.tsx         # 任务管理页
│   │   │   ├── CalendarPage.tsx      # 日程管理页
│   │   │   ├── ProjectsPage.tsx      # 项目列表页 🆕
│   │   │   └── ProjectDetailPage.tsx # 项目详情页 🆕
│   │   ├── store/            # 状态管理
│   │   │   ├── authStore.ts          # 认证状态
│   │   │   ├── taskStore.ts          # 任务状态
│   │   │   ├── statsStore.ts         # 统计状态
│   │   │   └── projectStore.ts       # 项目状态 🆕
│   │   ├── services/         # API服务
│   │   │   ├── api.ts                # 基础API配置
│   │   │   ├── authService.ts        # 认证服务
│   │   │   ├── taskService.ts        # 任务服务
│   │   │   ├── statsService.ts       # 统计服务
│   │   │   ├── projectService.ts     # 项目服务 🆕
│   │   │   ├── projectNoteService.ts # 项目记录服务 🆕
│   │   │   └── okrService.ts         # OKR服务 🆕
│   │   ├── utils/            # 工具函数
│   │   │   ├── taskUtils.ts          # 任务工具函数
│   │   │   └── calendarUtils.ts      # 日历工具函数
│   │   ├── types/            # TypeScript类型
│   │   └── constants/        # 常量定义
│   │   └── App.tsx           # 应用入口
│   ├── tailwind.config.js    # Tailwind配置
│   └── vite.config.ts        # Vite配置
└── backend/                  # 后端应用
    ├── src/
    │   ├── controllers/      # API控制器
    │   │   ├── authController.ts     # 认证控制器
    │   │   ├── taskController.ts     # 任务控制器
    │   │   ├── categoryController.ts # 分类控制器
    │   │   ├── statsController.ts    # 统计控制器
    │   │   ├── projectController.ts  # 项目控制器 🆕
    │   │   ├── projectNoteController.ts # 项目记录控制器 🆕
    │   │   └── okrController.ts      # OKR控制器 🆕
    │   ├── services/         # 业务逻辑层
    │   │   ├── authService.ts        # 认证服务
    │   │   ├── taskService.ts        # 任务服务
    │   │   ├── categoryService.ts    # 分类服务
    │   │   ├── statsService.ts       # 统计服务
    │   │   ├── projectService.ts     # 项目服务 🆕
    │   │   ├── projectNoteService.ts # 项目记录服务 🆕
    │   │   └── okrService.ts         # OKR服务 🆕
    │   ├── routes/           # 路由配置
    │   │   ├── authRoutes.ts         # 认证路由
    │   │   ├── taskRoutes.ts         # 任务路由
    │   │   ├── categoryRoutes.ts     # 分类路由
    │   │   ├── statsRoutes.ts        # 统计路由
    │   │   ├── projectRoutes.ts      # 项目路由 🆕
    │   │   ├── projectNoteRoutes.ts  # 项目记录路由 🆕
    │   │   └── okrRoutes.ts          # OKR路由 🆕
    │   ├── middleware/       # 中间件
    │   │   └── auth.ts               # 认证中间件
    │   ├── utils/            # 工具函数
    │   └── index.ts          # 应用入口
    ├── prisma/               # 数据库配置
    │   ├── schema.prisma             # 数据库模式
    │   └── migrations/               # 数据库迁移
    └── .env                  # 环境变量
```

##  项目打包和部署

### 快速部署
```bash
# 1. 克隆项目
git clone <repository-url>
cd task-manager

# 2. 一键构建
node build.js

# 3. Docker部署（推荐）
docker-compose up -d

# 4. 或使用部署脚本
./scripts/deploy.sh production
```

### 详细部署指南
查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取完整的部署说明，包括：
- 本地开发环境搭建
- 生产环境部署
- Docker容器化部署
- CI/CD自动化部署
- 性能优化和监控

### 部署文件说明
- `Dockerfile` - Docker镜像构建文件
- `docker-compose.yml` - Docker编排配置
- `frontend/nginx.conf` - 前端Nginx配置文件
- `.env.example` - 环境变量示例
- `build.js` - 一键构建脚本
- `scripts/deploy.sh` - 自动化部署脚本

## 🚀 快速开始

### Windows 一键启动（推荐）
- 运行 `start.bat`（或 `start.ps1`）自动安装依赖并启动前后端
- 前端：http://localhost:5173
- 后端：http://localhost:5000
- 停止：运行 `stop.bat`
  - 注意：`stop.bat` 会结束所有 `node.exe` 进程，可能影响你机器上其它 Node 程序

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

# 配置环境变量（本地开发）
# 在 backend/ 目录创建 backend/.env（此文件通常不提交到仓库）
# 可参考根目录的 .env.example，并至少设置 JWT_SECRET / DATABASE_URL / FRONTEND_URL / PORT

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

### 后端环境变量（本地开发：backend/.env）
```env
# 数据库连接
DATABASE_URL="file:./dev.db"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key"

# 服务器配置
PORT=5000
FRONTEND_URL="http://localhost:5173"
NODE_ENV=development
```

### 前端环境变量（可选）

前端请求默认使用相对路径 `/api`：
- 本地开发由 `frontend/vite.config.ts` 将 `/api` 代理到 `http://localhost:5000`
- Docker/生产环境由 `frontend/nginx.conf` 将 `/api` 反向代理到后端容器

说明：当前前端代码未读取 `VITE_API_URL` 变量（`frontend/src/services/api.ts` 的 `baseURL` 固定为 `/api`）。

## 🔌 API接口文档

除注册/登录外，其它接口需要在请求头携带：`Authorization: Bearer <token>`。

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 任务接口
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/main` - 获取主任务列表
- `GET /api/tasks/quadrant` - 按象限获取任务
- `DELETE /api/tasks/batch` - 批量删除任务
- `GET /api/tasks/:id` - 获取任务详情
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/copy` - 复制任务
- `POST /api/tasks/:parentTaskId/subtasks` - 创建子任务
- `GET /api/tasks/:parentTaskId/subtasks` - 获取子任务列表

### 项目接口 🆕
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 项目记录接口 🆕
- `GET /api/projects/:id/notes` - 获取项目记录列表
- `POST /api/projects/:id/notes` - 创建项目记录
- `GET /api/notes/:id` - 获取项目记录详情
- `PUT /api/notes/:id` - 更新项目记录
- `DELETE /api/notes/:id` - 删除项目记录

### OKR接口 🆕
- `POST /api/objectives` - 创建目标
- `GET /api/projects/:projectId/objectives` - 获取项目目标列表
- `GET /api/objectives/:id` - 获取目标详情
- `PUT /api/objectives/:id` - 更新目标
- `DELETE /api/objectives/:id` - 删除目标
- `POST /api/key-results` - 创建关键结果
- `PUT /api/key-results/:id` - 更新关键结果
- `DELETE /api/key-results/:id` - 删除关键结果
- `POST /api/key-result-updates` - 新增关键结果更新记录
- `POST /api/resource-requirements` - 创建资源需求
- `PUT /api/resource-requirements/:id` - 更新资源需求
- `DELETE /api/resource-requirements/:id` - 删除资源需求
- `POST /api/execution-plans` - 创建执行计划
- `PUT /api/execution-plans/:id` - 更新执行计划
- `DELETE /api/execution-plans/:id` - 删除执行计划
- `POST /api/action-checks` - 创建行动检查
- `PUT /api/action-checks/:id` - 更新行动检查
- `DELETE /api/action-checks/:id` - 删除行动检查

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 统计接口
- `GET /api/stats/stats` - 获取任务统计
- `GET /api/stats/quadrant-stats` - 获取四象限统计
- `GET /api/stats/category-stats` - 获取分类统计
- `GET /api/stats/project-stats` - 获取项目统计 🆕
- `GET /api/stats/project-task-stats` - 获取项目任务统计 🆕
- `GET /api/stats/task-duration-ranking` - 获取任务耗时排行 🆕
- `GET /api/stats/time-series` - 获取时间序列数据
- `GET /api/stats/time-series-year` - 获取年度热力图数据

### 文件上传接口
- `POST /api/upload/image` - 上传图片（表单字段名：`image`）
- `DELETE /api/upload/image/:filename` - 删除图片
- `GET /api/uploads/:filename` - 访问已上传图片（静态文件）

## 🎯 使用指南

### 1. 注册与登录
- 首次使用需要注册新账号
- 使用用户名和密码登录系统
- 支持退出登录功能

### 2. 个人主页
- 查看任务统计概览
- 查看项目统计信息 🆕
- 使用热力图查看任务活动情况
- 通过时间周期选择器切换视图
- 点击统计卡片快速跳转到相应管理页面

### 3. 项目管理 🆕
- **创建项目**：点击"创建项目"按钮，填写项目信息
- **项目列表**：查看所有项目，支持状态筛选
- **项目详情**：
  - 查看项目基本信息和进度
  - 管理项目任务（创建新任务、添加现有任务）
  - 切换列表视图和甘特图视图
  - 创建和管理项目记录
- **项目记录**：
  - 使用Markdown编辑器记录项目过程
  - 选择不同记录类型（记录、总结、会议等）
  - 使用模板快速创建记录
  - 实时预览Markdown内容

### 4. 任务管理
- **添加任务**：点击"添加任务"按钮创建新任务
- **关联项目**：在任务表单中选择所属项目 🆕
- **子任务管理**：在主任务中创建和管理子任务 🆕
- **编辑任务**：点击任务卡片上的编辑按钮
- **删除任务**：点击任务卡片上的删除按钮
- **切换视图**：使用"四象限展示"和"看板展示"按钮切换视图模式
- **拖拽操作**：
  - 四象限模式：拖拽任务改变优先级
  - 看板模式：拖拽任务改变状态
- **筛选任务**：使用左侧筛选按钮按状态查看任务

### 5. 日程管理
- **月视图浏览**：查看整月的任务安排
- **创建任务**：点击任意日期快速创建任务
- **编辑任务**：点击任务卡片进行编辑或删除
- **月份导航**：使用左右箭头切换月份，点击"今天"快速回到当前月
- **任务排序**：每日任务按优先级自动排序显示

### 6. 优先级管理
- 根据艾森豪威尔矩阵原则设置任务优先级
- 重要且紧急的任务优先处理
- 重要但不紧急的任务需要规划
- 紧急但不重要的任务可以委托
- 既不紧急也不重要的任务可以推迟

## 🎨 界面特色

### 现代化设计
- 简洁的Material Design风格
- 响应式布局，支持各种设备
- 统一的颜色主题系统 🆕
- 流畅的动画和过渡效果
- 无图标干扰的简洁标签设计 🆕

### 交互体验
- 直观的拖拽操作
- 实时的数据更新
- 优雅的加载状态
- 丰富的视觉反馈
- 统一的确认对话框 🆕

### 数据可视化
- GitHub风格的活动热力图
- 多种图表类型支持
- 甘特图时间轴展示 🆕
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
- 任务表：存储任务详情和优先级，支持项目关联和子任务 🆕
- 分类表：支持任务分类管理
- 项目表：存储项目信息和状态 🆕
- 项目记录表：存储项目记录和总结 🆕
- 目标表(Objective)：存储OKR目标 🆕
- 关键结果表(KeyResult)：存储OKR关键结果 🆕
- 资源需求表(ResourceRequirement)：存储目标所需资源 🆕
- 执行计划表(ExecutionPlan)：存储目标执行计划 🆕
- 行动检查表(ActionCheck)：存储目标行动检查项 🆕
- 包含创建时间和更新时间字段

### 性能优化 🆕
- 前端组件懒加载
- API请求缓存机制
- 数据库查询优化
- 图片和资源压缩
- 移除生产环境调试日志
- 优化组件渲染性能

## 📈 未来规划

- [ ] 任务提醒功能
- [ ] 数据导入导出
- [ ] 多主题支持
- [ ] 移动端适配优化
- [ ] 团队协作功能
- [ ] 更多图表类型
- [ ] 任务模板功能
- [ ] 数据备份与同步
- [ ] 项目模板功能 🆕
- [ ] 项目成员管理 🆕
- [ ] 文件管理功能 🆕

## 🆕 最新更新 (2026年1月)

### 重大功能更新
1. **完整的项目管理系统**
   - 项目CRUD操作和状态管理
   - 任务关联和批量操作
   - 项目进度跟踪和搜索功能

2. **项目记录与总结功能**
   - 专业的Markdown编辑器，支持实时预览
   - 6种记录类型和智能模板系统
   - Zhihu风格的展示和编辑体验

3. **甘特图可视化**
   - 精确的时间轴展示和智能时间计算
   - 状态和优先级颜色编码
   - 中文化界面和视图切换功能

4. **OKR目标管理系统**
   - 完整的目标和关键结果管理
   - 四个平级组件：关键结果、资源需求、执行计划、行动检查
   - 进度跟踪和状态管理

5. **子任务系统**
   - 任务层次化管理和智能显示规则
   - 进度统计和防止过度嵌套
   - 完成状态优化显示

6. **项目统计功能**
   - 项目维度统计和任务分布图表
   - 集成到个人主页仪表盘
   - 实时进度跟踪

7. **UI/UX全面优化**
   - 统一标签颜色系统和简洁设计理念
   - 移除冗余图标，优化确认对话框
   - 提升整体一致性和用户体验

8. **性能和代码优化**
   - 清理调试日志和优化组件性能
   - 改进错误处理和状态管理
   - 增强类型安全和代码质量

### 技术改进
- 新增多个数据模型和API端点
- 优化数据库结构和查询性能
- 改进状态管理和错误处理机制
- 增强类型安全和代码可维护性
- 完善的错误处理和用户反馈

### 架构优化
- 清理和优化后端服务代码
- 优化个性化标签系统（本地存储），简化交互
- 改进前端状态管理和组件结构
- 优化数据库查询和性能
- 完善的文档和架构说明

项目现已达到**企业级生产就绪**状态，具备专业级任务和项目管理应用的所有核心功能，代码质量高，架构清晰，性能优异。

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