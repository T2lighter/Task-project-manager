import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TaskStats } from '../types';

interface TaskStatusPieChartProps {
  stats: TaskStats;
  onStatusClick?: (status: string) => void;
}

const COLORS = {
  completed: '#10B981', // green-500
  inProgress: '#3B82F6', // blue-500
  blocked: '#A855F7', // purple-500
  pending: '#F59E0B', // amber-500
};

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ stats, onStatusClick }) => {
  const [, setActiveIndex] = React.useState<number | null>(null);
  
  const data = [
    { name: '已完成', value: stats.completed, color: COLORS.completed, key: 'completed' },
    { name: '处理中', value: stats.inProgress, color: COLORS.inProgress, key: 'in-progress' },
    { name: '阻塞', value: stats.blocked, color: COLORS.blocked, key: 'blocked' },
    { name: '待办', value: stats.pending, color: COLORS.pending, key: 'pending' },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / stats.total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            数量: {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (stats.total === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 h-80 flex flex-col">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-bold text-gray-800">任务状态分布</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">暂无任务数据</p>
            <p className="text-gray-400 text-sm mt-2">开始创建你的第一个任务吧！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 h-96 flex flex-col transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-800">任务状态分布</h3>
        <span className="text-sm text-gray-600">{stats.total} 总任务</span>
      </div>
      
      <div className="flex-1 flex items-center">
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={600}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="white" 
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* 中心显示总数 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">总任务</div>
            </div>
          </div>
        </div>
        
        {/* 右侧图例 */}
        <div className="ml-6 space-y-6 w-32">
          {data.map((item, index) => {
            const percentage = ((item.value / stats.total) * 100).toFixed(0);
            return (
              <div 
                key={item.key} 
                className="cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onStatusClick && onStatusClick(item.key)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`font-semibold text-sm ${
                    item.key === 'completed' ? 'text-green-600' :
                    item.key === 'in-progress' ? 'text-blue-600' :
                    item.key === 'blocked' ? 'text-purple-600' :
                    item.key === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {item.name}({item.value})
                  </div>
                  <div className={`text-sm font-semibold ${
                    item.key === 'completed' ? 'text-green-500' :
                    item.key === 'in-progress' ? 'text-blue-500' :
                    item.key === 'blocked' ? 'text-purple-500' :
                    item.key === 'pending' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {percentage}%
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-0.5 mt-0.5">
                  <div 
                    className="h-0.5 rounded-full"
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskStatusPieChart;