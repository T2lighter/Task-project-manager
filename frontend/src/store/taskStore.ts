import { create } from 'zustand';
import { Task } from '../types';
import api from '../services/api';

interface TaskState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  updateTask: (taskId: number, task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  
  fetchTasks: async () => {
    const response = await api.get('/tasks');
    set({ tasks: response.data });
  },
  
  createTask: async (task) => {
    const response = await api.post('/tasks', task);
    set((state) => ({ tasks: [...state.tasks, response.data] }));
  },
  
  updateTask: async (taskId, task) => {
    try {
      console.log('更新任务:', taskId, task);
      const response = await api.put(`/tasks/${taskId}`, task);
      console.log('更新响应:', response.data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? response.data : t))
      }));
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  },
  
  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
  }
}));