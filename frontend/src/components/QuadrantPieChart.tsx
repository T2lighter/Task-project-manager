import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { QuadrantStats } from '../types';

interface QuadrantPieChartProps {
  stats: QuadrantStats;
  onQuadrantClick?: (quadrant: string) => void;
}

const COLORS = {
  urgentImportant: '#DC2626', // red-600
  importantNotUrgent: '#059669', // emerald-600
  urgentNotImportant: '#D97706', // amber-600
  neitherUrgentNorImportant: '#6B7280', // gray-500
};

const QuadrantPieChart: React.FC<QuadrantPieChartProps> = ({ stats, onQuadrantClick }) => {
  const [, setActiveIndex] = React.useState<number | null>(null);
  const total = stats.urgentImportant + stats.importantNotUrgent + stats.urgentNotImportant + stats.neitherUrgentNorImportant;
  
  // 按照用户要求的顺序排列：紧急且重要 → 重要但不紧急 → 紧急但不重要 → 既不紧急也不重要
  const data = [
    { 
      name: '紧急且重要', 
      shortName: '紧急重要',
      value: stats.urgentImportant, 
      color: COLORS.urgentImportant,
      key: 'urgentImportant',
      description: '需要立即处理'
    },
    { 
      name: '重要但不紧急', 
      shortName: '重要不紧急',
      value: stats.importantNotUrgent, 
      color: COLORS.importantNotUrgent,
      key: 'importantNotUrgent',
      description: '计划安排处理'
    },
    { 
      name: '紧急但不重要', 
      shortName: '紧急不重要',
      value: stats.urgentNotImportant, 
      color: COLORS.urgentNotImportant,
      key: 'urgentNotImportant',
      description: '可以委托他人'
    },
    { 
      name: '既不紧急也不重要', 
      shortName: '不紧急不重要',
      value: stats.neitherUrgentNorImportant, 
      color: COLORS.neitherUrgentNorImportant,
      key: 'neitherUrgentNorImportant',
      description: '考虑是否必要'
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
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 h-96 flex flex-col transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-bold text-gray-800">四象限分布</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500 text-lg">暂无四象限数据</p>
            <p className="text-gray-400 text-sm mt-2">为任务设置紧急度和重要性</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100 h-96 flex flex-col transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-800">四象限分布</h3>
        <span className="text-sm text-gray-600">{total} 总任务</span>
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
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">总任务</div>
            </div>
          </div>
        </div>
        
        {/* 右侧图例 */}
        <div className="ml-9 space-y-4 w-32">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return (
              <div 
                key={item.key} 
                className="cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onQuadrantClick && onQuadrantClick(item.key)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`font-semibold text-sm ${
                    item.key === 'urgentImportant' ? 'text-red-600' :
                    item.key === 'importantNotUrgent' ? 'text-emerald-600' :
                    item.key === 'urgentNotImportant' ? 'text-amber-600' :
                    'text-gray-600'
                  }`}>
                    {item.shortName}({item.value})
                  </div>
                  <div className={`text-sm font-semibold ${
                    item.key === 'urgentImportant' ? 'text-red-500' :
                    item.key === 'importantNotUrgent' ? 'text-emerald-500' :
                    item.key === 'urgentNotImportant' ? 'text-amber-500' :
                    'text-gray-500'
                  }`}>
                    {percentage}%
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-0.5">
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

export default QuadrantPieChart;