import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { useProjectStore } from '../store/projectStore';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import RichTextEditor from './RichTextEditor';

interface TaskFormProps {
  task: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'userId'>) => void;
  onClose: () => void;
  onDelete?: () => void;
  defaultDueDate?: Date | null;
  defaultCreatedAt?: Date | null; // 新增：默认创建时间
  defaultProjectId?: number | null; // 新增：默认项目ID
  isOpen?: boolean; // 新增：控制弹窗显示
  asModal?: boolean; // 新增：是否以弹窗模式显示
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  onSubmit, 
  onClose, 
  onDelete, 
  defaultDueDate,
  defaultCreatedAt, // 新增参数
  defaultProjectId, // 新增参数
  isOpen = true,
  asModal = false
}) => {
  const { projects, fetchProjects } = useProjectStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    urgency: false,
    importance: false,
    dueDate: '',
    createdAt: '', // 新增：创建时间字段
    categoryId: undefined as number | undefined,
    projectId: undefined as number | undefined // 新增：项目ID字段
  });

  // 新增：控制删除确认对话框的状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 获取项目列表
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 辅助函数：将Date对象转换为本地日期字符串 (YYYY-MM-DD)
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (task) {
      const taskCreatedAt = task.createdAt ? formatDateToLocal(new Date(task.createdAt)) : '';
      const taskDueDate = task.dueDate ? formatDateToLocal(new Date(task.dueDate)) : '';
      
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        urgency: task.urgency,
        importance: task.importance,
        dueDate: taskDueDate || taskCreatedAt,
        createdAt: taskCreatedAt,
        categoryId: task.categoryId,
        projectId: task.projectId
      });
    } else {
      const today = formatDateToLocal(new Date());
      const defaultCreatedAtFormatted = defaultCreatedAt ? formatDateToLocal(defaultCreatedAt) : today;
      const defaultDueDateFormatted = defaultDueDate ? formatDateToLocal(defaultDueDate) : defaultCreatedAtFormatted;
      
      setFormData({
        title: '',
        description: '',
        status: 'pending' as Task['status'],
        urgency: false,
        importance: false,
        dueDate: defaultDueDateFormatted,
        createdAt: defaultCreatedAtFormatted,
        categoryId: undefined as number | undefined,
        projectId: defaultProjectId || undefined
      });
    }
  }, [task, defaultDueDate, defaultCreatedAt, defaultProjectId]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // 如果修改的是创建日期，并且截止日期为空或等于之前的创建日期，则同步更新截止日期
      if (name === 'createdAt' && value) {
        if (!prev.dueDate || prev.dueDate === prev.createdAt) {
          newData.dueDate = value;
        }
      }
      
      return newData;
    });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果截止日期为空，则使用创建日期作为截止日期
    const finalDueDate = formData.dueDate || formData.createdAt;
    
    // 提交任务数据
    onSubmit({
      ...formData,
      dueDate: finalDueDate ? new Date(finalDueDate) : undefined,
      createdAt: formData.createdAt ? new Date(formData.createdAt) : undefined
    });
  }, [formData, onSubmit]);

  // 新增：处理删除确认
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

  // 表单内容JSX
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
          任务标题
        </label>
        <input
          type="text"
          id="task-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
          任务描述
        </label>
        <RichTextEditor
          id="task-description"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="输入任务描述..."
          minHeight="80px"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-createdAt" className="block text-sm font-medium text-gray-700 mb-1">
            创建日期
          </label>
          <input
            type="date"
            id="task-createdAt"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="task-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            截止日期
          </label>
          <input
            type="date"
            id="task-dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-1">
            任务状态
          </label>
          <select
            id="task-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="pending">待办</option>
            <option value="in-progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            优先级
          </label>
          <div className="flex space-x-4 pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="task-urgency"
                name="urgency"
                checked={formData.urgency}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="task-urgency" className="ml-2 block text-sm text-gray-700">
                紧急
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="task-importance"
                name="importance"
                checked={formData.importance}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="task-importance" className="ml-2 block text-sm text-gray-700">
                重要
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 项目选择字段 */}
      <div>
        <label htmlFor="task-project" className="block text-sm font-medium text-gray-700 mb-1">
          所属项目
        </label>
        <select
          id="task-project"
          name="projectId"
          value={formData.projectId || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">无项目</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : project.status === 'planning' ? '规划中' : project.status === 'on-hold' ? '暂停' : '已取消'})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {task && onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            删除任务
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
          {task ? '更新任务' : '添加任务'}
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
          title={task ? '编辑任务' : '添加新任务'}
          size="md"
        >
          {formContent}
        </Modal>
        
        {/* 删除确认对话框 */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="删除任务"
          message={`确定要删除任务"${formData.title}"吗？此操作无法撤销。`}
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
        title="删除任务"
        message={`确定要删除任务"${formData.title}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </>
  );
};

export default TaskForm;