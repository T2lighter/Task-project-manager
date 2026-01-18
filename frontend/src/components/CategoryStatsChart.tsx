import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryStats } from '../types';

interface CategoryStatsChartProps {
  data: CategoryStats[];
}

const CategoryStatsChart: React.FC<CategoryStatsChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const categoryData = data.find(item => item.categoryName === label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}个
            </p>
          ))}
          {categoryData && (
            <p className="text-sm text-gray-600 mt-1">
              完成率: {categoryData.completionRate.toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">分类任务统计</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          暂无分类数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">分类任务统计</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="categoryName" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="completed" fill="#10B981" name="已完成" />
          <Bar dataKey="inProgress" fill="#3B82F6" name="处理中" />
          <Bar dataKey="blocked" fill="#A855F7" name="阻塞" />
          <Bar dataKey="pending" fill="#F59E0B" name="待办" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryStatsChart;