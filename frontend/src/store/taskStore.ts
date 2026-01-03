import { create } from 'zustand';
import { Task } from '../types';
import api from '../services/api';
import { createSubtask, getSubtasks, getMainTasks } from '../services/subtaskService';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // 基础任务操作
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  updateTask: (taskId: number, task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  copyTask: (taskId: number) => Promise<void>;
  
  // 子任务相关方法
  createSubtask: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  getSubtasks: (parentTaskId: number) => Promise<Task[]>;
  fetchMainTasks: () => Promise<void>;
  
  // 工具方法
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  
  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/tasks');
      
      // 获取任务标签映射
      const taskLabelsMapping = JSON.parse(localStorage.getItem('task_labels_mapping') || '{}');
      const storedLabels = JSON.parse(localStorage.getItem('personalized_labels') || '[]');
      
      // 为每个任务添加标签信息
      const tasksWithLabels = response.data.map((task: Task) => {
        const labelIds = taskLabelsMapping[task.id] || [];
        const taskLabels = labelIds.map((labelId: number) => {
          const label = storedLabels.find((l: any) => l.id === labelId);
          return label ? {
            id: `${task.id}-${labelId}`, // 使用任务ID和标签ID组合作为稳定的ID
            taskId: task.id,
            labelId: labelId,
            label: label
          } : null;
        }).filter(Boolean);
        
        return {
          ...task,
          labels: taskLabels
        };
      });
      
      set({ tasks: tasksWithLabels, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取任务列表失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  createTask: async (task) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/tasks', task);
      set((state) => ({ 
        tasks: [...state.tasks, response.data], 
        loading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  updateTask: async (taskId, task) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put(`/tasks/${taskId}`, task);
      
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
        
        return { tasks: updatedTasks, loading: false };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  deleteTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      await api.delete(`/tasks/${taskId}`);
      
      set((state) => ({
        tasks: state.tasks
          .filter((t) => t.id !== taskId) // 移除主任务
          .map((t) => ({
            ...t,
            // 同时从父任务的subtasks数组中移除子任务
            subtasks: t.subtasks ? t.subtasks.filter((subtask) => subtask.id !== taskId) : t.subtasks
          })),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  copyTask: async (taskId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post(`/tasks/${taskId}/copy`);
      
      // 将复制的任务添加到任务列表中
      set((state) => ({ 
        tasks: [...state.tasks, response.data],
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '复制任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 子任务相关方法
  createSubtask: async (parentTaskId, subtaskData) => {
    try {
      set({ loading: true, error: null });
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
        }),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建子任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getSubtasks: async (parentTaskId) => {
    try {
      return await getSubtasks(parentTaskId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取子任务失败';
      set({ error: errorMessage });
      throw error;
    }
  },

  fetchMainTasks: async () => {
    try {
      set({ loading: true, error: null });
      const mainTasks = await getMainTasks();
      set({ tasks: mainTasks, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取主任务失败';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));