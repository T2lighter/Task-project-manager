import React, { useState, useEffect } from 'react';
import { ResourceRequirement } from '../types';

interface ResourceRequirementFormProps {
  resourceRequirement?: ResourceRequirement | null;
  objectiveId: number;
  onSubmit: (data: Omit<ResourceRequirement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen: boolean;
  asModal?: boolean;
}

const ResourceRequirementForm: React.FC<ResourceRequirementFormProps> = ({
  resourceRequirement,
  objectiveId,
  onSubmit,
  onClose,
  onDelete,
  isOpen,
  asModal = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as ResourceRequirement['type'],
    status: 'requested' as ResourceRequirement['status'],
    objectiveId: objectiveId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (resourceRequirement) {
      setFormData({
        title: resourceRequirement.title,
        description: resourceRequirement.description || '',
        type: resourceRequirement.type,
        status: resourceRequirement.status,
        objectiveId: resourceRequirement.objectiveId
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'other',
        status: 'requested',
        objectiveId: objectiveId
      });
    }
    setErrors({});
  }, [resourceRequirement, objectiveId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '资源需求标题不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {resourceRequirement ? '编辑资源需求' : '创建资源需求'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {/* 标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          资源需求标题 *
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
          placeholder="输入资源需求标题"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 资源类型 */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          资源类型
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="human">👥 人力资源</option>
          <option value="financial">💰 资金</option>
          <option value="material">📦 物料</option>
          <option value="technical">🔧 技术</option>
          <option value="other">📋 其他</option>
        </select>
      </div>

      {/* 详细描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          详细描述
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="详细描述资源需求，包括数量、规格、用途等..."
        />
      </div>

      {/* 状态 */}
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
          <option value="requested">已申请</option>
          <option value="approved">已批准</option>
          <option value="allocated">已分配</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      {/* 按钮组 */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && resourceRequirement && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              删除资源需求
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
            {resourceRequirement ? '更新资源需求' : '创建资源需求'}
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

export default ResourceRequirementForm;