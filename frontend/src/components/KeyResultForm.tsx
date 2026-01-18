import React, { useState, useEffect } from 'react';
import { KeyResult } from '../types';
import RichTextEditor from './RichTextEditor';

interface KeyResultFormProps {
  keyResult?: KeyResult | null;
  objectiveId: number;
  onSubmit: (keyResultData: Omit<KeyResult, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'updates'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen: boolean;
  asModal?: boolean;
}

const KeyResultForm: React.FC<KeyResultFormProps> = ({
  keyResult,
  objectiveId,
  onSubmit,
  onClose,
  onDelete,
  isOpen,
  asModal = false
}) => {
  const [formData, setFormData] = useState({
    description: '',
    status: 'not-started' as KeyResult['status'],
    progress: 0,
    objectiveId: objectiveId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (keyResult) {
      setFormData({
        description: keyResult.description || '',
        status: keyResult.status,
        progress: keyResult.progress,
        objectiveId: keyResult.objectiveId
      });
    } else {
      setFormData({
        description: '',
        status: 'not-started',
        progress: 0,
        objectiveId: objectiveId
      });
    }
    setErrors({});
  }, [keyResult, objectiveId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      newErrors.description = '关键结果描述不能为空';
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

  if (!isOpen) return null;

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {keyResult ? '编辑关键结果' : '创建关键结果'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      {/* 描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          关键结果描述 *
        </label>
        <RichTextEditor
          id="description"
          value={formData.description}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, description: value }));
            if (errors.description) {
              setErrors(prev => ({ ...prev, description: '' }));
            }
          }}
          placeholder="详细描述这个关键结果的具体内容和预期成果..."
          minHeight="100px"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
            <option value="not-started">⏸️ 未开始</option>
            <option value="in-progress">🔄 处理中</option>
            <option value="completed">✅ 已完成</option>
            <option value="at-risk">⚠️ 有风险</option>
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

      {/* 按钮组 */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && keyResult && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              删除关键结果
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
            {keyResult ? '更新关键结果' : '创建关键结果'}
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

export default KeyResultForm;