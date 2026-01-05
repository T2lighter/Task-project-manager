import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Quadrant from '../components/Quadrant';
import KanbanBoard from '../components/KanbanBoard';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomLabelManager from '../components/CustomLabelManager';
import PersonalizedView from '../components/PersonalizedView';
import { useTaskStore } from '../store/taskStore';
import { useLabelStore } from '../store/labelStore';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, batchDeleteTasks, createSubtask, copyTask } = useTaskStore();
  const { 
    labels, 
    loading: labelsLoading,
    fetchLabels, 
    createLabel, 
    updateLabel, 
    deleteLabel,
    assignLabelToTask,
    removeLabelFromTask
  } = useLabelStore();
  
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue' | 'due-today' | 'this-week'>('all');
  const [viewMode, setViewMode] = useState<'quadrant' | 'kanban' | 'personalized'>('quadrant'); // 新增：个性化视图
  const [searchQuery, setSearchQuery] = useState(''); // 新增：搜索查询状态
  const [showLabelManager, setShowLabelManager] = useState(false); // 新增：标签管理对话框状态
  
  // 新增：控制删除确认对话框的状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // 新增：任务列表拖拽状态
  const [isDragOverTaskList, setIsDragOverTaskList] = useState(false);

  // 批量删除相关状态
  const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);


  React.useEffect(() => {
    fetchTasks();
    fetchLabels(); // 获取标签数据
  }, [fetchTasks, fetchLabels]);

  // 当切换到个性化展示时，重新同步任务标签数据
  React.useEffect(() => {
    if (viewMode === 'personalized' && labels.length > 0) {
      // 使用setTimeout确保在下一个事件循环中执行，避免状态更新冲突
      const timeoutId = setTimeout(() => {
        syncTaskLabels();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [viewMode, labels]); // 依赖viewMode和labels变化

  // 同步任务标签数据的函数
  const syncTaskLabels = React.useCallback(() => {
    if (labels.length === 0 || tasks.length === 0) return;
    
    try {
      // 从本地存储获取任务标签映射
      JSON.parse(localStorage.getItem('task_labels_mapping') || '{}');
      // 这里可以添加同步逻辑，但现在先简化处理
    } catch (error) {
      console.error('同步任务标签数据失败:', error);
    }
  }, [tasks, labels]);

  // 从location.state中获取筛选条件并应用
  React.useEffect(() => {
    const filterState = location.state?.filter;
    if (filterState && ['all', 'pending', 'in-progress', 'completed', 'overdue', 'due-today', 'this-week'].includes(filterState)) {
      setFilter(filterState as 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue' | 'due-today' | 'this-week');
    }
  }, [location.state]);

  // 键盘快捷键：Ctrl+F 或 Cmd+F 聚焦搜索框
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="搜索任务"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
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

  const handleCreateTask = async (task: Omit<Task, 'id' | 'userId'>) => {
    try {
      await createTask(task);
      setIsFormOpen(false);
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = async (task: Omit<Task, 'id' | 'userId'>) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, task);
        setEditingTask(null);
        setIsFormOpen(false);
      } catch (error) {
        console.error('更新任务失败:', error);
        alert('更新任务失败，请重试');
      }
    }
  };

  // 处理任务复制
  const handleCopyTask = async (task: Task) => {
    try {
      await copyTask(task.id);
    } catch (error) {
      console.error('复制任务失败:', error);
      alert('复制任务失败，请重试');
    }
  };

  // 处理创建子任务
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

  // 处理单个任务删除确认
  const handleDeleteTaskWithConfirm = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete.id);
        setTaskToDelete(null);
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败，请重试');
      }
    }
  };

  const handleCancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // 批量删除相关处理函数
  const handleToggleBatchDeleteMode = () => {
    if (isBatchDeleteMode) {
      // 退出批量删除模式，清空选择
      setIsBatchDeleteMode(false);
      setSelectedTaskIds([]);
    } else {
      // 进入批量删除模式
      setIsBatchDeleteMode(true);
    }
  };

  const handleSelectTask = (task: Task, selected: boolean) => {
    if (selected) {
      setSelectedTaskIds(prev => [...prev, task.id]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== task.id));
    }
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      // 全部取消选择
      setSelectedTaskIds([]);
    } else {
      // 全选
      setSelectedTaskIds(filteredTasks.map(task => task.id));
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedTaskIds.length > 0) {
      setShowBatchDeleteConfirm(true);
    }
  };

  const handleConfirmBatchDelete = async () => {
    try {
      await batchDeleteTasks(selectedTaskIds);
      setSelectedTaskIds([]);
      setIsBatchDeleteMode(false);
      setShowBatchDeleteConfirm(false);
    } catch (error) {
      console.error('批量删除任务失败:', error);
      alert('批量删除任务失败，请重试');
    }
  };

  const handleCancelBatchDelete = () => {
    setShowBatchDeleteConfirm(false);
  };

  // 处理拖拽任务到标签区域
  const handleDropTaskToLabel = async (task: Task, labelId: number) => {
    try {
      // 检查任务是否已经有这个标签
      const existingLabel = task.labels?.find(tl => tl.labelId === labelId);
      if (existingLabel) {
        return;
      }

      await assignLabelToTask(task.id, labelId);
      await fetchTasks(); // 重新获取任务数据
    } catch (error) {
      console.error('拖拽分配标签失败:', error);
      alert('添加标签失败，请重试');
    }
  };

  const handleDropTaskToTaskList = async (task: Task) => {
    try {
      // 检查是否从特定标签拖拽
      const dragFromLabelData = sessionStorage.getItem('dragFromLabel');
      
      if (dragFromLabelData) {
        // 从特定标签拖拽，只移除该标签
        const { taskId, labelId } = JSON.parse(dragFromLabelData);
        
        if (taskId === task.id) {
          // 移除特定标签
          await removeLabelFromTask(task.id, labelId);
          await fetchTasks(); // 重新获取任务数据
        }
        
        // 清理sessionStorage
        sessionStorage.removeItem('dragFromLabel');
      } else {
        // 从任务列表拖拽，移除所有标签（保持原有逻辑）
        const currentLabels = task.labels || [];
        
        if (currentLabels.length === 0) {
          return;
        }
        
        // 移除任务的所有标签
        for (const taskLabel of currentLabels) {
          await removeLabelFromTask(task.id, taskLabel.labelId);
        }
        
        await fetchTasks(); // 重新获取任务数据
      }
    } catch (error) {
      console.error('取消任务标签关联失败:', error);
    }
  };



  // 处理从表单中删除任务
  const handleDeleteTaskFromForm = async () => {
    if (editingTask) {
      try {
        await deleteTask(editingTask.id);
        setEditingTask(null);
        setIsFormOpen(false);
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败，请重试');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleDragStartTask = (_task: Task) => {
    // 拖拽开始时的处理逻辑（如果需要的话）
  };

  const handleDropTask = async (task: Task, newUrgency: boolean, newImportance: boolean) => {
    // 验证任务数据完整性
    if (!task || !task.id) {
      console.error('无效的任务数据:', task);
      return;
    }
    
    // 只有当任务的紧急/重要状态发生变化时才更新
    if (task.urgency !== newUrgency || task.importance !== newImportance) {
      // 解构任务数据，排除id和userId，并确保所有必需字段都存在
      const { id, userId, category, ...taskData } = task;
      
      // 准备更新数据
      const updateData = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        urgency: newUrgency,
        importance: newImportance,
        dueDate: taskData.dueDate || undefined,
        categoryId: taskData.categoryId || undefined
      };
      
      try {
        await updateTask(task.id, updateData);
      } catch (error) {
        console.error('移动任务失败:', error);
        alert('移动任务失败，请重试');
      }
    }
  };

  // 看板模式的拖拽处理函数
  const handleKanbanDropTask = async (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => {
    // 验证任务数据完整性
    if (!task || !task.id) {
      console.error('无效的任务数据:', task);
      return;
    }
    
    // 只有当任务状态发生变化时才更新
    if (task.status !== newStatus) {
      // 解构任务数据，排除id和userId
      const { id, userId, category, ...taskData } = task;
      
      // 准备更新数据
      const updateData = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: newStatus,
        urgency: taskData.urgency || false,
        importance: taskData.importance || false,
        dueDate: taskData.dueDate || undefined,
        categoryId: taskData.categoryId || undefined
      };
      
      try {
        await updateTask(task.id, updateData);
      } catch (error) {
        console.error('更新任务状态失败:', error);
        alert('更新任务状态失败，请重试');
      }
    }
  };

  // 四象限任务状态排序函数
  const sortTasksByStatus = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // 定义状态权重：进行中(2) > 代办(1)
      const getStatusWeight = (task: Task) => {
        if (task.status === 'in-progress') return 2; // 进行中
        if (task.status === 'pending') return 1; // 代办
        return 0; // 其他状态
      };

      const weightA = getStatusWeight(a);
      const weightB = getStatusWeight(b);
      
      // 按权重降序排列（高权重在前）
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      // 如果状态相同，按创建时间排序（新的在前）
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  };

  // 搜索过滤函数
  const filterTasksBySearch = (tasks: Task[], query: string) => {
    if (!query.trim()) return tasks;
    
    const searchTerm = query.toLowerCase().trim();
    return tasks.filter(task => {
      // 搜索任务标题
      const titleMatch = task.title.toLowerCase().includes(searchTerm);
      
      // 搜索任务描述
      const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) || false;
      
      // 搜索分类名称
      const categoryMatch = task.category?.name.toLowerCase().includes(searchTerm) || false;
      
      // 搜索项目名称
      const projectMatch = task.project?.name.toLowerCase().includes(searchTerm) || false;
      
      // 搜索状态（中文）
      const statusMatch = (() => {
        const statusNames = {
          'pending': '待办',
          'in-progress': '进行中',
          'completed': '已完成'
        };
        const statusName = statusNames[task.status as keyof typeof statusNames];
        return statusName?.toLowerCase().includes(searchTerm) || false;
      })();
      
      // 搜索优先级（中文）
      const priorityMatch = (() => {
        let priorityName = '';
        if (task.urgency && task.importance) priorityName = '紧急重要';
        else if (!task.urgency && task.importance) priorityName = '重要';
        else if (task.urgency && !task.importance) priorityName = '紧急';
        else priorityName = '普通';
        
        return priorityName.toLowerCase().includes(searchTerm);
      })();
      
      return titleMatch || descriptionMatch || categoryMatch || projectMatch || statusMatch || priorityMatch;
    });
  };

  // 按象限过滤任务（不包含已完成任务和子任务）并排序，然后应用搜索
  const quadrant1Tasks = filterTasksBySearch(
    sortTasksByStatus(tasks.filter(task => task.urgency && task.importance && task.status !== 'completed' && !task.parentTaskId)),
    searchQuery
  );
  const quadrant2Tasks = filterTasksBySearch(
    sortTasksByStatus(tasks.filter(task => !task.urgency && task.importance && task.status !== 'completed' && !task.parentTaskId)),
    searchQuery
  );
  const quadrant3Tasks = filterTasksBySearch(
    sortTasksByStatus(tasks.filter(task => task.urgency && !task.importance && task.status !== 'completed' && !task.parentTaskId)),
    searchQuery
  );
  const quadrant4Tasks = filterTasksBySearch(
    sortTasksByStatus(tasks.filter(task => !task.urgency && !task.importance && task.status !== 'completed' && !task.parentTaskId)),
    searchQuery
  );

  // 任务优先级排序函数
  const sortTasksByPriority = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // 定义优先级权重：紧急重要(4) > 紧急(3) > 重要(2) > 普通(1)
      const getPriorityWeight = (task: Task) => {
        if (task.urgency && task.importance) return 4; // 紧急重要
        if (task.urgency && !task.importance) return 3; // 紧急
        if (!task.urgency && task.importance) return 2; // 重要
        return 1; // 普通
      };

      const weightA = getPriorityWeight(a);
      const weightB = getPriorityWeight(b);
      
      // 按权重降序排列（高优先级在前）
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      // 如果优先级相同，按创建时间排序（新的在前）
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  };

  // 按状态过滤任务并排序（排除子任务），然后应用搜索
  const filteredTasks = filterTasksBySearch(
    sortTasksByPriority(tasks.filter(task => {
      // 首先排除子任务
      if (task.parentTaskId) return false;
      
      const now = new Date();
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // 计算本周的开始和结束时间
      const startOfWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 调整为周一开始
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      switch (filter) {
        case 'pending':
          return task.status === 'pending';
        case 'in-progress':
          return task.status === 'in-progress';
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          // 逾期任务：未完成且截止日期已过
          return task.status !== 'completed' && 
                 task.dueDate && 
                 new Date(task.dueDate) < now;
        case 'due-today':
          // 今日到期：未完成且截止日期在今天
          return task.status !== 'completed' &&
                 task.dueDate && 
                 new Date(task.dueDate) >= todayStart && 
                 new Date(task.dueDate) <= todayEnd;
        case 'this-week':
          // 本周任务：未完成且截止日期在本周内
          return task.status !== 'completed' &&
                 task.dueDate && 
                 new Date(task.dueDate) >= startOfWeek && 
                 new Date(task.dueDate) <= endOfWeek;
        default:
          // 默认显示待办和进行中的任务
          return task.status === 'pending' || task.status === 'in-progress';
      }
    })),
    searchQuery
  );

  // 计算各种筛选条件的任务数量（排除子任务）
  const getTaskCount = (filterType: string) => {
    const mainTasks = tasks.filter(t => !t.parentTaskId); // 只计算主任务
    const now = new Date();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    switch (filterType) {
      case 'all':
        return mainTasks.length;
      case 'pending':
        return mainTasks.filter(t => t.status === 'pending').length;
      case 'in-progress':
        return mainTasks.filter(t => t.status === 'in-progress').length;
      case 'completed':
        return mainTasks.filter(t => t.status === 'completed').length;
      case 'overdue':
        return mainTasks.filter(t => 
          t.status !== 'completed' && 
          t.dueDate && 
          new Date(t.dueDate) < now
        ).length;
      case 'due-today':
        return mainTasks.filter(t => 
          t.status !== 'completed' &&
          t.dueDate && 
          new Date(t.dueDate) >= todayStart && 
          new Date(t.dueDate) <= todayEnd
        ).length;
      case 'this-week':
        return mainTasks.filter(t => 
          t.status !== 'completed' &&
          t.dueDate && 
          new Date(t.dueDate) >= startOfWeek && 
          new Date(t.dueDate) <= endOfWeek
        ).length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-2">
      {/* 隐藏原有的h1和span，将按钮移到适当位置 */}
      <div className="flex justify-between items-center">
        {/* 隐藏h1 */}
        <div className="w-0 h-0 overflow-hidden">
          <h1 className="text-3xl font-bold text-gray-900">任务管理</h1>
        </div>
      </div>

      {/* 任务表单弹窗 */}
      <TaskForm
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        onClose={handleCloseForm}
        onDelete={editingTask ? handleDeleteTaskFromForm : undefined}
        isOpen={isFormOpen}
        asModal={true}
      />

      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-3">
            {/* 标题行：任务列表 + 搜索框 + 添加任务按钮 + 删除按钮 */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex-shrink-0">任务列表</h2>
              
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜索任务... (Ctrl+F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                    title="清除搜索 (ESC)"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* 添加任务按钮 */}
              {!isBatchDeleteMode && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 text-white w-10 h-10 rounded-lg text-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex-shrink-0 flex items-center justify-center"
                  title="添加任务"
                >
                  ➕
                </button>
              )}
              
              {/* 删除任务按钮 */}
              {!isBatchDeleteMode ? (
                <button
                  onClick={handleToggleBatchDeleteMode}
                  className="bg-gray-100 text-gray-600 w-10 h-10 rounded-lg text-lg hover:bg-red-100 hover:text-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0 flex items-center justify-center"
                  title="批量删除"
                >
                  🗑️
                </button>
              ) : (
                <button
                  onClick={handleToggleBatchDeleteMode}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all duration-200 flex-shrink-0"
                  title="取消批量删除"
                >
                  取消
                </button>
              )}
            </div>
            
            {/* 搜索结果提示 */}
            {searchQuery && (
              <div className="mb-3 flex items-center justify-between text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-blue-700 font-medium">
                  找到 {filteredTasks.length} 个匹配的任务
                </span>
                <span className="text-blue-500">
                  按 ESC 清除搜索
                </span>
              </div>
            )}

            {/* 批量删除模式工具栏 */}
            {isBatchDeleteMode && (
              <div className="mb-3 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">全选</span>
                  </label>
                  <span className="text-sm text-gray-600">
                    已选择 {selectedTaskIds.length} 个任务
                  </span>
                </div>
                <button
                  onClick={handleBatchDeleteClick}
                  disabled={selectedTaskIds.length === 0}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTaskIds.length > 0
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  删除选中 ({selectedTaskIds.length})
                </button>
              </div>
            )}
            
            {/* 筛选按钮 */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'all' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                全部 ({getTaskCount('all')})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'pending' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                待办 ({getTaskCount('pending')})
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'in-progress' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                进行中 ({getTaskCount('in-progress')})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'completed' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                已完成 ({getTaskCount('completed')})
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'overdue' ? 'bg-red-100 text-red-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                逾期 ({getTaskCount('overdue')})
              </button>
              <button
                onClick={() => setFilter('due-today')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'due-today' ? 'bg-yellow-100 text-yellow-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                今日 ({getTaskCount('due-today')})
              </button>
              <button
                onClick={() => setFilter('this-week')}
                className={`px-2 py-1 rounded-full text-xs ${filter === 'this-week' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                本周 ({getTaskCount('this-week')})
              </button>
            </div>
            
            {/* 任务列表 */}
            <div 
              className={`space-y-2 max-h-[600px] overflow-y-auto transition-all duration-200 ${
                isDragOverTaskList 
                  ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-2' 
                  : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setIsDragOverTaskList(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                // 检查是否真正离开了任务列表区域
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                  setIsDragOverTaskList(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverTaskList(false);
                try {
                  const taskData = e.dataTransfer.getData('text/plain');
                  const task = JSON.parse(taskData) as Task;
                  handleDropTaskToTaskList(task);
                } catch (error) {
                  console.error('拖拽任务到任务列表失败:', error);
                }
              }}
            >
              {/* 拖拽提示 */}
              {isDragOverTaskList && (
                <div className="text-center py-4 text-blue-600 font-medium">
                  <div className="text-2xl mb-2">📋</div>
                  <p>释放以取消任务的标签关联</p>
                </div>
              )}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">
                    {searchQuery ? '🔍' : '📝'}
                  </div>
                  <p className="text-gray-600">
                    {searchQuery ? `没有找到包含"${searchQuery}"的任务` : '暂无任务'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      清除搜索条件
                    </button>
                  )}
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={isBatchDeleteMode ? undefined : handleEditTask}
                    onDelete={isBatchDeleteMode ? undefined : handleDeleteTaskWithConfirm}
                    onCopy={isBatchDeleteMode ? undefined : handleCopyTask}
                    onDragStart={isBatchDeleteMode ? undefined : handleDragStartTask}
                    showSubtasks={!isBatchDeleteMode} // 批量删除模式下不显示子任务
                    onCreateSubtask={isBatchDeleteMode ? undefined : handleCreateSubtask}
                    selectable={isBatchDeleteMode}
                    selected={selectedTaskIds.includes(task.id)}
                    onSelect={handleSelectTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧：视图区域 */}
        <div className="lg:col-span-2">
          {/* 视图切换按钮 */}
          <div className="flex justify-between items-center mb-3">
            <div className="bg-gray-50 rounded-xl p-1 flex shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('quadrant')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'quadrant'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                四象限展示
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                看板展示
              </button>
              <button
                onClick={() => setViewMode('personalized')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'personalized'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                个性化展示
              </button>
            </div>
            
            {/* 标签管理按钮 */}
            {viewMode === 'personalized' && (
              <button
                onClick={() => setShowLabelManager(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                管理标签
              </button>
            )}
          </div>

          {/* 条件渲染视图 */}
          {viewMode === 'quadrant' ? (
            // 艾森豪威尔矩阵
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Quadrant
                title="紧急且重要"
                urgency={true}
                importance={true}
                tasks={quadrant1Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTaskWithConfirm}
                onCopyTask={handleCopyTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
                onCreateSubtask={handleCreateSubtask}
              />
              <Quadrant
                title="重要但不紧急"
                urgency={false}
                importance={true}
                tasks={quadrant2Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTaskWithConfirm}
                onCopyTask={handleCopyTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
                onCreateSubtask={handleCreateSubtask}
              />
              <Quadrant
                title="紧急但不重要"
                urgency={true}
                importance={false}
                tasks={quadrant3Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTaskWithConfirm}
                onCopyTask={handleCopyTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
                onCreateSubtask={handleCreateSubtask}
              />
              <Quadrant
                title="既不紧急也不重要"
                urgency={false}
                importance={false}
                tasks={quadrant4Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTaskWithConfirm}
                onCopyTask={handleCopyTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
                onCreateSubtask={handleCreateSubtask}
              />
            </div>
          ) : viewMode === 'kanban' ? (
            // 看板视图
            <KanbanBoard
              tasks={filterTasksBySearch(tasks.filter(task => !task.parentTaskId), searchQuery)} // 只传递主任务并应用搜索
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskWithConfirm}
              onCopyTask={handleCopyTask}
              onDropTask={handleKanbanDropTask}
              onDragStart={handleDragStartTask}
              onCreateSubtask={handleCreateSubtask}
            />
          ) : (
            // 个性化展示视图
            <PersonalizedView
              tasks={filterTasksBySearch(tasks.filter(task => !task.parentTaskId), searchQuery)}
              labels={labels}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskWithConfirm}
              onCopyTask={handleCopyTask}
              onDragStart={handleDragStartTask}
              onCreateSubtask={handleCreateSubtask}
              onDropTask={handleDropTaskToLabel}
            />
          )}
        </div>
      </div>

      {/* 删除单个任务确认对话框 */}
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

      {/* 批量删除确认对话框 */}
      <ConfirmDialog
        isOpen={showBatchDeleteConfirm}
        onClose={handleCancelBatchDelete}
        onConfirm={handleConfirmBatchDelete}
        title="批量删除任务"
        message={`确定要删除选中的 ${selectedTaskIds.length} 个任务吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />

      {/* 标签管理对话框 */}
      <CustomLabelManager
        isOpen={showLabelManager}
        onClose={() => setShowLabelManager(false)}
        labels={labels}
        loading={labelsLoading}
        onCreateLabel={createLabel}
        onUpdateLabel={updateLabel}
        onDeleteLabel={deleteLabel}
      />
    </div>
  );
};

export default TasksPage;