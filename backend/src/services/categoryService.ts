import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

export const createCategory = async (categoryData: Omit<Category, 'id' | 'userId'>, userId: number) => {
  return prisma.category.create({
    data: {
      ...categoryData,
      userId,
    },
  });
};

export const getCategories = async (userId: number) => {
  return prisma.category.findMany({
    where: { userId },
  });
};

export const updateCategory = async (categoryId: number, categoryData: Partial<Category>, userId: number) => {
  return prisma.category.updateMany({
    where: { id: categoryId, userId },
    data: categoryData,
  }).then(result => {
    if (result.count === 0) return null;
    return prisma.category.findFirst({ where: { id: categoryId, userId } });
  });
};

export const deleteCategory = async (categoryId: number, userId: number) => {
  // 先删除分类下的所有任务
  await prisma.task.updateMany({
    where: { categoryId, userId },
    data: { categoryId: null },
  });
  
  // 再删除分类
  return prisma.category.deleteMany({
    where: { id: categoryId, userId },
  });
};