import { Request, Response } from 'express';
import {
  createObjective,
  getObjectivesByProject,
  getObjectiveById,
  updateObjective,
  deleteObjective,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult,
  createKeyResultUpdate,
  createResourceRequirement,
  updateResourceRequirement,
  deleteResourceRequirement,
  createExecutionPlan,
  updateExecutionPlan,
  deleteExecutionPlan,
  createActionCheck,
  updateActionCheck,
  deleteActionCheck
} from '../services/okrService';

// Objective控制器
export const createNewObjective = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const objective = await createObjective(req.body, userId);
    res.status(201).json(objective);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getProjectObjectives = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = parseInt(req.params.projectId);
    const objectives = await getObjectivesByProject(projectId, userId);
    res.json(objectives);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getObjective = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const objectiveId = parseInt(req.params.id);
    const objective = await getObjectiveById(objectiveId, userId);
    if (!objective) {
      return res.status(404).json({ message: '目标不存在' });
    }
    res.json(objective);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateExistingObjective = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const objectiveId = parseInt(req.params.id);
    const objective = await updateObjective(objectiveId, req.body, userId);
    if (!objective) {
      return res.status(404).json({ message: '目标不存在' });
    }
    res.json(objective);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingObjective = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const objectiveId = parseInt(req.params.id);
    const result = await deleteObjective(objectiveId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '目标不存在或无权限删除' });
    }
    res.json({ message: '目标已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// KeyResult控制器
export const createNewKeyResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const keyResult = await createKeyResult(req.body, userId);
    res.status(201).json(keyResult);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateExistingKeyResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const keyResultId = parseInt(req.params.id);
    const keyResult = await updateKeyResult(keyResultId, req.body, userId);
    if (!keyResult) {
      return res.status(404).json({ message: '关键结果不存在' });
    }
    res.json(keyResult);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingKeyResult = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const keyResultId = parseInt(req.params.id);
    const result = await deleteKeyResult(keyResultId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '关键结果不存在或无权限删除' });
    }
    res.json({ message: '关键结果已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// KeyResultUpdate控制器
export const createNewKeyResultUpdate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const update = await createKeyResultUpdate(req.body, userId);
    res.status(201).json(update);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// ResourceRequirement控制器
export const createNewResourceRequirement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const resource = await createResourceRequirement(req.body, userId);
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateExistingResourceRequirement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const resourceId = parseInt(req.params.id);
    const resource = await updateResourceRequirement(resourceId, req.body, userId);
    if (!resource) {
      return res.status(404).json({ message: '资源需求不存在' });
    }
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingResourceRequirement = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const resourceId = parseInt(req.params.id);
    const result = await deleteResourceRequirement(resourceId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '资源需求不存在或无权限删除' });
    }
    res.json({ message: '资源需求已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ExecutionPlan控制器
export const createNewExecutionPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const plan = await createExecutionPlan(req.body, userId);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateExistingExecutionPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const planId = parseInt(req.params.id);
    const plan = await updateExecutionPlan(planId, req.body, userId);
    if (!plan) {
      return res.status(404).json({ message: '执行计划不存在' });
    }
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingExecutionPlan = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const planId = parseInt(req.params.id);
    const result = await deleteExecutionPlan(planId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '执行计划不存在或无权限删除' });
    }
    res.json({ message: '执行计划已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ActionCheck控制器
export const createNewActionCheck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const check = await createActionCheck(req.body, userId);
    res.status(201).json(check);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateExistingActionCheck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const checkId = parseInt(req.params.id);
    const check = await updateActionCheck(checkId, req.body, userId);
    if (!check) {
      return res.status(404).json({ message: '行动检查不存在' });
    }
    res.json(check);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingActionCheck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const checkId = parseInt(req.params.id);
    const result = await deleteActionCheck(checkId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '行动检查不存在或无权限删除' });
    }
    res.json({ message: '行动检查已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};