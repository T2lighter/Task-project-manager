import React from 'react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onDragStart?: (task: Task) => void;
  compact?: boolean; // 新增：紧凑模式
  showPriority?: boolean; // 新增：是否显示优先级
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onDragStart, compact = false, showPriority = true }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    const taskData = JSON.stringify(task);
    console.log('开始拖拽任务:', taskData);
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
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    // 重置样式
    if (e.currentTarget) {
      (e.currentTarget as HTMLElement).style.transform = '';
    }
  };

  // 获取优先级标签
  const getPriorityBadge = () => {
    if (task.urgency && task.importance) {
      return { text: '紧急重要', color: 'bg-red-100 text-red-800', icon: '🔥' };
    }
    if (!task.urgency && task.importance) {
      return { text: '重要', color: 'bg-blue-100 text-blue-800', icon: '⭐' };
    }
    if (task.urgency && !task.importance) {
      return { text: '紧急', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' };
    }
    return { text: '普通', color: 'bg-gray-100 text-gray-800', icon: '📋' };
  };

  const priorityBadge = getPriorityBadge();

  return (
    <div 
      className={`rounded-md shadow-sm border cursor-move hover:shadow-md drag-transition ${
        compact ? 'p-2' : 'p-3'
      } ${
        isDragging 
          ? 'task-card-dragging border-blue-400 bg-blue-50' 
          : 'bg-gray-50 border-gray-200'
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>{task.title}</h3>
          {task.description && !compact && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className={`flex flex-wrap gap-1 ${compact ? 'mt-1' : 'mt-2'}`}>
            {/* 优先级标签 */}
            {showPriority && (
              <span className={`text-xs px-2 py-1 rounded-full ${priorityBadge.color} flex items-center gap-1`}>
                <span>{priorityBadge.icon}</span>
                <span>{priorityBadge.text}</span>
              </span>
            )}
            {task.dueDate && (
              <span className={`bg-green-100 text-green-800 px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'}`}>
                {format(new Date(task.dueDate), compact ? 'MM-dd' : 'yyyy-MM-dd')}
              </span>
            )}
            {!compact && (
              <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {task.status === 'completed' ? '已完成' : task.status === 'in-progress' ? '进行中' : '待办'}
              </span>
            )}
            {task.category && (
              <span className={`bg-purple-100 text-purple-800 px-2 py-1 rounded-full ${compact ? 'text-xs' : 'text-xs'}`}>
                {task.category.name}
              </span>
            )}
          </div>
        </div>
        <div className={`flex ml-2 ${compact ? 'space-x-1' : 'space-x-2 ml-4'}`}>
          <button
            onClick={() => onEdit(task)}
            className={`text-blue-600 hover:text-blue-800 ${compact ? 'text-sm' : ''}`}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={`text-red-600 hover:text-red-800 ${compact ? 'text-sm' : ''}`}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;