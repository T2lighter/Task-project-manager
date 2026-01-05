import React, { useState, useEffect } from 'react';
import { ExecutionPlan } from '../types';
import RichTextEditor from './RichTextEditor';

interface ExecutionPlanFormProps {
  executionPlan?: ExecutionPlan | null;
  objectiveId: number;
  onSubmit: (data: Omit<ExecutionPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen: boolean;
  asModal?: boolean;
}

const ExecutionPlanForm: React.FC<ExecutionPlanFormProps> = ({
  executionPlan,
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
    phase: '',
    objectiveId: objectiveId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (executionPlan) {
      setFormData({
        title: executionPlan.title,
        description: executionPlan.description || '',
        phase: executionPlan.phase,
        objectiveId: executionPlan.objectiveId
      });
    } else {
      setFormData({
        title: '',
        description: '',
        phase: '',
        objectiveId: objectiveId
      });
    }
    setErrors({});
  }, [executionPlan, objectiveId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '执行计划标题不能为空';
    }

    if (!formData.phase.trim()) {
      newErrors.phase = '阶段名称不能为空';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          {executionPlan ? '编辑执行计划' : '创建执行计划'}
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
          执行计划标题 *
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
          placeholder="输入执行计划标题"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 阶段名称 */}
      <div>
        <label htmlFor="phase" className="block text-sm font-medium text-gray-700 mb-1">
          阶段名称 *
        </label>
        <input
          type="text"
          id="phase"
          name="phase"
          value={formData.phase}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phase ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="第一阶段、准备阶段、执行阶段等"
        />
        {errors.phase && <p className="text-red-500 text-sm mt-1">{errors.phase}</p>}
      </div>

      {/* 详细描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          详细描述
        </label>
        <RichTextEditor
          id="description"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="详细描述执行计划，包括具体步骤、时间安排、负责人、依赖关系、里程碑等..."
          minHeight="120px"
        />
      </div>

      {/* 按钮组 */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && executionPlan && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              删除执行计划
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
            {executionPlan ? '更新执行计划' : '创建执行计划'}
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

export default ExecutionPlanForm;