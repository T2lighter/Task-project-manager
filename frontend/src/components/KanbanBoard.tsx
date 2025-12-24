import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onDropTask: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onDragStart: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // 只有真正离开列区域时才重置状态
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
    const taskData = e.dataTransfer.getData('text/plain');
    if (taskData) {
      try {
        const task = JSON.parse(taskData);
        onDropTask(task, status);
      } catch (error) {
        console.error('解析拖拽数据失败:', error);
      }
    }
  };

  // 获取列的颜色类 - 与四象限风格保持一致
  const getColumnColorClasses = () => {
    switch (status) {
      case 'pending':
        return {
          border: 'border-yellow-500',
          text: 'text-yellow-600'
        };
      case 'in-progress':
        return {
          border: 'border-blue-500',
          text: 'text-blue-600'
        };
      case 'completed':
        return {
          border: 'border-green-500',
          text: 'text-green-600'
        };
      default:
        return {
          border: 'border-gray-500',
          text: 'text-gray-600'
        };
    }
  };

  const colorClasses = getColumnColorClasses();

  return (
    <div
      className={`rounded-lg shadow p-4 border-l-4 min-h-32 drag-transition ${
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
      
      <div className="space-y-3 min-h-[100px]">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">此列中没有任务</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              compact={true}
              showPriority={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onDropTask: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onDragStart: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart
}) => {
  // 按状态分类任务
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn
        title="待办"
        status="pending"
        tasks={pendingTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
      />
      <KanbanColumn
        title="进行中"
        status="in-progress"
        tasks={inProgressTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
      />
      <KanbanColumn
        title="已完成"
        status="completed"
        tasks={completedTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
      />
    </div>
  );
};

export default KanbanBoard;