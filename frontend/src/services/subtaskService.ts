import api from './api';
import { Task } from '../types';

// 创建子任务
export const createSubtask = async (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => {
  const response = await api.post(`/tasks/${parentTaskId}/subtasks`, subtaskData);
  return response.data;
};

// 获取任务的子任务列表
export const getSubtasks = async (parentTaskId: number) => {
  const response = await api.get(`/tasks/${parentTaskId}/subtasks`);
  return response.data;
};

// 获取主任务列表（不包含子任务）
export const getMainTasks = async () => {
  const response = await api.get('/tasks/main');
  return response.data;
};