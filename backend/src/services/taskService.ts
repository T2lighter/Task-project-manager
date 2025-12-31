import { PrismaClient, Task } from '@prisma/client';

const prisma = new PrismaClient();

export const createTask = async (taskData: Omit<Task, 'id' | 'userId'>, userId: number) => {
  return prisma.task.create({
    data: {
      ...taskData,
      userId,
    },
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
    orderBy: [
      { urgency: 'desc' },
      { importance: 'desc' },
      { createdAt: 'desc' }
    ]
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
  // 首先检查任务是否存在
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });
  
  if (!existingTask) {
    throw new Error('任务不存在或无权限访问');
  }
  
  // 使用 update 而不是 updateMany 来确保返回更新后的数据
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: taskData,
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
  
  return updatedTask;
};

export const deleteTask = async (taskId: number, userId: number) => {
  // 首先检查任务是否存在
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });
  
  if (!existingTask) {
    throw new Error('任务不存在或无权限访问');
  }

  // 删除任务（子任务会自动级联删除）
  return prisma.task.delete({
    where: { id: taskId },
  });
};

// 创建子任务
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

// 获取任务的所有子任务
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

// 获取主任务（没有父任务的任务）
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
    orderBy: [
      { urgency: 'desc' },
      { importance: 'desc' },
      { createdAt: 'desc' }
    ]
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
    orderBy: [
      { createdAt: 'desc' }
    ]
  });
};

// 复制任务
export const copyTask = async (taskId: number, userId: number) => {
  // 获取原任务数据
  const originalTask = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: {
      category: true,
      project: true,
      subtasks: {
        include: {
          category: true,
          project: true
        }
      }
    }
  });

  if (!originalTask) {
    throw new Error('任务不存在或无权限访问');
  }

  // 准备复制的任务数据
  const { id, userId: _, createdAt, updatedAt, subtasks, category, project, ...taskData } = originalTask;
  
  // 创建新任务，标题添加"-复制"后缀
  const copiedTask = await prisma.task.create({
    data: {
      ...taskData,
      title: `${originalTask.title}-复制`,
      userId,
      status: 'pending', // 复制的任务默认为待办状态
    },
    include: {
      category: true,
      project: true
    }
  });

  // 如果原任务有子任务，也复制子任务
  if (subtasks && subtasks.length > 0) {
    await Promise.all(
      subtasks.map(async (subtask) => {
        const { id: subtaskId, userId: __, createdAt: ___, updatedAt: ____, parentTaskId, category: subtaskCategory, project: subtaskProject, ...subtaskData } = subtask;
        
        return prisma.task.create({
          data: {
            ...subtaskData,
            title: `${subtask.title}-复制`,
            userId,
            parentTaskId: copiedTask.id,
            status: 'pending', // 复制的子任务也默认为待办状态
          },
          include: {
            category: true,
            project: true
          }
        });
      })
    );
  }

  // 返回完整的复制任务数据（包含子任务）
  return prisma.task.findFirst({
    where: { id: copiedTask.id },
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
    }
  });
};
