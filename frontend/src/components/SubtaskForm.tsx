import React, { useState } from 'react';
import { Task } from '../types';
import RichTextEditor from './RichTextEditor';

interface SubtaskFormProps {
  parentTask: Task;
  onSubmit: (subtaskData: Omit<Task, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  parentTask,
  onSubmit,
  onCancel
}) => {
  // 获取今天的日期字符串 (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    urgency: parentTask.urgency, // 继承父任务的紧急性
    importance: parentTask.importance, // 继承父任务的重要性
    dueDate: getTodayDateString(), // 默认为今天
    categoryId: parentTask.categoryId,
    projectId: parentTask.projectId
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      createdAt: new Date()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="subtask-title" className="block text-xs font-medium text-gray-700 mb-1">
          子任务标题
        </label>
        <input
          type="text"
          id="subtask-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="输入子任务标题..."
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="subtask-description" className="block text-xs font-medium text-gray-700 mb-1">
          描述（可选）
        </label>
        <RichTextEditor
          id="subtask-description"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="输入子任务描述..."
          minHeight="60px"
        />
      </div>

      <div>
        <label htmlFor="subtask-status" className="block text-xs font-medium text-gray-700 mb-1">
          状态
        </label>
        <select
          id="subtask-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pending">待办</option>
          <option value="in-progress">处理中</option>
          <option value="blocked">阻塞</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="subtask-dueDate" className="block text-xs font-medium text-gray-700 mb-1">
            截止日期
          </label>
          <input
            type="date"
            id="subtask-dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            优先级
          </label>
          <div className="flex items-center space-x-4 bg-gray-100 rounded-lg px-3 py-1">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subtask-urgency"
                name="urgency"
                checked={formData.urgency}
                onChange={handleChange}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subtask-urgency" className="ml-1 block text-xs text-gray-700">
                紧急
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subtask-importance"
                name="importance"
                checked={formData.importance}
                onChange={handleChange}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subtask-importance" className="ml-1 block text-xs text-gray-700">
                重要
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          添加子任务
        </button>
      </div>
    </form>
  );
};

export default SubtaskForm;