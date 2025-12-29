import { PrismaClient, ProjectNote } from '@prisma/client';

const prisma = new PrismaClient();

export const createProjectNote = async (
  noteData: Omit<ProjectNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, 
  userId: number
) => {
  // 验证数据
  if (!noteData.title || !noteData.title.trim()) {
    throw new Error('标题不能为空');
  }
  
  if (!noteData.content || !noteData.content.trim()) {
    throw new Error('内容不能为空');
  }
  
  const result = await prisma.projectNote.create({
    data: {
      ...noteData,
      userId,
    },
  });
  
  return result;
};

export const getProjectNotes = async (projectId: number, userId: number) => {
  return prisma.projectNote.findMany({
    where: { 
      projectId,
      userId 
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getProjectNoteById = async (noteId: number, userId: number) => {
  return prisma.projectNote.findFirst({
    where: { 
      id: noteId, 
      userId 
    },
  });
};

export const updateProjectNote = async (
  noteId: number, 
  noteData: Partial<Omit<ProjectNote, 'id' | 'userId' | 'projectId' | 'createdAt'>>, 
  userId: number
) => {
  const result = await prisma.projectNote.updateMany({
    where: { 
      id: noteId, 
      userId 
    },
    data: {
      ...noteData,
      updatedAt: new Date()
    },
  });
  
  if (result.count === 0) {
    return null;
  }
  
  const updatedNote = await getProjectNoteById(noteId, userId);
  return updatedNote;
};

export const deleteProjectNote = async (noteId: number, userId: number) => {
  return prisma.projectNote.deleteMany({
    where: { 
      id: noteId, 
      userId 
    },
  });
};

// 获取项目的所有记录（包含在项目查询中）
export const getProjectWithNotes = async (projectId: number, userId: number) => {
  return prisma.project.findFirst({
    where: { 
      id: projectId, 
      userId 
    },
    include: {
      notes: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      tasks: {
        include: {
          category: true,
        },
      },
    },
  });
};