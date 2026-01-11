import React from 'react';
import { Task } from '../types';
import { format } from 'date-fns';
import { getPriorityConfig, isTaskOverdue, isTaskDueToday } from '../utils/taskUtils';
import { TASK_STATUS_NAMES } from '../constants';
import SubtaskList from './SubtaskList';
import SubtaskModal from './SubtaskModal';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void; // 改为可选
  onDelete?: (task: Task) => void; // 改为可选
  onCopy?: (task: Task) => void; // 新增：复制任务回调
  onDragStart?: (task: Task) => void;
  compact?: boolean;
  showPriority?: boolean;
  showSubtasks?: boolean; // 新增：是否显示子任务
  onCreateSubtask?: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void; // 新增
  showCompleted?: boolean; // 新增：是否显示已完成样式
  showStatus?: boolean; // 新增：是否显示状态标签
  showProject?: boolean; // 新增：是否显示项目标签
  showPersonalizedLabels?: boolean; // 新增：是否显示个性化标签
  // 批量选择相关
  selectable?: boolean; // 是否可选择
  selected?: boolean; // 是否已选中
  onSelect?: (task: Task, selected: boolean) => void; // 选择回调
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onCopy, // 新增：复制回调
  onDragStart, 
  compact = false, 
  showPriority = true,
  showSubtasks: _showSubtasks = false, // 默认不显示子任务（保留用于未来扩展）
  onCreateSubtask,
  showCompleted = true, // 默认显示已完成样式
  showStatus = true, // 默认显示状态标签
  showProject = true, // 默认显示项目标签
  showPersonalizedLabels = false, // 默认不显示个性化标签
  // 批量选择相关
  selectable = false,
  selected = false,
  onSelect
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = React.useState(false); // 新增：子任务Modal状态
  const [isSubtaskListExpanded, setIsSubtaskListExpanded] = React.useState(false); // 新增：子任务列表展开状态

  const handleDragStart = (e: React.DragEvent) => {
    // 确保事件对象存在
    if (!e || !e.dataTransfer) {
      return;
    }
    
    try {
      const taskData = JSON.stringify(task);
      e.dataTransfer.setData('text/plain', taskData);
      e.dataTransfer.effectAllowed = 'move';
      setIsDragging(true);
      onDragStart?.(task);
      
      // 添加拖拽时的视觉效果
      setTimeout(() => {
        if (e.currentTarget) {
          (e.currentTarget as HTMLElement).style.transform = 'rotate(5deg) scale(1.05)';
        }
      }, 0);
    } catch (error) {
      console.error('拖拽开始时出错:', error);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    // 重置样式
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.transform = '';
    }
  };

  const handleCreateSubtask = (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => {
    if (onCreateSubtask) {
      onCreateSubtask(parentTaskId, subtaskData);
    }
  };

  const priorityConfig = getPriorityConfig(task);

  // 计算子任务进度
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;

  // 移除HTML标签的函数
  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div 
      className={`rounded-md shadow-sm border cursor-move hover:shadow-md drag-transition ${
        compact ? 'p-2' : 'p-2'
      } ${
        isDragging 
          ? 'task-card-dragging border-blue-400 bg-blue-50' 
          : selected
            ? 'bg-blue-50 border-blue-400'
            : 'bg-gray-50 border-gray-200'
      }`}
      draggable={!selectable}
      onDragStart={selectable ? undefined : handleDragStart}
      onDragEnd={selectable ? undefined : handleDragEnd}
      onClick={selectable ? (e) => {
        // 如果点击的是 checkbox 本身，不触发卡片的点击事件（避免重复触发）
        if ((e.target as HTMLElement).tagName === 'INPUT') {
          return;
        }
        onSelect?.(task, !selected);
      } : undefined}
    >
      {/* 第一行：任务标题和操作按钮 */}
      <div className="flex justify-between items-start gap-2">
        {/* 选择框 */}
        {selectable && (
          <div className="flex-shrink-0 flex items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(task, e.target.checked);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-sm'} ${
          showCompleted && task.status === 'completed' ? 'line-through' : ''
        } flex-1 min-w-0`}>
          {task.title}
          {/* 子任务数量指示器 */}
          {totalSubtasks > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSubtaskListExpanded(!isSubtaskListExpanded);
              }}
              className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
              title={isSubtaskListExpanded ? '隐藏子任务' : '显示子任务'}
            >
              {completedSubtasks}/{totalSubtasks}
            </button>
          )}
        </h3>
        {(onEdit || onDelete || onCopy || onCreateSubtask) && (
          <div className={`flex ${compact ? 'space-x-1' : 'space-x-1'} flex-shrink-0`}>
            {/* 添加子任务按钮 */}
            {onCreateSubtask && !task.parentTaskId && ( // 只有主任务才能添加子任务
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSubtaskModalOpen(true);
                }}
                className={`text-green-600 hover:text-green-800 ${compact ? 'text-sm' : 'text-sm'}`}
                title="添加子任务"
              >
                ➕
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onEdit(task);
                }}
                className={`text-blue-600 hover:text-blue-800 ${compact ? 'text-sm' : 'text-sm'}`}
                title="编辑任务"
              >
                ✏️
              </button>
            )}
            {/* 复制按钮 */}
            {onCopy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(task);
                }}
                className={`text-purple-600 hover:text-purple-800 ${compact ? 'text-sm' : 'text-sm'}`}
                title="复制任务"
              >
                📋
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(task);
                }}
                className={`text-red-600 hover:text-red-800 ${compact ? 'text-sm' : 'text-sm'}`}
                title="删除任务"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* 第二行：任务描述 */}
      {task.description && !compact && (
        <div className="mt-0.5 w-full">
          <div 
            className="text-xs text-gray-600 leading-4"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={stripHtmlTags(task.description)} // 鼠标悬停显示完整内容
          >
            {stripHtmlTags(task.description)}
          </div>
          </div>
      )}

      {/* 第三行：标签 */}
      <div className={`flex ${compact ? 'flex-nowrap gap-0.5' : 'flex-wrap gap-1'} ${compact ? 'mt-0.5' : 'mt-0.5'}`}>
            {/* 优先级标签 */}
            {showPriority && (
              <span className={`${compact ? 'text-xs px-1 py-0.5' : 'text-xs px-1.5 py-0.5'} rounded-full ${priorityConfig.color} flex items-center gap-1`}>
                <span>{priorityConfig.icon}</span>
                <span>{priorityConfig.text}</span>
              </span>
            )}
            {!compact && showStatus && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                task.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : task.status === 'in-progress' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-slate-100 text-slate-800'
              }`}>
                {TASK_STATUS_NAMES[task.status as keyof typeof TASK_STATUS_NAMES]}
              </span>
            )}
            {/* 在紧凑模式下也显示状态（用于子任务） */}
            {compact && showStatus && (
              <span className={`text-xs px-1 py-0.5 rounded-full ${
                task.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : task.status === 'in-progress' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-slate-100 text-slate-800'
              }`}>
                {TASK_STATUS_NAMES[task.status as keyof typeof TASK_STATUS_NAMES]}
              </span>
            )}
            {/* 项目标签 */}
            {showProject && task.project && (
              <span className={`bg-orange-100 text-orange-800 ${compact ? 'px-1 py-0.5' : 'px-1.5 py-0.5'} rounded-full ${compact ? 'text-xs' : 'text-xs'}`}>
                {task.project.name}
              </span>
            )}
            {/* 个性化标签 */}
            {showPersonalizedLabels && task.labels && task.labels.length > 0 && (
              <>
                {task.labels.slice(0, compact ? 2 : 3).map((taskLabel) => {
                  if (!taskLabel.label) return null;
                  return (
                    <span
                      key={taskLabel.labelId}
                      className={`${compact ? 'px-1 py-0.5 text-xs' : 'px-1.5 py-0.5 text-xs'} rounded-full text-white font-medium`}
                      style={{ backgroundColor: taskLabel.label.color }}
                      title={taskLabel.label.description || taskLabel.label.name}
                    >
                      {taskLabel.label.name}
                    </span>
                  );
                })}
                {task.labels.length > (compact ? 2 : 3) && (
                  <span className={`bg-gray-100 text-gray-600 ${compact ? 'px-1 py-0.5 text-xs' : 'px-1.5 py-0.5 text-xs'} rounded-full`}>
                    +{task.labels.length - (compact ? 2 : 3)}
                  </span>
                )}
              </>
            )}
            {task.category && (
              <span className={`bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full ${compact ? 'text-xs' : 'text-xs'}`}>
                {task.category.name}
              </span>
            )}
            {/* 截止日期和逾期状态 */}
            {task.dueDate && (
              <span className={`${
                isTaskOverdue(task) 
                  ? 'bg-red-100 text-red-800' 
                  : isTaskDueToday(task)
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
              } ${compact ? 'px-1 py-0.5' : 'px-1.5 py-0.5'} rounded-full ${compact ? 'text-xs' : 'text-xs'}`}>
                {format(new Date(task.dueDate), compact ? 'MM-dd' : 'MM-dd')}
                {isTaskOverdue(task) && ' ⚠️'}
              </span>
            )}
      </div>

      {/* 子任务列表 */}
      {isSubtaskListExpanded && totalSubtasks > 0 && (
        <SubtaskList
          subtasks={subtasks}
          onEditSubtask={onEdit || (() => {})}
          onDeleteSubtask={onDelete || (() => {})}
        />
      )}

      {/* 子任务创建Modal */}
      {onCreateSubtask && (
        <SubtaskModal
          isOpen={isSubtaskModalOpen}
          onClose={() => setIsSubtaskModalOpen(false)}
          parentTask={task}
          onCreateSubtask={handleCreateSubtask}
        />
      )}
    </div>
  );
};

export default TaskCard;