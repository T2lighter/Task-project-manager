import { Request, Response } from 'express';
import {
  getTaskStats,
  getQuadrantStats,
  getTimeSeriesData,
  getYearHeatmapData,
  getCategoryStats,
  getProjectStats,
  getProjectTaskStats,
  getTaskDurationRanking
} from '../services/statsService';

export const getTaskStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: '用户未认证' });
    }
    
    const period = (req.query.period as 'day' | 'week' | 'month') || 'month';
    const stats = await getTaskStats(userId, period);
    
    res.json(stats);
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getQuadrantStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const period = (req.query.period as 'day' | 'week' | 'month') || 'month';
    
    const stats = await getQuadrantStats(userId, period);
    res.json(stats);
  } catch (error) {
    console.error('获取四象限统计失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getTimeSeriesDataHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
    const dateStr = req.query.date as string;
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    
    const data = await getTimeSeriesData(userId, period, targetDate);
    res.json(data);
  } catch (error) {
    console.error('获取时间序列数据失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getYearTimeSeriesDataHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    console.log(`控制器：用户 ${userId} 请求 ${year} 年度热力图数据`);
    const data = await getYearHeatmapData(userId, year);
    console.log(`控制器：返回 ${data.length} 天的数据`);
    res.json(data);
  } catch (error) {
    console.error('获取年度热力图数据失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCategoryStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const period = (req.query.period as 'day' | 'week' | 'month') || 'month';
    
    const stats = await getCategoryStats(userId, period);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProjectStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: '用户未认证' });
    }
    
    const stats = await getProjectStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('获取项目统计失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProjectTaskStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: '用户未认证' });
    }
    
    const stats = await getProjectTaskStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('获取项目任务统计失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getTaskDurationRankingHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: '用户未认证' });
    }
    
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const ranking = await getTaskDurationRanking(userId, year);
    res.json(ranking);
  } catch (error) {
    console.error('获取任务耗时排行失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};