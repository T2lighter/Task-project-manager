import api from './api';
import { TaskStats, QuadrantStats, CategoryStats, TimeSeriesData, ProjectStats, ProjectTaskStats, TaskDurationData } from '../types';

export const getTaskStats = async (period: 'day' | 'week' | 'month' = 'month'): Promise<TaskStats> => {
  const response = await api.get(`/stats/stats?period=${period}`);
  return response.data;
};

export const getQuadrantStats = async (period: 'day' | 'week' | 'month' = 'month'): Promise<QuadrantStats> => {
  const response = await api.get(`/stats/quadrant-stats?period=${period}`);
  return response.data;
};

export const getTimeSeriesData = async (
  period: 'day' | 'week' | 'month' = 'day',
  date: Date = new Date()
): Promise<TimeSeriesData[]> => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD格式
  const response = await api.get(`/stats/time-series?period=${period}&date=${dateStr}`);
  return response.data;
};

// 获取年度热力图数据
export const getYearHeatmapData = async (year?: number): Promise<TimeSeriesData[]> => {
  const targetYear = year || new Date().getFullYear();
  const response = await api.get(`/stats/time-series-year?year=${targetYear}`);
  return response.data;
};

export const getCategoryStats = async (period: 'day' | 'week' | 'month' = 'month'): Promise<CategoryStats[]> => {
  const response = await api.get(`/stats/category-stats?period=${period}`);
  return response.data;
};

export const getProjectStats = async (): Promise<ProjectStats> => {
  const response = await api.get('/stats/project-stats');
  return response.data;
};

export const getProjectTaskStats = async (): Promise<ProjectTaskStats[]> => {
  const response = await api.get('/stats/project-task-stats');
  return response.data;
};

export const getTaskDurationRanking = async (year?: number): Promise<TaskDurationData[]> => {
  const yearParam = year ? `?year=${year}` : '';
  const response = await api.get(`/stats/task-duration-ranking${yearParam}`);
  return response.data;
};