import { Request, Response } from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  getTasksByQuadrant
} from '../services/taskService';

export const createNewTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const task = await createTask(req.body, userId);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    console.log(`获取任务列表: 用户 ${userId}`);
    
    const tasks = await getTasks(userId);
    console.log(`找到 ${tasks.length} 个任务`);
    console.log('任务列表:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    res.json(tasks);
  } catch (error) {
    console.error('获取任务列表时出错:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const task = await getTaskById(parseInt(req.params.id), userId);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateExistingTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const task = await updateTask(parseInt(req.params.id), req.body, userId);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = parseInt(req.params.id);
    
    console.log(`删除任务请求: 用户 ${userId}, 任务ID ${taskId}`);
    
    // 先检查任务是否存在
    const existingTask = await getTaskById(taskId, userId);
    if (!existingTask) {
      console.log(`任务不存在: ID ${taskId}`);
      return res.status(404).json({ message: '任务不存在' });
    }
    
    console.log(`准备删除任务: ${existingTask.title} (ID: ${taskId})`);
    
    const result = await deleteTask(taskId, userId);
    console.log(`删除结果: 影响行数 ${result.count}`);
    
    if (result.count === 0) {
      console.log(`删除失败: 没有找到匹配的任务`);
      return res.status(404).json({ message: '任务不存在或无权限删除' });
    }
    
    console.log(`任务删除成功: ID ${taskId}`);
    res.json({ message: '任务已删除' });
  } catch (error) {
    console.error('删除任务时出错:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getTasksByQuadrantHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { urgency, importance } = req.query;
    const tasks = await getTasksByQuadrant(
      userId,
      urgency === 'true',
      importance === 'true'
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};