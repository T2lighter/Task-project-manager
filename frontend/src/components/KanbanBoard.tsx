import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void; // 修改为接收Task对象
  onDropTask: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onDragStart: (task: Task) => void;
  onCreateSubtask?: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void; // 新增
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart,
  onCreateSubtask
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
      
      <div className="space-y-2 min-h-[100px] max-h-[600px] overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic text-sm">此列中没有任务</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              onCreateSubtask={onCreateSubtask}
              compact={true}
              showPriority={true}
              showSubtasks={true}
              showStatus={false} // 在看板中隐藏状态，因为列已经表示了状态
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
  onDeleteTask: (task: Task) => void; // 修改为接收Task对象
  onDropTask: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onDragStart: (task: Task) => void;
  onCreateSubtask?: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void; // 新增
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDropTask,
  onDragStart,
  onCreateSubtask // 新增参数
}) => {
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

  // 按状态分类任务并排序
  const pendingTasks = sortTasksByPriority(tasks.filter(task => task.status === 'pending'));
  const inProgressTasks = sortTasksByPriority(tasks.filter(task => task.status === 'in-progress'));
  const completedTasks = sortTasksByPriority(tasks.filter(task => task.status === 'completed'));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <KanbanColumn
        title="待办"
        status="pending"
        tasks={pendingTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
        onCreateSubtask={onCreateSubtask}
      />
      <KanbanColumn
        title="进行中"
        status="in-progress"
        tasks={inProgressTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
        onCreateSubtask={onCreateSubtask}
      />
      <KanbanColumn
        title="已完成"
        status="completed"
        tasks={completedTasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
        onCreateSubtask={onCreateSubtask}
      />
    </div>
  );
};

export default KanbanBoard;