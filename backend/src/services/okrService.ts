import { PrismaClient, Objective, KeyResult, KeyResultUpdate, ResourceRequirement, ExecutionPlan, ActionCheck } from '@prisma/client';

const prisma = new PrismaClient();

// Objective相关服务
export const createObjective = async (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number) => {
  return prisma.objective.create({
    data: {
      ...objectiveData,
      userId,
    },
    include: {
      keyResults: {
        include: {
          updates: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      },
      resourceRequirements: true,
      executionPlans: true,
      actionChecks: true
    },
  });
};

export const getObjectivesByProject = async (projectId: number, userId: number) => {
  return prisma.objective.findMany({
    where: { 
      projectId,
      userId 
    },
    include: {
      keyResults: {
        include: {
          updates: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      },
      resourceRequirements: true,
      executionPlans: true,
      actionChecks: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getObjectiveById = async (objectiveId: number, userId: number) => {
  return prisma.objective.findFirst({
    where: { 
      id: objectiveId,
      userId 
    },
    include: {
      keyResults: {
        include: {
          updates: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      },
      resourceRequirements: true,
      executionPlans: true,
      actionChecks: true
    }
  });
};

export const updateObjective = async (objectiveId: number, objectiveData: Partial<Objective>, userId: number) => {
  const result = await prisma.objective.updateMany({
    where: { 
      id: objectiveId, 
      userId 
    },
    data: objectiveData,
  });
  
  if (result.count === 0) return null;
  return getObjectiveById(objectiveId, userId);
};

export const deleteObjective = async (objectiveId: number, userId: number) => {
  return prisma.objective.deleteMany({
    where: { 
      id: objectiveId, 
      userId 
    },
  });
};

// KeyResult相关服务
export const createKeyResult = async (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number) => {
  const keyResult = await prisma.keyResult.create({
    data: {
      ...keyResultData,
      userId,
    },
    include: {
      updates: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
  });

  // 更新目标的进度
  await updateObjectiveProgress(keyResultData.objectiveId, userId);
  
  return keyResult;
};

export const updateKeyResult = async (keyResultId: number, keyResultData: Partial<KeyResult>, userId: number) => {
  const keyResult = await prisma.keyResult.findFirst({
    where: { id: keyResultId, userId }
  });
  
  if (!keyResult) return null;

  const result = await prisma.keyResult.updateMany({
    where: { 
      id: keyResultId, 
      userId 
    },
    data: keyResultData,
  });
  
  if (result.count === 0) return null;
  
  // 更新目标的进度
  await updateObjectiveProgress(keyResult.objectiveId, userId);
  
  return prisma.keyResult.findFirst({
    where: { id: keyResultId, userId },
    include: {
      updates: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
};

export const deleteKeyResult = async (keyResultId: number, userId: number) => {
  const keyResult = await prisma.keyResult.findFirst({
    where: { id: keyResultId, userId }
  });
  
  if (!keyResult) return { count: 0 };

  const result = await prisma.keyResult.deleteMany({
    where: { 
      id: keyResultId, 
      userId 
    },
  });

  // 更新目标的进度
  if (result.count > 0) {
    await updateObjectiveProgress(keyResult.objectiveId, userId);
  }
  
  return result;
};

// KeyResultUpdate相关服务
export const createKeyResultUpdate = async (updateData: Omit<KeyResultUpdate, 'id' | 'userId' | 'createdAt'>, userId: number) => {
  const update = await prisma.keyResultUpdate.create({
    data: {
      ...updateData,
      userId,
    },
  });

  // 更新KeyResult的进度
  if (updateData.progress !== undefined) {
    await prisma.keyResult.updateMany({
      where: { 
        id: updateData.keyResultId, 
        userId 
      },
      data: {
        progress: updateData.progress
      },
    });

    // 获取KeyResult以更新目标进度
    const keyResult = await prisma.keyResult.findFirst({
      where: { id: updateData.keyResultId, userId }
    });
    
    if (keyResult) {
      await updateObjectiveProgress(keyResult.objectiveId, userId);
    }
  }

  return update;
};

// ResourceRequirement相关服务
export const createResourceRequirement = async (resourceData: Omit<ResourceRequirement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number) => {
  return prisma.resourceRequirement.create({
    data: {
      ...resourceData,
      userId,
    },
  });
};

export const updateResourceRequirement = async (resourceId: number, resourceData: Partial<ResourceRequirement>, userId: number) => {
  const result = await prisma.resourceRequirement.updateMany({
    where: { 
      id: resourceId, 
      userId 
    },
    data: resourceData,
  });
  
  if (result.count === 0) return null;
  
  return prisma.resourceRequirement.findFirst({
    where: { id: resourceId, userId }
  });
};

export const deleteResourceRequirement = async (resourceId: number, userId: number) => {
  return prisma.resourceRequirement.deleteMany({
    where: { 
      id: resourceId, 
      userId 
    },
  });
};

// ExecutionPlan相关服务
export const createExecutionPlan = async (planData: Omit<ExecutionPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number) => {
  return prisma.executionPlan.create({
    data: {
      ...planData,
      userId,
    },
  });
};

export const updateExecutionPlan = async (planId: number, planData: Partial<ExecutionPlan>, userId: number) => {
  const result = await prisma.executionPlan.updateMany({
    where: { 
      id: planId, 
      userId 
    },
    data: planData,
  });
  
  if (result.count === 0) return null;
  
  return prisma.executionPlan.findFirst({
    where: { id: planId, userId }
  });
};

export const deleteExecutionPlan = async (planId: number, userId: number) => {
  return prisma.executionPlan.deleteMany({
    where: { 
      id: planId, 
      userId 
    },
  });
};

// ActionCheck相关服务
export const createActionCheck = async (checkData: Omit<ActionCheck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: number) => {
  return prisma.actionCheck.create({
    data: {
      ...checkData,
      userId,
    },
  });
};

export const updateActionCheck = async (checkId: number, checkData: Partial<ActionCheck>, userId: number) => {
  const result = await prisma.actionCheck.updateMany({
    where: { 
      id: checkId, 
      userId 
    },
    data: checkData,
  });
  
  if (result.count === 0) return null;
  
  return prisma.actionCheck.findFirst({
    where: { id: checkId, userId }
  });
};

export const deleteActionCheck = async (checkId: number, userId: number) => {
  return prisma.actionCheck.deleteMany({
    where: { 
      id: checkId, 
      userId 
    },
  });
};

// 辅助函数：更新目标进度
const updateObjectiveProgress = async (objectiveId: number, userId: number) => {
  const objective = await prisma.objective.findFirst({
    where: { id: objectiveId, userId },
    include: {
      keyResults: true
    }
  });

  if (!objective || objective.keyResults.length === 0) return;

  // 计算平均进度
  const totalProgress = objective.keyResults.reduce((sum, kr) => sum + kr.progress, 0);
  const averageProgress = Math.round(totalProgress / objective.keyResults.length);

  // 根据进度更新状态
  let status = objective.status;
  if (averageProgress === 100) {
    status = 'completed';
  } else if (averageProgress > 0 && status === 'draft') {
    status = 'active';
  }

  await prisma.objective.updateMany({
    where: { id: objectiveId, userId },
    data: { 
      progress: averageProgress,
      status
    },
  });
};