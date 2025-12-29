import { create } from 'zustand';
import { Task } from '../types';
import api from '../services/api';
import { createSubtask, getSubtasks, getMainTasks } from '../services/subtaskService';

interface TaskState {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  updateTask: (taskId: number, task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  
  // 子任务相关方法
  createSubtask: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  getSubtasks: (parentTaskId: number) => Promise<Task[]>;
  fetchMainTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  fetchTasks: async () => {
    console.log('TaskStore: fetchTasks 被调用');
    try {
      const response = await api.get('/tasks');
      console.log('TaskStore: API响应成功，任务数量:', response.data.length);
      set({ tasks: response.data });
    } catch (error) {
      console.error('TaskStore: fetchTasks 失败:', error);
      throw error;
    }
  },
  
  createTask: async (task) => {
    const response = await api.post('/tasks', task);
    set((state) => ({ tasks: [...state.tasks, response.data] }));
  },
  
  updateTask: async (taskId, task) => {
    try {
      console.log('TaskStore: 开始更新任务', taskId, task);
      const response = await api.put(`/tasks/${taskId}`, task);
      console.log('TaskStore: 更新响应:', response.data);
      
      set((state) => {
        const updatedTasks = state.tasks.map((t) => {
          // 如果是主任务，直接更新
          if (t.id === taskId) {
            return response.data;
          }
          // 如果是子任务，需要在父任务的subtasks数组中更新
          if (t.subtasks && t.subtasks.length > 0) {
            const updatedSubtasks = t.subtasks.map((subtask) => 
              subtask.id === taskId ? response.data : subtask
            );
            // 检查是否有子任务被更新
            if (updatedSubtasks.some((subtask, index) => subtask !== t.subtasks![index])) {
              return { ...t, subtasks: updatedSubtasks };
            }
          }
          return t;
        });
        console.log('TaskStore: 任务状态已更新，新的任务数量:', updatedTasks.length);
        return { tasks: updatedTasks };
      });
    } catch (error) {
      console.error('TaskStore: 更新任务失败:', error);
      throw error;
    }
  },
  
  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set((state) => ({
      tasks: state.tasks
        .filter((t) => t.id !== taskId) // 移除主任务
        .map((t) => ({
          ...t,
          // 同时从父任务的subtasks数组中移除子任务
          subtasks: t.subtasks ? t.subtasks.filter((subtask) => subtask.id !== taskId) : t.subtasks
        }))
    }));
  },

  // 子任务相关方法
  createSubtask: async (parentTaskId, subtaskData) => {
    const newSubtask = await createSubtask(parentTaskId, subtaskData);
    
    // 更新本地状态：将子任务添加到父任务的subtasks数组中
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === parentTaskId) {
          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask]
          };
        }
        return task;
      })
    }));
  },

  getSubtasks: async (parentTaskId) => {
    return await getSubtasks(parentTaskId);
  },

  fetchMainTasks: async () => {
    const mainTasks = await getMainTasks();
    set({ tasks: mainTasks });
  }
}));