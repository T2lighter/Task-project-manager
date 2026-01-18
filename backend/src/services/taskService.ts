import { PrismaClient, Task } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function log(message: string) {
  try {
    fs.appendFileSync('debug.log', message + '\n');
  } catch (e) {
    console.error('Log failed:', e);
  }
}

export const createTask = async (taskData: Omit<Task, 'id' | 'userId'>, userId: number) => {
  const normalizeInt = (val: unknown) => {
    if (val === null || val === undefined || val === '') return undefined;
    if (typeof val === 'number') return Number.isFinite(val) ? val : undefined;
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const normalizeDate = (val: unknown) => {
    if (val === null || val === undefined || val === '') return undefined;
    if (val instanceof Date) return val;
    if (typeof val === 'string' || typeof val === 'number') {
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
  };

  const normalizedProjectId = normalizeInt((taskData as any).projectId);
  const normalizedCategoryId = normalizeInt((taskData as any).categoryId);
  const normalizedParentTaskId = normalizeInt((taskData as any).parentTaskId);

  if (normalizedProjectId !== undefined) {
    const project = await prisma.project.findFirst({
      where: {
        id: normalizedProjectId,
        userId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new Error('所属项目不存在或无权限访问');
    }
  }

  return prisma.task.create({
    data: {
      ...(taskData as any),
      projectId: normalizedProjectId,
      categoryId: normalizedCategoryId,
      parentTaskId: normalizedParentTaskId,
      dueDate: normalizeDate((taskData as any).dueDate),
      createdAt: normalizeDate((taskData as any).createdAt),
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

  // 检查是否是子任务状态更新
  const isSubtaskUpdate = existingTask.parentTaskId && taskData.status;
  const isSubtaskActive = taskData.status && (taskData.status === 'pending' || taskData.status === 'in-progress' || taskData.status === 'blocked');

  log(`[updateTask] TaskId: ${taskId}, isSubtaskUpdate: ${!!isSubtaskUpdate}, isSubtaskActive: ${!!isSubtaskActive}`);
  log(`[updateTask] parentTaskId: ${existingTask.parentTaskId}, status: ${taskData.status}`);

  // 使用 update 来确保返回更新后的数据
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

  // 如果更新的是子任务且新状态为活跃状态（pending/in-progress），同步父任务状态
  // 逻辑：如果父任务是completed，则将父任务改为in-progress
  let updatedParentTask = null;
  if (isSubtaskUpdate && isSubtaskActive) {
    updatedParentTask = await syncParentTaskStatus(existingTask.parentTaskId!, userId);
  }

  // 注意：父任务设为completed时，子任务状态不变

  return { updatedTask, updatedParentTask };
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
  // 注意：删除子任务后，父任务状态不变
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
  });

  return deletedTask;
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

  // 创建子任务
  const newSubtask = await prisma.task.create({
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

  // 创建子任务后，同步检查父任务状态
  // 逻辑：如果父任务是completed状态，且新创建的子任务是处理中或代办（默认也是代办），则将父任务改为处理中
  // 注意：如果 subtaskData.status 未定义，Prisma 会使用默认值 'pending'，所以也视为活跃状态
  const isSubtaskActive = !subtaskData.status || subtaskData.status === 'pending' || subtaskData.status === 'in-progress' || subtaskData.status === 'blocked';

  let updatedParentTask = null;
  if (parentTask.status === 'completed' && isSubtaskActive) {
    updatedParentTask = await prisma.task.update({
      where: { id: parentTaskId },
      data: { status: 'in-progress' },
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
  }

  return { subtask: newSubtask, updatedParentTask };
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

// 辅助函数：同步父任务状态
// 触发条件：子任务状态变为 pending 或 in-progress
// 逻辑：如果父任务当前是 completed 状态，则将父任务改为 in-progress
// 返回：更新后的父任务（如果有更新），否则返回 null
async function syncParentTaskStatus(parentTaskId: number, userId: number) {
  console.log(`[同步父任务状态] 开始同步，父任务ID: ${parentTaskId}, 用户ID: ${userId}`);

  // 查询父任务
  const parentTask = await prisma.task.findUnique({
    where: { id: parentTaskId }
  });

  if (!parentTask) {
    console.log(`[同步父任务状态] 父任务不存在`);
    return null;
  }

  // 验证父任务属于当前用户
  if (parentTask.userId !== userId) {
    console.log(`[同步父任务状态] 父任务不属于当前用户`);
    return null;
  }

  console.log(`[同步父任务状态] 父任务当前状态: ${parentTask.status}`);

  // 如果父任务不是 completed，不需要同步
  if (parentTask.status !== 'completed') {
    console.log(`[同步父任务状态] 父任务不是 completed，无需同步`);
    return null;
  }

  // 父任务是 completed，将其改为 in-progress
  console.log(`[同步父任务状态] 父任务是 completed，准备更新为 in-progress`);
  const updatedParentTask = await prisma.task.update({
    where: { id: parentTaskId },
    data: { status: 'in-progress' },
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
  console.log(`[同步父任务状态] 父任务状态已更新为 in-progress`);
  return updatedParentTask;
}


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

// 批量删除任务
export const batchDeleteTasks = async (taskIds: number[], userId: number) => {
  // 验证所有任务都属于当前用户
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      userId
    }
  });

  if (tasks.length !== taskIds.length) {
    throw new Error('部分任务不存在或无权限删除');
  }

  // 批量删除任务（子任务会自动级联删除）
  return prisma.task.deleteMany({
    where: {
      id: { in: taskIds },
      userId
    }
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
