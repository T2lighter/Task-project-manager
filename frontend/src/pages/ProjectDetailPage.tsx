import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Project, Task } from '../types';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskSelector from '../components/TaskSelector';
import ConfirmDialog from '../components/ConfirmDialog';
import GanttChart from '../components/GanttChart';
import ProjectNotes from '../components/ProjectNotes';
import { format } from 'date-fns';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id) : null;

  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, createSubtask } = useTaskStore();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false); // 新增：任务选择器状态
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list'); // 新增：视图模式状态
  
  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      setCurrentProject(project || null);
    }
  }, [projectId, projects]);

  // 调试：监听tasks变化
  useEffect(() => {
    console.log('ProjectDetailPage: tasks 更新了，数量:', tasks.length);
    if (tasks.length > 0) {
      const tasksWithProject = tasks.filter(t => t.projectId !== null);
      console.log('ProjectDetailPage: 有项目的任务数量:', tasksWithProject.length);
      if (projectId) {
        const currentProjectTasks = tasks.filter(t => t.projectId === projectId);
        console.log(`ProjectDetailPage: 项目${projectId}的任务数量:`, currentProjectTasks.length);
      }
    }
  }, [tasks, projectId]);

  // 获取当前项目的主任务（排除子任务）
  const projectTasks = tasks.filter(task => task.projectId === projectId && !task.parentTaskId);

  // 按状态过滤任务
  const filteredTasks = projectTasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  // 任务操作处理函数
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'userId'>) => {
    // 确保任务关联到当前项目
    const newTaskData = {
      ...taskData,
      projectId: projectId || undefined
    };
    createTask(newTaskData);
    setIsTaskFormOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'userId'>) => {
    if (editingTask) {
      // 确保任务仍然关联到当前项目
      const updatedTaskData = {
        ...taskData,
        projectId: projectId || undefined
      };
      updateTask(editingTask.id, updatedTaskData);
      setEditingTask(null);
      setIsTaskFormOpen(false);
    }
  };

  const handleDeleteTaskWithConfirm = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleCancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // 处理从表单中删除任务
  const handleDeleteTaskFromForm = () => {
    if (editingTask) {
      deleteTask(editingTask.id);
      setEditingTask(null);
      setIsTaskFormOpen(false);
    }
  };

  const handleCloseForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  // 新增：处理创建子任务
  const handleCreateSubtask = async (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => {
    try {
      await createSubtask(parentTaskId, subtaskData);
      // 刷新任务列表以获取最新的子任务数据
      await fetchTasks();
    } catch (error) {
      console.error('创建子任务失败:', error);
      alert('创建子任务失败，请重试');
    }
  };

  // 新增：处理添加现有任务
  const handleAddExistingTasks = async (taskIds: number[]) => {
    try {
      console.log('开始添加任务到项目:', { projectId, taskIds });
      
      // 批量更新任务的项目ID
      const updatePromises = taskIds.map(async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          // 保持任务的其他属性不变，只更新projectId
          const updatedTaskData = {
            title: task.title,
            description: task.description || '',
            status: task.status,
            urgency: task.urgency,
            importance: task.importance,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            categoryId: task.categoryId,
            projectId: projectId || undefined
          };
          
          console.log(`准备更新任务 ${taskId}:`, updatedTaskData);
          await updateTask(taskId, updatedTaskData);
          console.log(`任务 ${taskId} 更新完成`);
        }
      });
      
      await Promise.all(updatePromises);
      console.log(`所有任务更新完成，开始刷新任务列表`);
      
      // 强制刷新任务列表
      await fetchTasks();
      console.log('任务列表刷新完成');
    } catch (error) {
      console.error('添加任务到项目失败:', error);
      alert('添加任务失败，请重试');
    }
  };

  // 计算各种状态的任务数量
  const getTaskCount = (filterType: string) => {
    switch (filterType) {
      case 'all':
        return projectTasks.length;
      case 'pending':
        return projectTasks.filter(t => t.status === 'pending').length;
      case 'in-progress':
        return projectTasks.filter(t => t.status === 'in-progress').length;
      case 'completed':
        return projectTasks.filter(t => t.status === 'completed').length;
      default:
        return 0;
    }
  };

  // 计算项目进度
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 获取项目状态的样式配置
  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return { color: 'bg-gray-100 text-gray-800', icon: '📋', text: '规划中' };
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: '🚀', text: '进行中' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: '已完成' };
      case 'on-hold':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏸️', text: '暂停' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: '❌', text: '已取消' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📋', text: '未知' };
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">项目不存在</h3>
          <p className="text-gray-600 mb-4">请检查项目ID是否正确</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回项目列表
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentProject.status);

  return (
    <div className="space-y-6">
      {/* 项目头部信息 - 紧凑布局 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* 头部一行：返回按钮 + 项目信息居中 + 操作按钮 */}
        <div className="flex items-center justify-between mb-3">
          {/* 左侧：返回按钮 */}
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="返回项目列表"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          {/* 中间：项目信息居中 */}
          <div className="flex-1 text-center px-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{currentProject.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color} flex items-center gap-1`}>
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.text}</span>
              </span>
            </div>
            {currentProject.description && (
              <p className="text-sm text-gray-600 max-w-md mx-auto">{currentProject.description}</p>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all duration-200"
            >
              创建任务
            </button>
            <button
              onClick={() => setIsTaskSelectorOpen(true)}
              className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200"
            >
              添加任务
            </button>
          </div>
        </div>

        {/* 项目日期信息 - 紧凑显示 */}
        <div className="flex justify-center gap-6 text-xs text-gray-500 mb-3">
          {currentProject.startDate && (
            <span>开始: {format(new Date(currentProject.startDate), 'yyyy-MM-dd')}</span>
          )}
          {currentProject.endDate && (
            <span>结束: {format(new Date(currentProject.endDate), 'yyyy-MM-dd')}</span>
          )}
          {currentProject.createdAt && (
            <span>创建: {format(new Date(currentProject.createdAt), 'MM-dd HH:mm')}</span>
          )}
        </div>

        {/* 项目进度 - 紧凑显示 */}
        {totalTasks > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">项目进度</span>
              <span className="text-xs font-medium text-gray-900">
                {completedTasks}/{totalTasks} ({progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 任务筛选和列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">项目任务</h2>
          {/* 视图切换按钮 */}
          <div className="flex bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 列表视图
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 甘特图
            </button>
          </div>
        </div>
        
        {/* 筛选按钮 - 只在列表视图中显示 */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部任务 ({getTaskCount('all')})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              待办 ({getTaskCount('pending')})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'in-progress' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              进行中 ({getTaskCount('in-progress')})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              已完成 ({getTaskCount('completed')})
            </button>
          </div>
        )}

        {/* 任务内容区域 */}
        {viewMode === 'gantt' ? (
          /* 甘特图视图 */
          <GanttChart
            tasks={projectTasks} // 使用所有项目任务，不受筛选影响
            onTaskClick={handleEditTask}
          />
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? '还没有任务' : `没有${filter === 'pending' ? '待办' : filter === 'in-progress' ? '进行中' : '已完成'}的任务`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' ? '为这个项目添加第一个任务' : '切换到其他筛选条件查看任务'}
            </p>
            {filter === 'all' && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建新任务
                </button>
                <button
                  onClick={() => setIsTaskSelectorOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  添加现有任务
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 列表视图 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTaskWithConfirm}
                compact={false}
                showPriority={true}
                showSubtasks={true} // 启用子任务显示
                onCreateSubtask={handleCreateSubtask} // 添加子任务创建功能
                showProject={false} // 项目详情页面不显示项目标签
              />
            ))}
          </div>
        )}
      </div>

      {/* 项目记录与总结 */}
      <ProjectNotes
        project={currentProject}
        onNotesChange={() => {
          // 可选：当记录变化时刷新项目数据
          fetchProjects();
        }}
      />

      {/* 任务表单弹窗 */}
      <TaskForm
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onClose={handleCloseForm}
        onDelete={editingTask ? handleDeleteTaskFromForm : undefined}
        defaultProjectId={projectId} // 新增：传递当前项目ID作为默认值
        isOpen={isTaskFormOpen}
        asModal={true}
      />

      {/* 任务选择器弹窗 */}
      {currentProject && (
        <TaskSelector
          isOpen={isTaskSelectorOpen}
          onClose={() => setIsTaskSelectorOpen(false)}
          onSelectTasks={handleAddExistingTasks}
          currentProject={currentProject}
          title={`添加任务到"${currentProject.name}"`}
        />
      )}

      {/* 删除任务确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDeleteTask}
        onConfirm={handleConfirmDeleteTask}
        title="删除任务"
        message={taskToDelete ? `确定要删除任务"${taskToDelete.title}"吗？此操作无法撤销。` : ''}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default ProjectDetailPage;