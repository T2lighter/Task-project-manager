import React, { useState, useEffect } from 'react';
import { Objective } from '../types';

interface ObjectiveFormProps {
  objective?: Objective | null;
  projectId: number;
  onSubmit: (objectiveData: Omit<Objective, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'keyResults'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen: boolean;
  asModal?: boolean;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  objective,
  projectId,
  onSubmit,
  onClose,
  onDelete,
  isOpen,
  asModal = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as Objective['status'],
    progress: 0,
    startDate: '',
    endDate: '',
    projectId: projectId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (objective) {
      setFormData({
        title: objective.title,
        description: objective.description || '',
        status: objective.status,
        progress: objective.progress,
        startDate: objective.startDate ? new Date(objective.startDate).toISOString().split('T')[0] : '',
        endDate: objective.endDate ? new Date(objective.endDate).toISOString().split('T')[0] : '',
        projectId: objective.projectId
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'draft',
        progress: 0,
        startDate: '',
        endDate: '',
        projectId: projectId
      });
    }
    setErrors({});
  }, [objective, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '目标标题不能为空';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStatusConfig = (status: Objective['status']) => {
    switch (status) {
      case 'draft':
        return { color: 'text-gray-600', text: '草稿' };
      case 'active':
        return { color: 'text-blue-600', text: '进行中' };
      case 'completed':
        return { color: 'text-green-600', text: '已完成' };
      case 'cancelled':
        return { color: 'text-red-600', text: '已取消' };
      default:
        return { color: 'text-gray-600', text: '未知' };
    }
  };

  if (!isOpen) return null;

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {objective ? '编辑目标' : '创建目标'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {/* 目标标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          目标标题 *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="输入目标标题"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 目标描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          目标描述
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="详细描述这个目标..."
        />
      </div>

      {/* 状态和进度 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            状态
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">草稿</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        <div>
          <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
            进度 ({formData.progress}%)
          </label>
          <input
            type="range"
            id="progress"
            name="progress"
            min="0"
            max="100"
            value={formData.progress}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      </div>

      {/* 日期范围 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            开始日期
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            结束日期
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.endDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
        </div>
      </div>

      {/* 按钮组 */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && objective && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              删除目标
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {objective ? '更新目标' : '创建目标'}
          </button>
        </div>
      </div>
    </form>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {content}
    </div>
  );
};

export default ObjectiveForm;