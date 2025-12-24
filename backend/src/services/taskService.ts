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
    include: { category: true },
  });
};

export const getTaskById = async (taskId: number, userId: number) => {
  return prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { category: true },
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

export const getTasksByQuadrant = async (userId: number, urgency: boolean, importance: boolean) => {
  return prisma.task.findMany({
    where: { userId, urgency, importance },
    include: { category: true },
  });
};
