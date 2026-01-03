import { create } from 'zustand';
import { CustomLabel } from '../types';

// 本地存储键名
const LABELS_STORAGE_KEY = 'personalized_labels';
const TASK_LABELS_STORAGE_KEY = 'task_labels_mapping';

interface LabelStore {
  labels: CustomLabel[];
  loading: boolean;
  error: string | null;
  
  // 标签管理
  fetchLabels: () => Promise<void>;
  createLabel: (label: Omit<CustomLabel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLabel: (id: number, label: Omit<CustomLabel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteLabel: (id: number) => Promise<void>;
  
  // 任务标签关联管理
  assignLabelToTask: (taskId: number, labelId: number) => Promise<void>;
  removeLabelFromTask: (taskId: number, labelId: number) => Promise<void>;
  updateTaskLabels: (taskId: number, labelIds: number[]) => Promise<void>;
  
  // 本地存储管理
  getTaskLabelsMapping: () => Record<number, number[]>;
  saveTaskLabelsMapping: (mapping: Record<number, number[]>) => void;
  
  // 清理函数
  clearError: () => void;
}

// 本地存储辅助函数
const loadLabelsFromStorage = (): CustomLabel[] => {
  try {
    const stored = localStorage.getItem(LABELS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('加载本地标签数据失败:', error);
  }
  
  // 返回默认标签并保存到本地存储
  const defaultLabels = [
    {
      id: 1,
      name: '对内标签',
      color: '#3B82F6',
      description: '内部工作相关任务',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: '对外标签',
      color: '#EF4444',
      description: '外部合作相关任务',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: '交叉标签',
      color: '#10B981',
      description: '跨部门协作任务',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // 保存默认标签到本地存储
  saveLabelsToStorage(defaultLabels);
  
  return defaultLabels;
};

const saveLabelsToStorage = (labels: CustomLabel[]) => {
  try {
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels));
  } catch (error) {
    console.warn('保存标签到本地存储失败:', error);
  }
};

const loadTaskLabelsMapping = (): Record<number, number[]> => {
  try {
    const stored = localStorage.getItem(TASK_LABELS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('加载任务标签映射失败:', error);
  }
  return {};
};

const saveTaskLabelsMapping = (mapping: Record<number, number[]>) => {
  try {
    localStorage.setItem(TASK_LABELS_STORAGE_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.warn('保存任务标签映射失败:', error);
  }
};

export const useLabelStore = create<LabelStore>((set) => ({
  labels: [],
  loading: false,
  error: null,

  fetchLabels: async () => {
    set({ loading: true, error: null });
    try {
      // 从本地存储加载标签数据
      const storedLabels = loadLabelsFromStorage();
      
      // 减少模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      set({ labels: storedLabels, loading: false });
    } catch (error) {
      console.error('获取标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '获取标签失败', 
        loading: false 
      });
    }
  },

  createLabel: async (labelData) => {
    set({ loading: true, error: null });
    try {
      // 创建新标签
      const newLabel: CustomLabel = {
        id: Date.now(), // 使用时间戳作为临时ID
        ...labelData,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => {
        const updatedLabels = [...state.labels, newLabel];
        // 保存到本地存储
        saveLabelsToStorage(updatedLabels);
        return {
          labels: updatedLabels,
          loading: false
        };
      });
    } catch (error) {
      console.error('创建标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '创建标签失败', 
        loading: false 
      });
    }
  },

  updateLabel: async (id, labelData) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => {
        const updatedLabels = state.labels.map(label => 
          label.id === id ? { ...label, ...labelData, updatedAt: new Date() } : label
        );
        // 保存到本地存储
        saveLabelsToStorage(updatedLabels);
        return {
          labels: updatedLabels,
          loading: false
        };
      });
    } catch (error) {
      console.error('更新标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '更新标签失败', 
        loading: false 
      });
    }
  },

  deleteLabel: async (id) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => {
        const updatedLabels = state.labels.filter(label => label.id !== id);
        // 保存到本地存储
        saveLabelsToStorage(updatedLabels);
        
        // 同时清理任务标签映射中的相关数据
        const taskLabelsMapping = loadTaskLabelsMapping();
        const updatedMapping: Record<number, number[]> = {};
        
        Object.keys(taskLabelsMapping).forEach(taskIdStr => {
          const taskId = parseInt(taskIdStr);
          const labelIds = taskLabelsMapping[taskId].filter(labelId => labelId !== id);
          if (labelIds.length > 0) {
            updatedMapping[taskId] = labelIds;
          }
        });
        
        saveTaskLabelsMapping(updatedMapping);
        
        return {
          labels: updatedLabels,
          loading: false
        };
      });
    } catch (error) {
      console.error('删除标签失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '删除标签失败', 
        loading: false 
      });
    }
  },

  assignLabelToTask: async (taskId, labelId) => {
    try {
      // 模拟分配标签到任务
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 更新本地存储的任务标签映射
      const mapping = loadTaskLabelsMapping();
      const currentLabels = mapping[taskId] || [];
      
      if (!currentLabels.includes(labelId)) {
        mapping[taskId] = [...currentLabels, labelId];
        saveTaskLabelsMapping(mapping);
      }
    } catch (error) {
      console.error('分配标签失败:', error);
      set({ error: error instanceof Error ? error.message : '分配标签失败' });
      throw error;
    }
  },

  removeLabelFromTask: async (taskId, labelId) => {
    try {
      // 模拟移除任务标签
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 更新本地存储的任务标签映射
      const mapping = loadTaskLabelsMapping();
      const currentLabels = mapping[taskId] || [];
      
      mapping[taskId] = currentLabels.filter(id => id !== labelId);
      if (mapping[taskId].length === 0) {
        delete mapping[taskId];
      }
      
      saveTaskLabelsMapping(mapping);
      
      console.log(`从任务 ${taskId} 移除标签 ${labelId}`);
    } catch (error) {
      console.error('移除标签失败:', error);
      set({ error: error instanceof Error ? error.message : '移除标签失败' });
      throw error;
    }
  },

  updateTaskLabels: async (taskId, labelIds) => {
    try {
      // 模拟更新任务标签
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 更新本地存储的任务标签映射
      const mapping = loadTaskLabelsMapping();
      
      if (labelIds.length > 0) {
        mapping[taskId] = labelIds;
      } else {
        delete mapping[taskId];
      }
      
      saveTaskLabelsMapping(mapping);
      
      console.log(`更新任务 ${taskId} 的标签为:`, labelIds);
    } catch (error) {
      console.error('更新任务标签失败:', error);
      set({ error: error instanceof Error ? error.message : '更新任务标签失败' });
      throw error;
    }
  },

  // 本地存储管理
  getTaskLabelsMapping: () => {
    return loadTaskLabelsMapping();
  },

  saveTaskLabelsMapping: (mapping) => {
    saveTaskLabelsMapping(mapping);
  },

  clearError: () => set({ error: null }),
}));