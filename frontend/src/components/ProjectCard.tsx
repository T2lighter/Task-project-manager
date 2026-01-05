import React from 'react';
import { Project } from '../types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onView?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  // 获取项目状态的样式配置
  const getStatusConfig = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '📋',
          text: '规划中'
        };
      case 'active':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: '🚀',
          text: '进行中'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          icon: '✅',
          text: '已完成'
        };
      case 'on-hold':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏸️',
          text: '暂停'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: '❌',
          text: '已取消'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '📋',
          text: '未知'
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  // 计算项目进度
  const progress = project.progress || 0;
  const taskCount = project.taskCount || 0;
  const completedTaskCount = project.completedTaskCount || 0;

  // 判断项目是否逾期
  const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== 'completed';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* 项目头部 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onView?.(project)}
          >
            {project.name}
          </h3>
          {project.description && (
            <div 
              className="text-sm text-gray-600 mt-1 line-clamp-2 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-3 [&_ol]:list-decimal [&_ol]:ml-3 [&_li]:my-0 [&_p]:my-0"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit?.(project)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="编辑项目"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete?.(project)}
            className="text-red-600 hover:text-red-800 p-1"
            title="删除项目"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* 项目状态和标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color} flex items-center gap-1`}>
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.text}</span>
        </span>
        
        {isOverdue && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
            <span>⚠️</span>
            <span>逾期</span>
          </span>
        )}
        
        {taskCount > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
            {taskCount} 个任务
          </span>
        )}
      </div>

      {/* 项目进度 */}
      {taskCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">进度</span>
            <span className="text-sm font-medium text-gray-900">
              {completedTaskCount}/{taskCount} ({progress}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 项目日期信息 */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex flex-col">
          {project.startDate && (
            <span>开始: {format(new Date(project.startDate), 'yyyy-MM-dd')}</span>
          )}
          {project.endDate && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              结束: {format(new Date(project.endDate), 'yyyy-MM-dd')}
            </span>
          )}
        </div>
        
        {project.createdAt && (
          <span>创建于 {format(new Date(project.createdAt), 'MM-dd')}</span>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;