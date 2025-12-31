import { create } from 'zustand';
import { Objective, KeyResult, KeyResultUpdate, ResourceRequirement, ExecutionPlan, ActionCheck } from '../types';
import { 
  objectiveService, 
  keyResultService, 
  keyResultUpdateService,
  resourceRequirementService,
  executionPlanService,
  actionCheckService
} from '../services/okrService';

interface OKRState {
  objectives: Objective[];
  loading: boolean;
  error: string | null;
  
  // Objective actions
  fetchObjectives: (projectId: number) => Promise<void>;
  createObjective: (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'keyResults'>) => Promise<void>;
  updateObjective: (objectiveId: number, objectiveData: Partial<Objective>) => Promise<void>;
  deleteObjective: (objectiveId: number) => Promise<void>;
  
  // KeyResult actions
  createKeyResult: (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updates'>) => Promise<void>;
  updateKeyResult: (keyResultId: number, keyResultData: Partial<KeyResult>) => Promise<void>;
  deleteKeyResult: (keyResultId: number) => Promise<void>;
  
  // KeyResultUpdate actions
  createKeyResultUpdate: (updateData: Omit<KeyResultUpdate, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  
  // ResourceRequirement actions
  createResourceRequirement: (resourceData: Omit<ResourceRequirement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateResourceRequirement: (resourceId: number, resourceData: Partial<ResourceRequirement>) => Promise<void>;
  deleteResourceRequirement: (resourceId: number) => Promise<void>;
  
  // ExecutionPlan actions
  createExecutionPlan: (planData: Omit<ExecutionPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExecutionPlan: (planId: number, planData: Partial<ExecutionPlan>) => Promise<void>;
  deleteExecutionPlan: (planId: number) => Promise<void>;
  
  // ActionCheck actions
  createActionCheck: (checkData: Omit<ActionCheck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateActionCheck: (checkId: number, checkData: Partial<ActionCheck>) => Promise<void>;
  deleteActionCheck: (checkId: number) => Promise<void>;
  
  // Utility actions
  clearError: () => void;
}

export const useOKRStore = create<OKRState>((set, get) => ({
  objectives: [],
  loading: false,
  error: null,

  // Objective actions
  fetchObjectives: async (projectId: number) => {
    set({ loading: true, error: null });
    try {
      const objectives = await objectiveService.getByProject(projectId);
      set({ objectives, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取目标失败', 
        loading: false 
      });
    }
  },

  createObjective: async (objectiveData) => {
    set({ loading: true, error: null });
    try {
      const newObjective = await objectiveService.create(objectiveData);
      set(state => ({ 
        objectives: [...state.objectives, newObjective],
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建目标失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateObjective: async (objectiveId: number, objectiveData: Partial<Objective>) => {
    set({ loading: true, error: null });
    try {
      const updatedObjective = await objectiveService.update(objectiveId, objectiveData);
      set(state => ({
        objectives: state.objectives.map(obj => 
          obj.id === objectiveId ? updatedObjective : obj
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新目标失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteObjective: async (objectiveId: number) => {
    set({ loading: true, error: null });
    try {
      await objectiveService.delete(objectiveId);
      set(state => ({
        objectives: state.objectives.filter(obj => obj.id !== objectiveId),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除目标失败', 
        loading: false 
      });
      throw error;
    }
  },

  // KeyResult actions
  createKeyResult: async (keyResultData) => {
    set({ loading: true, error: null });
    try {
      const newKeyResult = await keyResultService.create(keyResultData);
      
      // 更新对应目标的关键结果列表
      set(state => ({
        objectives: state.objectives.map(obj => 
          obj.id === keyResultData.objectiveId 
            ? { ...obj, keyResults: [...(obj.keyResults || []), newKeyResult] }
            : obj
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建关键结果失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateKeyResult: async (keyResultId: number, keyResultData: Partial<KeyResult>) => {
    set({ loading: true, error: null });
    try {
      const updatedKeyResult = await keyResultService.update(keyResultId, keyResultData);
      
      // 更新对应目标的关键结果
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          keyResults: obj.keyResults?.map(kr => 
            kr.id === keyResultId ? updatedKeyResult : kr
          )
        })),
        loading: false
      }));
      
      // 重新获取目标数据以更新进度
      const { objectives } = get();
      const objective = objectives.find(obj => 
        obj.keyResults?.some(kr => kr.id === keyResultId)
      );
      if (objective) {
        const updatedObjective = await objectiveService.getById(objective.id);
        set(state => ({
          objectives: state.objectives.map(obj => 
            obj.id === objective.id ? updatedObjective : obj
          )
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新关键结果失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteKeyResult: async (keyResultId: number) => {
    set({ loading: true, error: null });
    try {
      await keyResultService.delete(keyResultId);
      
      // 从对应目标中移除关键结果
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          keyResults: obj.keyResults?.filter(kr => kr.id !== keyResultId)
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除关键结果失败', 
        loading: false 
      });
      throw error;
    }
  },

  // KeyResultUpdate actions
  createKeyResultUpdate: async (updateData) => {
    set({ loading: true, error: null });
    try {
      const newUpdate = await keyResultUpdateService.create(updateData);
      
      // 更新对应关键结果的更新列表
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          keyResults: obj.keyResults?.map(kr => 
            kr.id === updateData.keyResultId 
              ? { 
                  ...kr, 
                  updates: [newUpdate, ...(kr.updates || [])],
                  progress: updateData.progress
                }
              : kr
          )
        })),
        loading: false
      }));
      
      // 重新获取目标数据以更新进度
      const { objectives } = get();
      const objective = objectives.find(obj => 
        obj.keyResults?.some(kr => kr.id === updateData.keyResultId)
      );
      if (objective) {
        const updatedObjective = await objectiveService.getById(objective.id);
        set(state => ({
          objectives: state.objectives.map(obj => 
            obj.id === objective.id ? updatedObjective : obj
          )
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建更新记录失败', 
        loading: false 
      });
      throw error;
    }
  },

  // ResourceRequirement actions
  createResourceRequirement: async (resourceData) => {
    set({ loading: true, error: null });
    try {
      const newResource = await resourceRequirementService.create(resourceData);
      
      // 更新对应目标的资源需求列表
      set(state => ({
        objectives: state.objectives.map(obj => 
          obj.id === resourceData.objectiveId 
            ? { ...obj, resourceRequirements: [...(obj.resourceRequirements || []), newResource] }
            : obj
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建资源需求失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateResourceRequirement: async (resourceId: number, resourceData: Partial<ResourceRequirement>) => {
    set({ loading: true, error: null });
    try {
      const updatedResource = await resourceRequirementService.update(resourceId, resourceData);
      
      // 更新对应目标的资源需求
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          resourceRequirements: obj.resourceRequirements?.map(rr => 
            rr.id === resourceId ? updatedResource : rr
          )
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新资源需求失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteResourceRequirement: async (resourceId: number) => {
    set({ loading: true, error: null });
    try {
      await resourceRequirementService.delete(resourceId);
      
      // 从对应目标中移除资源需求
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          resourceRequirements: obj.resourceRequirements?.filter(rr => rr.id !== resourceId)
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除资源需求失败', 
        loading: false 
      });
      throw error;
    }
  },

  // ExecutionPlan actions
  createExecutionPlan: async (planData) => {
    set({ loading: true, error: null });
    try {
      const newPlan = await executionPlanService.create(planData);
      
      // 更新对应目标的执行计划列表
      set(state => ({
        objectives: state.objectives.map(obj => 
          obj.id === planData.objectiveId 
            ? { ...obj, executionPlans: [...(obj.executionPlans || []), newPlan] }
            : obj
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建执行计划失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateExecutionPlan: async (planId: number, planData: Partial<ExecutionPlan>) => {
    set({ loading: true, error: null });
    try {
      const updatedPlan = await executionPlanService.update(planId, planData);
      
      // 更新对应目标的执行计划
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          executionPlans: obj.executionPlans?.map(ep => 
            ep.id === planId ? updatedPlan : ep
          )
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新执行计划失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteExecutionPlan: async (planId: number) => {
    set({ loading: true, error: null });
    try {
      await executionPlanService.delete(planId);
      
      // 从对应目标中移除执行计划
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          executionPlans: obj.executionPlans?.filter(ep => ep.id !== planId)
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除执行计划失败', 
        loading: false 
      });
      throw error;
    }
  },

  // ActionCheck actions
  createActionCheck: async (checkData) => {
    set({ loading: true, error: null });
    try {
      const newCheck = await actionCheckService.create(checkData);
      
      // 更新对应目标的行动检查列表
      set(state => ({
        objectives: state.objectives.map(obj => 
          obj.id === checkData.objectiveId 
            ? { ...obj, actionChecks: [...(obj.actionChecks || []), newCheck] }
            : obj
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建行动检查失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateActionCheck: async (checkId: number, checkData: Partial<ActionCheck>) => {
    set({ loading: true, error: null });
    try {
      const updatedCheck = await actionCheckService.update(checkId, checkData);
      
      // 更新对应目标的行动检查
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          actionChecks: obj.actionChecks?.map(ac => 
            ac.id === checkId ? updatedCheck : ac
          )
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新行动检查失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteActionCheck: async (checkId: number) => {
    set({ loading: true, error: null });
    try {
      await actionCheckService.delete(checkId);
      
      // 从对应目标中移除行动检查
      set(state => ({
        objectives: state.objectives.map(obj => ({
          ...obj,
          actionChecks: obj.actionChecks?.filter(ac => ac.id !== checkId)
        })),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除行动检查失败', 
        loading: false 
      });
      throw error;
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
}));