import api from './api';
import { ProjectNote } from '../types';

export const createProjectNote = async (
  projectId: number, 
  noteData: Omit<ProjectNote, 'id' | 'projectId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<ProjectNote> => {
  // 验证数据
  if (!noteData.title || !noteData.title.trim()) {
    throw new Error('标题不能为空');
  }
  
  if (!noteData.content || !noteData.content.trim()) {
    throw new Error('内容不能为空');
  }
  
  const response = await api.post(`/projects/${projectId}/notes`, noteData);
  return response.data;
};

export const getProjectNotes = async (projectId: number): Promise<ProjectNote[]> => {
  const response = await api.get(`/projects/${projectId}/notes`);
  return response.data;
};

export const getProjectNote = async (noteId: number): Promise<ProjectNote> => {
  const response = await api.get(`/notes/${noteId}`);
  return response.data;
};

export const updateProjectNote = async (
  noteId: number, 
  noteData: Partial<Omit<ProjectNote, 'id' | 'projectId' | 'userId' | 'createdAt'>>
): Promise<ProjectNote> => {
  const response = await api.put(`/notes/${noteId}`, noteData);
  return response.data;
};

export const deleteProjectNote = async (noteId: number): Promise<void> => {
  await api.delete(`/notes/${noteId}`);
};