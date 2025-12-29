import React from 'react';
import { ProjectStats } from '../types';

interface ProjectStatsCardProps {
  stats: ProjectStats;
  onProjectsClick?: () => void;
}

const ProjectStatsCard: React.FC<ProjectStatsCardProps> = ({ stats, onProjectsClick }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: '🚀', text: '进行中' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: '已完成' };
      case 'planning':
        return { color: 'bg-gray-100 text-gray-800', icon: '📋', text: '规划中' };
      case 'on-hold':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏸️', text: '暂停' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: '❌', text: '已取消' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '📁', text: '未知' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">项目概览</h3>
        {onProjectsClick && (
          <button
            onClick={onProjectsClick}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 →
          </button>
        )}
      </div>

      {/* 总体统计 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">总项目数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {(stats.completionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">完成率</div>
        </div>
      </div>

      {/* 状态分布 */}
      <div className="space-y-3">
        {[
          { key: 'active', value: stats.active },
          { key: 'completed', value: stats.completed },
          { key: 'planning', value: stats.planning },
          { key: 'on-hold', value: stats.onHold },
          { key: 'cancelled', value: stats.cancelled }
        ].filter(item => item.value > 0).map(item => {
          const config = getStatusConfig(item.key);
          return (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${config.color} flex items-center gap-1`}>
                  <span>{config.icon}</span>
                  <span>{config.text}</span>
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          );
        })}
      </div>

      {/* 进度条 */}
      {stats.total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>项目进度</span>
            <span>{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatsCard;