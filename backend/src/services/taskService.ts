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
  
  // 先更新任务（注意：这里还不调用同步函数，因为需要等子任务状态更新后再查）
  const isSubtaskUpdate = existingTask.parentTaskId && taskData.status;
  const isSubtaskActive = taskData.status && (taskData.status === 'pending' || taskData.status === 'in-progress');
  
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
  
  // 如果更新的是子任务且新状态为活跃状态，更新完成后再同步父任务状态
  // 这样才能查询到最新的子任务状态
  if (isSubtaskUpdate && isSubtaskActive) {
    await syncParentTaskStatus(existingTask.parentTaskId!, userId);
  }
  
  // 如果更新的是主任务，检查是否需要更新所有子任务的完成状态
  if (!existingTask.parentTaskId && taskData.status === 'completed') {
    await autoCompleteSubtasks(taskId, userId);
  }
  
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
  
  // 如果删除的是子任务，先记录父任务ID用于后续状态同步
  const parentTaskId = existingTask.parentTaskId;
  
  // 删除任务（子任务会自动级联删除）
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
  });
  
  // 删除子任务后，检查父任务是否需要同步状态
  if (parentTaskId) {
    await syncParentTaskStatusAfterDelete(parentTaskId, userId);
  }
  
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
  // 逻辑：如果父任务是completed状态，且新创建的子任务是进行中或代办，则将父任务改为进行中
  if (
    parentTask.status === 'completed' && 
    (subtaskData.status === 'pending' || subtaskData.status === 'in-progress')
  ) {
    await prisma.task.update({
      where: { id: parentTaskId },
      data: { status: 'in-progress' }
    });
  }
  
  return newSubtask;
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
// 触发条件：子任务状态为pending或in-progress
// 逻辑：如果父任务当前是completed状态，则将父任务改为in-progress
async function syncParentTaskStatus(parentTaskId: number, userId: number) {
  console.log(`[同步父任务状态] 开始同步，父任务ID: ${parentTaskId}, 用户ID: ${userId}`);
  
  // 查询父任务及其所有子任务，使用findUnique确保查询正确的任务
  const parentTask = await prisma.task.findUnique({
    where: { id: parentTaskId },
    include: { 
      subtasks: {
        where: { userId } // 确保子任务也属于当前用户
      }
    }
  });
  
  if (!parentTask) {
    console.log(`[同步父任务状态] 父任务不存在`);
    return;
  }
  
  // 验证父任务属于当前用户
  if (parentTask.userId !== userId) {
    console.log(`[同步父任务状态] 父任务不属于当前用户`);
    return;
  }
  
  console.log(`[同步父任务状态] 父任务当前状态: ${parentTask.status}, 子任务数量: ${parentTask.subtasks.length}`);
  console.log(`[同步父任务状态] 父任务userId: ${parentTask.userId}, 当前用户ID: ${userId}`);
  console.log(`[同步父任务状态] 子任务详情:`, parentTask.subtasks.map(st => ({ id: st.id, status: st.status })));
  
  // 如果父任务不是completed，不需要同步
  if (parentTask.status !== 'completed') {
    console.log(`[同步父任务状态] 父任务不是completed，无需同步`);
    return;
  }
  
  // 检查是否有子任务处于pending或in-progress状态
  const activeSubtasks = parentTask.subtasks.filter(
    subtask => subtask.status === 'pending' || subtask.status === 'in-progress'
  );
  
  console.log(`[同步父任务状态] 活跃子任务数量: ${activeSubtasks.length}`);
  
  // 如果有活跃的子任务，将父任务改为in-progress
  if (activeSubtasks.length > 0) {
    console.log(`[同步父任务状态] 检测到活跃子任务，准备更新父任务状态为in-progress`);
    await prisma.task.update({
      where: { id: parentTaskId },
      data: { status: 'in-progress' }
    });
    console.log(`[同步父任务状态] 父任务状态已更新为in-progress`);
  } else {
    console.log(`[同步父任务状态] 没有活跃子任务，无需更新父任务`);
  }
}


// 辅助函数：当父任务设为完成时，自动将所有子任务也设为完成
async function autoCompleteSubtasks(parentTaskId: number, userId: number) {
  await prisma.task.updateMany({
    where: { 
      parentTaskId: parentTaskId,
      userId,
      status: { not: 'completed' } // 只更新未完成的子任务
    },
    data: { status: 'completed' }
  });
}

// 辅助函数：删除子任务后同步父任务状态
async function syncParentTaskStatusAfterDelete(parentTaskId: number, userId: number) {
  const parentTask = await prisma.task.findFirst({
    where: { id: parentTaskId, userId },
    include: { subtasks: true }
  });
  
  if (!parentTask) return;
  
  // 如果父任务是completed状态，检查是否所有子任务都完成了
  if (parentTask.status === 'completed') {
    if (parentTask.subtasks.length === 0) {
      // 没有子任务了，父任务保持completed
      return;
    }
    
    // 检查是否所有子任务都是completed状态
    const allSubtasksCompleted = parentTask.subtasks.every(
      subtask => subtask.status === 'completed'
    );
    
    if (allSubtasksCompleted) {
      // 所有子任务都完成了，父任务保持completed
      return;
    }
    
    // 还有子任务未完成，将父任务改为in-progress
    await prisma.task.update({
      where: { id: parentTaskId },
      data: { status: 'in-progress' }
    });
  }
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
