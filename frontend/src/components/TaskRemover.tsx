import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useTaskStore } from '../store/taskStore';
import Modal from './Modal';
import TaskCard from './TaskCard';

interface TaskRemoverProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoveTasks: (taskIds: number[]) => void;
  currentProject: Project;
  title?: string;
}

const TaskRemover: React.FC<TaskRemoverProps> = ({
  isOpen,
  onClose,
  onRemoveTasks,
  currentProject,
  title = '从项目中移除任务'
}) => {
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      setSelectedTaskIds([]);
    }
  }, [isOpen, fetchTasks]);

  // 获取当前项目的任务（可移除的任务）
  const getRemovableTasks = () => {
    const projectTasks = tasks.filter(task => task.projectId === currentProject.id && !task.parentTaskId);
    
    switch (filter) {
      case 'pending':
        return projectTasks.filter(task => task.status === 'pending');
      case 'in-progress':
        return projectTasks.filter(task => task.status === 'in-progress');
      case 'completed':
        return projectTasks.filter(task => task.status === 'completed');
      case 'all':
      default:
        return projectTasks;
    }
  };

  const removableTasks = getRemovableTasks();

  // 处理任务选择
  const handleTaskToggle = (taskId: number) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedTaskIds.length === removableTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(removableTasks.map(task => task.id));
    }
  };

  // 确认移除
  const handleConfirm = () => {
    onRemoveTasks(selectedTaskIds);
    onClose();
  };

  // 计算各筛选条件的任务数量
  const getTaskCount = (filterType: string) => {
    const projectTasks = tasks.filter(task => task.projectId === currentProject.id && !task.parentTaskId);
    
    switch (filterType) {
      case 'all':
        return projectTasks.length;
      case 'pending':
        return projectTasks.filter(task => task.status === 'pending').length;
      case 'in-progress':
        return projectTasks.filter(task => task.status === 'in-progress').length;
      case 'completed':
        return projectTasks.filter(task => task.status === 'completed').length;
      default:
        return 0;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="space-y-4">
        {/* 警告提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                注意
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>移除任务只会取消任务与项目的关联，任务本身不会被删除。移除后的任务将变为未分配状态。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部任务 ({getTaskCount('all')})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待办 ({getTaskCount('pending')})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'in-progress' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            进行中 ({getTaskCount('in-progress')})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已完成 ({getTaskCount('completed')})
          </button>
        </div>

        {/* 操作按钮 */}
        {removableTasks.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              {selectedTaskIds.length === removableTasks.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-600">
              已选择 {selectedTaskIds.length} / {removableTasks.length} 个任务
            </span>
          </div>
        )}

        {/* 任务列表 */}
        <div className="max-h-96 overflow-y-auto">
          {removableTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? '项目中没有任务' : `没有${filter === 'pending' ? '待办' : filter === 'in-progress' ? '进行中' : '已完成'}的任务`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? '当前项目中没有可移除的任务' : '切换到其他筛选条件查看任务'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {removableTasks.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTaskIds.includes(task.id)
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    // 如果点击的是复选框或其父元素，不处理
                    const target = e.target as HTMLInputElement;
                    if (target.type === 'checkbox' || 
                        target.closest('input[type="checkbox"]')) {
                      return;
                    }
                    handleTaskToggle(task.id);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        handleTaskToggle(task.id);
                      }}
                      onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <TaskCard
                        task={task}
                        compact={true}
                        showPriority={true}
                        showProject={false} // 不显示项目信息，因为都是当前项目的任务
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTaskIds.length === 0}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedTaskIds.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            从项目中移除 ({selectedTaskIds.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskRemover;