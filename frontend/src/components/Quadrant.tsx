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
}

const Quadrant: React.FC<QuadrantProps> = ({
  title,
  urgency,
  importance,
  tasks,
  onEditTask,
  onDeleteTask
}) => {
  // 获取象限颜色类
  const getQuadrantColor = () => {
    if (urgency && importance) return 'quadrant-1';
    if (!urgency && importance) return 'quadrant-2';
    if (urgency && !importance) return 'quadrant-3';
    return 'quadrant-4';
  };

  const colorClass = getQuadrantColor();

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 border-${colorClass}`}>
      <h2 className={`text-lg font-semibold text-${colorClass} mb-4`}>{title}</h2>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">此象限中没有任务</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Quadrant;