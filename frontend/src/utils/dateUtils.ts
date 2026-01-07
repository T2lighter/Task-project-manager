import { Task } from '../types';

/**
 * 日期工具函数模块
 * 提供统一的日期处理功能，避免重复代码
 */

// 获取今日开始时间（00:00:00）
export const getStartOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// 获取今日结束时间（23:59:59）
export const getEndOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
};

// 获取本周开始时间（周一 00:00:00）
export const getStartOfWeek = (date: Date): Date => {
  const startOfWeek = new Date(date);
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

// 获取本周结束时间（周日 23:59:59）
export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

// 获取指定日期后一天的开始时间
export const getDayAfter = (date: Date): Date => {
  const dayAfter = new Date(date);
  dayAfter.setDate(date.getDate() + 1);
  dayAfter.setHours(0, 0, 0, 0);
  return dayAfter;
};

// 检查日期是否在指定范围内
export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

// 任务日期检查工具函数（基于上述基础函数）
export const taskDateUtils = {
  // 检查任务是否逾期（截止日期后一天才算逾期）
  isOverdue: (task: Task, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const dayAfterDueDate = getDayAfter(dueDate);
    
    return now >= dayAfterDueDate;
  },

  // 检查任务是否今日到期
  isDueToday: (task: Task, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);
    
    return isDateInRange(dueDate, todayStart, todayEnd);
  },

  // 检查任务是否本周到期
  isDueThisWeek: (task: Task, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const weekStart = getStartOfWeek(now);
    const weekEnd = getEndOfWeek(now);
    
    return isDateInRange(dueDate, weekStart, weekEnd);
  }
};