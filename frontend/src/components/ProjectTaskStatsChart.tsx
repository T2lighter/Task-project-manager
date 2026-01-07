import React from 'react';
import { ProjectTaskStats } from '../types';

interface ProjectTaskStatsChartProps {
  data: ProjectTaskStats[];
  onProjectClick?: (projectId: number) => void;
  selectedStatus?: string; // 新增：选中的项目状态筛选
}

const ProjectTaskStatsChart: React.FC<ProjectTaskStatsChartProps> = ({ 
  data, 
  onProjectClick, 
  selectedStatus = 'active' // 默认显示进行中的项目
}) => {
  // 根据选中的状态筛选项目
  const filteredData = selectedStatus ? data.filter(project => project.projectStatus === selectedStatus) : data;

  // 获取状态对应的中文名称
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'planning': return '规划中';
      case 'on-hold': return '暂停';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">项目任务分布</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            暂无{getStatusText(selectedStatus)}项目的任务数据
          </h4>
          <p className="text-gray-600 mb-4">
            {selectedStatus === 'active' 
              ? '当前没有进行中的项目，或项目中还没有添加任务'
              : `当前没有${getStatusText(selectedStatus)}状态的项目任务数据`
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => window.location.href = '/projects'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              管理项目
            </button>
            <button
              onClick={() => window.location.href = '/tasks'}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              管理任务
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 按任务总数排序，同时考虑逾期任务优先级
  const sortedData = [...filteredData].sort((a, b) => {
    // 如果有逾期任务，优先显示
    if (a.overdueTasks > 0 && b.overdueTasks === 0) return -1;
    if (b.overdueTasks > 0 && a.overdueTasks === 0) return 1;
    // 其次按任务总数排序
    return b.totalTasks - a.totalTasks;
  });

  // 获取当前时间（用于逾期判断）
  const now = new Date();

  // 获取项目状态颜色
  const getProjectStatusColor = (project: ProjectTaskStats) => {
    if (project.overdueTasks > 0) return 'border-red-200 bg-red-50';
    if (project.completionRate === 100) return 'border-green-200 bg-green-50';
    if (project.inProgressTasks > 0) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-white';
  };

  // 获取进度条颜色
  const getProgressBarColor = (project: ProjectTaskStats) => {
    if (project.overdueTasks > 0) return 'bg-red-500';
    if (project.completionRate === 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">项目任务分布</h3>
        <div className="text-sm text-gray-500">
          {getStatusText(selectedStatus)} • {filteredData.length} 个项目
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedData.map((project) => (
          <div 
            key={project.projectId} 
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getProjectStatusColor(project)}`}
          >
            {/* 项目头部 */}
            <div className="flex items-center justify-between mb-3">
              <div 
                className={`flex-1 ${onProjectClick ? 'cursor-pointer hover:text-blue-600 group' : ''}`}
                onClick={() => onProjectClick?.(project.projectId)}
                title={onProjectClick ? '点击查看项目详情' : ''}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {project.projectName}
                  </h4>
                  {onProjectClick && (
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                  {project.overdueTasks > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ⚠️ 有逾期
                    </span>
                  )}
                  {project.totalTasks === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      📝 待添加任务
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {project.totalTasks === 0 ? (
                    '暂无任务 • 点击添加第一个任务'
                  ) : (
                    <>
                      {project.totalTasks} 个任务 • {project.completionRate.toFixed(1)}% 完成
                      {project.overdueTasks > 0 && (
                        <span className="text-red-600 ml-2">• {project.overdueTasks} 个逾期</span>
                      )}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                {project.totalTasks === 0 ? (
                  <div className="text-sm text-gray-500">
                    <div className="text-lg font-bold text-gray-400">0</div>
                    <div className="text-xs">个任务</div>
                  </div>
                ) : (
                  <>
                    <div className="text-lg font-bold text-gray-900">
                      {project.completedTasks}/{project.totalTasks}
                    </div>
                    {project.completionRate === 100 && (
                      <div className="text-xs text-green-600 font-medium">已完成</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 进度条 - 只有任务时才显示 */}
            {project.totalTasks > 0 && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(project)}`}
                    style={{ width: `${Math.max(project.completionRate, 2)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{project.completionRate.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* 任务状态分布 - 只有任务时才显示 */}
            {project.totalTasks > 0 && (
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                {project.completedTasks > 0 && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    ✅ 已完成 {project.completedTasks}
                  </span>
                )}
                {project.inProgressTasks > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    🔄 进行中 {project.inProgressTasks}
                  </span>
                )}
                {project.pendingTasks > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    ⏳ 待办 {project.pendingTasks}
                  </span>
                )}
                {project.overdueTasks > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium animate-pulse">
                    ⚠️ 逾期 {project.overdueTasks}
                  </span>
                )}
              </div>
            )}

            {/* 项目状态和操作提示 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {project.totalTasks === 0 ? '项目状态:' : '项目健康度:'}
                </span>
                <div className="flex items-center gap-1">
                  {project.totalTasks === 0 ? (
                    <span className="text-xs text-gray-600 font-medium">📝 等待添加任务</span>
                  ) : project.overdueTasks > 0 ? (
                    <span className="text-xs text-red-600 font-medium">⚠️ 需要关注</span>
                  ) : project.completionRate === 100 ? (
                    <span className="text-xs text-green-600 font-medium">✅ 已完成</span>
                  ) : project.completionRate >= 80 ? (
                    <span className="text-xs text-blue-600 font-medium">🎯 进展良好</span>
                  ) : project.completionRate >= 50 ? (
                    <span className="text-xs text-yellow-600 font-medium">⏳ 进行中</span>
                  ) : (
                    <span className="text-xs text-gray-600 font-medium">🚀 刚开始</span>
                  )}
                </div>
              </div>
              {project.totalTasks > 0 ? (
                <div className="text-xs text-gray-400">
                  效率: {((project.completedTasks / project.totalTasks) * 100).toFixed(0)}%
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTaskStatsChart;