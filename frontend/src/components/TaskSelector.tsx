import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useTaskStore } from '../store/taskStore';
import Modal from './Modal';
import TaskCard from './TaskCard';

interface TaskSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTasks: (taskIds: number[]) => void;
  currentProject: Project;
  title?: string;
}

const TaskSelector: React.FC<TaskSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTasks,
  currentProject,
  title = '选择现有任务'
}) => {
  const { tasks, fetchTasks } = useTaskStore();
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'other-projects'>('unassigned');

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
      setSelectedTaskIds([]);
    }
  }, [isOpen, fetchTasks]);

  // 获取可选择的任务（排除子任务）
  const getSelectableTasks = () => {
    // 首先排除子任务
    const mainTasks = tasks.filter(task => !task.parentTaskId);
    
    switch (filter) {
      case 'unassigned':
        // 未分配到任何项目的主任务
        return mainTasks.filter(task => !task.projectId);
      case 'other-projects':
        // 分配到其他项目的主任务
        return mainTasks.filter(task => task.projectId && task.projectId !== currentProject.id);
      case 'all':
      default:
        // 所有不在当前项目的主任务
        return mainTasks.filter(task => task.projectId !== currentProject.id);
    }
  };

  const selectableTasks = getSelectableTasks();

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
    if (selectedTaskIds.length === selectableTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(selectableTasks.map(task => task.id));
    }
  };

  // 确认选择
  const handleConfirm = () => {
    onSelectTasks(selectedTaskIds);
    onClose();
  };

  // 计算各筛选条件的任务数量（排除子任务）
  const getTaskCount = (filterType: string) => {
    // 首先排除子任务
    const mainTasks = tasks.filter(task => !task.parentTaskId);
    
    switch (filterType) {
      case 'all':
        return mainTasks.filter(task => task.projectId !== currentProject.id).length;
      case 'unassigned':
        return mainTasks.filter(task => !task.projectId).length;
      case 'other-projects':
        return mainTasks.filter(task => task.projectId && task.projectId !== currentProject.id).length;
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
        {/* 筛选按钮 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('unassigned')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'unassigned' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            未分配任务 ({getTaskCount('unassigned')})
          </button>
          <button
            onClick={() => setFilter('other-projects')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'other-projects' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            其他项目任务 ({getTaskCount('other-projects')})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === 'all' 
                ? 'bg-indigo-100 text-indigo-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部可选任务 ({getTaskCount('all')})
          </button>
        </div>

        {/* 操作按钮 */}
        {selectableTasks.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedTaskIds.length === selectableTasks.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-600">
              已选择 {selectedTaskIds.length} / {selectableTasks.length} 个任务
            </span>
          </div>
        )}

        {/* 任务列表 */}
        <div className="max-h-96 overflow-y-auto">
          {selectableTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unassigned' ? '没有未分配的任务' : 
                 filter === 'other-projects' ? '没有其他项目的任务' : 
                 '没有可选择的任务'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unassigned' ? '所有任务都已分配到项目中' : 
                 filter === 'other-projects' ? '没有分配到其他项目的任务' : 
                 '所有任务都已在当前项目中'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectableTasks.map(task => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTaskIds.includes(task.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    // 如果点击的是复选框或其父元素，不处理
                    const target = e.target as HTMLInputElement;
                    if (target.tagName === 'INPUT' || 
                        (e.target as HTMLElement).closest('input[type="checkbox"]')) {
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
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <TaskCard
                        task={task}
                        compact={true}
                        showPriority={true}
                      />
                      {/* 显示当前所属项目 */}
                      {task.projectId && task.project && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                            当前项目: {task.project.name}
                          </span>
                        </div>
                      )}
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
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            添加到项目 ({selectedTaskIds.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskSelector;