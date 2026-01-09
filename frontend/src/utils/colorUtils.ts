/**
 * 统一颜色配置系统
 * 基于DRY原则，集中管理所有颜色配置
 * 
 * @description
 * 消除颜色配置的重复定义，提供一致的颜色主题
 * 支持Tailwind CSS类名和颜色值的映射
 */

// 基础颜色映射 - 支持HEX到Tailwind类的转换
export const BASE_COLORS = {
  // 标准颜色
  RED: '#EF4444',
  ORANGE: '#F97316', 
  AMBER: '#F59E0B',
  YELLOW: '#EAB308',
  LIME: '#84CC16',
  GREEN: '#22C55E',
  EMERALD: '#10B981',
  TEAL: '#14B8A6',
  CYAN: '#06B6D4',
  SKY: '#0EA5E9',
  BLUE: '#3B82F6',
  INDIGO: '#6366F1',
  VIOLET: '#8B5CF6',
  PURPLE: '#A855F7',
  FUCHSIA: '#D946EF',
  PINK: '#EC4899',
  ROSE: '#F43F5E',
  GRAY: '#6B7280',
  GRAY_DARK: '#374151',
  GRAY_DARKEST: '#1F2937'
} as const;

// 任务状态颜色配置
export const TASK_STATUS_COLORS = {
  pending: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-100',
    bgDark: 'bg-yellow-800',
    color: BASE_COLORS.YELLOW
  },
  'in-progress': {
    border: 'border-blue-500',
    text: 'text-blue-600', 
    bg: 'bg-blue-100',
    bgDark: 'bg-blue-800',
    color: BASE_COLORS.BLUE
  },
  completed: {
    border: 'border-green-500',
    text: 'text-green-600',
    bg: 'bg-green-100', 
    bgDark: 'bg-green-800',
    color: BASE_COLORS.GREEN
  },
  overdue: {
    border: 'border-red-500',
    text: 'text-red-600',
    bg: 'bg-red-100',
    bgDark: 'bg-red-800', 
    color: BASE_COLORS.RED
  }
} as const;

// 四象限颜色配置
export const QUADRANT_COLORS = {
  urgentImportant: {
    border: 'border-red-500',
    text: 'text-red-600',
    bg: 'bg-red-100',
    color: BASE_COLORS.RED
  },
  importantNotUrgent: {
    border: 'border-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-100',
    color: BASE_COLORS.BLUE
  },
  urgentNotImportant: {
    border: 'border-yellow-500',
    text: 'text-yellow-600',
    bg: 'bg-yellow-100',
    color: BASE_COLORS.YELLOW
  },
  notUrgentNotImportant: {
    border: 'border-gray-500',
    text: 'text-gray-600',
    bg: 'bg-gray-100',
    color: BASE_COLORS.GRAY
  }
} as const;

// UI元素颜色配置
export const UI_COLORS = {
  primary: {
    bg: 'bg-blue-600',
    bgHover: 'bg-blue-700',
    text: 'text-blue-600',
    textHover: 'text-blue-800',
    bgLight: 'bg-blue-50',
    textDark: 'text-blue-700',
    border: 'border-blue-500',
    borderLight: 'border-blue-200',
    ring: 'ring-blue-500',
    color: BASE_COLORS.BLUE
  },
  secondary: {
    bg: 'bg-gray-600',
    bgHover: 'bg-gray-700',
    text: 'text-gray-600',
    textHover: 'text-gray-800',
    bgLight: 'bg-gray-50',
    textDark: 'text-gray-700',
    border: 'border-gray-500',
    borderLight: 'border-gray-200',
    color: BASE_COLORS.GRAY
  },
  gray50: 'bg-gray-50',
  gray100: 'bg-gray-100',
  gray200: 'bg-gray-200',
  gray300: 'bg-gray-300',
  gray400: 'bg-gray-400',
  gray500: 'bg-gray-500',
  gray600: 'bg-gray-600',
  gray700: 'bg-gray-700',
  gray800: 'bg-gray-800',
  gray900: 'bg-gray-900',
  grayText50: 'text-gray-50',
  grayText100: 'text-gray-100',
  grayText200: 'text-gray-200',
  grayText300: 'text-gray-300',
  grayText400: 'text-gray-400',
  grayText500: 'text-gray-500',
  grayText600: 'text-gray-600',
  grayText700: 'text-gray-700',
  grayText800: 'text-gray-800',
  grayText900: 'text-gray-900',
  grayBorder100: 'border-gray-100',
  grayBorder200: 'border-gray-200',
  grayBorder300: 'border-gray-300',
  grayBorder400: 'border-gray-400',
  grayBorder500: 'border-gray-500',
  grayHover100: 'hover:bg-gray-100',
  grayHover200: 'hover:bg-gray-200',
  grayHover300: 'hover:bg-gray-300',
  grayHoverText600: 'hover:text-gray-600',
  grayHoverText700: 'hover:text-gray-700',
  grayHoverText800: 'hover:text-gray-800',
  blue50: 'bg-blue-50',
  blue100: 'bg-blue-100',
  blue200: 'bg-blue-200',
  blue300: 'bg-blue-300',
  blue400: 'bg-blue-400',
  blue500: 'bg-blue-500',
  blue600: 'bg-blue-600',
  blue700: 'bg-blue-700',
  blue800: 'bg-blue-800',
  blue900: 'bg-blue-900',
  blueText50: 'text-blue-50',
  blueText100: 'text-blue-100',
  blueText200: 'text-blue-200',
  blueText300: 'text-blue-300',
  blueText400: 'text-blue-400',
  blueText500: 'text-blue-500',
  blueText600: 'text-blue-600',
  blueText700: 'text-blue-700',
  blueText800: 'text-blue-800',
  blueText900: 'text-blue-900',
  blueBorder200: 'border-blue-200',
  blueBorder300: 'border-blue-300',
  blueBorder500: 'border-blue-500',
  blueRing500: 'ring-blue-500',
  blueHover100: 'hover:bg-blue-100',
  blueHover200: 'hover:bg-blue-200',
  blueHover600: 'hover:bg-blue-600',
  blueHover700: 'hover:bg-blue-700',
  blueHoverText600: 'hover:text-blue-600',
  blueHoverText700: 'hover:text-blue-700',
  blueHoverText800: 'hover:text-blue-800',
  placeholder: 'placeholder-gray-500',
  // 红色系颜色
  red50: 'bg-red-50',
  red100: 'bg-red-100',
  red200: 'bg-red-200',
  red600: 'text-red-600',
  redBorder200: 'border-red-200',
  // 复选框红色配置
  checkboxRedText: 'text-red-600',
  checkboxRedRing: 'focus:ring-red-500',
  // 输入框相关颜色
  inputHoverBg: 'hover:bg-gray-100',
  inputHoverText: 'hover:text-gray-600',
  // 视图模式按钮颜色
  viewModeActive: 'bg-blue-600 text-white shadow-md transform scale-105',
  viewModeInactive: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
  // 批量删除相关颜色
  batchDeleteBg: 'bg-gray-100',
  batchDeleteText: 'text-gray-600',
  batchDeleteHoverRedBg: 'hover:bg-red-100',
  batchDeleteHoverRedText: 'hover:text-red-600',
  // 错误状态颜色
  errorBg50: 'bg-red-50',
  errorBorder200: 'border-red-200',
  // 复选框红色配置
  checkboxRed: 'text-red-600 focus:ring-red-500',
  success: {
    bg: 'bg-green-600',
    bgHover: 'bg-green-700',
    text: 'text-green-600',
    textHover: 'text-green-800',
    bgLight: 'bg-green-50',
    textDark: 'text-green-700',
    border: 'border-green-500',
    borderLight: 'border-green-200',
    color: BASE_COLORS.GREEN
  },
  warning: {
    bg: 'bg-yellow-600',
    bgHover: 'bg-yellow-700',
    text: 'text-yellow-600',
    textHover: 'text-yellow-800',
    bgLight: 'bg-yellow-50',
    textDark: 'text-yellow-700',
    border: 'border-yellow-500',
    borderLight: 'border-yellow-200',
    color: BASE_COLORS.YELLOW
  },
  danger: {
    bg: 'bg-red-600',
    bgHover: 'bg-red-700',
    text: 'text-red-600',
    textHover: 'text-red-800',
    bgLight: 'bg-red-50',
    textDark: 'text-red-700',
    border: 'border-red-500',
    borderLight: 'border-red-200',
    ring: 'ring-red-500',
    color: BASE_COLORS.RED
  },
  
  // 背景色
  bgWhite: 'bg-white',
  bgGray50: 'bg-gray-50',
  bgGray100: 'bg-gray-100',
  bgGray200: 'bg-gray-200',
  bgBlue50: 'bg-blue-50',
  bgRed50: 'bg-red-50',
  info: {
    bg: 'bg-blue-600',
    bgHover: 'bg-blue-700',
    text: 'text-blue-600',
    textHover: 'text-blue-800',
    bgLight: 'bg-blue-50',
    textDark: 'text-blue-700',
    border: 'border-blue-500',
    borderLight: 'border-blue-200',
    ring: 'ring-blue-500',
    color: BASE_COLORS.BLUE
  }
} as const;

// 输入框颜色配置
export const INPUT_COLORS = {
  default: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    bgHover: 'bg-white',
    bgFocus: 'bg-white',
    ring: 'ring-blue-500',
    borderFocus: 'border-blue-500',
    placeholder: 'placeholder-gray-500'
  },
  error: {
    border: 'border-red-500',
    text: 'text-red-500'
  }
} as const;

// 进度条颜色配置
export const PROGRESS_COLORS = {
  default: 'bg-blue-500',
  complete: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500'
} as const;

// 标签颜色映射 - HEX到Tailwind类
export const LABEL_COLOR_MAP: { [key: string]: { border: string; text: string; bg?: string } } = {
  [BASE_COLORS.RED]: { border: 'border-red-500', text: 'text-red-600', bg: 'bg-red-100' },
  [BASE_COLORS.ORANGE]: { border: 'border-orange-500', text: 'text-orange-600', bg: 'bg-orange-100' },
  [BASE_COLORS.AMBER]: { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-100' },
  [BASE_COLORS.YELLOW]: { border: 'border-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-100' },
  [BASE_COLORS.LIME]: { border: 'border-lime-500', text: 'text-lime-600', bg: 'bg-lime-100' },
  [BASE_COLORS.GREEN]: { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-100' },
  [BASE_COLORS.EMERALD]: { border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-100' },
  [BASE_COLORS.TEAL]: { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-100' },
  [BASE_COLORS.CYAN]: { border: 'border-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-100' },
  [BASE_COLORS.SKY]: { border: 'border-sky-500', text: 'text-sky-600', bg: 'bg-sky-100' },
  [BASE_COLORS.BLUE]: { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-100' },
  [BASE_COLORS.INDIGO]: { border: 'border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-100' },
  [BASE_COLORS.VIOLET]: { border: 'border-violet-500', text: 'text-violet-600', bg: 'bg-violet-100' },
  [BASE_COLORS.PURPLE]: { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-100' },
  [BASE_COLORS.FUCHSIA]: { border: 'border-fuchsia-500', text: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  [BASE_COLORS.PINK]: { border: 'border-pink-500', text: 'text-pink-600', bg: 'bg-pink-100' },
  [BASE_COLORS.ROSE]: { border: 'border-rose-500', text: 'text-rose-600', bg: 'bg-rose-100' },
  [BASE_COLORS.GRAY]: { border: 'border-gray-500', text: 'text-gray-600', bg: 'bg-gray-100' },
  [BASE_COLORS.GRAY_DARK]: { border: 'border-gray-700', text: 'text-gray-700', bg: 'bg-gray-200' },
  [BASE_COLORS.GRAY_DARKEST]: { border: 'border-gray-800', text: 'text-gray-800', bg: 'bg-gray-300' }
};

// 工具函数：获取任务状态颜色
export const getTaskStatusColors = (status: keyof typeof TASK_STATUS_COLORS) => {
  return TASK_STATUS_COLORS[status] || TASK_STATUS_COLORS.pending;
};

// 工具函数：获取四象限颜色
export const getQuadrantColors = (urgency: boolean, importance: boolean) => {
  if (urgency && importance) return QUADRANT_COLORS.urgentImportant;
  if (!urgency && importance) return QUADRANT_COLORS.importantNotUrgent;
  if (urgency && !importance) return QUADRANT_COLORS.urgentNotImportant;
  return QUADRANT_COLORS.notUrgentNotImportant;
};

// 工具函数：获取标签颜色
export const getLabelColorClasses = (color: string) => {
  return LABEL_COLOR_MAP[color] || LABEL_COLOR_MAP[BASE_COLORS.GRAY];
};

// 工具函数：获取进度条颜色
export const getProgressBarColor = (progress: number, status?: string) => {
  if (status === 'at-risk') return PROGRESS_COLORS.danger;
  if (progress === 100) return PROGRESS_COLORS.complete;
  if (progress >= 80) return PROGRESS_COLORS.warning;
  return PROGRESS_COLORS.default;
};

// 工具函数：获取UI颜色
export const getUIColor = (type: keyof typeof UI_COLORS) => {
  return UI_COLORS[type] || UI_COLORS.primary;
};

// 工具函数：获取输入框颜色
export const getInputColors = (hasError: boolean = false) => {
  return hasError ? INPUT_COLORS.error : INPUT_COLORS.default;
};

// 类型导出
type BaseColorKey = keyof typeof BASE_COLORS;
type TaskStatusKey = keyof typeof TASK_STATUS_COLORS;
type QuadrantKey = keyof typeof QUADRANT_COLORS;
type UIKey = keyof typeof UI_COLORS;

export type { BaseColorKey, TaskStatusKey, QuadrantKey, UIKey };