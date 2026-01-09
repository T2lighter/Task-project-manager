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
import { isTaskOverdue, isTaskDueToday, isTaskDueThisWeek } from '../utils/taskUtils';
import { UI_COLORS } from '../utils/colorUtils'; // 新增：统一颜色配置
import { CARD_STYLES, getCardStyle, combineStyles, getCardHover, getCardShadow } from '../utils/cardStyles';

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
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-today' | 'this-week'>('all');
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
    if (filterState && ['all', 'overdue', 'due-today', 'this-week'].includes(filterState)) {
      setFilter(filterState);
    }
  }, [location.state]);

  // 从location.state中获取四象限筛选条件
  React.useEffect(() => {
    const quadrantFilterState = location.state?.quadrantFilter;
    if (quadrantFilterState) {
      // 设置四象限筛选逻辑
      console.log('四象限筛选:', quadrantFilterState);
    }
  }, [location.state]);

  // 从location.state中获取视图模式并应用（支持从个人主页跳转到看板视图）
  React.useEffect(() => {
    const viewModeState = location.state?.viewMode;
    if (viewModeState && ['quadrant', 'kanban', 'personalized'].includes(viewModeState)) {
      setViewMode(viewModeState as 'quadrant' | 'kanban' | 'personalized');
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

  // 任务优先级排序函数（已完成的任务排在末尾）
  const sortTasksByPriority = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // 首先按状态排序：未完成的任务在前，已完成的任务在后
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // 如果都是已完成或都是未完成，再按优先级排序
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

      switch (filter) {
        case 'overdue':
          return isTaskOverdue(task);
        case 'due-today':
          return isTaskDueToday(task);
        case 'this-week':
          return isTaskDueThisWeek(task);
        default:
          // 全部任务：包含所有任务（包括已完成的，但会在排序中处理顺序）
          return true;
      }
    })),
    searchQuery
  );

  // 计算各种筛选条件的任务数量（排除子任务）
  const getTaskCount = (filterType: string) => {
    const mainTasks = tasks.filter(t => !t.parentTaskId); // 只计算主任务

    switch (filterType) {
      case 'all':
        return mainTasks.length;
      case 'overdue':
        return mainTasks.filter(t => isTaskOverdue(t)).length;
      case 'due-today':
        return mainTasks.filter(t => isTaskDueToday(t)).length;
      case 'this-week':
        return mainTasks.filter(t => isTaskDueThisWeek(t)).length;
      default:
        return 0;
    }
  };

  return (
    <div className={CARD_STYLES.spacing.spaceY2}>
      {/* 隐藏原有的h1和span，将按钮移到适当位置 */}
      <div className={getCardStyle('flex', 'rowBetween')}>
        {/* 隐藏h1 */}
        <div className={CARD_STYLES.state.hidden}>
          <h1 className={`${CARD_STYLES.text.title} ${UI_COLORS.grayText900}`}>任务管理</h1>
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
      <div className={getCardStyle('grid', 'main')}>
        {/* 左侧：任务列表 */}
        <div className={getCardStyle('grid', 'leftCol')}>
          <div className={getCardStyle('container')}>
            {/* 标题行：任务列表 + 搜索框 + 添加任务按钮 + 删除按钮 */}
            <div className={getCardStyle('flex', 'rowCenter') + ' ' + CARD_STYLES.spacing.section}>
              <h2 className={`${CARD_STYLES.text.large} ${CARD_STYLES.text.semibold} ${UI_COLORS.grayText800} ${CARD_STYLES.layout.flexShrink0}`}>任务列表</h2>
              
              {/* 搜索框 */}
              <div className={getCardStyle('searchBox', 'container')}>
                <div className={getCardStyle('searchBox', 'icon')}>
                  <svg className={`${CARD_STYLES.size.small} ${UI_COLORS.grayText400}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜索任务... (Ctrl+F)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={combineStyles(
                    getCardStyle('searchBox', 'input'),
                    `${UI_COLORS.grayBorder300} ${UI_COLORS.placeholder} focus:ring-2 ${UI_COLORS.blueRing500} ${UI_COLORS.blueBorder500} ${UI_COLORS.gray50} hover:${UI_COLORS.bgWhite} focus:${UI_COLORS.bgWhite}`
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={getCardStyle('searchBox', 'clear')}
                    title="清除搜索 (ESC)"
                  >
                    <svg className={`${CARD_STYLES.size.small} ${UI_COLORS.grayText400} ${UI_COLORS.grayHoverText600}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* 添加任务按钮 */}
              {!isBatchDeleteMode && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className={combineStyles(
                    `${UI_COLORS.blue600} text-white ${CARD_STYLES.spacing.icon} ${UI_COLORS.blueHover700}`,
                    getCardStyle('button'),
                    getCardHover(true, true),
                    CARD_STYLES.layout.flexShrink0 + ' ' + CARD_STYLES.position.flexCenter
                  )}
                  title="添加任务"
                >
                  ➕
                </button>
              )}
              
              {/* 删除任务按钮 */}
              {!isBatchDeleteMode ? (
                <button
                  onClick={handleToggleBatchDeleteMode}
                  className={combineStyles(
                    `${UI_COLORS.batchDeleteBg} ${UI_COLORS.batchDeleteText} ${getCardStyle('spacing', 'icon')}`,
                    getCardStyle('button'),
                    getCardHover(true, false),
                    CARD_STYLES.layout.flexShrink0 + ' ' + CARD_STYLES.position.flexCenter
                  )}
                  title="批量删除"
                >
                  🗑️
                </button>
              ) : (
                <button
                  onClick={handleToggleBatchDeleteMode}
                  className={combineStyles(
                    `${UI_COLORS.gray200} ${UI_COLORS.grayText700} ${getCardStyle('spacing', 'button')}`,
                    getCardStyle('spacing', 'text'),
                    getCardStyle('animation', 'transition'),
                    CARD_STYLES.layout.flexShrink0
                  )}
                  title="取消批量删除"
                >
                  取消
                </button>
              )}
            </div>
            
            {/* 搜索结果提示 */}
            {searchQuery && (
              <div className={combineStyles(
                getCardStyle('toolbar'),
                `${UI_COLORS.blue50} ${UI_COLORS.blueBorder200} ${getCardStyle('spacing', 'smallText')}`
              )}>
                <span className={combineStyles(UI_COLORS.blueText700, CARD_STYLES.text.medium)}>
                  找到 {filteredTasks.length} 个匹配的任务
                </span>
                <span className={`${UI_COLORS.blueText600}`}>
                  按 ESC 清除搜索
                </span>
              </div>
            )}

            {/* 批量删除模式工具栏 */}
            {isBatchDeleteMode && (
              <div className={combineStyles(
                getCardStyle('toolbar'),
                `${UI_COLORS.errorBg50} ${UI_COLORS.errorBorder200}`
              )}>
                <div className={getCardStyle('flex', 'rowCenter')}>
                  <label className={combineStyles(getCardStyle('flex', 'rowCenter'), CARD_STYLES.interactive.cursorPointer)}>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
                      className={`${CARD_STYLES.size.small} ${UI_COLORS.checkboxRed} ${UI_COLORS.gray100} ${UI_COLORS.grayBorder300} ${CARD_STYLES.shape.rounded}`}
                    />
                    <span className={`${CARD_STYLES.text.small} ${UI_COLORS.grayText700}`}>全选</span>
                  </label>
                  <span className={`${CARD_STYLES.text.small} ${UI_COLORS.grayText600}`}>
                    已选择 {selectedTaskIds.length} 个任务
                  </span>
                </div>
                <button
                  onClick={handleBatchDeleteClick}
                  disabled={selectedTaskIds.length === 0}
                  className={combineStyles(
                    combineStyles(getCardStyle('spacing', 'text'), CARD_STYLES.text.medium),
                    getCardStyle('animation', 'transition'),
                    selectedTaskIds.length > 0
                      ? `${UI_COLORS.danger.bg} ${CARD_STYLES.text.white} hover:${UI_COLORS.danger.bgHover} ${getCardShadow('md')}`
                      : `${UI_COLORS.gray300} ${UI_COLORS.grayText500} ${CARD_STYLES.interactive.disabled}`
                  )}
                >
                  删除选中 ({selectedTaskIds.length})
                </button>
              </div>
            )}
            
            {/* 筛选按钮 */}
            <div className={combineStyles(getCardStyle('flex', 'wrap'), CARD_STYLES.spacing.section)}>
              <button
                onClick={() => setFilter('all')}
                className={combineStyles(
                  getCardStyle('tag'),
                  filter === 'all' ? `${UI_COLORS.primary.bgLight} ${UI_COLORS.primary.text} ${CARD_STYLES.text.medium}` : `${UI_COLORS.gray100} ${UI_COLORS.grayText600} ${UI_COLORS.grayHover200}`
                )}
              >
                全部 ({getTaskCount('all')})
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={combineStyles(
                  getCardStyle('tag'),
                  filter === 'overdue' ? `${UI_COLORS.danger.bgLight} ${UI_COLORS.danger.text} ${CARD_STYLES.text.medium}` : `${UI_COLORS.gray100} ${UI_COLORS.grayText600} ${UI_COLORS.grayHover200}`
                )}
              >
                逾期 ({getTaskCount('overdue')})
              </button>
              <button
                onClick={() => setFilter('due-today')}
                className={combineStyles(
                  getCardStyle('tag'),
                  filter === 'due-today' ? `${UI_COLORS.warning.bgLight} ${UI_COLORS.warning.text} ${CARD_STYLES.text.medium}` : `${UI_COLORS.gray100} ${UI_COLORS.grayText600} ${UI_COLORS.grayHover200}`
                )}
              >
                今日 ({getTaskCount('due-today')})
              </button>
              <button
                onClick={() => setFilter('this-week')}
                className={combineStyles(
                  getCardStyle('tag'),
                  filter === 'this-week' ? `${UI_COLORS.primary.bgLight} ${UI_COLORS.primary.text} ${CARD_STYLES.text.medium}` : `${UI_COLORS.gray100} ${UI_COLORS.grayText600} ${UI_COLORS.grayHover200}`
                )}
              >
                本周 ({getTaskCount('this-week')})
              </button>
            </div>
            
            {/* 任务列表 */}
            <div 
              className={combineStyles(
                getCardStyle('taskList', 'container'),
                isDragOverTaskList 
                  ? `${UI_COLORS.blue50} ${getCardStyle('taskList', 'dragOver')} ${UI_COLORS.blueBorder300}` 
                  : ''
              )}
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
                <div className={combineStyles(
                  getCardStyle('taskList', 'searchResult'),
                  combineStyles(UI_COLORS.blueText600, CARD_STYLES.text.medium)
                )}>
                  <div className="text-2xl mb-2">📋</div>
                  <p>释放以取消任务的标签关联</p>
                </div>
              )}
              {filteredTasks.length === 0 ? (
                <div className={getCardStyle('taskList', 'empty')}>
                  <div className={`${UI_COLORS.grayText400} text-4xl mb-4`}>
                    {searchQuery ? '🔍' : '📝'}
                  </div>
                  <p className={`${UI_COLORS.grayText600}`}>
                    {searchQuery ? `没有找到包含"${searchQuery}"的任务` : '暂无任务'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`${CARD_STYLES.spacing.marginTop2} ${UI_COLORS.blueText600} ${UI_COLORS.blueHoverText800} ${CARD_STYLES.text.small}`}
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
        <div className={getCardStyle('grid', 'rightCol')}>
          {/* 视图切换按钮 */}
          <div className={combineStyles(getCardStyle('flex', 'rowBetween'), CARD_STYLES.spacing.section)}>
            <div className={combineStyles(
              `${UI_COLORS.gray50} ${UI_COLORS.grayBorder200}`,
              getCardStyle('viewToggle', 'container')
            )}>
              <button
                onClick={() => setViewMode('quadrant')}
                className={combineStyles(
                  getCardStyle('viewToggle', 'button'),
                  viewMode === 'quadrant'
                    ? UI_COLORS.viewModeActive
                    : UI_COLORS.viewModeInactive
                )}
              >
                四象限展示
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={combineStyles(
                  getCardStyle('viewToggle', 'button'),
                  viewMode === 'kanban'
                    ? UI_COLORS.viewModeActive
                    : UI_COLORS.viewModeInactive
                )}
              >
                看板展示
              </button>
              <button
                onClick={() => setViewMode('personalized')}
                className={combineStyles(
                  getCardStyle('viewToggle', 'button'),
                  viewMode === 'personalized'
                    ? UI_COLORS.viewModeActive
                    : UI_COLORS.viewModeInactive
                )}
              >
                个性化展示
              </button>
            </div>
            
            {/* 标签管理按钮 */}
            {viewMode === 'personalized' && (
              <button
                onClick={() => setShowLabelManager(true)}
                className={combineStyles(
                  `${UI_COLORS.success.bg} ${CARD_STYLES.text.white} ${UI_COLORS.success.bgHover}`,
                  getCardStyle('button'),
                  getCardHover(true, true),
                  getCardStyle('flex', 'rowCenter')
                )}
              >
                <svg className={CARD_STYLES.size.small} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                管理标签
              </button>
            )}
          </div>

          {/* 条件渲染视图 */}
          {viewMode === 'quadrant' ? (
            // 艾森豪威尔矩阵
            <div className={getCardStyle('grid', 'view')}>
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
        confirmButtonClass={`${UI_COLORS.danger.bg} hover:${UI_COLORS.danger.bgHover} ${CARD_STYLES.text.white}`}
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
        confirmButtonClass={`${UI_COLORS.danger.bg} hover:${UI_COLORS.danger.bgHover} ${CARD_STYLES.text.white}`}
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