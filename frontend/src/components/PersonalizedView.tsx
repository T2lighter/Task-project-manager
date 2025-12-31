import React from 'react';
import { Task, CustomLabel } from '../types';
import TaskCard from './TaskCard';

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
  const [dragOverLabelId, setDragOverLabelId] = React.useState<number | null>(null);
  
  // 自定义拖拽开始处理函数，包含标签信息
  const handleDragStartFromLabel = (task: Task, labelId: number) => {
    // 调用原始的拖拽开始函数
    onDragStart(task);
    
    // 将标签信息存储到sessionStorage，以便在拖拽结束时使用
    sessionStorage.setItem('dragFromLabel', JSON.stringify({ taskId: task.id, labelId }));
  };
  // 按标签分组任务
  const getTasksByLabel = (labelId: number) => {
    return tasks.filter(task => 
      task.labels?.some(taskLabel => taskLabel.labelId === labelId)
    );
  };

  // 获取标签颜色类 - 与四象限和看板风格保持一致
  const getLabelColorClasses = (color: string) => {
    // 将标签颜色转换为对应的Tailwind类
    const colorMap: { [key: string]: { border: string; text: string } } = {
      '#EF4444': { border: 'border-red-500', text: 'text-red-600' },
      '#F97316': { border: 'border-orange-500', text: 'text-orange-600' },
      '#F59E0B': { border: 'border-amber-500', text: 'text-amber-600' },
      '#EAB308': { border: 'border-yellow-500', text: 'text-yellow-600' },
      '#84CC16': { border: 'border-lime-500', text: 'text-lime-600' },
      '#22C55E': { border: 'border-green-500', text: 'text-green-600' },
      '#10B981': { border: 'border-emerald-500', text: 'text-emerald-600' },
      '#14B8A6': { border: 'border-teal-500', text: 'text-teal-600' },
      '#06B6D4': { border: 'border-cyan-500', text: 'text-cyan-600' },
      '#0EA5E9': { border: 'border-sky-500', text: 'text-sky-600' },
      '#3B82F6': { border: 'border-blue-500', text: 'text-blue-600' },
      '#6366F1': { border: 'border-indigo-500', text: 'text-indigo-600' },
      '#8B5CF6': { border: 'border-violet-500', text: 'text-violet-600' },
      '#A855F7': { border: 'border-purple-500', text: 'text-purple-600' },
      '#D946EF': { border: 'border-fuchsia-500', text: 'text-fuchsia-600' },
      '#EC4899': { border: 'border-pink-500', text: 'text-pink-600' },
      '#F43F5E': { border: 'border-rose-500', text: 'text-rose-600' },
      '#6B7280': { border: 'border-gray-500', text: 'text-gray-600' },
      '#374151': { border: 'border-gray-700', text: 'text-gray-700' },
      '#1F2937': { border: 'border-gray-800', text: 'text-gray-800' }
    };
    
    return colorMap[color] || { border: 'border-gray-500', text: 'text-gray-600' };
  };

  // 拖拽事件处理函数
  const handleDragOver = (e: React.DragEvent, labelId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLabelId(labelId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有真正离开标签区域时才重置状态
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverLabelId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, labelId: number) => {
    e.preventDefault();
    setDragOverLabelId(null);
    try {
      const taskData = e.dataTransfer.getData('text/plain');
      const task = JSON.parse(taskData) as Task;
      onDropTask?.(task, labelId);
    } catch (error) {
      console.error('拖拽任务到标签失败:', error);
    }
  };

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
        
        return (
          <div 
            key={label.id} 
            className={`rounded-lg shadow p-3 border-l-4 min-h-24 bg-white hover:bg-gray-50 drag-transition ${
              dragOverLabelId === label.id 
                ? 'drop-zone-active' 
                : ''
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
              <div className="text-center py-6 text-gray-400">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">暂无任务</p>
                <p className="text-xs mt-1">拖拽任务到此处进行分类</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PersonalizedView;