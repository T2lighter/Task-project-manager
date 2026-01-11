import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';
// import SubtaskForm from './SubtaskForm';

interface SubtaskListProps {
  subtasks: Task[];
  onEditSubtask: (subtask: Task) => void;
  onDeleteSubtask: (subtask: Task) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onEditSubtask,
  onDeleteSubtask
}) => {
  // 对子任务进行排序：未完成的在前，已完成的在后
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    // 已完成的任务排在后面
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // 相同状态按创建时间排序（新的在前）
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="mt-1.5 border-l-2 border-gray-200 pl-2">
      {/* 子任务列表 */}
      <div className="space-y-0.1">
        {subtasks.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-2">还没有子任务</p>
        ) : (
          sortedSubtasks.map(subtask => (
            <div key={subtask.id} className={`bg-gray-50 rounded p-1.5 ${subtask.status === 'completed' ? 'opacity-60' : ''}`}>
              <TaskCard
                task={subtask}
                onEdit={onEditSubtask}
                onDelete={onDeleteSubtask}
                onCreateSubtask={undefined} // 明确禁止子任务添加子任务
                compact={true}
                showPriority={true} // 显示子任务的优先级信息
                showSubtasks={false} // 子任务不显示子任务列表
                showCompleted={true} // 启用已完成样式（删除线）
                showStatus={true} // 显示子任务状态
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubtaskList;