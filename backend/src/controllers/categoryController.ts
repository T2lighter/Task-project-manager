import { Request, Response } from 'express';
import { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory 
} from '../services/categoryService';

export const createNewCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const category = await createCategory(req.body, userId);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const categories = await getCategories(userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateExistingCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const category = await updateCategory(parseInt(req.params.id), req.body, userId);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await deleteCategory(parseInt(req.params.id), userId);
    res.json({ message: '分类已删除' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};