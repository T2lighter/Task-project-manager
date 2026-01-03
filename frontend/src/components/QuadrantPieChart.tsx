import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { QuadrantStats } from '../types';

interface QuadrantPieChartProps {
  stats: QuadrantStats;
}

const COLORS = {
  urgentImportant: '#DC2626', // red-600
  importantNotUrgent: '#059669', // emerald-600
  urgentNotImportant: '#D97706', // amber-600
  neitherUrgentNorImportant: '#6B7280', // gray-500
};

const QuadrantPieChart: React.FC<QuadrantPieChartProps> = ({ stats }) => {
  const total = stats.urgentImportant + stats.importantNotUrgent + stats.urgentNotImportant + stats.neitherUrgentNorImportant;
  
  // 按照用户要求的顺序排列：紧急且重要 → 重要但不紧急 → 紧急但不重要 → 既不紧急也不重要
  const data = [
    { 
      name: '紧急且重要', 
      shortName: '紧急重要',
      value: stats.urgentImportant, 
      color: COLORS.urgentImportant,
      key: 'urgentImportant'
    },
    { 
      name: '重要但不紧急', 
      shortName: '不紧急重要',
      value: stats.importantNotUrgent, 
      color: COLORS.importantNotUrgent,
      key: 'importantNotUrgent'
    },
    { 
      name: '紧急但不重要', 
      shortName: '紧急不重要',
      value: stats.urgentNotImportant, 
      color: COLORS.urgentNotImportant,
      key: 'urgentNotImportant'
    },
    { 
      name: '既不紧急也不重要', 
      shortName: '既不紧急也不重要',
      value: stats.neitherUrgentNorImportant, 
      color: COLORS.neitherUrgentNorImportant,
      key: 'neitherUrgentNorImportant'
    },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            数量: {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
        <h3 className="text-base font-semibold text-gray-800 mb-3">四象限分布</h3>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          暂无任务数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
      <h3 className="text-base font-semibold text-gray-800 mb-3">四象限分布</h3>
      <div className="flex-1 flex items-center">
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* 中心显示总数 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">总数</div>
            </div>
          </div>
        </div>
        
        {/* 右侧图例 */}
        <div className="ml-4 space-y-2">
          {data.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return (
              <div key={item.key} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 font-medium text-xs">{item.shortName}</div>
                  <div className="text-gray-500 text-xs">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuadrantPieChart;