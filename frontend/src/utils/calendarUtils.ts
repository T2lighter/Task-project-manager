import { Task } from '../types';

// 常量定义
const DAYS_PER_WEEK = 7;
const TIMEZONE = 'Asia/Shanghai';
const DATE_FORMAT = 'en-CA';

// 月份名称常量
const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
] as const;

// 星期名称常量
const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;

// 任务优先级权重常量
const PRIORITY_WEIGHTS = {
  URGENT_IMPORTANT: 4,
  URGENT: 3,
  IMPORTANT: 2,
  NORMAL: 1
} as const;

// 任务状态权重常量
const STATUS_WEIGHTS = {
  IN_PROGRESS: 3,
  PENDING: 2,
  COMPLETED: 1
} as const;

// 获取月份的所有日期（优化版本）
export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // 计算日历网格的开始和结束日期
  const startDayOfWeek = firstDay.getDay();
  const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const endDayOfWeek = lastDay.getDay();
  const daysToAdd = endDayOfWeek === 0 ? 0 : DAYS_PER_WEEK - endDayOfWeek;
  
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - daysToSubtract);
  
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + daysToAdd);
  
  // 计算总天数并预分配数组
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const days: Date[] = new Array(totalDays);
  
  // 填充日期数组
  const currentDate = new Date(startDate);
  for (let i = 0; i < totalDays; i++) {
    days[i] = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// 获取任务优先级权重（优化版本）
const getTaskPriorityWeight = (task: Task): number => {
  if (task.urgency && task.importance) return PRIORITY_WEIGHTS.URGENT_IMPORTANT;
  if (task.urgency && !task.importance) return PRIORITY_WEIGHTS.URGENT;
  if (!task.urgency && task.importance) return PRIORITY_WEIGHTS.IMPORTANT;
  return PRIORITY_WEIGHTS.NORMAL;
};

// 获取任务状态权重（优化版本）
const getTaskStatusWeight = (task: Task): number => {
  switch (task.status) {
    case 'in-progress': return STATUS_WEIGHTS.IN_PROGRESS;
    case 'pending': return STATUS_WEIGHTS.PENDING;
    default: return STATUS_WEIGHTS.COMPLETED;
  }
};

// 任务排序比较函数（提取公共逻辑）
export const compareTasksByPriority = (a: Task, b: Task): number => {
  // 按优先级权重排序
  const weightA = getTaskPriorityWeight(a);
  const weightB = getTaskPriorityWeight(b);
  
  if (weightA !== weightB) {
    return weightB - weightA; // 降序：高优先级在前
  }
  
  // 相同优先级按状态排序
  const statusWeightA = getTaskStatusWeight(a);
  const statusWeightB = getTaskStatusWeight(b);
  
  if (statusWeightA !== statusWeightB) {
    return statusWeightB - statusWeightA; // 降序：进行中 > 待办 > 已完成
  }
  
  // 最后按创建时间排序
  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return timeA - timeB; // 升序：早创建的在前
};

// 按日期分组任务（优化版本）
export const groupTasksByDate = (tasks: Task[]): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};
  const taskMap = new Map<number, Task>(); // 用于去重
  
  // 预处理任务，建立ID映射
  tasks.forEach(task => {
    taskMap.set(task.id, task);
  });
  
  tasks.forEach(task => {
    const startDate = task.createdAt ? new Date(task.createdAt) : null;
    const endDate = task.dueDate ? new Date(task.dueDate) : null;
    
    if (endDate) {
      if (startDate && startDate < endDate) {
        // 跨日任务：显示持续期间
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateKey = formatDateKey(currentDate);
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(task);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // 单日任务：只在截止日期显示
        const dateKey = formatDateKey(endDate);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    }
  });
  
  // 对每天的任务排序并去重
  Object.keys(grouped).forEach(dateKey => {
    // 去重：使用Map确保同一任务只出现一次
    const uniqueTasks = Array.from(
      new Map(grouped[dateKey].map(task => [task.id, task])).values()
    );
    
    // 使用统一的排序函数
    uniqueTasks.sort(compareTasksByPriority);
    grouped[dateKey] = uniqueTasks;
  });
  
  return grouped;
};

// 格式化日期为键值（优化版本）
export const formatDateKey = (date: Date): string => {
  return date.toLocaleDateString(DATE_FORMAT, { timeZone: TIMEZONE });
};

// 检查是否为今天（优化版本）
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDateKey(today) === formatDateKey(date);
};

// 检查是否为当前月份
export const isCurrentMonth = (date: Date, currentMonth: number): boolean => {
  return date.getMonth() === currentMonth;
};

// 获取月份名称（优化版本）
export const getMonthName = (month: number): string => {
  return MONTH_NAMES[month] || '';
};

// 获取星期名称（优化版本）
export const getWeekDays = (): readonly string[] => {
  return WEEK_DAYS;
};

// 获取任务在特定日期的显示类型
export const getTaskDisplayType = (task: Task, currentDate: Date): 'single' | 'start' | 'middle' | 'end' => {
  const startDate = task.createdAt ? new Date(task.createdAt) : null;
  const endDate = task.dueDate ? new Date(task.dueDate) : null;
  
  if (!startDate || !endDate) {
    return 'single';
  }
  
  const currentDateStr = formatDateKey(currentDate);
  const startDateStr = formatDateKey(startDate);
  const endDateStr = formatDateKey(endDate);
  
  if (startDateStr === endDateStr) {
    return 'single';
  }
  
  if (currentDateStr === startDateStr) {
    return 'start';
  } else if (currentDateStr === endDateStr) {
    return 'end';
  } else {
    return 'middle';
  }
};

// 检查任务是否跨越多天（优化版本）
export const isMultiDayTask = (task: Task): boolean => {
  if (!task.createdAt || !task.dueDate) {
    return false;
  }
  
  return formatDateKey(new Date(task.createdAt)) !== formatDateKey(new Date(task.dueDate));
};

// 计算任务的持续天数（优化版本）
export const getTaskDuration = (task: Task): number => {
  if (!task.createdAt || !task.dueDate) {
    return 1;
  }
  
  const startDate = new Date(task.createdAt);
  const endDate = new Date(task.dueDate);
  const timeDiff = endDate.getTime() - startDate.getTime();
  
  return Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1);
};

// 计算跨格任务的布局信息
export interface TaskLayout {
  task: Task;
  startCol: number;  // 开始列（0-6）
  endCol: number;    // 结束列（0-6）
  startRow: number;  // 开始行
  endRow: number;    // 结束行
  layer: number;     // 垂直层级（0, 1, 2...）
  spans: Array<{     // 每一行的跨度信息
    row: number;
    startCol: number;
    endCol: number;
    isStart: boolean;
    isEnd: boolean;
    layer: number;   // 该跨度的层级
  }>;
}

// 计算任务在日历网格中的布局
export const calculateTaskLayouts = (tasks: Task[], monthDays: Date[]): TaskLayout[] => {
  const layouts: TaskLayout[] = [];
  
  // 创建日期到网格位置的映射
  const dateToPosition = new Map<string, { row: number; col: number }>();
  monthDays.forEach((date, index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    dateToPosition.set(formatDateKey(date), { row, col });
  });
  
  // 用于跟踪每个网格位置的占用情况
  const occupiedLayers = new Map<string, Set<number>>(); // key: "row-col", value: Set of occupied layers
  
  tasks.forEach(task => {
    if (!isMultiDayTask(task)) return;
    
    let startDate: Date;
    const endDate = task.dueDate ? new Date(task.dueDate) : null;
    
    if (!endDate) return;
    
    // 如果有创建时间，使用创建时间；否则使用今天作为开始时间
    if (task.createdAt) {
      startDate = new Date(task.createdAt);
    } else {
      startDate = new Date(); // 使用今天
    }
    
    const startPos = dateToPosition.get(formatDateKey(startDate));
    const endPos = dateToPosition.get(formatDateKey(endDate));
    
    if (!startPos || !endPos) return;
    
    // 计算任务占用的所有网格位置
    const occupiedPositions: Array<{row: number, col: number}> = [];
    
    if (startPos.row === endPos.row) {
      // 同一行
      for (let col = startPos.col; col <= endPos.col; col++) {
        occupiedPositions.push({ row: startPos.row, col });
      }
    } else {
      // 跨多行
      for (let row = startPos.row; row <= endPos.row; row++) {
        if (row === startPos.row) {
          // 第一行：从开始列到第6列
          for (let col = startPos.col; col <= 6; col++) {
            occupiedPositions.push({ row, col });
          }
        } else if (row === endPos.row) {
          // 最后一行：从第0列到结束列
          for (let col = 0; col <= endPos.col; col++) {
            occupiedPositions.push({ row, col });
          }
        } else {
          // 中间行：整行
          for (let col = 0; col <= 6; col++) {
            occupiedPositions.push({ row, col });
          }
        }
      }
    }
    
    // 找到可用的层级
    let availableLayer = 0;
    while (true) {
      let layerAvailable = true;
      
      // 检查这个层级是否在所有占用位置都可用
      for (const pos of occupiedPositions) {
        const posKey = `${pos.row}-${pos.col}`;
        const occupied = occupiedLayers.get(posKey) || new Set();
        if (occupied.has(availableLayer)) {
          layerAvailable = false;
          break;
        }
      }
      
      if (layerAvailable) {
        break;
      }
      availableLayer++;
    }
    
    // 标记这些位置的这个层级为已占用
    for (const pos of occupiedPositions) {
      const posKey = `${pos.row}-${pos.col}`;
      if (!occupiedLayers.has(posKey)) {
        occupiedLayers.set(posKey, new Set());
      }
      occupiedLayers.get(posKey)!.add(availableLayer);
    }
    
    // 计算跨度信息
    const spans: TaskLayout['spans'] = [];
    
    if (startPos.row === endPos.row) {
      // 同一行
      spans.push({
        row: startPos.row,
        startCol: startPos.col,
        endCol: endPos.col,
        isStart: true,
        isEnd: true,
        layer: availableLayer
      });
    } else {
      // 跨多行
      for (let row = startPos.row; row <= endPos.row; row++) {
        if (row === startPos.row) {
          // 第一行：从开始列到第6列
          spans.push({
            row,
            startCol: startPos.col,
            endCol: 6,
            isStart: true,
            isEnd: false,
            layer: availableLayer
          });
        } else if (row === endPos.row) {
          // 最后一行：从第0列到结束列
          spans.push({
            row,
            startCol: 0,
            endCol: endPos.col,
            isStart: false,
            isEnd: true,
            layer: availableLayer
          });
        } else {
          // 中间行：整行
          spans.push({
            row,
            startCol: 0,
            endCol: 6,
            isStart: false,
            isEnd: false,
            layer: availableLayer
          });
        }
      }
    }
    
    layouts.push({
      task,
      startCol: startPos.col,
      endCol: endPos.col,
      startRow: startPos.row,
      endRow: endPos.row,
      layer: availableLayer,
      spans
    });
  });
  
  return layouts;
};