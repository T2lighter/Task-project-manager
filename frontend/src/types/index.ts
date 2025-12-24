export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
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
  createdAt?: Date;
  updatedAt?: Date;
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