import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TaskStats } from '../types';

interface TaskStatusPieChartProps {
  stats: TaskStats;
}

const COLORS = {
  completed: '#10B981', // green-500
  inProgress: '#3B82F6', // blue-500
  pending: '#F59E0B', // amber-500
  overdue: '#EF4444', // red-500
};

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ stats }) => {
  const data = [
    { name: '已完成', value: stats.completed, color: COLORS.completed },
    { name: '进行中', value: stats.inProgress, color: COLORS.inProgress },
    { name: '待办', value: stats.pending, color: COLORS.pending },
    { name: '逾期', value: stats.overdue, color: COLORS.overdue },
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

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">任务状态分布</h3>
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

export default TaskStatusPieChart;