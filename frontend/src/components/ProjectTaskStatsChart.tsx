import React from 'react';
import { ProjectTaskStats } from '../types';

interface ProjectTaskStatsChartProps {
  data: ProjectTaskStats[];
  onProjectClick?: (projectId: number) => void;
}

const ProjectTaskStatsChart: React.FC<ProjectTaskStatsChartProps> = ({ data, onProjectClick }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">项目任务分布</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">暂无项目任务数据</p>
        </div>
      </div>
    );
  }

  // 按任务总数排序
  const sortedData = [...data].sort((a, b) => b.totalTasks - a.totalTasks);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">项目任务分布</h3>
      
      <div className="space-y-4">
        {sortedData.map((project) => (
          <div key={project.projectId} className="border border-gray-200 rounded-lg p-4">
            {/* 项目头部 */}
            <div className="flex items-center justify-between mb-3">
              <div 
                className={`flex-1 ${onProjectClick ? 'cursor-pointer hover:text-blue-600' : ''}`}
                onClick={() => onProjectClick?.(project.projectId)}
              >
                <h4 className="font-medium text-gray-900 truncate">{project.projectName}</h4>
                <p className="text-sm text-gray-600">
                  {project.totalTasks} 个任务 • {project.completionRate.toFixed(1)}% 完成
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {project.completedTasks}/{project.totalTasks}
                </div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    project.completionRate === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${project.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* 任务状态分布 */}
            <div className="flex flex-wrap gap-2 text-xs">
              {project.completedTasks > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ✅ 已完成 {project.completedTasks}
                </span>
              )}
              {project.inProgressTasks > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  🔄 进行中 {project.inProgressTasks}
                </span>
              )}
              {project.pendingTasks > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  ⏳ 待办 {project.pendingTasks}
                </span>
              )}
              {project.overdueTasks > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  ⚠️ 逾期 {project.overdueTasks}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTaskStatsChart;