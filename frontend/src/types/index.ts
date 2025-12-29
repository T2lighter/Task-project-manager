export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
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

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  urgency: boolean;
  importance: boolean;
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
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  progress: number;
}