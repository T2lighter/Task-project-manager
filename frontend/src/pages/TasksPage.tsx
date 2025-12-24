import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Quadrant from '../components/Quadrant';
import KanbanBoard from '../components/KanbanBoard';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

const TasksPage: React.FC = () => {
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'quadrant' | 'kanban'>('quadrant'); // 新增：视图模式状态

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 从location.state中获取筛选条件并应用
  React.useEffect(() => {
    const filterState = location.state?.filter;
    if (filterState && ['all', 'pending', 'in-progress', 'completed'].includes(filterState)) {
      setFilter(filterState as 'all' | 'pending' | 'in-progress' | 'completed');
    }
  }, [location.state]);

  const handleCreateTask = (task: Omit<Task, 'id' | 'userId'>) => {
    createTask(task);
    setIsFormOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleUpdateTask = (task: Omit<Task, 'id' | 'userId'>) => {
    if (editingTask) {
      updateTask(editingTask.id, task);
      setEditingTask(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTask(taskId);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleDragStartTask = (task: Task) => {
    setDraggingTask(task);
  };

  const handleDropTask = (task: Task, newUrgency: boolean, newImportance: boolean) => {
    console.log('处理任务放置:', task.title, '新紧急状态:', newUrgency, '新重要状态:', newImportance);
    
    // 验证任务数据完整性
    if (!task || !task.id) {
      console.error('无效的任务数据:', task);
      setDraggingTask(null);
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
      
      console.log('正在更新任务:', task.id, '更新数据:', updateData);
      
      updateTask(task.id, updateData).then(() => {
        // 显示成功提示（仅控制台，无弹窗）
        const quadrantNames = {
          'true-true': '紧急且重要',
          'false-true': '重要但不紧急', 
          'true-false': '紧急但不重要',
          'false-false': '既不紧急也不重要'
        };
        const quadrantName = quadrantNames[`${newUrgency}-${newImportance}`];
        console.log(`任务"${task.title}"已移动到"${quadrantName}"象限`);
      }).catch((error) => {
        console.error('移动任务失败:', error);
      }).finally(() => {
        setDraggingTask(null);
      });
    } else {
      console.log('任务分类未发生变化，无需更新');
      setDraggingTask(null);
    }
  };

  // 看板模式的拖拽处理函数
  const handleKanbanDropTask = (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => {
    console.log('看板模式：处理任务状态变更:', task.title, '新状态:', newStatus);
    
    // 验证任务数据完整性
    if (!task || !task.id) {
      console.error('无效的任务数据:', task);
      setDraggingTask(null);
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
      
      console.log('正在更新任务状态:', task.id, '更新数据:', updateData);
      
      updateTask(task.id, updateData).then(() => {
        const statusNames = {
          'pending': '待办',
          'in-progress': '进行中',
          'completed': '已完成'
        };
        const statusName = statusNames[newStatus];
        console.log(`任务"${task.title}"已移动到"${statusName}"列`);
      }).catch((error) => {
        console.error('更新任务状态失败:', error);
      }).finally(() => {
        setDraggingTask(null);
      });
    } else {
      console.log('任务状态未发生变化，无需更新');
      setDraggingTask(null);
    }
  };

  // 按象限过滤任务（不包含已完成任务）
  const quadrant1Tasks = tasks.filter(task => task.urgency && task.importance && task.status !== 'completed');
  const quadrant2Tasks = tasks.filter(task => !task.urgency && task.importance && task.status !== 'completed');
  const quadrant3Tasks = tasks.filter(task => task.urgency && !task.importance && task.status !== 'completed');
  const quadrant4Tasks = tasks.filter(task => !task.urgency && !task.importance && task.status !== 'completed');

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

  // 按状态过滤任务并排序
  const filteredTasks = sortTasksByPriority(tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      default:
        // 默认显示预计代办和进行中的任务
        return task.status === 'pending' || task.status === 'in-progress';
    }
  }));

  return (
    <div className="space-y-6">
      {/* 隐藏原有的h1和span，将按钮移到适当位置 */}
      <div className="flex justify-between items-center">
        {/* 隐藏h1 */}
        <div className="w-0 h-0 overflow-hidden">
          <h1 className="text-3xl font-bold text-gray-900">任务管理</h1>
        </div>
      </div>

      {/* 拖拽状态指示器 */}
      {draggingTask && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          正在拖拽任务: {draggingTask.title}
        </div>
      )}

      {/* 任务表单 */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={handleCloseForm}
        />
      )}

      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">任务列表</h2>
              {/* 隐藏任务数量span，将添加任务按钮移到这里 */}
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                添加任务
              </button>
            </div>
            
            {/* 筛选按钮 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                全部任务 ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                待办 ({tasks.filter(t => t.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'in-progress' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                进行中 ({tasks.filter(t => t.status === 'in-progress').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'completed' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                已完成 ({tasks.filter(t => t.status === 'completed').length})
              </button>
            </div>
            
            {/* 任务列表 */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onDragStart={handleDragStartTask}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：视图区域 */}
        <div className="lg:col-span-2">
          {/* 视图切换按钮 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 rounded-xl p-1.5 flex shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('quadrant')}
                className={`px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  viewMode === 'quadrant'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                四象限展示
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                看板展示
              </button>
            </div>
          </div>

          {/* 条件渲染视图 */}
          {viewMode === 'quadrant' ? (
            // 艾森豪威尔矩阵
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Quadrant
                title="紧急且重要"
                urgency={true}
                importance={true}
                tasks={quadrant1Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
              />
              <Quadrant
                title="重要但不紧急"
                urgency={false}
                importance={true}
                tasks={quadrant2Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
              />
              <Quadrant
                title="紧急但不重要"
                urgency={true}
                importance={false}
                tasks={quadrant3Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
              />
              <Quadrant
                title="既不紧急也不重要"
                urgency={false}
                importance={false}
                tasks={quadrant4Tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDropTask={handleDropTask}
                onDragStart={handleDragStartTask}
              />
            </div>
          ) : (
            // 看板视图
            <KanbanBoard
              tasks={tasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onDropTask={handleKanbanDropTask}
              onDragStart={handleDragStartTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;