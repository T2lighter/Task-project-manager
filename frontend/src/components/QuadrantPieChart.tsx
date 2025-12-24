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
      value: stats.urgentImportant, 
      color: COLORS.urgentImportant,
      description: '需要立即处理'
    },
    { 
      name: '重要但不紧急', 
      value: stats.importantNotUrgent, 
      color: COLORS.importantNotUrgent,
      description: '需要规划处理'
    },
    { 
      name: '紧急但不重要', 
      value: stats.urgentNotImportant, 
      color: COLORS.urgentNotImportant,
      description: '可以委托处理'
    },
    { 
      name: '既不紧急也不重要', 
      value: stats.neitherUrgentNorImportant, 
      color: COLORS.neitherUrgentNorImportant,
      description: '可以推迟处理'
    },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">{data.payload.description}</p>
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">四象限分布</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          暂无任务数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">四象限分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuadrantPieChart;