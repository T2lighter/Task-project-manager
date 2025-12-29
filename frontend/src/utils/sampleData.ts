import { Task } from '../types';

// 样例任务数据
export const sampleTasks: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  // 本周任务（2024年12月）
  {
    title: '完成项目方案设计',
    description: '设计新产品的技术架构和实现方案',
    status: 'in-progress',
    urgency: true,
    importance: true,
    dueDate: new Date('2024-12-26'),
    categoryId: undefined
  },
  {
    title: '团队周会准备',
    description: '准备本周工作汇报和下周计划',
    status: 'pending',
    urgency: true,
    importance: false,
    dueDate: new Date('2024-12-27'),
    categoryId: undefined
  },
  {
    title: '学习新技术文档',
    description: '阅读React 19新特性文档',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2024-12-28'),
    categoryId: undefined
  },
  {
    title: '整理桌面文件',
    description: '清理电脑桌面和文档分类',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2024-12-29'),
    categoryId: undefined
  },
  {
    title: '年终总结报告',
    description: '撰写2024年工作总结和2025年计划',
    status: 'pending',
    urgency: true,
    importance: true,
    dueDate: new Date('2024-12-31'),
    categoryId: undefined
  },
  
  // 2025年1月任务
  {
    title: '新年计划制定',
    description: '制定2025年个人发展和学习计划',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-01-01'),
    categoryId: undefined
  },
  {
    title: '客户需求评审',
    description: '与客户讨论新功能需求和优先级',
    status: 'pending',
    urgency: true,
    importance: true,
    dueDate: new Date('2025-01-03'),
    categoryId: undefined
  },
  {
    title: '购买年货',
    description: '采购春节所需的食品和用品',
    status: 'pending',
    urgency: true,
    importance: false,
    dueDate: new Date('2025-01-25'),
    categoryId: undefined
  },
  {
    title: '春节大扫除',
    description: '家里大扫除，迎接新年',
    status: 'pending',
    urgency: true,
    importance: false,
    dueDate: new Date('2025-01-28'),
    categoryId: undefined
  },
  {
    title: '拜访长辈',
    description: '春节期间走亲访友',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-01-30'),
    categoryId: undefined
  },
  
  // 2025年2月任务
  {
    title: '元宵节聚餐',
    description: '和家人一起过元宵节',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2025-02-12'),
    categoryId: undefined
  },
  {
    title: '项目启动会议',
    description: '新项目的启动会议和任务分配',
    status: 'pending',
    urgency: true,
    importance: true,
    dueDate: new Date('2025-02-17'),
    categoryId: undefined
  },
  {
    title: '技术培训课程',
    description: '参加公司组织的技术培训',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-02-20'),
    categoryId: undefined
  },
  
  // 春季任务
  {
    title: '扫墓祭祖',
    description: '清明节扫墓，缅怀先人',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-04-05'),
    categoryId: undefined
  },
  {
    title: '春游踏青',
    description: '和家人一起春游踏青',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2025-04-06'),
    categoryId: undefined
  },
  
  // 劳动节
  {
    title: '家庭装修',
    description: '利用假期进行家庭装修',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-05-01'),
    categoryId: undefined
  },
  {
    title: '五一旅游',
    description: '五一假期旅游安排',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2025-05-02'),
    categoryId: undefined
  },
  
  // 端午节
  {
    title: '包粽子',
    description: '和家人一起包粽子',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2025-06-01'),
    categoryId: undefined
  },
  
  // 中秋国庆
  {
    title: '中秋团圆',
    description: '中秋节家庭聚餐',
    status: 'pending',
    urgency: false,
    importance: true,
    dueDate: new Date('2025-10-06'),
    categoryId: undefined
  },
  {
    title: '国庆出游',
    description: '国庆假期出游计划',
    status: 'pending',
    urgency: false,
    importance: false,
    dueDate: new Date('2025-10-02'),
    categoryId: undefined
  },
  
  // 已完成的任务示例
  {
    title: '完成月度报告',
    description: '提交12月份工作报告',
    status: 'completed',
    urgency: true,
    importance: true,
    dueDate: new Date('2024-12-20'),
    categoryId: undefined
  },
  {
    title: '参加技术分享会',
    description: '参加前端技术分享会',
    status: 'completed',
    urgency: false,
    importance: true,
    dueDate: new Date('2024-12-18'),
    categoryId: undefined
  },
  {
    title: '购买圣诞礼物',
    description: '为家人准备圣诞礼物',
    status: 'completed',
    urgency: true,
    importance: false,
    dueDate: new Date('2024-12-24'),
    categoryId: undefined
  }
];

// 检查是否需要初始化样例数据
export const shouldInitializeSampleData = (existingTasks: Task[]): boolean => {
  // 如果任务数量少于5个，则初始化样例数据
  return existingTasks.length < 5;
};

// 获取样例数据的子集（用于初始化）
export const getInitialSampleTasks = (): Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] => {
  // 返回前10个任务作为初始数据
  return sampleTasks.slice(0, 10);
};