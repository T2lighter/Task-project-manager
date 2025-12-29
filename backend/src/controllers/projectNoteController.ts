import { Request, Response } from 'express';
import {
  createProjectNote,
  getProjectNotes,
  getProjectNoteById,
  updateProjectNote,
  deleteProjectNote
} from '../services/projectNoteService';

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = parseInt(req.params.projectId);
    
    const noteData = {
      ...req.body,
      projectId
    };
    
    const note = await createProjectNote(noteData, userId);
    res.status(201).json(note);
  } catch (error) {
    console.error('创建项目记录失败:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = parseInt(req.params.projectId);
    
    const notes = await getProjectNotes(projectId, userId);
    res.json(notes);
  } catch (error) {
    console.error('获取项目记录失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const noteId = parseInt(req.params.noteId);
    
    const note = await getProjectNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({ message: '项目记录不存在' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('获取项目记录失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const noteId = parseInt(req.params.noteId);
    
    const note = await updateProjectNote(noteId, req.body, userId);
    if (!note) {
      return res.status(404).json({ message: '项目记录不存在' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('更新项目记录失败:', error);
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const noteId = parseInt(req.params.noteId);
    
    const result = await deleteProjectNote(noteId, userId);
    if (result.count === 0) {
      return res.status(404).json({ message: '项目记录不存在' });
    }
    
    res.json({ message: '项目记录已删除' });
  } catch (error) {
    console.error('删除项目记录失败:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};