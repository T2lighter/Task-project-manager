import { Request, Response } from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  batchDeleteTasks,
  getTasksByQuadrant,
  createSubtask,
  getSubtasks,
  getMainTasks,
  copyTask
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
    const taskId = parseInt(req.params.id);
    
    const task = await updateTask(taskId, req.body, userId);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('更新任务时出错:', error);
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

// 新增：创建子任务
export const createNewSubtask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const parentTaskId = parseInt(req.params.parentTaskId);
    
    if (!parentTaskId) {
      return res.status(400).json({ message: '父任务ID无效' });
    }
    
    const subtask = await createSubtask(parentTaskId, req.body, userId);
    res.status(201).json(subtask);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// 新增：获取任务的子任务列表
export const getTaskSubtasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const parentTaskId = parseInt(req.params.parentTaskId);
    
    if (!parentTaskId) {
      return res.status(400).json({ message: '父任务ID无效' });
    }
    
    const subtasks = await getSubtasks(parentTaskId, userId);
    res.json(subtasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// 新增：获取主任务列表（不包含子任务）
export const getMainTasksHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const mainTasks = await getMainTasks(userId);
    res.json(mainTasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// 批量删除任务
export const batchDeleteTasksHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: '请提供要删除的任务ID列表' });
    }

    console.log(`批量删除任务请求: 用户 ${userId}, 任务IDs ${taskIds.join(', ')}`);

    const result = await batchDeleteTasks(taskIds, userId);

    console.log(`批量删除成功: 删除了 ${result.count} 个任务`);
    res.json({ message: `成功删除 ${result.count} 个任务`, count: result.count });
  } catch (error) {
    console.error('批量删除任务时出错:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

// 新增：复制任务
export const copyTaskHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = parseInt(req.params.id);
    
    if (!taskId) {
      return res.status(400).json({ message: '任务ID无效' });
    }
    
    console.log(`复制任务请求: 用户 ${userId}, 任务ID ${taskId}`);
    
    const copiedTask = await copyTask(taskId, userId);
    
    console.log(`任务复制成功: 原任务ID ${taskId}, 新任务ID ${copiedTask?.id}`);
    res.status(201).json(copiedTask);
  } catch (error) {
    console.error('复制任务时出错:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};