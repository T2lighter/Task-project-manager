import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import ConfirmDialog from '../components/ConfirmDialog';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    projects, 
    loading, 
    error, 
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject 
  } = useProjectStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'planning' | 'on-hold'>('all');
  
  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 项目操作处理函数
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'userId'>) => {
    createProject(projectData);
    setIsFormOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleUpdateProject = (projectData: Omit<Project, 'id' | 'userId'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteProjectWithConfirm = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleCancelDeleteProject = () => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  // 处理从表单中删除项目
  const handleDeleteProjectFromForm = () => {
    if (editingProject) {
      deleteProject(editingProject.id);
      setEditingProject(null);
      setIsFormOpen(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleViewProject = (project: Project) => {
    // 导航到项目详情页面
    navigate(`/projects/${project.id}`);
  };

  // 按状态过滤项目
  const filteredProjects = projects.filter(project => {
    switch (filter) {
      case 'active':
        return project.status === 'active';
      case 'completed':
        return project.status === 'completed';
      case 'planning':
        return project.status === 'planning';
      case 'on-hold':
        return project.status === 'on-hold';
      default:
        return true;
    }
  });

  // 计算各种状态的项目数量
  const getProjectCount = (filterType: string) => {
    switch (filterType) {
      case 'all':
        return projects.length;
      case 'active':
        return projects.filter(p => p.status === 'active').length;
      case 'completed':
        return projects.filter(p => p.status === 'completed').length;
      case 'planning':
        return projects.filter(p => p.status === 'planning').length;
      case 'on-hold':
        return projects.filter(p => p.status === 'on-hold').length;
      default:
        return 0;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载项目中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-600">❌</span>
          <span className="ml-2 text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-600 mt-1">管理和跟踪您的项目进度</p>
        </div>
        
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          创建项目
        </button>
      </div>

      {/* 筛选按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'all' 
              ? 'bg-indigo-100 text-indigo-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部项目 ({getProjectCount('all')})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'active' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          进行中 ({getProjectCount('active')})
        </button>
        <button
          onClick={() => setFilter('planning')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'planning' 
              ? 'bg-gray-100 text-gray-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          规划中 ({getProjectCount('planning')})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          已完成 ({getProjectCount('completed')})
        </button>
        <button
          onClick={() => setFilter('on-hold')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'on-hold' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          暂停 ({getProjectCount('on-hold')})
        </button>
      </div>

      {/* 项目网格 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? '还没有项目' : `没有${filter === 'active' ? '进行中' : filter === 'completed' ? '已完成' : filter === 'planning' ? '规划中' : '暂停'}的项目`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' ? '创建您的第一个项目来开始管理任务' : '切换到其他筛选条件查看项目'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建项目
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProjectWithConfirm}
              onView={handleViewProject}
            />
          ))}
        </div>
      )}

      {/* 项目表单弹窗 */}
      <ProjectForm
        project={editingProject}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        onClose={handleCloseForm}
        onDelete={editingProject ? handleDeleteProjectFromForm : undefined}
        isOpen={isFormOpen}
        asModal={true}
      />

      {/* 删除项目确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDeleteProject}
        onConfirm={handleConfirmDeleteProject}
        title="删除项目"
        message={projectToDelete ? `确定要删除项目"${projectToDelete.name}"吗？此操作将同时删除项目下的所有任务，且无法撤销。` : ''}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ProjectsPage;