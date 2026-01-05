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
  const [searchQuery, setSearchQuery] = useState(''); // 新增：搜索查询状态
  
  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // 批量删除相关状态
  const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+F 聚焦搜索框
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="搜索项目"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // ESC 键清除搜索
      if (event.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery]);

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

  // 批量删除相关处理函数
  const handleToggleBatchDeleteMode = () => {
    if (isBatchDeleteMode) {
      setIsBatchDeleteMode(false);
      setSelectedProjectIds([]);
    } else {
      setIsBatchDeleteMode(true);
    }
  };

  const handleSelectProject = (project: Project, selected: boolean) => {
    if (selected) {
      setSelectedProjectIds(prev => [...prev, project.id]);
    } else {
      setSelectedProjectIds(prev => prev.filter(id => id !== project.id));
    }
  };

  const handleSelectAllProjects = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map(p => p.id));
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedProjectIds.length > 0) {
      setShowBatchDeleteConfirm(true);
    }
  };

  const handleConfirmBatchDelete = async () => {
    try {
      for (const projectId of selectedProjectIds) {
        await deleteProject(projectId);
      }
      setSelectedProjectIds([]);
      setIsBatchDeleteMode(false);
      setShowBatchDeleteConfirm(false);
    } catch (error) {
      console.error('批量删除项目失败:', error);
      alert('批量删除项目失败，请重试');
    }
  };

  const handleCancelBatchDelete = () => {
    setShowBatchDeleteConfirm(false);
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

  // 搜索过滤函数
  const filterProjectsBySearch = (projects: Project[], query: string) => {
    if (!query.trim()) return projects;
    
    const searchTerm = query.toLowerCase().trim();
    return projects.filter(project => {
      // 搜索项目名称
      const nameMatch = project.name.toLowerCase().includes(searchTerm);
      
      // 搜索项目描述
      const descriptionMatch = project.description?.toLowerCase().includes(searchTerm) || false;
      
      // 搜索状态（中文）
      const statusMap: { [key: string]: string } = {
        'planning': '规划中',
        'active': '进行中',
        'completed': '已完成',
        'on-hold': '暂停'
      };
      const statusMatch = statusMap[project.status]?.includes(searchTerm) || false;
      
      return nameMatch || descriptionMatch || statusMatch;
    });
  };

  // 按状态过滤项目，然后应用搜索
  const statusFilteredProjects = projects.filter(project => {
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

  const filteredProjects = filterProjectsBySearch(statusFilteredProjects, searchQuery);

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
        
        <div className="flex items-center gap-3">
          {/* 搜索框 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜索项目... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                title="清除搜索 (ESC)"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 创建项目按钮 */}
          {!isBatchDeleteMode && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white w-10 h-10 rounded-lg text-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
              title="创建项目"
            >
              ➕
            </button>
          )}

          {/* 删除项目按钮 */}
          {!isBatchDeleteMode ? (
            <button
              onClick={handleToggleBatchDeleteMode}
              className="bg-gray-100 text-gray-600 w-10 h-10 rounded-lg text-lg hover:bg-red-100 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
              title="批量删除"
            >
              🗑️
            </button>
          ) : (
            <button
              onClick={handleToggleBatchDeleteMode}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all duration-200"
              title="取消批量删除"
            >
              取消
            </button>
          )}
        </div>
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

      {/* 批量删除模式工具栏 */}
      {isBatchDeleteMode && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjectIds.length === filteredProjects.length && filteredProjects.length > 0}
                onChange={handleSelectAllProjects}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">全选</span>
            </label>
            <span className="text-sm text-gray-600">
              已选择 {selectedProjectIds.length} 个项目
            </span>
          </div>
          <button
            onClick={handleBatchDeleteClick}
            disabled={selectedProjectIds.length === 0}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedProjectIds.length > 0
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            删除选中 ({selectedProjectIds.length})
          </button>
        </div>
      )}

      {/* 搜索结果提示 */}
      {searchQuery && (
        <div className="flex items-center justify-between text-sm bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-blue-700 font-medium">
            找到 {filteredProjects.length} 个包含 "{searchQuery}" 的项目
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* 项目网格 */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            {searchQuery ? '🔍' : '📋'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery 
              ? `没有找到包含"${searchQuery}"的项目` 
              : filter === 'all' 
                ? '还没有项目' 
                : `没有${filter === 'active' ? '进行中' : filter === 'completed' ? '已完成' : filter === 'planning' ? '规划中' : '暂停'}的项目`
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? '尝试使用不同的关键词搜索，或清除搜索条件查看所有项目'
              : filter === 'all' 
                ? '创建您的第一个项目来开始管理任务' 
                : '切换到其他筛选条件查看项目'
            }
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              清除搜索
            </button>
          ) : filter === 'all' && (
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
            <div key={project.id} className="relative">
              {/* 批量删除模式下的选择框 */}
              {isBatchDeleteMode && (
                <div 
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.includes(project.id)}
                    onChange={(e) => handleSelectProject(project, e.target.checked)}
                    className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500 cursor-pointer shadow-sm"
                  />
                </div>
              )}
              <div 
                className={`${isBatchDeleteMode && selectedProjectIds.includes(project.id) ? 'ring-2 ring-red-400 rounded-lg' : ''}`}
                onClick={isBatchDeleteMode ? () => handleSelectProject(project, !selectedProjectIds.includes(project.id)) : undefined}
              >
                <ProjectCard
                  project={project}
                  onEdit={isBatchDeleteMode ? undefined : handleEditProject}
                  onDelete={isBatchDeleteMode ? undefined : handleDeleteProjectWithConfirm}
                  onView={isBatchDeleteMode ? undefined : handleViewProject}
                />
              </div>
            </div>
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

      {/* 批量删除项目确认对话框 */}
      <ConfirmDialog
        isOpen={showBatchDeleteConfirm}
        onClose={handleCancelBatchDelete}
        onConfirm={handleConfirmBatchDelete}
        title="批量删除项目"
        message={`确定要删除选中的 ${selectedProjectIds.length} 个项目吗？此操作将同时删除项目下的所有任务，且无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ProjectsPage;