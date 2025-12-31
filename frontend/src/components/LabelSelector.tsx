import React, { useState } from 'react';
import { CustomLabel, TaskLabel } from '../types';

interface LabelSelectorProps {
  labels: CustomLabel[];
  selectedLabels: TaskLabel[];
  onLabelsChange: (labelIds: number[]) => void;
  className?: string;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  labels,
  selectedLabels,
  onLabelsChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLabelIds = selectedLabels.map(tl => tl.labelId);

  const toggleLabel = (labelId: number) => {
    const newSelectedIds = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter(id => id !== labelId)
      : [...selectedLabelIds, labelId];
    
    onLabelsChange(newSelectedIds);
  };

  const getSelectedLabelsDisplay = () => {
    if (selectedLabels.length === 0) {
      return <span className="text-gray-500">选择标签...</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {selectedLabels.slice(0, 3).map((taskLabel) => {
          const label = labels.find(l => l.id === taskLabel.labelId);
          if (!label) return null;
          
          return (
            <span
              key={taskLabel.labelId}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          );
        })}
        {selectedLabels.length > 3 && (
          <span className="text-xs text-gray-500">
            +{selectedLabels.length - 3} 更多
          </span>
        )}
      </div>
    );
  };

  if (labels.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        暂无可用标签，请先创建标签
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        个性化标签
      </label>
      
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] flex items-center justify-between"
      >
        <div className="flex-1">
          {getSelectedLabelsDisplay()}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {labels.map((label) => {
            const isSelected = selectedLabelIds.includes(label.id);
            
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="font-medium">{label.name}</span>
                  {label.description && (
                    <span className="text-sm text-gray-500 truncate">
                      - {label.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LabelSelector;