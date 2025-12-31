import { Objective, KeyResult, KeyResultUpdate, ResourceRequirement, ExecutionPlan, ActionCheck } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// 获取认证token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 通用请求函数
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const fullUrl = `${API_BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // 忽略解析错误，使用默认错误消息
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`无法连接到服务器，请检查网络连接和后端服务状态`);
    }
    throw error;
  }
};

// Objective相关API
export const objectiveService = {
  // 创建目标
  create: async (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'keyResults'>): Promise<Objective> => {
    return apiRequest('/objectives', {
      method: 'POST',
      body: JSON.stringify(objectiveData),
    });
  },

  // 获取项目的所有目标
  getByProject: async (projectId: number): Promise<Objective[]> => {
    return apiRequest(`/projects/${projectId}/objectives`);
  },

  // 获取单个目标
  getById: async (objectiveId: number): Promise<Objective> => {
    return apiRequest(`/objectives/${objectiveId}`);
  },

  // 更新目标
  update: async (objectiveId: number, objectiveData: Partial<Objective>): Promise<Objective> => {
    return apiRequest(`/objectives/${objectiveId}`, {
      method: 'PUT',
      body: JSON.stringify(objectiveData),
    });
  },

  // 删除目标
  delete: async (objectiveId: number): Promise<void> => {
    return apiRequest(`/objectives/${objectiveId}`, {
      method: 'DELETE',
    });
  },
};

// KeyResult相关API
export const keyResultService = {
  // 创建关键结果
  create: async (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updates'>): Promise<KeyResult> => {
    return apiRequest('/key-results', {
      method: 'POST',
      body: JSON.stringify(keyResultData),
    });
  },

  // 更新关键结果
  update: async (keyResultId: number, keyResultData: Partial<KeyResult>): Promise<KeyResult> => {
    return apiRequest(`/key-results/${keyResultId}`, {
      method: 'PUT',
      body: JSON.stringify(keyResultData),
    });
  },

  // 删除关键结果
  delete: async (keyResultId: number): Promise<void> => {
    return apiRequest(`/key-results/${keyResultId}`, {
      method: 'DELETE',
    });
  },
};

// KeyResultUpdate相关API
export const keyResultUpdateService = {
  // 创建关键结果更新
  create: async (updateData: Omit<KeyResultUpdate, 'id' | 'userId' | 'createdAt'>): Promise<KeyResultUpdate> => {
    return apiRequest('/key-result-updates', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  },
};

// ResourceRequirement相关API
export const resourceRequirementService = {
  // 创建资源需求
  create: async (resourceData: Omit<ResourceRequirement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ResourceRequirement> => {
    return apiRequest('/resource-requirements', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },

  // 更新资源需求
  update: async (resourceId: number, resourceData: Partial<ResourceRequirement>): Promise<ResourceRequirement> => {
    return apiRequest(`/resource-requirements/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  // 删除资源需求
  delete: async (resourceId: number): Promise<void> => {
    return apiRequest(`/resource-requirements/${resourceId}`, {
      method: 'DELETE',
    });
  },
};

// ExecutionPlan相关API
export const executionPlanService = {
  // 创建执行计划
  create: async (planData: Omit<ExecutionPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ExecutionPlan> => {
    return apiRequest('/execution-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  // 更新执行计划
  update: async (planId: number, planData: Partial<ExecutionPlan>): Promise<ExecutionPlan> => {
    return apiRequest(`/execution-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  // 删除执行计划
  delete: async (planId: number): Promise<void> => {
    return apiRequest(`/execution-plans/${planId}`, {
      method: 'DELETE',
    });
  },
};

// ActionCheck相关API
export const actionCheckService = {
  // 创建行动检查
  create: async (checkData: Omit<ActionCheck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ActionCheck> => {
    return apiRequest('/action-checks', {
      method: 'POST',
      body: JSON.stringify(checkData),
    });
  },

  // 更新行动检查
  update: async (checkId: number, checkData: Partial<ActionCheck>): Promise<ActionCheck> => {
    return apiRequest(`/action-checks/${checkId}`, {
      method: 'PUT',
      body: JSON.stringify(checkData),
    });
  },

  // 删除行动检查
  delete: async (checkId: number): Promise<void> => {
    return apiRequest(`/action-checks/${checkId}`, {
      method: 'DELETE',
    });
  },
};