import React, { useState, useEffect } from 'react';
import { CustomLabel } from '../types';

interface CustomLabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  labels: CustomLabel[];
  loading?: boolean; // 新增：加载状态
  onCreateLabel: (label: Omit<CustomLabel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateLabel: (id: number, label: Omit<CustomLabel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteLabel: (id: number) => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
];

const CustomLabelManager: React.FC<CustomLabelManagerProps> = ({
  isOpen,
  onClose,
  labels,
  loading = false, // 新增：加载状态，默认为false
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel
}) => {
  const [editingLabel, setEditingLabel] = useState<CustomLabel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: PRESET_COLORS[0],
    description: ''
  });

  useEffect(() => {
    if (editingLabel) {
      setFormData({
        name: editingLabel.name,
        color: editingLabel.color,
        description: editingLabel.description || ''
      });
    } else {
      setFormData({
        name: '',
        color: PRESET_COLORS[0],
        description: ''
      });
    }
  }, [editingLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingLabel) {
      onUpdateLabel(editingLabel.id, formData);
    } else {
      onCreateLabel(formData);
    }

    setEditingLabel(null);
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      description: ''
    });
  };

  const handleCancel = () => {
    setEditingLabel(null);
    setFormData({
      name: '',
      color: PRESET_COLORS[0],
      description: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">管理标签</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 overflow-y-auto max-h-[75vh]">
          {/* 标签表单 */}
          <form onSubmit={handleSubmit} className="mb-3 p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {editingLabel ? '编辑标签' : '新建标签'}
              </h3>
              {editingLabel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  取消
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="标签名称"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  颜色
                </label>
                <div className="grid grid-cols-8 gap-0.5">
                  {PRESET_COLORS.slice(0, 16).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-4 h-4 rounded border transition-all ${
                        formData.color === color
                          ? 'border-gray-800 ring-1 ring-gray-400 scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                描述（可选）
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="标签用途说明..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-1.5 text-sm rounded hover:bg-blue-700 transition-colors"
            >
              {editingLabel ? '更新标签' : '创建标签'}
            </button>
          </form>

          {/* 标签列表 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">现有标签 ({labels.length})</h3>
            {loading ? (
              <div className="text-center py-6 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm">加载标签中...</p>
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <div className="text-2xl mb-1">🏷️</div>
                <p className="text-sm">还没有标签</p>
                <p className="text-xs text-gray-400">创建标签来组织任务</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-56 overflow-y-auto border border-gray-100 rounded">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-sm truncate">{label.name}</div>
                        {label.description && (
                          <div className="text-xs text-gray-500 truncate">{label.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingLabel(label)}
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => onDeleteLabel(label.id)}
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-3 py-1.5 text-sm rounded hover:bg-gray-400 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomLabelManager;