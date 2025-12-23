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
    const tasks = await getTasks(userId);
    res.json(tasks);
  } catch (error) {
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
    await deleteTask(parseInt(req.params.id), userId);
    res.json({ message: '任务已删除' });
  } catch (error) {
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