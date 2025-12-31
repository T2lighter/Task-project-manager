import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../types';

interface QuadrantProps {
  title: string;
  urgency: boolean;
  importance: boolean;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void; // 修改为接收Task对象
  onCopyTask?: (task: Task) => void; // 新增：复制任务
  onDropTask?: (task: Task, urgency: boolean, importance: boolean) => void;
  onDragStart?: (task: Task) => void;
  onCreateSubtask?: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void; // 新增
}

const Quadrant: React.FC<QuadrantProps> = ({
  title,
  urgency,
  importance,
  tasks,
  onEditTask,
  onDeleteTask,
  onCopyTask, // 新增：复制任务回调
  onDropTask,
  onDragStart,
  onCreateSubtask
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  // 获取象限颜色类 - 使用完整的Tailwind类名
  const getQuadrantColorClasses = () => {
    if (urgency && importance) return {
      border: 'border-red-500',
      text: 'text-red-600'
    };
    if (!urgency && importance) return {
      border: 'border-blue-500', 
      text: 'text-blue-600'
    };
    if (urgency && !importance) return {
      border: 'border-yellow-500',
      text: 'text-yellow-600'
    };
    return {
      border: 'border-gray-500',
      text: 'text-gray-600'
    };
  };

  const colorClasses = getQuadrantColorClasses();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有真正离开象限区域时才重置状态
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const taskData = e.dataTransfer.getData('text/plain');
      const task = JSON.parse(taskData) as Task;
      onDropTask?.(task, urgency, importance);
    } catch (error) {
      console.error('拖拽任务失败:', error);
    }
  };

  return (
    <div 
      className={`rounded-lg shadow p-3 border-l-4 min-h-24 drag-transition ${
        isDragOver 
          ? 'drop-zone-active' 
          : 'bg-white hover:bg-gray-50'
      } ${colorClasses.border}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className={`text-base font-semibold ${colorClasses.text} mb-3`}>
        {title} ({tasks.length})
      </h2>
      <div className="space-y-2 min-h-[80px] max-h-[267px] overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">此象限中没有任务</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onCopy={onCopyTask}
              onDragStart={onDragStart}
              onCreateSubtask={onCreateSubtask}
              showPriority={false} // 四象限中不显示优先级，因为位置已经表示了优先级
              showSubtasks={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Quadrant;