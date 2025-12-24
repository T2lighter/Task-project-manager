import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../types';

interface QuadrantProps {
  title: string;
  urgency: boolean;
  importance: boolean;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onDropTask?: (task: Task, urgency: boolean, importance: boolean) => void;
  onDragStart?: (task: Task) => void;
}

const Quadrant: React.FC<QuadrantProps> = ({
  title,
  urgency,
  importance,
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart
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
    console.log('拖拽悬停在象限:', title, '紧急:', urgency, '重要:', importance);
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
      console.log('接收到的拖拽数据:', taskData);
      const task = JSON.parse(taskData) as Task;
      console.log('解析的任务对象:', task);
      console.log(`目标象限: 紧急=${urgency}, 重要=${importance}`);
      onDropTask?.(task, urgency, importance);
    } catch (error) {
      console.error('拖拽任务失败:', error);
    }
  };

  return (
    <div 
      className={`rounded-lg shadow p-4 border-l-4 h-full flex flex-col drag-transition ${
        isDragOver 
          ? 'drop-zone-active' 
          : 'bg-white hover:bg-gray-50'
      } ${colorClasses.border}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className={`text-lg font-semibold ${colorClasses.text} mb-4`}>
        {title} ({tasks.length})
      </h2>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">此象限中没有任务</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              showPriority={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Quadrant;