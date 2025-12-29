import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';

interface ProjectFormProps {
  project: Project | null;
  onSubmit: (project: Omit<Project, 'id' | 'userId'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  isOpen?: boolean;
  asModal?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ 
  project, 
  onSubmit, 
  onClose, 
  onDelete, 
  isOpen = true,
  asModal = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    startDate: '',
    endDate: ''
  });

  // 控制删除确认对话框的状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 辅助函数：将Date对象转换为本地日期字符串 (YYYY-MM-DD)
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: project.startDate ? formatDateToLocal(new Date(project.startDate)) : '',
        endDate: project.endDate ? formatDateToLocal(new Date(project.endDate)) : ''
      });
    } else {
      // 重置表单数据
      setFormData({
        name: '',
        description: '',
        status: 'planning' as Project['status'],
        startDate: '',
        endDate: ''
      });
    }
  }, [project]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined
    });
  }, [formData, onSubmit]);

  // 处理删除确认
  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  const handleDeleteCancel = React.useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // 项目状态选项
  const statusOptions = [
    { value: 'planning', label: '规划中', color: 'text-gray-600' },
    { value: 'active', label: '进行中', color: 'text-blue-600' },
    { value: 'completed', label: '已完成', color: 'text-green-600' },
    { value: 'on-hold', label: '暂停', color: 'text-yellow-600' },
    { value: 'cancelled', label: '已取消', color: 'text-red-600' }
  ];

  // 表单内容JSX
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
          项目名称 *
        </label>
        <input
          type="text"
          id="project-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="请输入项目名称"
        />
      </div>

      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
          项目描述
        </label>
        <textarea
          id="project-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="请输入项目描述"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-startDate" className="block text-sm font-medium text-gray-700 mb-1">
            开始日期
          </label>
          <input
            type="date"
            id="project-startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="project-endDate" className="block text-sm font-medium text-gray-700 mb-1">
            结束日期
          </label>
          <input
            type="date"
            id="project-endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-status" className="block text-sm font-medium text-gray-700 mb-1">
          项目状态
        </label>
        <select
          id="project-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {project && onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            删除项目
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {project ? '更新项目' : '创建项目'}
        </button>
      </div>
    </form>
  );

  // 根据模式返回不同的渲染结果
  if (asModal) {
    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title={project ? '编辑项目' : '创建新项目'}
          size="md"
        >
          {formContent}
        </Modal>
        
        {/* 删除确认对话框 */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="删除项目"
          message={`确定要删除项目"${formData.name}"吗？此操作将同时删除项目下的所有任务，且无法撤销。`}
          confirmText="删除"
          cancelText="取消"
          confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        />
      </>
    );
  }

  // 非弹窗模式，返回原有的表单
  return (
    <>
      {formContent}
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="删除项目"
        message={`确定要删除项目"${formData.name}"吗？此操作将同时删除项目下的所有任务，且无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
};

export default ProjectForm;