import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Project, Task } from '../types';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskSelector from '../components/TaskSelector';
import TaskRemover from '../components/TaskRemover';
import ConfirmDialog from '../components/ConfirmDialog';
import GanttChart from '../components/GanttChart';
import ProjectNotes from '../components/ProjectNotes';
import ProjectOKR from '../components/ProjectOKR';
import { format } from 'date-fns';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id) : null;

  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, createSubtask, copyTask } = useTaskStore();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false); // 新增：任务选择器状态
  const [isRemoveTaskSelectorOpen, setIsRemoveTaskSelectorOpen] = useState(false); // 新增：移除任务选择器状态
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'blocked' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list'); // 新增：视图模式状态
  const [activeTab, setActiveTab] = useState<'tasks' | 'okr' | 'notes'>('tasks'); // 新增：标签页状态
  
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
  
  // 调试：监听projectTasks变化
  useEffect(() => {
    console.log('ProjectDetailPage: projectTasks 更新了，数量:', projectTasks.length);
    if (projectTasks.length > 0) {
      console.log('ProjectDetailPage: 项目任务列表:', projectTasks.map(t => ({ id: t.id, title: t.title, projectId: t.projectId })));
    }
  }, [projectTasks]);

  // 按状态过滤任务
  const filteredTasks = projectTasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'blocked':
        return task.status === 'blocked';
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

  // 新增：处理任务复制
  const handleCopyTask = async (task: Task) => {
    try {
      await copyTask(task.id);
      console.log(`任务"${task.title}"复制成功`);
    } catch (error) {
      console.error('复制任务失败:', error);
      alert('复制任务失败，请重试');
    }
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

  // 新增：处理移除任务（从项目中移除，但不删除任务）
  const handleRemoveTasksFromProject = async (taskIds: number[]) => {
    try {
      console.log('开始从项目中移除任务:', { projectId, taskIds });
      
      // 显示当前项目任务数量
      const currentProjectTasks = tasks.filter(task => task.projectId === projectId && !task.parentTaskId);
      console.log('移除前项目任务数量:', currentProjectTasks.length);
      
      // 批量更新任务，将projectId设置为null
      for (const taskId of taskIds) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          console.log(`移除前任务 ${taskId} 的项目ID:`, task.projectId);
          
          // 保持任务的其他属性不变，只将projectId设置为null
          const updatedTaskData: Omit<Task, 'id' | 'userId'> = {
            title: task.title,
            description: task.description || '',
            status: task.status,
            urgency: task.urgency,
            importance: task.importance,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            categoryId: task.categoryId,
            projectId: null as any // 明确设置为null，移除项目关联
          };
          
          console.log(`准备移除任务 ${taskId} 的项目关联:`, updatedTaskData);
          await updateTask(taskId, updatedTaskData);
          console.log(`任务 ${taskId} 项目关联移除完成`);
        } else {
          console.warn(`未找到任务 ${taskId}`);
        }
      }
      
      console.log(`所有任务项目关联移除完成，开始刷新任务列表`);
      
      // 强制刷新任务列表 - 使用Promise确保完成
      await fetchTasks();
      console.log('任务列表刷新完成');
      
      // 验证移除结果
      setTimeout(() => {
        const updatedProjectTasks = tasks.filter(task => task.projectId === projectId && !task.parentTaskId);
        console.log('移除后项目任务数量:', updatedProjectTasks.length);
        console.log('移除的任务数量:', taskIds.length);
        console.log('预期剩余任务数量:', currentProjectTasks.length - taskIds.length);
      }, 500);
      
      console.log(`成功从项目中移除了 ${taskIds.length} 个任务`);
      
    } catch (error) {
      console.error('从项目中移除任务失败:', error);
      alert(`移除任务失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
      case 'blocked':
        return projectTasks.filter(t => t.status === 'blocked').length;
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
        return { color: 'bg-blue-100 text-blue-800', icon: '🚀', text: '处理中' };
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
    <div className="space-y-4">
      {/* 项目头部信息 - 更紧凑布局 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        {/* 头部一行：返回按钮 + 项目信息居中 + 操作按钮 */}
        <div className="flex items-center justify-between mb-2">
          {/* 左侧：返回按钮 */}
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="返回项目列表"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          {/* 中间：项目信息居中 */}
          <div className="flex-1 text-center px-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-900">{currentProject.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color} flex items-center gap-1`}>
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.text}</span>
              </span>
            </div>
            {currentProject.description && (
              <div 
                className="text-xs text-gray-600 max-w-md mx-auto truncate prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
                dangerouslySetInnerHTML={{ __html: currentProject.description }}
              />
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-1">
            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="bg-blue-600 text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-all duration-200"
            >
              创建任务
            </button>
            <button
              onClick={() => setIsTaskSelectorOpen(true)}
              className="bg-green-600 text-white px-2 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition-all duration-200"
            >
              添加任务
            </button>
            <button
              onClick={() => setIsRemoveTaskSelectorOpen(true)}
              className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                projectTasks.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              disabled={projectTasks.length === 0}
              title={projectTasks.length === 0 ? "当前项目没有任务可移除" : "从项目中移除任务"}
            >
              移除任务
            </button>
          </div>
        </div>

        {/* 项目日期信息 - 更紧凑显示 */}
        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-2">
          {currentProject.startDate && (
            <span>开始: {format(new Date(currentProject.startDate), 'MM-dd')}</span>
          )}
          {currentProject.endDate && (
            <span>结束: {format(new Date(currentProject.endDate), 'MM-dd')}</span>
          )}
          {currentProject.createdAt && (
            <span>创建: {format(new Date(currentProject.createdAt), 'MM-dd')}</span>
          )}
        </div>

        {/* 项目进度 - 更紧凑显示 */}
        {totalTasks > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">项目进度</span>
              <span className="text-xs font-medium text-gray-900">
                {completedTasks}/{totalTasks} ({progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 任务筛选和列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* 标签页导航 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 任务管理
            </button>
            <button
              onClick={() => setActiveTab('okr')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'okr'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 OKR管理
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 项目记录
            </button>
          </div>

          {/* 视图切换按钮 - 只在任务标签页显示 */}
          {activeTab === 'tasks' && (
            <div className="flex bg-gray-50 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 列表
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'gantt'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 甘特图
              </button>
            </div>
          )}
        </div>

        {/* 标签页内容 */}
        {activeTab === 'tasks' && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">项目任务</h2>
            </div>
            
            {/* 筛选按钮 - 只在列表视图中显示 */}
            {viewMode === 'list' && (
              <div className="flex flex-wrap gap-1 mb-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === 'all' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部 ({getTaskCount('all')})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  待办 ({getTaskCount('pending')})
                </button>
                <button
                  onClick={() => setFilter('in-progress')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === 'in-progress' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  处理中 ({getTaskCount('in-progress')})
                </button>
                <button
                  onClick={() => setFilter('blocked')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === 'blocked' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  阻塞 ({getTaskCount('blocked')})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  {filter === 'all' ? '还没有任务' : `没有${filter === 'pending' ? '待办' : filter === 'in-progress' ? '处理中' : filter === 'blocked' ? '阻塞' : '已完成'}的任务`}
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
                    onCopy={handleCopyTask}
                    compact={false}
                    showPriority={true}
                    showSubtasks={true} // 启用子任务显示
                    onCreateSubtask={handleCreateSubtask} // 添加子任务创建功能
                    showProject={false} // 项目详情页面不显示项目标签
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'okr' && currentProject && (
          <ProjectOKR project={currentProject} />
        )}

        {activeTab === 'notes' && currentProject && (
          <ProjectNotes
            project={currentProject}
            onNotesChange={() => {
              // 可选：当记录变化时刷新项目数据
              fetchProjects();
            }}
          />
        )}
      </div>

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

      {/* 任务移除器弹窗 */}
      {currentProject && (
        <TaskRemover
          isOpen={isRemoveTaskSelectorOpen}
          onClose={() => setIsRemoveTaskSelectorOpen(false)}
          onRemoveTasks={handleRemoveTasksFromProject}
          currentProject={currentProject}
          title={`从"${currentProject.name}"中移除任务`}
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