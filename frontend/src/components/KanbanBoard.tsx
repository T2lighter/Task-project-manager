import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
import { useDragHandlers } from '../hooks/useDragHandlers'; // 新增：拖拽钩子
import { getTaskStatusColors } from '../utils/colorUtils'; // 新增：统一颜色配置

interface KanbanColumnProps {
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void; // 修改为接收Task对象
  onCopyTask?: (task: Task) => void; // 新增：复制任务
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
  onCopyTask, // 新增：复制任务回调
  onDropTask,
  onDragStart,
  onCreateSubtask
}) => {
  // 使用拖拽钩子简化逻辑
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragHandlers();

  // 处理任务拖拽放下
  const handleTaskDrop = (task: any) => {
    onDropTask(task, status);
  };

  // 使用统一颜色配置系统
  const colorClasses = getTaskStatusColors(status);

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
      
      <div className="space-y-2 min-h-[300px] max-h-[600px] overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic text-sm">此列中没有任务</p>
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
  onCopyTask?: (task: Task) => void; // 新增：复制任务
  onDropTask: (task: Task, newStatus: 'pending' | 'in-progress' | 'completed') => void;
  onDragStart: (task: Task) => void;
  onCreateSubtask?: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void; // 新增
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onCopyTask, // 新增：复制任务回调
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
        onCopyTask={onCopyTask}
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
        onCopyTask={onCopyTask}
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
        onCopyTask={onCopyTask}
        onDropTask={onDropTask}
        onDragStart={onDragStart}
        onCreateSubtask={onCreateSubtask}
      />
    </div>
  );
};

export default KanbanBoard;