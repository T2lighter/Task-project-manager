import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';

const prisma = new PrismaClient();

const normalizeTaskStatus = (status: unknown): 'pending' | 'in-progress' | 'blocked' | 'completed' => {
  if (status === 'pending' || status === 'in-progress' || status === 'blocked' || status === 'completed') {
    return status;
  }
  return 'pending';
};

// 任务日期检查工具函数（使用date-fns优化实现）
export const taskDateUtils = {
  // 检查任务是否逾期（截止日期后一天才算逾期）
  isOverdue: (task: any, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const dayAfterDueDate = new Date(dueDate);
    dayAfterDueDate.setDate(dueDate.getDate() + 1);
    dayAfterDueDate.setHours(0, 0, 0, 0);
    
    return now >= dayAfterDueDate;
  },

  // 检查任务是否今日到期
  isDueToday: (task: any, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const dueDate = new Date(task.dueDate);
    
    return dueDate >= todayStart && dueDate <= todayEnd;
  },

  // 检查任务是否本周到期
  isDueThisWeek: (task: any, now: Date = new Date()): boolean => {
    if (task.status === 'completed' || !task.dueDate) return false;
    
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 周一开始
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const dueDate = new Date(task.dueDate);
    
    return dueDate >= weekStart && dueDate <= weekEnd;
  }
};

// 保持向后兼容性
export const isTaskOverdue = taskDateUtils.isOverdue;
export const isTaskDueToday = taskDateUtils.isDueToday;
export const isTaskDueThisWeek = taskDateUtils.isDueThisWeek;

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
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
  blocked: number;
  completionRate: number;
}

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
  blockedTasks: number;
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

export const getTaskStats = async (userId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<TaskStats> => {
  try {
    const now = new Date();
    
    // 获取所有主任务用于基础统计（排除子任务）
    const allTasks = await prisma.task.findMany({
      where: { 
        userId,
        parentTaskId: null // 只获取主任务
      }
    });

    const total = allTasks.length;
    const completed = allTasks.filter(task => normalizeTaskStatus(task.status) === 'completed').length;
    const inProgress = allTasks.filter(task => normalizeTaskStatus(task.status) === 'in-progress').length;
    const pending = allTasks.filter(task => normalizeTaskStatus(task.status) === 'pending').length;
    const blocked = allTasks.filter(task => normalizeTaskStatus(task.status) === 'blocked').length;

    // 使用统一的工具函数计算逾期任务
    const overdue = allTasks.filter(task => isTaskOverdue(task, now)).length;

    // 使用统一的工具函数计算今日到期任务
    const dueToday = allTasks.filter(task => isTaskDueToday(task, now)).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const overdueRate = total > 0 ? (overdue / total) * 100 : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      overdue,
      dueToday,
      completionRate,
      overdueRate
    };
  } catch (error) {
    console.error('获取任务统计时出错:', error);
    throw error;
  }
};

export const getQuadrantStats = async (userId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<QuadrantStats> => {
  try {
    console.log(`获取用户 ${userId} 的四象限统计数据（排除已完成任务和子任务）`);
    
    // 只获取未完成的主任务（排除 completed 状态和子任务）
    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        status: {
          not: 'completed'
        },
        parentTaskId: null // 只获取主任务
      }
    });

    console.log(`找到 ${tasks.length} 个未完成任务`);
    
    const urgentImportant = tasks.filter(task => task.urgency === true && task.importance === true).length;
    const importantNotUrgent = tasks.filter(task => task.urgency === false && task.importance === true).length;
    const urgentNotImportant = tasks.filter(task => task.urgency === true && task.importance === false).length;
    const neitherUrgentNorImportant = tasks.filter(task => task.urgency === false && task.importance === false).length;

    const quadrantStats = {
      urgentImportant,
      importantNotUrgent,
      urgentNotImportant,
      neitherUrgentNorImportant,
    };

    console.log('四象限统计结果（未完成主任务）:', quadrantStats);

    return quadrantStats;
  } catch (error) {
    console.error('获取四象限统计时出错:', error);
    throw error;
  }
};

export const getTimeSeriesData = async (
  userId: number, 
  period: 'day' | 'week' | 'month' = 'day',
  targetDate: Date = new Date()
): Promise<TimeSeriesData[]> => {
  const result: TimeSeriesData[] = [];
  
  try {
    // 简化实现：直接获取主任务数据，在内存中处理
    const tasks = await prisma.task.findMany({
      where: { 
        userId,
        parentTaskId: null // 只获取主任务
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true
      }
    });
    
    // 根据时间周期生成数据点
    let rangeStart: Date;
    let rangeEnd: Date;
    
    switch (period) {
      case 'day':
        rangeStart = startOfDay(targetDate);
        rangeEnd = endOfDay(targetDate);
        break;
      case 'week':
        rangeStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        rangeEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
        break;
      case 'month':
        rangeStart = startOfMonth(targetDate);
        rangeEnd = endOfMonth(targetDate);
        break;
    }
    
    const allDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    
    allDays.forEach(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const created = tasks.filter(task => {
        const taskDate = task.createdAt;
        return taskDate >= dayStart && taskDate <= dayEnd;
      }).length;
      
      const completed = tasks.filter(task => {
        const taskDate = task.updatedAt;
        return normalizeTaskStatus(task.status) === 'completed' && taskDate >= dayStart && taskDate <= dayEnd;
      }).length;
      
      result.push({
        date: format(date, 'yyyy-MM-dd'),
        created,
        completed
      });
    });
    
  } catch (error) {
    console.error('查询时间序列数据时出错:', error);
    return [];
  }
  
  return result;
};

// 获取年度热力图数据（高性能实现）
export const getYearHeatmapData = async (
  userId: number, 
  year: number = new Date().getFullYear()
): Promise<TimeSeriesData[]> => {
  try {
    console.log(`获取用户 ${userId} 的 ${year} 年度热力图数据`);
    
    // 获取用户的所有任务（包括主任务和子任务）
    const allTasks = await prisma.task.findMany({
      where: { 
        userId
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
        parentTaskId: true
      }
    });
    
    // 分离主任务和子任务
    const mainTasks = allTasks.filter(task => !task.parentTaskId);
    const subtasks = allTasks.filter(task => task.parentTaskId);
    
    console.log(`获取到用户 ${userId} 的 ${mainTasks.length} 个主任务和 ${subtasks.length} 个子任务`);
    
    // 创建高效的Map索引 - 主任务
    const createdMap = new Map<string, number>();
    const completedMap = new Map<string, number>();
    
    // 创建高效的Map索引 - 子任务
    const subtaskCreatedMap = new Map<string, number>();
    const subtaskCompletedMap = new Map<string, number>();
    
    // 处理主任务统计
    mainTasks.forEach(task => {
      const createdYear = task.createdAt.getFullYear();
      if (createdYear === year) {
        const createdDate = format(task.createdAt, 'yyyy-MM-dd');
        createdMap.set(createdDate, (createdMap.get(createdDate) || 0) + 1);
      }
      
      if (normalizeTaskStatus(task.status) === 'completed') {
        const completedYear = task.updatedAt.getFullYear();
        if (completedYear === year) {
          const completedDate = format(task.updatedAt, 'yyyy-MM-dd');
          completedMap.set(completedDate, (completedMap.get(completedDate) || 0) + 1);
        }
      }
    });
    
    // 处理子任务统计
    subtasks.forEach(task => {
      const createdYear = task.createdAt.getFullYear();
      if (createdYear === year) {
        const createdDate = format(task.createdAt, 'yyyy-MM-dd');
        subtaskCreatedMap.set(createdDate, (subtaskCreatedMap.get(createdDate) || 0) + 1);
      }
      
      if (normalizeTaskStatus(task.status) === 'completed') {
        const completedYear = task.updatedAt.getFullYear();
        if (completedYear === year) {
          const completedDate = format(task.updatedAt, 'yyyy-MM-dd');
          subtaskCompletedMap.set(completedDate, (subtaskCompletedMap.get(completedDate) || 0) + 1);
        }
      }
    });
    
    console.log(`${year} 年统计 - 主任务创建: ${createdMap.size} 天, 完成: ${completedMap.size} 天`);
    console.log(`${year} 年统计 - 子任务创建: ${subtaskCreatedMap.size} 天, 完成: ${subtaskCompletedMap.size} 天`);
    
    // 生成年度所有日期（365/366天）
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    // 快速生成结果数组
    const result: TimeSeriesData[] = allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return {
        date: dateStr,
        created: createdMap.get(dateStr) || 0,
        completed: completedMap.get(dateStr) || 0,
        subtaskCreated: subtaskCreatedMap.get(dateStr) || 0,
        subtaskCompleted: subtaskCompletedMap.get(dateStr) || 0
      };
    });
    
    // 统计信息
    const totalCreated = Array.from(createdMap.values()).reduce((sum, count) => sum + count, 0);
    const totalCompleted = Array.from(completedMap.values()).reduce((sum, count) => sum + count, 0);
    const totalSubtaskCreated = Array.from(subtaskCreatedMap.values()).reduce((sum, count) => sum + count, 0);
    const totalSubtaskCompleted = Array.from(subtaskCompletedMap.values()).reduce((sum, count) => sum + count, 0);
    const activeDays = result.filter(item => 
      item.created > 0 || item.completed > 0 || 
      (item.subtaskCreated || 0) > 0 || (item.subtaskCompleted || 0) > 0
    ).length;
    
    console.log(`年度统计 - 主任务创建: ${totalCreated}, 完成: ${totalCompleted}`);
    console.log(`年度统计 - 子任务创建: ${totalSubtaskCreated}, 完成: ${totalSubtaskCompleted}`);
    console.log(`年度统计 - 活跃天数: ${activeDays}/${result.length}`);
    
    return result;
    
  } catch (error) {
    console.error('获取年度热力图数据失败:', error);
    return [];
  }
};

export const getCategoryStats = async (userId: number, period: 'day' | 'week' | 'month' = 'month'): Promise<CategoryStats[]> => {
  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      tasks: {
        where: {
          parentTaskId: null // 只包含主任务
        }
      }
    }
  });

  return categories.map(category => {
    const total = category.tasks.length;
    const completed = category.tasks.filter(task => normalizeTaskStatus(task.status) === 'completed').length;
    const pending = category.tasks.filter(task => normalizeTaskStatus(task.status) === 'pending').length;
    const inProgress = category.tasks.filter(task => normalizeTaskStatus(task.status) === 'in-progress').length;
    const blocked = category.tasks.filter(task => normalizeTaskStatus(task.status) === 'blocked').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      total,
      completed,
      pending,
      inProgress,
      blocked,
      completionRate
    };
  }).filter(stat => stat.total > 0);
};

// 获取项目统计
export const getProjectStats = async (userId: number): Promise<ProjectStats> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId }
    });

    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const planning = projects.filter(p => p.status === 'planning').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const cancelled = projects.filter(p => p.status === 'cancelled').length;
    const completionRate = total > 0 ? completed / total : 0;

    return {
      total,
      active,
      completed,
      planning,
      onHold,
      cancelled,
      completionRate
    };
  } catch (error) {
    console.error('获取项目统计时出错:', error);
    throw error;
  }
};

// 获取项目任务统计
export const getProjectTaskStats = async (userId: number): Promise<ProjectTaskStats[]> => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: {
          where: {
            parentTaskId: null // 只包含主任务
          }
        }
      }
    });

    const now = new Date();

    return projects.map(project => {
      const tasks = project.tasks;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => normalizeTaskStatus(task.status) === 'completed').length;
      const inProgressTasks = tasks.filter(task => normalizeTaskStatus(task.status) === 'in-progress').length;
      const pendingTasks = tasks.filter(task => normalizeTaskStatus(task.status) === 'pending').length;
      const blockedTasks = tasks.filter(task => normalizeTaskStatus(task.status) === 'blocked').length;
      
      // 使用统一的工具函数计算逾期任务
      const overdueTasks = tasks.filter(task => isTaskOverdue(task, now)).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const progress = completionRate;

      return {
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status, // 新增：项目状态
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        blockedTasks,
        overdueTasks,
        completionRate,
        progress
      };
    }); // 返回所有项目，包括没有任务的项目
  } catch (error) {
    console.error('获取项目任务统计时出错:', error);
    throw error;
  }
};

// 获取任务耗时排行数据
export const getTaskDurationRanking = async (userId: number, year?: number): Promise<TaskDurationData[]> => {
  try {
    const targetYear = year || new Date().getFullYear();
    
    // 获取指定年份相关的任务（创建时间、更新时间或截止时间在该年份）
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        parentTaskId: null, // 只获取主任务
        OR: [
          // 任务创建时间在目标年份
          {
            createdAt: {
              gte: new Date(`${targetYear}-01-01`),
              lt: new Date(`${targetYear + 1}-01-01`)
            }
          },
          // 任务更新时间在目标年份（用于已完成任务）
          {
            updatedAt: {
              gte: new Date(`${targetYear}-01-01`),
              lt: new Date(`${targetYear + 1}-01-01`)
            }
          },
          // 任务截止时间在目标年份
          {
            dueDate: {
              gte: new Date(`${targetYear}-01-01`),
              lt: new Date(`${targetYear + 1}-01-01`)
            }
          }
        ]
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    });

    const now = new Date();
    
    return tasks.map(task => {
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      let durationDays = 0;

      const normalizedStatus = normalizeTaskStatus(task.status);

      // 确定任务的开始时间
      startDate = task.createdAt;

      // 确定任务的结束时间
      if (normalizedStatus === 'completed') {
        // 已完成任务使用更新时间作为结束时间
        endDate = task.updatedAt;
      } else if (normalizedStatus === 'in-progress') {
        // 处理中任务使用当前时间作为结束时间
        endDate = now;
      } else if (normalizedStatus === 'blocked') {
        // 阻塞任务使用当前时间作为结束时间
        endDate = now;
      } else if (task.dueDate) {
        // 待办任务如果有截止时间，使用截止时间作为预期结束时间
        endDate = new Date(task.dueDate);
      }

      // 计算持续天数
      if (startDate && endDate) {
        const diffTime = endDate.getTime() - startDate.getTime();
        durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // 至少1天
      }

      return {
        taskId: task.id,
        taskTitle: task.title,
        startDate,
        endDate,
        durationDays,
        status: normalizedStatus,
        projectName: task.project?.name
      };
    }).filter(task => task.durationDays > 0); // 只返回有持续时间的任务
  } catch (error) {
    console.error('获取任务耗时排行时出错:', error);
    throw error;
  }
};