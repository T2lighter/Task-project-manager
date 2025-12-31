import React, { useState } from 'react';
import { KeyResult, KeyResultUpdate } from '../types';

interface KeyResultUpdateFormProps {
  keyResult: KeyResult;
  onSubmit: (updateData: Omit<KeyResultUpdate, 'id' | 'userId' | 'createdAt'>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const KeyResultUpdateForm: React.FC<KeyResultUpdateFormProps> = ({
  keyResult,
  onSubmit,
  onClose,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    progress: keyResult.progress,
    note: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = '进度必须在0-100之间';
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
      keyResultId: keyResult.id,
      progress: formData.progress,
      note: formData.note.trim() || undefined,
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              更新关键结果
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* 关键结果信息 */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">关键结果描述:</span>
            </div>
            <p className="text-sm text-gray-700">
              {keyResult.description || '无描述'}
            </p>
          </div>

          {/* 进度 */}
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
            {errors.progress && <p className="text-red-500 text-sm mt-1">{errors.progress}</p>}
          </div>

          {/* 更新说明 */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              更新说明
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="记录这次更新的详细情况和进展..."
            />
          </div>

          {/* 按钮组 */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KeyResultUpdateForm;