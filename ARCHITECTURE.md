# 个人任务管理Web应用 - 完整架构设计文档

## 1. 项目概述

### 1.1 项目简介
个人任务管理Web应用是一个基于现代前后端分离架构的任务管理系统，采用艾森豪威尔矩阵（四象限法则）帮助用户高效管理个人任务。系统提供了丰富的数据可视化功能、项目管理、甘特图展示和多种任务管理视图，旨在提升个人工作效率和时间管理能力。

### 1.2 核心价值
- **科学的任务分类**：基于艾森豪威尔矩阵的四象限分类法
- **完整的项目管理**：项目创建、任务关联、进度跟踪、记录管理
- **多维度数据分析**：任务统计、项目统计、趋势分析和活动热力图
- **灵活的视图模式**：支持四象限、看板、日历、甘特图多种展示模式
- **现代化用户体验**：响应式设计、流畅动画、直观交互

### 1.3 技术特色
- **全栈TypeScript**：前后端统一类型安全
- **现代化技术栈**：React 18 + Express + Prisma
- **高性能优化**：数据缓存、懒加载、智能更新
- **可视化丰富**：多种图表类型、热力图、甘特图、实时统计

## 2. 系统架构设计

### 2.1 整体架构模式

采用**前后端分离架构**结合**分层架构模式**，确保系统的可维护性、可扩展性和高性能。

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   个人主页      │  │   任务管理      │  │   项目管理      │ │
│  │  (Dashboard)    │  │  (Task Mgmt)    │  │ (Project Mgmt)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   日程管理      │  │   用户认证      │  │   OKR管理       │ │
│  │  (Calendar)     │  │   (Auth)        │  │  (OKR Mgmt)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        API网关层                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   认证路由      │  │   任务路由      │  │   项目路由      │ │
│  │  /api/auth      │  │  /api/tasks     │  │ /api/projects   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   统计路由      │  │   分类路由      │  │   OKR路由       │ │
│  │  /api/stats     │  │ /api/categories │  │  /api/okr       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   认证服务      │  │   任务服务      │  │   项目服务      │ │
│  │  AuthService    │  │  TaskService    │  │ ProjectService  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   统计服务      │  │   分类服务      │  │   OKR服务       │ │
│  │  StatsService   │  │ CategoryService │  │  OKRService     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   用户模型      │  │   任务模型      │  │   项目模型      │ │
│  │   User Model    │  │   Task Model    │  │ Project Model   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   分类模型      │  │   记录模型      │  │   OKR模型       │ │
│  │ Category Model  │  │  Note Model     │  │  OKR Model      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据存储层                           │
│                      SQLite Database                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 架构特点
- **高内聚低耦合**：各层职责明确，依赖关系清晰
- **可扩展性强**：支持水平扩展和功能模块化
- **性能优化**：多级缓存、数据预加载、智能更新
- **安全可靠**：JWT认证、数据验证、错误处理

## 3. 技术栈详解

### 3.1 前端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **React** | 18.x | UI框架 | 组件化开发、虚拟DOM、生态丰富 |
| **TypeScript** | 5.x | 开发语言 | 类型安全、IDE支持、代码质量 |
| **Vite** | 5.x | 构建工具 | 快速热更新、ES模块、插件生态 |
| **Zustand** | 4.x | 状态管理 | 轻量级、简单易用、TypeScript友好 |
| **Tailwind CSS** | 3.x | 样式框架 | 原子化CSS、快速开发、响应式 |
| **React Router** | 6.x | 路由管理 | 声明式路由、代码分割、嵌套路由 |
| **Axios** | 1.x | HTTP客户端 | 请求拦截、响应处理、错误统一处理 |
| **date-fns** | 2.x | 日期处理 | 模块化、轻量级、国际化支持 |
| **Recharts** | 2.x | 图表库 | React原生、可定制、响应式 |
| **marked** | 12.x | Markdown解析 | 高性能、符合标准、扩展性强 🆕 |
| **@uiw/react-md-editor** | 4.x | Markdown编辑 | 功能丰富、实时预览、React组件 🆕 |
| **lunar-javascript** | 1.x | 农历支持 | 精确农历算法、节假日支持 🆕 |

### 3.2 后端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **Node.js** | 18.x | 运行环境 | JavaScript全栈、高性能、生态丰富 |
| **Express** | 4.x | Web框架 | 轻量级、中间件丰富、易于扩展 |
| **TypeScript** | 5.x | 开发语言 | 类型安全、代码质量、开发效率 |
| **Prisma** | 5.x | ORM框架 | 类型安全、数据库迁移、查询优化 |
| **SQLite** | 3.x | 数据库 | 零配置、文件存储、适合个人使用 |
| **JWT** | 9.x | 身份认证 | 无状态、跨域支持、安全可靠 |
| **bcryptjs** | 2.x | 密码加密 | 安全哈希、盐值处理、防彩虹表 |
| **CORS** | 2.x | 跨域处理 | 安全策略、灵活配置、标准支持 |

### 3.3 开发工具链

| 工具 | 用途 | 配置特点 |
|------|------|----------|
| **ESLint** | 代码检查 | TypeScript规则、React Hooks规则 |
| **Prettier** | 代码格式化 | 统一代码风格、自动格式化 |
| **Husky** | Git钩子 | 提交前检查、代码质量保证 |
| **lint-staged** | 暂存区检查 | 只检查变更文件、提高效率 |

## 4. 功能模块设计

### 4.1 用户认证模块

#### 功能特性
- **用户注册**：用户名、邮箱、密码注册
- **用户登录**：支持用户名/邮箱登录
- **JWT认证**：无状态令牌认证
- **密码安全**：bcrypt加密存储

#### 技术实现
```typescript
// 认证服务接口
interface AuthService {
  register(userData: RegisterData): Promise<AuthResponse>
  login(credentials: LoginData): Promise<AuthResponse>
  verifyToken(token: string): Promise<User>
  refreshToken(token: string): Promise<string>
}
```

#### 安全措施
- 密码强度验证
- JWT令牌过期机制
- 请求频率限制
- 输入数据验证

### 4.2 任务管理模块

#### 核心功能
- **任务CRUD**：创建、读取、更新、删除
- **优先级管理**：重要性、紧急性双维度
- **状态管理**：待办、进行中、已完成
- **分类管理**：自定义任务分类
- **子任务系统**：支持任务层次化管理
- **任务复制**：快速复制任务和子任务
- **拖拽操作**：直观的任务状态/优先级调整

#### 四象限分类
```typescript
interface TaskQuadrant {
  urgent: boolean      // 紧急性
  important: boolean   // 重要性
  quadrant: 1 | 2 | 3 | 4  // 象限编号
  color: string        // 象限颜色
  description: string  // 象限描述
}

// 四象限定义
const QUADRANTS = {
  1: { urgent: true,  important: true,  color: 'red',    description: '紧急且重要' },
  2: { urgent: false, important: true,  color: 'blue',   description: '重要但不紧急' },
  3: { urgent: true,  important: false, color: 'yellow', description: '紧急但不重要' },
  4: { urgent: false, important: false, color: 'gray',   description: '既不紧急也不重要' }
}
```

#### 子任务系统
```typescript
// 子任务数据结构
interface SubtaskRelation {
  parentTaskId: number | null  // 父任务ID
  subtasks: Task[]            // 子任务列表
  maxDepth: 1                 // 最大嵌套深度（防止过度嵌套）
}

// 子任务业务规则
const SUBTASK_RULES = {
  maxDepth: 1,                // 只允许一级子任务
  inheritProject: true,       // 子任务继承父任务的项目
  statusIndependence: true,   // 子任务状态独立管理
  completionTracking: true    // 跟踪子任务完成进度
}
```

#### 视图模式
1. **四象限视图**：按优先级矩阵展示
2. **看板视图**：按任务状态展示
3. **列表视图**：传统列表展示
4. **日历视图**：按日期展示任务

### 4.3 项目管理模块

#### 核心功能
- **项目CRUD**：完整的项目生命周期管理
- **状态管理**：规划中、进行中、已完成、暂停、已取消
- **任务关联**：项目与任务的多对多关系
- **进度跟踪**：基于关联任务的自动进度计算
- **甘特图展示**：时间轴可视化项目进度

#### 项目状态流转
```typescript
type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled'

// 状态流转规则
const PROJECT_STATUS_FLOW = {
  planning: ['active', 'cancelled'],
  active: ['completed', 'on-hold', 'cancelled'],
  'on-hold': ['active', 'cancelled'],
  completed: [], // 终态
  cancelled: []  // 终态
}
```

#### 甘特图组件
```typescript
// 甘特图数据结构
interface GanttData {
  tasks: GanttTask[]
  startDate: Date
  endDate: Date
  totalDays: number
  dateRange: Date[]
}

interface GanttTask extends Task {
  startOffset: number    // 相对开始位置
  duration: number       // 持续天数
  progress: number       // 完成进度
  calculatedStartDate: Date  // 智能计算的开始时间
  calculatedEndDate: Date    // 截止时间
}
```

### 4.4 项目记录模块

#### 功能特性
- **Markdown编辑**：支持实时预览的Markdown编辑器
- **记录类型**：记录、总结、会议、问题、里程碑、反思
- **模板系统**：每种类型提供专业模板
- **版本管理**：记录的创建和更新时间跟踪

#### 记录类型定义
```typescript
type NoteType = 'note' | 'summary' | 'meeting' | 'issue' | 'milestone' | 'reflection'

// 记录模板
const NOTE_TEMPLATES = {
  note: '# 项目记录\n\n## 日期\n{date}\n\n## 内容\n\n## 备注\n',
  summary: '# 项目总结\n\n## 项目概述\n\n## 主要成果\n\n## 遇到的问题\n\n## 经验教训\n\n## 下一步计划\n',
  meeting: '# 会议记录\n\n## 会议信息\n- 时间：{date}\n- 参与人员：\n- 会议主题：\n\n## 讨论内容\n\n## 决策事项\n\n## 行动计划\n',
  issue: '# 问题记录\n\n## 问题描述\n\n## 影响范围\n\n## 原因分析\n\n## 解决方案\n\n## 预防措施\n',
  milestone: '# 里程碑\n\n## 里程碑名称\n\n## 达成时间\n{date}\n\n## 主要成果\n\n## 关键指标\n\n## 下一个目标\n',
  reflection: '# 项目反思\n\n## 反思主题\n\n## 做得好的地方\n\n## 需要改进的地方\n\n## 学到的经验\n\n## 未来应用\n'
}
```

### 4.5 OKR管理模块

#### 核心概念
- **目标(Objectives)**：定性的、鼓舞人心的目标
- **关键结果(Key Results)**：量化的、可衡量的结果
- **资源需求**：实现目标所需的资源
- **执行计划**：分阶段的执行策略
- **行动检查**：定期检查和评估机制

#### OKR数据模型
```typescript
interface OKRStructure {
  objective: {
    id: number
    title: string
    description: string
    status: 'draft' | 'active' | 'completed' | 'cancelled'
    progress: number // 0-100
  }
  
  // 四个平级组件
  keyResults: KeyResult[]           // 关键结果
  resourceRequirements: Resource[]  // 资源需求
  executionPlans: ExecutionPlan[]   // 执行计划
  actionChecks: ActionCheck[]       // 行动检查
}
```

### 4.6 数据统计模块

#### 统计维度
- **任务统计**：总数、完成率、状态分布、逾期情况
- **项目统计**：项目数量、状态分布、完成率
- **时间统计**：创建趋势、完成趋势、活动热力图
- **分类统计**：各分类任务分布
- **四象限统计**：各象限任务分布

#### 可视化组件
```typescript
// 统计图表类型
type ChartType = 
  | 'pie'           // 饼图
  | 'bar'           // 柱状图
  | 'line'          // 折线图
  | 'heatmap'       // 热力图
  | 'area'          // 面积图
  | 'gantt'         // 甘特图

// 热力图数据结构
interface HeatmapData {
  date: string      // 日期
  created: number   // 创建任务数
  completed: number // 完成任务数
  intensity: number // 活动强度
}
```

#### 性能优化
- **数据缓存**：前端缓存统计数据
- **增量更新**：只更新变化的数据
- **懒加载**：按需加载图表组件
- **防抖处理**：避免频繁请求

### 4.7 日程管理模块

#### 核心功能
- **月视图日历**：以月为单位展示任务安排
- **任务按日期分组**：自动将任务按到期日期分组显示
- **快速任务操作**：点击日期创建任务，点击任务编辑
- **月份导航**：支持前后月份切换和快速回到今天
- **优先级排序**：每日任务按重要性和紧急性自动排序

#### 日历组件架构
```typescript
// 日历页面组件结构
CalendarPage
├── CalendarHeader    // 日历头部（月份导航）
├── CalendarGrid      // 日历网格容器
│   └── CalendarDay   // 单日组件（包含任务列表）
└── TaskForm          // 任务表单弹窗

// 日历工具函数
interface CalendarUtils {
  getMonthDays(year: number, month: number): Date[]
  groupTasksByDate(tasks: Task[]): Record<string, Task[]>
  formatDateKey(date: Date): string
  isToday(date: Date): boolean
  isCurrentMonth(date: Date, currentMonth: number): boolean
}
```

#### 日历数据处理
```typescript
// 任务按日期分组
const groupTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = formatDateKey(new Date(task.dueDate));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    }
  });
  
  // 对每天的任务按优先级排序
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      const getPriorityWeight = (task: Task) => {
        if (task.urgency && task.importance) return 4;
        if (task.urgency && !task.importance) return 3;
        if (!task.urgency && task.importance) return 2;
        return 1;
      };
      
      return getPriorityWeight(b) - getPriorityWeight(a);
    });
  });
  
  return grouped;
};
```

#### 用户交互设计
- **日期点击**：点击空白日期创建该日任务
- **任务点击**：点击任务卡片编辑或删除任务
- **月份导航**：左右箭头切换月份，"今天"按钮快速回到当前月
- **任务限制**：每日最多显示3个任务，超出显示"更多"提示
- **状态标识**：不同颜色和图标区分任务状态和优先级

#### 响应式适配
```css
/* 日历网格响应式 */
.calendar-grid {
  @apply grid grid-cols-7;
  @apply min-h-[600px];
}

.calendar-day {
  @apply min-h-[120px] border border-gray-200 p-2;
  @apply cursor-pointer hover:bg-gray-50 transition-colors;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .calendar-day {
    @apply min-h-[100px] p-1;
  }
  
  .task-item {
    @apply text-xs px-1 py-0.5;
  }
}
```

### 4.5 个人主页模块

#### 仪表盘组件
- **统计卡片**：核心指标展示
- **活动热力图**：GitHub风格的任务活动图
- **趋势图表**：任务完成趋势
- **快捷操作**：常用功能入口

#### 响应式设计
```css
/* 响应式布局断点 */
.dashboard-grid {
  @apply grid gap-6;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
  @apply grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8; /* 统计卡片 */
}

/* 热力图响应式 */
.heatmap-container {
  @apply w-full overflow-x-auto;
  min-height: 200px;
}
```

## 6. 数据模型设计

### 6.1 数据库设计

#### 用户表 (User)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String   // bcrypt加密
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 关联关系
  tasks     Task[]
  categories Category[]
  
  @@map("users")
}
```

#### 任务表 (Task)
```prisma
model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  urgency     Boolean   @default(false)
  importance  Boolean   @default(false)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // 外键关系
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  // 索引优化
  @@index([userId, status])
  @@index([userId, urgency, importance])
  @@index([createdAt])
  @@map("tasks")
}

enum TaskStatus {
  PENDING     // 待办
  IN_PROGRESS // 进行中
  COMPLETED   // 已完成
}
```

#### 分类表 (Category)
```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String
  color     String   @default("#3b82f6")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 外键关系
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks     Task[]
  
  // 唯一约束
  @@unique([userId, name])
  @@map("categories")
}
```

#### 项目表 (Project) 🆕
```prisma
model Project {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("planning") // planning, active, completed, on_hold, cancelled
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // 关联关系
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks       Task[]    // 项目关联的任务
  notes       ProjectNote[]
  objectives  Objective[]
  
  @@map("projects")
}
```

#### 项目记录表 (ProjectNote) 🆕
```prisma
model ProjectNote {
  id          Int       @id @default(autoincrement())
  title       String
  content     String
  type        String    @default("note") // note, summary, meeting, issue, milestone, reflection
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // 关联关系
  projectId   Int
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@map("project_notes")
}
```

#### OKR目标表 (Objective) 🆕
```prisma
model Objective {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("draft") // draft, active, completed, cancelled
  progress    Int       @default(0)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // 关联关系
  projectId   Int
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  keyResults  KeyResult[]
  
  @@map("objectives")
}
```

#### 关键结果表 (KeyResult) 🆕
```prisma
model KeyResult {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("pending")
  currentValue Float    @default(0)
  targetValue  Float
  unit        String?
  weight      Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // 关联关系
  objectiveId Int
  objective   Objective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  
  @@map("key_results")
}
```

### 5.2 数据关系图

```
User (1) ──────── (N) Task
 │                     │
 │                     │
 └── (1) ──────── (N) Category
           │
           └── (1) ──────── (N) Task
```

### 5.3 数据访问优化

#### 查询优化策略
```typescript
// 任务查询优化
const getTasksWithStats = async (userId: number) => {
  return await prisma.task.findMany({
    where: { userId },
    include: {
      category: {
        select: { id: true, name: true, color: true }
      }
    },
    orderBy: [
      { urgency: 'desc' },
      { importance: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

// 统计查询优化
const getTaskStats = async (userId: number) => {
  const [total, completed, pending, inProgress] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.task.count({ where: { userId, status: 'PENDING' } }),
    prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } })
  ])
  
  return { total, completed, pending, inProgress }
}
```

## 7. API接口设计

### 7.1 RESTful API规范

#### 接口命名规范
```
GET    /api/resource          # 获取资源列表
GET    /api/resource/:id      # 获取单个资源
POST   /api/resource          # 创建资源
PUT    /api/resource/:id      # 更新资源
DELETE /api/resource/:id      # 删除资源
```

#### 响应格式标准
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

// 成功响应
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 错误响应
{
  "success": false,
  "error": "Resource not found",
  "message": "The requested task does not exist",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 7.2 核心API接口

#### 认证接口
```typescript
// POST /api/auth/register
interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthResponse {
  user: User
  token: string
  expiresIn: number
}

// POST /api/auth/login
interface LoginRequest {
  username: string  // 支持用户名或邮箱
  password: string
}
```

#### 任务接口
```typescript
// GET /api/tasks
interface GetTasksQuery {
  status?: TaskStatus
  urgent?: boolean
  important?: boolean
  categoryId?: number
  page?: number
  limit?: number
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string
  description?: string
  urgency: boolean
  importance: boolean
  dueDate?: string
  categoryId?: number
}

// PUT /api/tasks/:id
interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  urgency?: boolean
  importance?: boolean
  dueDate?: string
  categoryId?: number
}
```

#### 项目接口 🆕
```typescript
// GET /api/projects
interface GetProjectsQuery {
  status?: ProjectStatus
  search?: string
}

// POST /api/projects
interface CreateProjectRequest {
  title: string
  description?: string
  status?: ProjectStatus
  startDate?: string
  endDate?: string
}
```

#### OKR接口 🆕
```typescript
// GET /api/projects/:projectId/objectives
interface GetObjectivesResponse {
  objectives: ObjectiveWithDetails[]
}

// POST /api/projects/:projectId/objectives
interface CreateObjectiveRequest {
  title: string
  description?: string
  startDate?: string
  endDate?: string
}

// POST /api/objectives/:id/key-results
interface CreateKeyResultRequest {
  title: string
  targetValue: number
  unit?: string
  weight?: number
}
```

#### 统计接口
```typescript
// GET /api/stats/overview
interface StatsOverview {
  taskStats: TaskStats
  quadrantStats: QuadrantStats
  categoryStats: CategoryStats[]
  recentActivity: ActivityData[]
}

// GET /api/stats/time-series
interface TimeSeriesQuery {
  period: 'day' | 'week' | 'month'
  startDate?: string
  endDate?: string
}

// GET /api/stats/heatmap
interface HeatmapQuery {
  year: number
}
```

### 7.3 错误处理机制

#### HTTP状态码规范
```typescript
const HTTP_STATUS = {
  OK: 200,                    // 成功
  CREATED: 201,               // 创建成功
  NO_CONTENT: 204,            // 删除成功
  BAD_REQUEST: 400,           // 请求参数错误
  UNAUTHORIZED: 401,          // 未认证
  FORBIDDEN: 403,             // 无权限
  NOT_FOUND: 404,             // 资源不存在
  CONFLICT: 409,              // 资源冲突
  INTERNAL_SERVER_ERROR: 500  // 服务器错误
}
```

#### 错误处理中间件
```typescript
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  // 记录错误日志
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`)
  
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  })
}
```

## 8. 前端架构设计

### 8.1 组件架构

#### 组件分层
```
src/
├── components/           # 通用组件
│   ├── ui/              # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── charts/          # 图表组件
│   │   ├── PieChart.tsx
│   │   ├── BarChart.tsx
│   │   └── Heatmap.tsx
│   ├── task/            # 任务相关组件
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── Quadrant.tsx
│   │   └── KanbanBoard.tsx
│   └── calendar/        # 日历相关组件
│       ├── CalendarGrid.tsx
│       ├── CalendarDay.tsx
│       ├── CalendarDay.tsx
      └── CalendarHeader.tsx
  ├── project/           # 项目相关组件 🆕
  │   ├── ProjectCard.tsx
  │   ├── ProjectForm.tsx
  │   ├── ProjectNotes.tsx
  │   ├── GanttChart.tsx
  │   └── ProjectOKR.tsx
  ├── okr/               # OKR相关组件 🆕
  │   ├── ObjectiveForm.tsx
  │   ├── KeyResultForm.tsx
  │   └── ExecutionPlanForm.tsx
├── pages/               # 页面组件
│   ├── ProfilePage.tsx
│   ├── TasksPage.tsx
│   ├── CalendarPage.tsx
│   └── LoginPage.tsx
└── layouts/             # 布局组件
    ├── AppLayout.tsx
    └── AuthLayout.tsx
```

#### 组件设计原则
- **单一职责**：每个组件只负责一个功能
- **可复用性**：通用组件支持多场景使用
- **可组合性**：复杂组件由简单组件组合而成
- **类型安全**：所有组件都有完整的TypeScript类型

### 8.2 状态管理

#### Zustand Store设计
```typescript
// 认证状态
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
}

// 任务状态
interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (task: CreateTaskData) => Promise<void>
  updateTask: (id: number, task: UpdateTaskData) => Promise<void>
  deleteTask: (id: number) => Promise<void>
}

// 统计状态
interface StatsState {
  taskStats: TaskStats | null
  quadrantStats: QuadrantStats | null
  categoryStats: CategoryStats[]
  timeSeriesData: TimeSeriesData[]
  yearTimeSeriesData: TimeSeriesData[]
  selectedPeriod: 'day' | 'week' | 'month'
  selectedDate: Date
  loading: boolean
  heatmapLoading: boolean
  fetchAllStats: () => Promise<void>
  fetchYearHeatmapData: (year?: number) => Promise<void>
}
```

#### 状态更新策略
- **乐观更新**：UI立即响应，后台同步
- **错误回滚**：请求失败时恢复原状态
- **缓存机制**：避免重复请求相同数据
- **订阅模式**：组件自动响应状态变化

### 8.3 路由设计

#### 路由配置
```typescript
const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ProfilePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> }
    ]
  }
]
```

#### 路由守卫
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <>{children}</>
}
```

## 9. 性能优化策略

### 9.1 前端性能优化

#### 代码分割
```typescript
// 路由级别的代码分割
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))

// 组件级别的代码分割
const HeatmapChart = lazy(() => import('./components/charts/HeatmapChart'))
```

#### 缓存策略
```typescript
// API响应缓存
const apiCache = new Map<string, { data: any, timestamp: number }>()

const getCachedData = (key: string, ttl: number = 5 * 60 * 1000) => {
  const cached = apiCache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  return null
}
```

#### 虚拟化长列表
```typescript
// 使用react-window进行列表虚拟化
const VirtualizedTaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={tasks.length}
      itemSize={80}
      itemData={tasks}
    >
      {TaskItem}
    </FixedSizeList>
  )
}
```

### 9.2 后端性能优化

#### 数据库优化
```sql
-- 创建复合索引
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, urgency, importance);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 查询优化
EXPLAIN QUERY PLAN 
SELECT * FROM tasks 
WHERE user_id = ? AND status = ? 
ORDER BY created_at DESC;
```

#### 缓存机制
```typescript
// Redis缓存（生产环境）
const cache = {
  async get(key: string) {
    return await redis.get(key)
  },
  
  async set(key: string, value: any, ttl: number = 300) {
    await redis.setex(key, ttl, JSON.stringify(value))
  },
  
  async del(key: string) {
    await redis.del(key)
  }
}

// 内存缓存（开发环境）
const memoryCache = new Map<string, { data: any, expires: number }>()
```

#### 请求优化
```typescript
// 批量操作
const batchUpdateTasks = async (updates: TaskUpdate[]) => {
  return await prisma.$transaction(
    updates.map(update => 
      prisma.task.update({
        where: { id: update.id },
        data: update.data
      })
    )
  )
}

// 分页查询
const getPaginatedTasks = async (userId: number, page: number, limit: number) => {
  const offset = (page - 1) * limit
  
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.task.count({ where: { userId } })
  ])
  
  return { tasks, total, page, limit }
}
```

## 10. 安全设计

### 10.1 认证安全

#### JWT安全配置
```typescript
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256',
  issuer: 'task-manager',
  audience: 'task-manager-users'
}

// Token验证中间件
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }
  
  jwt.verify(token, jwtConfig.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}
```

#### 密码安全
```typescript
// 密码强度验证
const validatePassword = (password: string): boolean => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers && 
         hasSpecialChar
}

// 密码加密
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}
```

### 10.2 数据安全

#### 输入验证
```typescript
// 使用Joi进行数据验证
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  urgency: Joi.boolean().required(),
  importance: Joi.boolean().required(),
  dueDate: Joi.date().iso().optional(),
  categoryId: Joi.number().integer().positive().optional()
})

const validateTask = (data: any) => {
  const { error, value } = taskSchema.validate(data)
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`)
  }
  return value
}
```

#### SQL注入防护
```typescript
// 使用Prisma ORM自动防护SQL注入
const getUserTasks = async (userId: number, status?: string) => {
  return await prisma.task.findMany({
    where: {
      userId,
      ...(status && { status: status as TaskStatus })
    }
  })
}
```

### 10.3 API安全

#### 请求限制
```typescript
// 使用express-rate-limit
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
})

// 登录接口特殊限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 最多5次登录尝试
  skipSuccessfulRequests: true
})
```

#### CORS配置
```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
```

## 10. 部署架构

### 10.1 开发环境

#### 本地开发配置
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000/api
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=dev-secret-key
```

### 10.2 生产环境

#### 部署架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Nginx     │    │   Load Balancer │    │   Database      │
│  (Static Files) │    │   (API Gateway) │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Redis Cache   │
│  (Vercel/Netlify)│   │  (Railway/Render)│   │  (Upstash)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 环境配置
```bash
# 生产环境变量
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=super-secure-secret-key
REDIS_URL=redis://user:pass@host:6379
CORS_ORIGIN=https://yourdomain.com
```

### 10.3 CI/CD流程

#### GitHub Actions配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: railway/action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 11. 监控与维护

### 11.1 性能监控

#### 前端监控
```typescript
// 性能指标收集
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart)
    }
  }
})

performanceObserver.observe({ entryTypes: ['navigation', 'measure'] })

// 错误监控
window.addEventListener('error', (event) => {
  console.error('JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})
```

#### 后端监控
```typescript
// API响应时间监控
const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)
  })
  
  next()
}

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})
```

### 11.2 日志管理

#### 结构化日志
```typescript
// 使用winston进行日志管理
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// 请求日志中间件
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  next()
}
```

## 12. 扩展规划

### 12.1 功能扩展

#### 短期规划（1-3个月）
- **任务提醒功能**：邮件/浏览器通知
- **数据导入导出**：支持CSV/JSON格式
- **任务模板**：常用任务模板管理
- **标签系统**：多标签任务分类

#### 中期规划（3-6个月）
- **团队协作**：多用户任务共享
- **移动端应用**：React Native开发
- **离线支持**：PWA + Service Worker
- **高级统计**：更多图表类型和分析维度

#### 长期规划（6-12个月）
- **AI智能推荐**：任务优先级智能建议
- **语音输入**：语音创建任务
- **第三方集成**：日历、邮件等系统集成
- **企业版功能**：权限管理、审批流程

### 12.2 技术升级

#### 架构演进
```
当前架构 → 微服务架构 → 云原生架构
单体应用 → 服务拆分   → 容器化部署
SQLite  → PostgreSQL → 分布式数据库
```

#### 技术栈升级
- **前端**：React 19、Next.js、Micro-frontends
- **后端**：NestJS、GraphQL、gRPC
- **数据库**：PostgreSQL、Redis、Elasticsearch
- **部署**：Docker、Kubernetes、Serverless

## 13. 总结

### 13.1 架构优势

1. **技术先进性**：采用现代化技术栈，保证系统的先进性和可维护性
2. **扩展性强**：模块化设计，支持功能和性能的横向扩展
3. **用户体验佳**：响应式设计、流畅动画、直观交互
4. **性能优异**：多级缓存、懒加载、虚拟化等优化策略
5. **安全可靠**：完善的认证授权、数据验证、错误处理机制

### 13.2 最佳实践

1. **代码质量**：TypeScript类型安全、ESLint代码检查、单元测试覆盖
2. **开发效率**：热更新、自动化部署、组件化开发
3. **运维友好**：结构化日志、健康检查、性能监控
4. **文档完善**：API文档、架构文档、使用说明

### 13.3 持续改进

本架构设计遵循敏捷开发原则，支持快速迭代和持续改进。通过用户反馈、性能监控、技术调研等方式，不断优化系统架构和用户体验，确保系统始终保持竞争力和先进性。