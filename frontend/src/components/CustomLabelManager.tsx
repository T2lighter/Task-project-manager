import React, { useState, useEffect, useRef } from 'react';
import { CustomLabel } from '../types';

interface CustomLabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  labels: CustomLabel[];
  loading?: boolean;
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

// 单个标签项组件，支持内联编辑
interface LabelItemProps {
  label: CustomLabel;
  onUpdate: (id: number, data: Omit<CustomLabel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onDelete: (id: number) => void;
}

const LabelItem: React.FC<LabelItemProps> = ({ label, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [editDescription, setEditDescription] = useState(label.description || '');
  const [editColor, setEditColor] = useState(label.color);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  // 点击外部关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartEdit = () => {
    setEditName(label.name);
    setEditDescription(label.description || '');
    setEditColor(label.color);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(label.id, {
        name: editName.trim(),
        color: editColor,
        description: editDescription.trim()
      });
    } else {
      setEditName(label.name);
      setEditDescription(label.description || '');
    }
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const handleCancel = () => {
    setEditName(label.name);
    setEditDescription(label.description || '');
    setEditColor(label.color);
    setIsEditing(false);
    setShowColorPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleColorChange = (color: string) => {
    setEditColor(color);
    setShowColorPicker(false);
  };

  // 编辑模式
  if (isEditing) {
    return (
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          {/* 颜色选择 */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: editColor }}
              title="点击更换颜色"
            />
            {showColorPicker && (
              <div className="absolute top-8 left-0 z-20 bg-white rounded-lg shadow-lg border p-2 w-40">
                <div className="grid grid-cols-5 gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        editColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">编辑标签</span>
        </div>
        
        <div className="space-y-2">
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="标签名称"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="标签描述（可选）"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!editName.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    );
  }

  // 显示模式
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* 颜色指示器 */}
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
          style={{ backgroundColor: label.color }}
        />

        {/* 标签信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 text-sm">{label.name}</div>
          {label.description && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{label.description}</div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleStartEdit}
          className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors"
          title="编辑标签"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(label.id)}
          className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
          title="删除标签"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const CustomLabelManager: React.FC<CustomLabelManagerProps> = ({
  isOpen,
  onClose,
  labels,
  loading = false,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);
  const [newLabelDescription, setNewLabelDescription] = useState('');
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && newLabelInputRef.current) {
      newLabelInputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onCreateLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
        description: newLabelDescription.trim()
      });
      setNewLabelName('');
      setNewLabelColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setNewLabelDescription('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateLabel();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewLabelName('');
      setNewLabelDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">标签管理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* 添加新标签按钮/表单 */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all mb-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">添加新标签</span>
            </button>
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center gap-3 mb-3">
                {/* 颜色选择 */}
                <div className="flex gap-1 flex-wrap">
                  {PRESET_COLORS.slice(0, 10).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        newLabelColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  ref={newLabelInputRef}
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入标签名称..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewLabelName('');
                  }}
                  className="px-3 py-2 text-gray-600 text-sm hover:bg-gray-200 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 标签列表 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                现有标签 ({labels.length})
              </h3>
              {labels.length > 0 && (
                <span className="text-xs text-gray-400">悬停显示操作按钮</span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-sm">加载标签中...</p>
              </div>
            ) : labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏷️</div>
                <p className="text-sm font-medium">还没有标签</p>
                <p className="text-xs text-gray-400 mt-1">创建标签来组织和分类任务</p>
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <LabelItem
                    key={label.id}
                    label={label}
                    onUpdate={onUpdateLabel}
                    onDelete={onDeleteLabel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="flex justify-end px-5 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomLabelManager;
