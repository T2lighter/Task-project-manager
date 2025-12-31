import { create } from 'zustand';
import { TaskStats, QuadrantStats, CategoryStats, TimeSeriesData, ProjectStats, ProjectTaskStats } from '../types';
import {
  getTaskStats,
  getQuadrantStats,
  getCategoryStats,
  getTimeSeriesData,
  getYearHeatmapData,
  getProjectStats,
  getProjectTaskStats
} from '../services/statsService';

interface StatsState {
  // 数据状态
  taskStats: TaskStats | null;
  quadrantStats: QuadrantStats | null;
  categoryStats: CategoryStats[];
  timeSeriesData: TimeSeriesData[];
  yearTimeSeriesData: TimeSeriesData[]; // 新增：年度数据
  projectStats: ProjectStats | null; // 新增：项目统计
  projectTaskStats: ProjectTaskStats[]; // 新增：项目任务统计
  
  // 时间选择状态
  selectedPeriod: 'day' | 'week' | 'month';
  selectedDate: Date;
  
  // 加载状态
  loading: boolean;
  heatmapLoading: boolean; // 新增：热力图专用加载状态
  error: string | null;
  
  // 操作方法
  setSelectedPeriod: (period: 'day' | 'week' | 'month') => void;
  setSelectedDate: (date: Date) => void;
  fetchTaskStats: (period?: 'day' | 'week' | 'month') => Promise<void>;
  fetchQuadrantStats: (period?: 'day' | 'week' | 'month') => Promise<void>;
  fetchCategoryStats: (period?: 'day' | 'week' | 'month') => Promise<void>;
  fetchTimeSeriesData: (period?: 'day' | 'week' | 'month', date?: Date) => Promise<void>;
  fetchYearHeatmapData: (year?: number) => Promise<void>;
  fetchProjectStats: () => Promise<void>; // 新增：获取项目统计
  fetchProjectTaskStats: () => Promise<void>; // 新增：获取项目任务统计
  fetchAllStats: (period?: 'day' | 'week' | 'month') => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  // 初始状态
  taskStats: null,
  quadrantStats: null,
  categoryStats: [],
  timeSeriesData: [],
  yearTimeSeriesData: [],
  projectStats: null, // 初始化项目统计
  projectTaskStats: [], // 初始化项目任务统计
  selectedPeriod: 'day',
  selectedDate: new Date(),
  loading: false,
  heatmapLoading: false, // 初始化热力图加载状态
  error: null,

  // 设置选择的时间周期和日期
  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period, heatmapLoading: true });
    // 短暂延迟后关闭加载状态，模拟数据处理
    setTimeout(() => {
      set({ heatmapLoading: false });
    }, 300);
  },

  setSelectedDate: (date) => {
    const currentYear = get().selectedDate.getFullYear();
    const newYear = date.getFullYear();
    
    set({ selectedDate: date });
    
    // 如果跨年，需要重新获取年度数据，显示热力图加载状态
    if (currentYear !== newYear) {
      set({ heatmapLoading: true });
      get().fetchYearHeatmapData(newYear).finally(() => {
        set({ heatmapLoading: false });
      });
    } else {
      // 同年内切换，显示短暂的加载状态
      set({ heatmapLoading: true });
      setTimeout(() => {
        set({ heatmapLoading: false });
      }, 200);
    }
  },

  // 获取任务统计
  fetchTaskStats: async (period) => {
    try {
      set({ loading: true, error: null });
      const currentPeriod = period || get().selectedPeriod;
      const stats = await getTaskStats(currentPeriod);
      set({ taskStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 获取四象限统计
  fetchQuadrantStats: async (period) => {
    try {
      set({ loading: true, error: null });
      const currentPeriod = period || get().selectedPeriod;
      const stats = await getQuadrantStats(currentPeriod);
      set({ quadrantStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 获取分类统计
  fetchCategoryStats: async (period) => {
    try {
      set({ loading: true, error: null });
      const currentPeriod = period || get().selectedPeriod;
      const stats = await getCategoryStats(currentPeriod);
      set({ categoryStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 获取时间序列数据
  fetchTimeSeriesData: async (period, date) => {
    try {
      // 不设置全局loading状态，避免影响页面其他部分
      set({ error: null });
      const currentPeriod = period || get().selectedPeriod;
      const currentDate = date || get().selectedDate;
      const data = await getTimeSeriesData(currentPeriod, currentDate);
      set({ timeSeriesData: data });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // 获取年度热力图数据（带缓存优化）
  fetchYearHeatmapData: async (year) => {
    try {
      const targetYear = year || new Date().getFullYear();
      
      // 检查缓存
      const cachedData = get().yearTimeSeriesData;
      if (cachedData.length > 0 && get().selectedDate.getFullYear() === targetYear) {
        console.log(`前端：使用缓存的 ${targetYear} 年度数据`);
        return;
      }
      
      set({ heatmapLoading: true, error: null });
      console.log(`前端：获取 ${targetYear} 年度热力图数据`);
      
      const startTime = performance.now();
      const data = await getYearHeatmapData(targetYear);
      const endTime = performance.now();
      
      console.log(`前端：收到 ${data.length} 天的热力图数据，耗时 ${Math.round(endTime - startTime)}ms`);
      
      if (data.length > 0) {
        const totalCreated = data.reduce((sum, item) => sum + item.created, 0);
        const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
        const activeDays = data.filter(item => item.created > 0 || item.completed > 0).length;
        console.log(`前端：${targetYear} 年统计 - 创建: ${totalCreated}, 完成: ${totalCompleted}, 活跃天数: ${activeDays}`);
      }
      
      set({ yearTimeSeriesData: data });
    } catch (error) {
      console.error('前端：获取年度热力图数据失败', error);
      set({ error: (error as Error).message });
    } finally {
      set({ heatmapLoading: false });
    }
  },

  // 获取项目统计
  fetchProjectStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await getProjectStats();
      set({ projectStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 获取项目任务统计
  fetchProjectTaskStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await getProjectTaskStats();
      set({ projectTaskStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 获取所有统计数据
  fetchAllStats: async (period) => {
    try {
      set({ loading: true, error: null });
      const currentPeriod = period || get().selectedPeriod;
      
      // 先只获取任务统计，确保基础功能工作
      const taskStats = await getTaskStats(currentPeriod);
      set({ taskStats });
      
      // 如果任务统计成功，再获取其他统计
      try {
        const quadrantStats = await getQuadrantStats(currentPeriod);
        set({ quadrantStats });
      } catch (error) {
        console.warn('四象限统计获取失败:', error);
      }
      
      try {
        const categoryStats = await getCategoryStats(currentPeriod);
        set({ categoryStats });
      } catch (error) {
        console.warn('分类统计获取失败:', error);
      }

      try {
        const timeSeriesData = await getTimeSeriesData(currentPeriod, get().selectedDate);
        set({ timeSeriesData });
      } catch (error) {
        console.warn('时间序列数据获取失败:', error);
      }

      // 获取年度数据用于热力图
      try {
        const yearTimeSeriesData = await getYearHeatmapData();
        set({ yearTimeSeriesData });
      } catch (error) {
        console.warn('年度时间序列数据获取失败:', error);
      }

      // 获取项目统计数据
      try {
        const projectStats = await getProjectStats();
        set({ projectStats });
      } catch (error) {
        console.warn('项目统计数据获取失败:', error);
      }

      try {
        const projectTaskStats = await getProjectTaskStats();
        set({ projectTaskStats });
      } catch (error) {
        console.warn('项目任务统计数据获取失败:', error);
      }
      
    } catch (error) {
      console.error('获取统计数据失败:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },
}));