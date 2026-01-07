import { Task } from '../types';
import { PRIORITY_CONFIG } from '../constants';
import { taskDateUtils } from './dateUtils';

// 获取任务优先级配置
export const getPriorityConfig = (task: Task) => {
  if (task.urgency && task.importance) {
    return PRIORITY_CONFIG.URGENT_IMPORTANT;
  }
  if (!task.urgency && task.importance) {
    return PRIORITY_CONFIG.IMPORTANT;
  }
  if (task.urgency && !task.importance) {
    return PRIORITY_CONFIG.URGENT;
  }
  return PRIORITY_CONFIG.NORMAL;
};

// 获取任务优先级权重
export const getPriorityWeight = (task: Task): number => {
  return getPriorityConfig(task).weight;
};

// 按优先级排序任务
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    const weightA = getPriorityWeight(a);
    const weightB = getPriorityWeight(b);
    
    // 按权重降序排列（高优先级在前）
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    
    // 如果优先级相同，按创建时间排序（新的在前）
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

// 按状态排序任务（用于四象限）
export const sortTasksByStatus = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => {
    // 定义状态权重：进行中(2) > 代办(1)
    const getStatusWeight = (task: Task) => {
      if (task.status === 'in-progress') return 2;
      if (task.status === 'pending') return 1;
      return 0;
    };

    const weightA = getStatusWeight(a);
    const weightB = getStatusWeight(b);
    
    // 按权重降序排列（高权重在前）
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    
    // 如果状态相同，按创建时间排序（新的在前）
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
};

// 检查任务是否逾期（使用统一的工具函数）
export const isTaskOverdue = (task: Task): boolean => {
  return taskDateUtils.isOverdue(task);
};

// 检查任务是否今日到期（使用统一的工具函数）
export const isTaskDueToday = (task: Task): boolean => {
  return taskDateUtils.isDueToday(task);
};

// 检查任务是否本周到期（使用统一的工具函数）
export const isTaskDueThisWeek = (task: Task): boolean => {
  return taskDateUtils.isDueThisWeek(task);
};