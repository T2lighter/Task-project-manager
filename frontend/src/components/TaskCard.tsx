import React from 'react';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-md p-3 shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {task.dueDate && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {format(new Date(task.dueDate), 'yyyy-MM-dd')}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {task.status === 'completed' ? '已完成' : '待完成'}
            </span>
            {task.category && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {task.category.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;