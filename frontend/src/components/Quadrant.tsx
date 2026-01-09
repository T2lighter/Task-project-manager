import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../types';
import { useDragHandlers } from '../hooks/useDragHandlers';
import { getQuadrantColors } from '../utils/colorUtils'; // 新增：统一颜色配置

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
  onCopyTask,
  onDropTask,
  onDragStart,
  onCreateSubtask
}) => {
  // 使用拖拽钩子简化逻辑
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragHandlers();

  // 使用统一颜色配置系统
  const colorClasses = getQuadrantColors(urgency, importance);

  // 处理任务拖拽放下
  const handleTaskDrop = (task: any) => {
    if (onDropTask) {
      onDropTask(task, urgency, importance);
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
      onDrop={(e) => handleDrop(e, handleTaskDrop)}
    >
      <h2 className={`text-base font-semibold ${colorClasses.text} mb-3`}>
        {title} ({tasks.length})
      </h2>
      <div className="space-y-2 min-h-[80px] max-h-[317px] overflow-y-auto">
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