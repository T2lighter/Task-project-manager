import { PrismaClient, Project } from '@prisma/client';
import { getProjectWithNotes } from './projectNoteService';

const prisma = new PrismaClient();

export const createProject = async (projectData: Omit<Project, 'id' | 'userId'>, userId: number) => {
  return prisma.project.create({
    data: {
      ...projectData,
      userId,
    },
    include: {
      tasks: true,
      notes: true,
    },
  });
};

export const getProjects = async (userId: number) => {
  return prisma.project.findMany({
    where: { userId },
    include: {
      tasks: true,
      notes: {
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
  });
};

export const getProjectById = async (projectId: number, userId: number) => {
  return getProjectWithNotes(projectId, userId);
};

export const updateProject = async (projectId: number, projectData: Partial<Project>, userId: number) => {
  return prisma.project.updateMany({
    where: { id: projectId, userId },
    data: projectData,
  }).then(result => {
    if (result.count === 0) return null;
    return getProjectById(projectId, userId);
  });
};

export const deleteProject = async (projectId: number, userId: number) => {
  // First, remove project association from all tasks
  await prisma.task.updateMany({
    where: { projectId, userId },
    data: { projectId: null },
  });
  
  // Project notes will be deleted automatically due to CASCADE
  
  // Then delete the project
  return prisma.project.deleteMany({
    where: { id: projectId, userId },
  });
};