import { create } from 'zustand';
import { Project, ProjectStats, ProjectTaskStats } from '../types';
import api from '../services/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'userId'>) => Promise<void>;
  updateProject: (id: number, project: Partial<Omit<Project, 'id' | 'userId'>>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Statistics
  getProjectStats: () => Promise<ProjectStats>;
  getProjectTaskStats: (projectId: number) => Promise<ProjectTaskStats>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '获取项目列表失败', 
        loading: false 
      });
    }
  },

  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/projects', projectData);
      set(state => ({ 
        projects: [...state.projects, response.data], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '创建项目失败', 
        loading: false 
      });
    }
  },

  updateProject: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/projects/${id}`, updates);
      set(state => ({
        projects: state.projects.map(p => p.id === id ? response.data : p),
        currentProject: state.currentProject?.id === id ? response.data : state.currentProject,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '更新项目失败', 
        loading: false 
      });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '删除项目失败', 
        loading: false 
      });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  getProjectStats: async () => {
    // Mock implementation for now
    const projects = get().projects;
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      completionRate: projects.length > 0 ? projects.filter(p => p.status === 'completed').length / projects.length : 0
    };
  },

  getProjectTaskStats: async (projectId) => {
    // Mock implementation for now
    const project = get().projects.find(p => p.id === projectId);
    return {
      projectId,
      projectName: project?.name || '未知项目',
      projectStatus: project?.status || 'planning',
      totalTasks: project?.taskCount || 0,
      completedTasks: project?.completedTaskCount || 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: project?.progress ? project.progress / 100 : 0,
      progress: project?.progress || 0
    };
  }
}));