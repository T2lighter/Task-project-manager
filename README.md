# 个人任务管理应用

一个基于React、TypeScript、Express和Prisma的现代化个人任务管理Web应用，使用艾森豪威尔矩阵（四象限法则）来帮助用户高效管理任务，支持多种视图模式、项目管理、甘特图、项目记录和丰富的数据统计功能。

## ✨ 功能特性

### 🔐 用户认证系统
- 用户注册与登录
- JWT令牌认证
- 安全的密码加密存储
- 退出登录功能

### 📊 个人主页仪表盘
- **用户信息展示**：用户名、邮箱等基本信息
- **任务统计卡片**：总任务数、完成率、逾期任务、今日到期等8个核心指标
- **项目统计卡片**：项目总数、进行中项目、完成率等项目维度统计 🆕
- **任务活动热力图**：GitHub风格的年度任务活动可视化
  - 支持日、周、月时间周期选择
  - 显示创建和完成任务的活动强度
  - 包含完成率和活跃天数统计
- **多维度图表分析**：
  - 任务状态分布饼图
  - 四象限分布饼图
  - 分类统计柱状图
  - 项目任务分布图表 🆕

### 🏗️ 项目管理系统 🆕
#### 📋 项目管理
- **完整的项目CRUD**：创建、编辑、删除项目
- **项目状态管理**：规划中、进行中、已完成、暂停、已取消
- **项目进度跟踪**：基于关联任务的完成情况自动计算
- **项目统计分析**：任务分布、完成率、进度趋势

#### 📝 项目记录与总结
- **Markdown编辑器**：左右分屏模式，左侧编辑，右侧实时预览
- **多种记录类型**：记录、总结、会议、问题、里程碑、反思
- **模板系统**：每种类型提供专业模板
- **完整的CRUD操作**：创建、编辑、删除项目记录
- **Markdown语法提示**：内置语法帮助

#### 📊 甘特图视图
- **时间轴可视化**：横向时间轴展示任务时间线
- **状态颜色编码**：不同状态用不同颜色表示
- **优先级边框**：高优先级任务有特殊边框
- **进度显示**：任务完成进度可视化
- **中文化界面**：星期显示为中文
- **视图切换**：列表视图 ↔ 甘特图视图

#### 🔗 任务关联
- **智能任务分配**：将现有任务分配到项目
- **项目内创建任务**：直接在项目中创建新任务
- **批量添加功能**：批量添加现有任务到项目
- **智能筛选选择**：未分配、其他项目、全部任务筛选

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

### 🌳 子任务系统 🆕
- **任务层次化管理**：支持在主任务下创建子任务
- **智能显示规则**：子任务只在父任务中显示，不单独展示
- **完成状态优化**：已完成子任务显示删除线并排在末尾
- **进度统计**：显示子任务完成进度（完成数/总数）
- **防止过度嵌套**：子任务不能再添加子任务

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
- **状态管理**：待办、进行中、已完成三种状态
- **分类系统**：支持任务分类管理
- **截止日期**：任务到期提醒
- **项目关联**：任务可关联到具体项目 🆕
- **统一标签系统**：优化的颜色方案，无图标干扰 🆕
- **智能筛选**：按状态、分类、项目等多维度筛选

### 📈 数据统计与分析
- **实时统计**：任务完成率、各状态任务数量
- **项目统计**：项目进度、任务分布、完成情况 🆕
- **时间序列分析**：支持日、周、月维度的数据查看
- **热力图可视化**：年度任务活动热力图
- **多图表展示**：饼图、柱状图等多种可视化方式
- **缓存优化**：智能数据缓存，提升加载速度

## 🎨 界面设计优化 🆕

### 统一的标签颜色系统
- **优先级标签**：
  - 紧急重要: 红色 (`bg-red-100 text-red-800`)
  - 重要: 蓝色 (`bg-blue-100 text-blue-800`)
  - 紧急: 黄色 (`bg-yellow-100 text-yellow-800`)
  - 普通: 灰色 (`bg-gray-100 text-gray-800`)
- **状态标签**：
  - 已完成: 绿色 (`bg-green-100 text-green-800`)
  - 进行中: 靛蓝 (`bg-indigo-100 text-indigo-800`)
  - 待办: 石板灰 (`bg-slate-100 text-slate-800`)
- **项目标签**: 橙色 (`bg-orange-100 text-orange-800`)
- **分类标签**: 紫色 (`bg-purple-100 text-purple-800`)

### 简洁的图标设计
- 移除了所有优先级标签的图标（🔥、⭐️、⚡️、📋）
- 移除了项目标签的文件夹图标（📁）
- 保持界面简洁统一，专注于内容本身

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
│   │   │   └── projectNoteService.ts # 项目记录服务 🆕
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
    │   │   └── projectNoteController.ts # 项目记录控制器 🆕
    │   ├── services/         # 业务逻辑层
    │   │   ├── authService.ts        # 认证服务
    │   │   ├── taskService.ts        # 任务服务
    │   │   ├── categoryService.ts    # 分类服务
    │   │   ├── statsService.ts       # 统计服务
    │   │   ├── projectService.ts     # 项目服务 🆕
    │   │   └── projectNoteService.ts # 项目记录服务 🆕
    │   ├── routes/           # 路由配置
    │   │   ├── authRoutes.ts         # 认证路由
    │   │   ├── taskRoutes.ts         # 任务路由
    │   │   ├── categoryRoutes.ts     # 分类路由
    │   │   ├── statsRoutes.ts        # 统计路由
    │   │   ├── projectRoutes.ts      # 项目路由 🆕
    │   │   └── projectNoteRoutes.ts  # 项目记录路由 🆕
    │   ├── middleware/       # 中间件
    │   │   └── auth.ts               # 认证中间件
    │   ├── utils/            # 工具函数
    │   └── index.ts          # 应用入口
    ├── prisma/               # 数据库配置
    │   ├── schema.prisma             # 数据库模式
    │   └── migrations/               # 数据库迁移
    └── .env                  # 环境变量
```

## � 项目打包和部署

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
- `nginx.conf` - Nginx配置文件
- `.env.example` - 环境变量示例
- `build.js` - 一键构建脚本
- `scripts/deploy.sh` - 自动化部署脚本

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

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 统计接口
- `GET /api/stats/tasks` - 获取任务统计
- `GET /api/stats/quadrants` - 获取四象限统计
- `GET /api/stats/categories` - 获取分类统计
- `GET /api/stats/projects` - 获取项目统计 🆕
- `GET /api/stats/time-series` - 获取时间序列数据
- `GET /api/stats/time-series-year` - 获取年度热力图数据

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

## 🆕 最新更新 (2024年12月28日)

### 重大功能更新
1. **完整的项目管理系统**
   - 项目CRUD操作
   - 项目状态管理
   - 任务关联和批量操作
   - 项目进度跟踪

2. **项目记录与总结功能**
   - Markdown左右分屏编辑器
   - 6种记录类型和专业模板
   - 实时预览和语法提示
   - 完整的记录管理

3. **甘特图可视化**
   - 时间轴展示
   - 状态和优先级颜色编码
   - 中文化界面
   - 视图切换功能

4. **子任务系统**
   - 任务层次化管理
   - 智能显示规则
   - 进度统计
   - 防止过度嵌套

5. **项目统计功能**
   - 项目维度统计
   - 任务分布图表
   - 集成到个人主页

6. **UI/UX全面优化**
   - 统一标签颜色系统
   - 移除冗余图标
   - 优化确认对话框
   - 提升整体一致性

7. **性能和代码优化**
   - 清理调试日志
   - 优化组件性能
   - 改进错误处理
   - 提升用户体验

### 技术改进
- 新增多个数据模型和API端点
- 优化数据库结构
- 改进状态管理
- 增强类型安全
- 完善错误处理机制

项目现已达到**生产就绪**状态，具备专业级任务和项目管理应用的所有核心功能。

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