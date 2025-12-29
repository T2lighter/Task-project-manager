import { PrismaClient, Task } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (taskData: Omit<Task, 'id' | 'userId'>, userId: number) => {
  return prisma.task.create({
    data: {
      ...taskData,
      userId,
    },
  });
};

export const getTasks = async (userId: number) => {
  return prisma.task.findMany({
    where: { userId },
    include: { 
      category: true,
      project: true,
      parentTask: true,
      subtasks: {
        include: {
          category: true,
          project: true
        }
      }
    },
  });
};

export const getTaskById = async (taskId: number, userId: number) => {
  return prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { 
      category: true,
      project: true,
      parentTask: true,
      subtasks: {
        include: {
          category: true,
          project: true
        }
      }
    },
  });
};

export const updateTask = async (taskId: number, taskData: Partial<Task>, userId: number) => {
  return prisma.task.updateMany({
    where: { id: taskId, userId },
    data: taskData,
  }).then(result => {
    if (result.count === 0) return null;
    return getTaskById(taskId, userId);
  });
};

export const deleteTask = async (taskId: number, userId: number) => {
  return prisma.task.deleteMany({
    where: { id: taskId, userId },
  });
};

// 新增：创建子任务
export const createSubtask = async (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>, userId: number) => {
  // 首先验证父任务是否存在且属于当前用户
  const parentTask = await prisma.task.findFirst({
    where: { id: parentTaskId, userId }
  });
  
  if (!parentTask) {
    throw new Error('父任务不存在或无权限访问');
  }
  
  // 验证父任务不是子任务（防止多层嵌套）
  if (parentTask.parentTaskId) {
    throw new Error('子任务不能再添加子任务');
  }
  
  return prisma.task.create({
    data: {
      ...subtaskData,
      userId,
      parentTaskId,
    },
    include: {
      category: true,
      project: true,
      parentTask: true
    }
  });
};

// 新增：获取任务的所有子任务
export const getSubtasks = async (parentTaskId: number, userId: number) => {
  return prisma.task.findMany({
    where: { 
      parentTaskId,
      userId 
    },
    include: {
      category: true,
      project: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

// 新增：获取主任务（没有父任务的任务）
export const getMainTasks = async (userId: number) => {
  return prisma.task.findMany({
    where: { 
      userId,
      parentTaskId: null // 只获取主任务
    },
    include: { 
      category: true,
      project: true,
      subtasks: {
        include: {
          category: true,
          project: true
        }
      }
    },
  });
};

export const getTasksByQuadrant = async (userId: number, urgency: boolean, importance: boolean) => {
  return prisma.task.findMany({
    where: { userId, urgency, importance },
    include: { 
      category: true,
      project: true,
      parentTask: true,
      subtasks: {
        include: {
          category: true,
          project: true
        }
      }
    },
  });
};
