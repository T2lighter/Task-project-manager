export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

// 个性化标签类型定义
export interface CustomLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 任务标签关联类型定义
export interface TaskLabel {
  id: number;
  taskId: number;
  labelId: number;
  label?: CustomLabel;
  createdAt?: Date;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: ProjectNote[]; // 修改：项目记录列表
  objectives?: Objective[]; // 新增：项目OKR目标列表
  // 项目统计信息（可选，用于显示）
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number; // 完成百分比
}

export interface ProjectNote {
  id: number;
  title: string;
  content: string;
  type: 'note' | 'summary' | 'meeting' | 'issue' | 'milestone' | 'reflection';
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  userId: number;
}

// OKR相关类型定义
export interface Objective {
  id: number;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  startDate?: Date;
  endDate?: Date;
  projectId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  keyResults?: KeyResult[];
  resourceRequirements?: ResourceRequirement[];
  executionPlans?: ExecutionPlan[];
  actionChecks?: ActionCheck[];
}

export interface KeyResult {
  id: number;
  description?: string; // 描述
  status: 'not-started' | 'in-progress' | 'completed' | 'at-risk'; // 状态
  progress: number; // 进度 0-100
  objectiveId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  updates?: KeyResultUpdate[];
}

export interface KeyResultUpdate {
  id: number;
  progress: number; // 进度
  note?: string; // 更新说明
  keyResultId: number;
  userId: number;
  createdAt: Date;
}

// 资源需求 (简化版本)
export interface ResourceRequirement {
  id: number;
  title: string; // 资源需求标题
  description?: string; // 详细描述
  type: 'human' | 'financial' | 'material' | 'technical' | 'other'; // 资源类型
  status: 'requested' | 'approved' | 'allocated' | 'completed'; // 状态
  objectiveId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// 执行计划 (简化版本)
export interface ExecutionPlan {
  id: number;
  title: string; // 执行计划标题
  description?: string; // 详细描述
  phase: string; // 阶段名称
  objectiveId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// 行动检查 (简化版本 - 可编辑的checklist)
export interface ActionCheck {
  id: number;
  title: string; // 行动检查标题
  description?: string; // 详细描述
  checkType: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'custom';
  criteria?: string; // 检查标准 (存储为JSON字符串的checklist)
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  objectiveId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  urgency: boolean;
  importance: boolean;
  source?: 'verbal' | 'email' | 'im'; // 任务来源：口头说明、邮件收取、通讯软件
  dueDate?: Date;
  userId: number;
  categoryId?: number;
  category?: Category;
  projectId?: number; // 新增：关联项目ID
  project?: Project;  // 新增：关联项目信息
  createdAt?: Date;
  updatedAt?: Date;
  
  // 子任务相关字段
  parentTaskId?: number;
  parentTask?: Task;
  subtasks?: Task[];
  
  // 个性化标签相关字段
  labels?: TaskLabel[]; // 任务关联的标签
}

// 统计相关类型定义
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  overdueRate: number;
}

export interface QuadrantStats {
  urgentImportant: number;
  importantNotUrgent: number;
  urgentNotImportant: number;
  neitherUrgentNorImportant: number;
}

export interface TimeSeriesData {
  date: string;
  completed: number;
  created: number;
  // 子任务统计
  subtaskCompleted?: number;
  subtaskCreated?: number;
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

// 项目统计相关类型定义
export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  planning: number;
  onHold: number;
  cancelled: number;
  completionRate: number;
}

export interface ProjectTaskStats {
  projectId: number;
  projectName: string;
  projectStatus: string; // 新增：项目状态
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  progress: number;
}

export interface TaskDurationData {
  taskId: number;
  taskTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  durationDays: number;
  status: string;
  projectName?: string;
}