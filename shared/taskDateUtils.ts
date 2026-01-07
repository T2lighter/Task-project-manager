/**
 * 共享的任务日期工具函数
 * 前后端共用，确保一致性
 */

export interface Task {
  id: number;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string | Date;
  // 其他任务属性...
}

// 基础日期工具函数
export const dateUtils = {
  getStartOfDay: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  getEndOfDay: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  },

  getStartOfWeek: (date: Date, weekStartsOn: number = 1): Date => {
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -weekStartsOn : (weekStartsOn - dayOfWeek));
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  },

  getEndOfWeek: (date: Date, weekStartsOn: number = 1): Date => {
    const startOfWeek = dateUtils.getStartOfWeek(date, weekStartsOn);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  },

  getDayAfter: (date: Date): Date => {
    const dayAfter = new Date(date);
    dayAfter.setDate(date.getDate() + 1);
    dayAfter.setHours(0, 0, 0, 0);
    return dayAfter;
  },

  isDateInRange: (date: Date, start: Date, end: Date): boolean => {
    return date >= start && date <= end;
  }
};

// 任务日期检查函数
export const taskDateUtils = {
  isOverdue: (task: Task, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const dayAfterDueDate = dateUtils.getDayAfter(dueDate);
    
    return now >= dayAfterDueDate;
  },

  isDueToday: (task: Task, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const todayStart = dateUtils.getStartOfDay(now);
    const todayEnd = dateUtils.getEndOfDay(now);
    
    return dateUtils.isDateInRange(dueDate, todayStart, todayEnd);
  },

  isDueThisWeek: (task: Task, now: Date = new Date(), weekStartsOn: number = 1): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const weekStart = dateUtils.getStartOfWeek(now, weekStartsOn);
    const weekEnd = dateUtils.getEndOfWeek(now, weekStartsOn);
    
    return dateUtils.isDateInRange(dueDate, weekStart, weekEnd);
  }
};

// 批量检查函数
export const batchTaskDateCheck = {
  getOverdueTasks: (tasks: Task[], now: Date = new Date()): Task[] => {
    return tasks.filter(task => taskDateUtils.isOverdue(task, now));
  },

  getDueTodayTasks: (tasks: Task[], now: Date = new Date()): Task[] => {
    return tasks.filter(task => taskDateUtils.isDueToday(task, now));
  },

  getDueThisWeekTasks: (tasks: Task[], now: Date = new Date()): Task[] => {
    return tasks.filter(task => taskDateUtils.isDueThisWeek(task, now));
  },

  getTaskDateStats: (tasks: Task[], now: Date = new Date()) => {
    const overdue = batchTaskDateCheck.getOverdueTasks(tasks, now).length;
    const dueToday = batchTaskDateCheck.getDueTodayTasks(tasks, now).length;
    const dueThisWeek = batchTaskDateCheck.getDueThisWeekTasks(tasks, now).length;
    
    return {
      overdue,
      dueToday,
      dueThisWeek,
      total: tasks.length
    };
  }
};