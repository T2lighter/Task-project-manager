import React, { useState, useCallback } from 'react';
import { Task, CustomLabel } from '../types';
import TaskCard from './TaskCard';
import { getLabelColorClasses } from '../utils/colorUtils'; // 新增：统一颜色配置

interface PersonalizedViewProps {
  tasks: Task[];
  labels: CustomLabel[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onCopyTask: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onCreateSubtask: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void;
  onDropTask?: (task: Task, labelId: number) => void; // 新增：拖拽任务到标签的回调
}

const PersonalizedView: React.FC<PersonalizedViewProps> = ({
  tasks,
  labels,
  onEditTask,
  onDeleteTask,
  onCopyTask,
  onDragStart,
  onCreateSubtask,
  onDropTask
}) => {
  // 使用单一状态管理所有标签的拖拽悬停状态
  const [dragOverLabelId, setDragOverLabelId] = useState<number | null>(null);

  // 拖拽处理函数
  const handleDragOver = useCallback((e: React.DragEvent, labelId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLabelId(labelId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // 只有真正离开标签区域时才重置状态
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverLabelId(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, labelId: number) => {
    e.preventDefault();
    setDragOverLabelId(null);
    
    if (!e.dataTransfer) {
      return;
    }
    
    try {
      const taskData = e.dataTransfer.getData('text/plain');
      if (!taskData) {
        return;
      }
      
      const task = JSON.parse(taskData) as Task;
      
      if (onDropTask) {
        onDropTask(task, labelId);
      }
    } catch (error) {
      console.error('拖拽任务到标签失败:', error);
    }
  }, [onDropTask]);
  
  // 监控任务数据变化
  React.useEffect(() => {
    // 任务数据更新时的处理逻辑（如果需要的话）
  }, [tasks]);
  
  // 自定义拖拽开始处理函数，包含标签信息
  const handleDragStartFromLabel = useCallback((task: Task, labelId: number) => {
    // 调用原始的拖拽开始函数
    onDragStart(task);
    
    // 将标签信息存储到sessionStorage，以便在拖拽结束时使用
    sessionStorage.setItem('dragFromLabel', JSON.stringify({ taskId: task.id, labelId }));
  }, [onDragStart]);

  // 按标签分组任务
  const getTasksByLabel = useCallback((labelId: number) => {
    return tasks.filter(task => 
      task.labels?.some(taskLabel => taskLabel.labelId === labelId)
    );
  }, [tasks]);

  // 使用统一颜色配置系统 - 已移除重复的颜色映射代码

  if (labels.length === 0) {
    return (
      <div className="rounded-lg shadow p-3 border-l-4 border-gray-500 bg-white">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">还没有创建标签</h3>
          <p className="text-gray-600 mb-4">
            创建个性化标签来组织你的任务，让任务管理更加高效
          </p>
          <p className="text-sm text-gray-500 italic">
            点击右上角的"管理标签"按钮开始创建标签
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 显示所有标签 - 包括没有任务的标签作为占位符 */}
      {labels.map((label) => {
        const labelTasks = getTasksByLabel(label.id);
        const colorClasses = getLabelColorClasses(label.color);
        const isDragOver = dragOverLabelId === label.id;
        
        return (
          <div 
            key={label.id} 
            className={`rounded-lg shadow p-3 border-l-4 min-h-24 bg-white hover:bg-gray-50 drag-transition ${
              isDragOver ? 'bg-blue-50' : ''
            } ${colorClasses.border}`}
            onDragOver={(e) => handleDragOver(e, label.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, label.id)}
          >
            {/* 标签头部 */}
            <h2 className={`text-base font-semibold ${colorClasses.text} mb-3 flex items-center gap-2`}>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name} ({labelTasks.length})
            </h2>
            
            {label.description && (
              <p className="text-xs text-gray-500 mb-3 italic">{label.description}</p>
            )}

            {/* 任务列表或空状态 */}
            {labelTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labelTasks.map((task) => (
                  <TaskCard
                    key={`${task.id}-${label.id}`} // 使用任务ID和标签ID组合作为key，确保同一任务在不同标签中有不同的实例
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onCopy={onCopyTask}
                    onDragStart={(draggedTask) => handleDragStartFromLabel(draggedTask, label.id)}
                    showSubtasks={true}
                    onCreateSubtask={onCreateSubtask}
                    showPersonalizedLabels={false}
                    compact={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">暂无任务</p>
                <p className="text-xs mt-1 text-gray-500">拖拽任务到此处进行分类</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PersonalizedView;