import React, { useState, useEffect } from 'react';
import { ActionCheck } from '../types';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ActionCheckFormProps {
  actionCheck?: ActionCheck | null;
  objectiveId: number;
  onSubmit: (data: Omit<ActionCheck, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen: boolean;
  asModal?: boolean;
}

const ActionCheckForm: React.FC<ActionCheckFormProps> = ({
  actionCheck,
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
    objectiveId: objectiveId
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: '', completed: false }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (actionCheck) {
      setFormData({
        title: actionCheck.title,
        description: actionCheck.description || '',
        objectiveId: actionCheck.objectiveId
      });

      // 解析现有的checklist数据（假设存储在criteria字段中）
      if (actionCheck.criteria) {
        try {
          const parsedChecklist = JSON.parse(actionCheck.criteria);
          if (Array.isArray(parsedChecklist) && parsedChecklist.length > 0) {
            setChecklist(parsedChecklist);
          }
        } catch (e) {
          // 如果解析失败，将criteria作为单个项目
          setChecklist([
            { id: '1', text: actionCheck.criteria, completed: false }
          ]);
        }
      }
    } else {
      setFormData({
        title: '',
        description: '',
        objectiveId: objectiveId
      });
      setChecklist([{ id: '1', text: '', completed: false }]);
    }
    setErrors({});
  }, [actionCheck, objectiveId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '行动检查标题不能为空';
    }

    const hasValidItems = checklist.some(item => item.text.trim());
    if (!hasValidItems) {
      newErrors.checklist = '至少需要一个检查项目';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 过滤掉空的检查项目
    const validChecklist = checklist.filter(item => item.text.trim());
    
    const submitData = {
      ...formData,
      checkType: 'custom' as ActionCheck['checkType'],
      criteria: JSON.stringify(validChecklist), // 将checklist存储为JSON字符串
      status: 'pending' as ActionCheck['status']
    };

    onSubmit(submitData);
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

  // Checklist操作函数
  const addChecklistItem = () => {
    const newId = Date.now().toString();
    setChecklist(prev => [...prev, { id: newId, text: '', completed: false }]);
  };

  const removeChecklistItem = (id: string) => {
    if (checklist.length > 1) {
      setChecklist(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateChecklistItem = (id: string, text: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, text } : item
    ));
    
    // 清除checklist错误
    if (errors.checklist) {
      setErrors(prev => ({ ...prev, checklist: '' }));
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  if (!isOpen) return null;

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {actionCheck ? '编辑行动检查' : '创建行动检查'}
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
          行动检查标题 *
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
          placeholder="输入行动检查标题"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* 描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          详细描述
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="详细描述行动检查的目的和背景..."
        />
      </div>

      {/* 检查清单 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            检查清单 *
          </label>
          <button
            type="button"
            onClick={addChecklistItem}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + 添加项目
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {checklist.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklistItem(item.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                placeholder={`检查项目 ${index + 1}`}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {checklist.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm px-2"
                  title="删除此项目"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        
        {errors.checklist && <p className="text-red-500 text-sm mt-1">{errors.checklist}</p>}
        
        {/* 进度统计 */}
        {checklist.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                完成进度: {checklist.filter(item => item.completed).length} / {checklist.length}
              </span>
              <span className="text-gray-600 font-medium">
                {checklist.length > 0 ? Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  checklist.length > 0 && checklist.filter(item => item.completed).length === checklist.length 
                    ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${checklist.length > 0 ? (checklist.filter(item => item.completed).length / checklist.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 按钮组 */}
      <div className="flex justify-between pt-4">
        <div>
          {onDelete && actionCheck && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              删除行动检查
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
            {actionCheck ? '更新行动检查' : '创建行动检查'}
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

export default ActionCheckForm;