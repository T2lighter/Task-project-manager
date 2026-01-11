import React, { useState } from 'react';
import { Task } from '../types';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import { TASK_SOURCE_OPTIONS } from '../constants';

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentTask: Task;
  onCreateSubtask: (parentTaskId: number, subtaskData: Omit<Task, 'id' | 'userId'>) => void;
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({
  isOpen,
  onClose,
  parentTask,
  onCreateSubtask
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
    source: parentTask.source || '' as Task['source'] | '', // 继承父任务的来源
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
    
    onCreateSubtask(parentTask.id, {
      ...formData,
      source: formData.source || undefined, // 空字符串转为 undefined
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      createdAt: new Date()
    });

    // 重置表单
    setFormData({
      title: '',
      description: '',
      status: 'pending' as Task['status'],
      urgency: parentTask.urgency,
      importance: parentTask.importance,
      source: parentTask.source || '',
      dueDate: getTodayDateString(), // 重置时也使用今天的日期
      categoryId: parentTask.categoryId,
      projectId: parentTask.projectId
    });

    onClose();
  };

  const handleClose = () => {
    // 重置表单
    setFormData({
      title: '',
      description: '',
      status: 'pending' as Task['status'],
      urgency: parentTask.urgency,
      importance: parentTask.importance,
      source: parentTask.source || '',
      dueDate: getTodayDateString(), // 重置时也使用今天的日期
      categoryId: parentTask.categoryId,
      projectId: parentTask.projectId
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`为"${parentTask.title}"添加子任务`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subtask-title" className="block text-sm font-medium text-gray-700 mb-1">
            子任务标题 *
          </label>
          <input
            type="text"
            id="subtask-title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="输入子任务标题..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="subtask-description" className="block text-sm font-medium text-gray-700 mb-1">
            描述
          </label>
          <RichTextEditor
            id="subtask-description"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="输入子任务描述..."
            minHeight="80px"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subtask-status" className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              id="subtask-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">待办</option>
              <option value="in-progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div>
            <label htmlFor="subtask-source" className="block text-sm font-medium text-gray-700 mb-1">
              任务来源
            </label>
            <select
              id="subtask-source"
              name="source"
              value={formData.source || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择来源</option>
              {TASK_SOURCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subtask-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              截止日期
            </label>
            <input
              type="date"
              id="subtask-dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            优先级（继承自父任务）
          </label>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="subtask-urgency"
                name="urgency"
                checked={formData.urgency}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subtask-urgency" className="ml-2 block text-sm text-gray-700">
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="subtask-importance" className="ml-2 block text-sm text-gray-700">
                重要
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            添加子任务
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubtaskModal;