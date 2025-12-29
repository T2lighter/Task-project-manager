import React, { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

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
    <div className="mt-2 border-l-2 border-gray-200 pl-3">
      {/* 子任务摘要 */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span>
            子任务 ({completedSubtasks}/{totalSubtasks})
            {totalSubtasks > 0 && (
              <span className="ml-1 text-xs">({progress}%)</span>
            )}
          </span>
        </button>
        
        {/* 移除这个按钮，因为TaskCard中已经有添加子任务的按钮 */}
      </div>

      {/* 进度条 */}
      {totalSubtasks > 0 && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 子任务列表 */}
      {isExpanded && (
        <div className="space-y-1">
          {subtasks.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">还没有子任务</p>
          ) : (
            sortedSubtasks.map(subtask => (
              <div key={subtask.id} className={`bg-gray-50 rounded p-2 ${subtask.status === 'completed' ? 'opacity-60' : ''}`}>
                <TaskCard
                  task={subtask}
                  onEdit={onEditSubtask}
                  onDelete={onDeleteSubtask}
                  onCreateSubtask={undefined} // 明确禁止子任务添加子任务
                  compact={true}
                  showPriority={true} // 修改：显示子任务的优先级信息
                  showSubtasks={false} // 子任务不显示子任务列表
                  showCompleted={true} // 启用已完成样式（删除线）
                  showStatus={true} // 显示子任务状态
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* 子任务创建表单 - 暂时移除，使用Modal方式 */}
      {/* {isFormOpen && (
        <div className="mt-2 p-3 bg-blue-50 rounded border">
          <SubtaskForm
            parentTask={parentTask}
            onSubmit={handleCreateSubtask}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )} */}
    </div>
  );
};

export default SubtaskList;