/**
 * 卡片样式配置系统
 * 基于DRY原则，集中管理所有卡片、面板、容器的样式配置
 * 
 * @description
 * 消除卡片样式配置的重复定义，提供一致的视觉风格
 * 支持Tailwind CSS类名的集中管理
 */

// 基础卡片样式配置
export const CARD_STYLES = {
  // 标准卡片容器
  container: {
    base: 'bg-white rounded-lg shadow p-3',
    hover: 'hover:shadow-lg transition-shadow duration-200',
  },
  
  // 面板卡片
  panel: {
    base: 'rounded-lg border',
    shadow: 'shadow-sm',
    padding: 'p-3',
  },
  
  // 工具栏卡片
  toolbar: {
    base: 'rounded-lg px-3 py-2',
    shadow: 'shadow-sm',
    margin: 'mb-3',
  },
  
  // 按钮卡片
  button: {
    base: 'rounded-lg transition-all duration-200',
    shadow: 'shadow-md hover:shadow-lg',
    transform: 'transform hover:scale-105',
  },
  
  // 标签卡片
  tag: {
    base: 'rounded-full text-xs',
    padding: 'px-2 py-1',
  },
  
  // 视图切换卡片
  viewToggle: {
    container: 'rounded-xl p-1 flex shadow-sm border',
    button: 'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
  },
  
  // 搜索框卡片
  searchBox: {
    container: 'relative',
    input: 'w-full block pl-10 pr-10 py-2 rounded-lg border focus:outline-none transition-colors duration-200 shadow-sm',
    button: 'absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-lg transition-colors duration-200',
    leftIcon: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
    clear: 'absolute inset-y-0 right-0 pr-3 flex items-center',
    icon: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
    rightIcon: 'absolute inset-y-0 right-0 pr-3 flex items-center',
  },

  
  // 任务列表容器
  taskList: {
    container: 'space-y-2 max-h-[600px] overflow-y-auto transition-all duration-200',
    dragOver: 'border-2 border-dashed rounded-lg p-2',
    empty: 'text-center py-8',
    searchResult: 'text-center py-4',
  },
  
  // 网格布局
  grid: {
    main: 'grid grid-cols-1 lg:grid-cols-10 gap-3',
    view: 'grid grid-cols-1 md:grid-cols-2 gap-3',
    leftCol: 'lg:col-span-3',
    rightCol: 'lg:col-span-7',
  },
  

  
  // 弹性布局
  flex: {
    row: 'flex items-center',
    rowBetween: 'flex items-center justify-between',
    rowCenter: 'flex items-center gap-3',
    wrap: 'flex flex-wrap gap-1',
  },
  
  // 间距配置
  spacing: {
    section: 'mb-3',
    element: 'gap-3',
    small: 'gap-1',
    button: 'px-3 py-2',
    icon: 'w-10 h-10',
    text: 'text-sm',
    smallText: 'text-xs',
    largeText: 'text-lg',
    marginTop2: 'mt-2',
    marginTop3: 'mt-3',
    marginBottom2: 'mb-2',
    marginBottom3: 'mb-3',
    padding2: 'p-2',
    padding3: 'p-3',
    padding4: 'p-4',
    spaceY2: 'space-y-2',
    spaceY3: 'space-y-3',
    paddingLeft3: 'pl-3',
  },
  
  // 动画效果
  animation: {
    transition: 'transition-all duration-200',
    hoverScale: 'transform hover:scale-105',
    shadowHover: 'shadow-md hover:shadow-lg',
  },
  
  // 文本样式
  text: {
    small: 'text-sm',
    xsmall: 'text-xs',
    large: 'text-lg',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    center: 'text-center',
    white: 'text-white',
    gray: 'text-gray-600',
    primary: 'text-blue-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    title: 'text-3xl font-bold',
    subtitle: 'text-xl font-semibold',
    caption: 'text-xs text-gray-500',
  },
  
  // 定位样式
  position: {
    absolute: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
    relative: 'relative',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex justify-between items-center',
    flexStart: 'flex items-start',
    absoluteLeft: 'absolute inset-y-0 left-0',
    absoluteRight: 'absolute inset-y-0 right-0',
  },
  
  // 交互样式
  interactive: {
    cursorPointer: 'cursor-pointer',
    disabled: 'cursor-not-allowed',
    buttonHover: 'hover:bg-gray-100 hover:text-gray-600',
    pointerEventsNone: 'pointer-events-none',
    opacity50: 'opacity-50',
  },
  
  // 图标样式
  icon: {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-10 h-10',
  },
  
  // 尺寸样式
  size: {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-10 h-10',
  },
  
  // 形状样式
  shape: {
    rounded: 'rounded',
    roundedFull: 'rounded-full',
    roundedLg: 'rounded-lg',
    roundedXl: 'rounded-xl',
  },
  
  // 布局样式
  layout: {
    flexShrink0: 'flex-shrink-0',
    flexGrow: 'flex-grow',
    flex1: 'flex-1',
    fullWidth: 'w-full',
    block: 'block',
    relative: 'relative',
  },
  
  // 边框样式
  border: {
    base: 'border',
    thin: 'border',
    medium: 'border-2',
    dashed: 'border-dashed',
  },
  
  // 状态样式
  state: {
    hidden: 'w-0 h-0 overflow-hidden',
    visible: 'block',
    loading: 'opacity-50 pointer-events-none',
    overflowHidden: 'overflow-hidden',
    overflowAuto: 'overflow-y-auto',
    maxHeight600: 'max-h-[600px]',
  },
} as const;

// 工具函数：获取卡片样式
export const getCardStyle = (type: keyof typeof CARD_STYLES, variant: string = 'base') => {
  const cardConfig = CARD_STYLES[type];
  if (variant && typeof cardConfig === 'object' && variant in cardConfig) {
    return cardConfig[variant as keyof typeof cardConfig];
  }
  return typeof cardConfig === 'string' ? cardConfig : '';
};

// 工具函数：组合多个样式
export const combineStyles = (...styles: string[]) => {
  return styles.filter(Boolean).join(' ');
};

// 工具函数：获取响应式卡片样式
export const getResponsiveCardStyle = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeMap = {
    sm: 'p-2 rounded-md',
    md: 'p-3 rounded-lg',
    lg: 'p-4 rounded-xl',
  };
  return sizeMap[size];
};

// 工具函数：获取卡片悬停效果
export const getCardHover = (enabled: boolean = true, scale: boolean = false) => {
  if (!enabled) return '';
  const effects = ['hover:shadow-lg transition-shadow duration-200'];
  if (scale) {
    effects.push('transform hover:scale-105');
  }
  return effects.join(' ');
};

// 工具函数：获取卡片阴影级别
export const getCardShadow = (level: 'none' | 'sm' | 'md' | 'lg' = 'md') => {
  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };
  return shadowMap[level];
};

// 类型导出
type CardStyleKey = keyof typeof CARD_STYLES;
type CardVariant = 'base' | 'hover' | 'shadow' | 'padding' | 'margin';

export type { CardStyleKey, CardVariant };