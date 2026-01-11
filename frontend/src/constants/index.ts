// 任务状态常量
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
} as const;

// 任务状态显示名称
export const TASK_STATUS_NAMES = {
  [TASK_STATUS.PENDING]: '待办',
  [TASK_STATUS.IN_PROGRESS]: '进行中',
  [TASK_STATUS.COMPLETED]: '已完成'
} as const;

// 任务来源常量
export const TASK_SOURCE = {
  VERBAL: 'verbal',
  EMAIL: 'email',
  IM: 'im'
} as const;

// 任务来源显示名称
export const TASK_SOURCE_NAMES: Record<string, string> = {
  [TASK_SOURCE.VERBAL]: '口头说明',
  [TASK_SOURCE.EMAIL]: '邮件收取',
  [TASK_SOURCE.IM]: '通讯软件'
} as const;

// 任务来源选项列表（用于下拉选择）
export const TASK_SOURCE_OPTIONS = [
  { value: TASK_SOURCE.VERBAL, label: '口头说明', icon: '🗣️' },
  { value: TASK_SOURCE.EMAIL, label: '邮件收取', icon: '📧' },
  { value: TASK_SOURCE.IM, label: '通讯软件', icon: '💬' }
] as const;

// 象限名称
export const QUADRANT_NAMES = {
  'true-true': '紧急且重要',
  'false-true': '重要但不紧急', 
  'true-false': '紧急但不重要',
  'false-false': '既不紧急也不重要'
} as const;

// 优先级配置
export const PRIORITY_CONFIG = {
  URGENT_IMPORTANT: {
    text: '紧急重要',
    color: 'bg-red-100 text-red-800',
    icon: '',
    weight: 4
  },
  IMPORTANT: {
    text: '重要',
    color: 'bg-blue-100 text-blue-800',
    icon: '',
    weight: 2
  },
  URGENT: {
    text: '紧急',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '',
    weight: 3
  },
  NORMAL: {
    text: '普通',
    color: 'bg-gray-100 text-gray-800',
    icon: '',
    weight: 1
  }
} as const;

// 筛选类型
export const FILTER_TYPES = {
  ALL: 'all',
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  DUE_TODAY: 'due-today',
  THIS_WEEK: 'this-week'
} as const;