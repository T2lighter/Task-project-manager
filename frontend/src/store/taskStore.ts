import { create } from 'zustand';
import { Task } from '../types';
import api from '../services/api';
import { createSubtask, getSubtasks, getMainTasks } from '../services/subtaskService';

const normalizeTaskStatus = (status: unknown): Task['status'] => {
  if (status === 'pending' || status === 'in-progress' || status === 'blocked' || status === 'completed') {
    return status;
  }
  return 'pending';
};

const normalizeTask = (task: Task): Task => {
  return {
    ...task,
    status: normalizeTaskStatus((task as any).status),
    subtasks: task.subtasks ? task.subtasks.map(normalizeTask) : task.subtasks
  };
};

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // 基础任务操作
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  updateTask: (taskId: number, task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  batchDeleteTasks: (taskIds: number[]) => Promise<void>;
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
        const normalizedTask = normalizeTask(task);
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
          ...normalizedTask,
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
        tasks: [...state.tasks, normalizeTask(response.data)], 
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
      
      // 新的响应格式: { task: updatedTask, parentTask: updatedParentTask | null }
      const { task: updatedTask, parentTask: updatedParentTask } = response.data;
      const normalizedUpdatedTask = normalizeTask(updatedTask);
      const normalizedUpdatedParentTask = updatedParentTask ? normalizeTask(updatedParentTask) : null;
      
      set((state) => {
        let updatedTasks = state.tasks.map((t) => {
          // 如果是被更新的任务本身（主任务或子任务）
          if (t.id === taskId) {
            return normalizedUpdatedTask;
          }
          
          // 如果父任务也被更新了，更新父任务
          if (normalizedUpdatedParentTask && t.id === normalizedUpdatedParentTask.id) {
            return normalizedUpdatedParentTask;
          }
          
          // 如果是子任务，需要在父任务的subtasks数组中更新
          if (t.subtasks && t.subtasks.length > 0) {
            const updatedSubtasks = t.subtasks.map((subtask) => 
              subtask.id === taskId ? normalizedUpdatedTask : subtask
            );
            // 检查是否有子任务被更新
            if (updatedSubtasks.some((subtask, index) => subtask !== t.subtasks![index])) {
              // 如果这个父任务也被更新了状态，使用更新后的状态
              if (normalizedUpdatedParentTask && t.id === normalizedUpdatedParentTask.id) {
                return { ...normalizedUpdatedParentTask, subtasks: updatedSubtasks };
              }
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

  batchDeleteTasks: async (taskIds) => {
    try {
      set({ loading: true, error: null });
      await api.delete('/tasks/batch', { data: { taskIds } });
      
      set((state) => ({
        tasks: state.tasks
          .filter((t) => !taskIds.includes(t.id)) // 移除被删除的任务
          .map((t) => ({
            ...t,
            // 同时从父任务的subtasks数组中移除被删除的子任务
            subtasks: t.subtasks ? t.subtasks.filter((subtask) => !taskIds.includes(subtask.id)) : t.subtasks
          })),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量删除任务失败';
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
        tasks: [...state.tasks, normalizeTask(response.data)],
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
      const result = await createSubtask(parentTaskId, subtaskData);
      const { subtask: newSubtask, parentTask: updatedParentTask } = result;
      const normalizedNewSubtask = normalizeTask(newSubtask);
      const normalizedUpdatedParentTask = updatedParentTask ? normalizeTask(updatedParentTask) : null;
      
      // 更新本地状态：将子任务添加到父任务的subtasks数组中，并更新父任务状态
      set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id === parentTaskId) {
            // 如果父任务状态也被更新了，使用更新后的父任务
            if (normalizedUpdatedParentTask) {
              return {
                ...normalizedUpdatedParentTask,
                subtasks: [...(normalizedUpdatedParentTask.subtasks || []), normalizedNewSubtask]
              };
            }
            return {
              ...task,
              subtasks: [...(task.subtasks || []), normalizedNewSubtask]
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
      set({ tasks: mainTasks.map(normalizeTask), loading: false });
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