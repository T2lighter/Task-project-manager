import React from 'react';

interface TaskDurationData {
  taskId: number;
  taskTitle: string;
  startDate: Date | null;
  endDate: Date | null;
  durationDays: number;
  status: string;
  projectName?: string;
}

interface TaskDurationRankingProps {
  data: TaskDurationData[];
  year?: number;
  onTaskClick?: (taskId: number) => void;
}

const TaskDurationRanking: React.FC<TaskDurationRankingProps> = ({ 
  data, 
  year = new Date().getFullYear(),
  onTaskClick 
}) => {
  // 按持续时间排序，取前8个（减少显示数量）
  const sortedData = [...data]
    .filter(task => task.durationDays > 0)
    .sort((a, b) => b.durationDays - a.durationDays)
    .slice(0, 8);

  // 计算统计数据
  const totalTasks = sortedData.length;
  const averageDuration = totalTasks > 0 ? Math.round(sortedData.reduce((sum, task) => sum + task.durationDays, 0) / totalTasks) : 0;
  const maxDuration = totalTasks > 0 ? sortedData[0].durationDays : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完成';
      case 'in-progress':
        return '进行';
      case 'pending':
        return '待办';
      default:
        return '未知';
    }
  };

  const formatDuration = (days: number) => {
    if (days < 1) return '< 1天';
    if (days < 30) return `${days}天`;
    if (days < 365) return `${Math.floor(days / 30)}月`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return years > 0 ? `${years}年${months > 0 ? months + '月' : ''}` : `${months}月`;
  };

  if (sortedData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border border-gray-100 p-4 h-96 flex flex-col transition-all duration-300 hover:shadow-xl">
        <h3 className="text-base font-semibold text-gray-800 mb-3">任务耗时排行</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-2">⏱️</div>
            <p className="text-sm text-gray-600">暂无{year}年任务数据</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border border-gray-100 p-4 h-96 flex flex-col transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">任务耗时排行</h3>
        <div className="text-sm text-gray-600">
          {year}年 • 前{sortedData.length}名
        </div>
      </div>
      
      {/* 任务列表 - 使用flex-1占据剩余空间 */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto">
          {sortedData.map((task, index) => (
            <div 
              key={task.taskId} 
              className={`border rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
                onTaskClick ? 'cursor-pointer hover:bg-gray-50' : ''
              } ${
                index === 0 ? 'border-yellow-200 bg-yellow-50' :
                index === 1 ? 'border-gray-300 bg-gray-50' :
                index === 2 ? 'border-orange-200 bg-orange-50' :
                'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onTaskClick?.(task.taskId)}
            >
              <div className="flex items-center justify-between">
                {/* 左侧：排名和任务信息 */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* 排名徽章 */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-500 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* 任务信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate" title={task.taskTitle}>
                        {task.taskTitle.length > 15 ? task.taskTitle.substring(0, 15) + '...' : task.taskTitle}
                      </h4>
                      {onTaskClick && (
                        <svg className="w-3 h-3 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    
                    {/* 项目信息 */}
                    <div className="text-xs text-gray-500">
                      {task.projectName ? (
                        <span>📁 {task.projectName.length > 12 ? task.projectName.substring(0, 12) + '...' : task.projectName}</span>
                      ) : (
                        <span>📝 无项目</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 右侧：状态和耗时 */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatDuration(task.durationDays)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计摘要 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-sm font-bold text-gray-900">
              {totalTasks}
            </div>
            <div className="text-xs text-gray-600">总任务</div>
          </div>
          <div>
            <div className="text-sm font-bold text-blue-600">
              {formatDuration(averageDuration)}
            </div>
            <div className="text-xs text-gray-600">平均耗时</div>
          </div>
          <div>
            <div className="text-sm font-bold text-green-600">
              {formatDuration(maxDuration)}
            </div>
            <div className="text-xs text-gray-600">最长耗时</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDurationRanking;