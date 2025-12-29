import { Request, Response } from 'express';
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject
} from '../services/projectService';

export const createNewProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const project = await createProject(req.body, userId);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    console.log(`获取项目列表: 用户 ${userId}`);
    
    const projects = await getProjects(userId);
    console.log(`找到 ${projects.length} 个项目`);
    
    res.json(projects);
  } catch (error) {
    console.error('获取项目列表时出错:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const project = await getProjectById(parseInt(req.params.id), userId);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateExistingProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const project = await updateProject(parseInt(req.params.id), req.body, userId);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExistingProject = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = parseInt(req.params.id);
    
    console.log(`删除项目请求: 用户 ${userId}, 项目ID ${projectId}`);
    
    // 先检查项目是否存在
    const existingProject = await getProjectById(projectId, userId);
    if (!existingProject) {
      console.log(`项目不存在: ID ${projectId}`);
      return res.status(404).json({ message: '项目不存在' });
    }
    
    console.log(`准备删除项目: ${existingProject.name} (ID: ${projectId})`);
    
    const result = await deleteProject(projectId, userId);
    console.log(`删除结果: 影响行数 ${result.count}`);
    
    if (result.count === 0) {
      console.log(`删除失败: 没有找到匹配的项目`);
      return res.status(404).json({ message: '项目不存在或无权限删除' });
    }
    
    console.log(`项目删除成功: ID ${projectId}`);
    res.json({ message: '项目已删除' });
  } catch (error) {
    console.error('删除项目时出错:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};