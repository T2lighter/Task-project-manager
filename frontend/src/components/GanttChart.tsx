import React, { useMemo } from 'react';
import { Task } from '../types';
import { format, differenceInDays, startOfDay, endOfDay, addDays } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onTaskClick }) => {
  // 计算甘特图的时间范围和任务数据
  const ganttData = useMemo(() => {
    // 过滤有日期的任务
    const tasksWithDates = tasks.filter(task => task.createdAt && task.dueDate);
    
    if (tasksWithDates.length === 0) {
      return {
        tasks: [],
        startDate: new Date(),
        endDate: new Date(),
        totalDays: 0,
        dateRange: []
      };
    }

    // 找到最早和最晚的日期
    const allDates = tasksWithDates.flatMap(task => [
      new Date(task.createdAt!),
      new Date(task.dueDate!)
    ]);
    
    const minDate = startOfDay(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const maxDate = endOfDay(new Date(Math.max(...allDates.map(d => d.getTime()))));
    
    // 添加一些缓冲天数
    const startDate = addDays(minDate, -2);
    const endDate = addDays(maxDate, 2);
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // 生成日期范围
    const dateRange = Array.from({ length: totalDays }, (_, i) => addDays(startDate, i));

    // 计算每个任务的甘特图数据
    const ganttTasks = tasksWithDates.map(task => {
      const taskStart = startOfDay(new Date(task.createdAt!));
      const taskEnd = startOfDay(new Date(task.dueDate!));
      
      const startOffset = differenceInDays(taskStart, startDate);
      const duration = differenceInDays(taskEnd, taskStart) + 1;
      
      return {
        ...task,
        startOffset: Math.max(0, startOffset),
        duration: Math.max(1, duration),
        progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0
      };
    });

    return {
      tasks: ganttTasks,
      startDate,
      endDate,
      totalDays,
      dateRange
    };
  }, [tasks]);

  // 获取任务状态颜色
  const getTaskColor = (task: Task) => {
    if (task.status === 'completed') return 'bg-green-500';
    if (task.status === 'in-progress') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  // 获取优先级边框颜色
  const getPriorityBorder = (task: Task) => {
    if (task.urgency && task.importance) return 'border-red-500 border-2';
    if (task.urgency) return 'border-yellow-500 border-2';
    if (task.importance) return 'border-blue-500 border-2';
    return 'border-gray-300 border';
  };

  // 获取中文星期名称
  const getChineseWeekday = (date: Date) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${weekdays[date.getDay()]}`;
  };

  if (ganttData.tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">项目甘特图</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">暂无甘特图数据</h4>
          <p className="text-gray-600">
            需要任务有创建日期和截止日期才能显示甘特图
          </p>
        </div>
      </div>
    );
  }

  const dayWidth = Math.max(30, Math.min(60, 800 / ganttData.totalDays)); // 动态计算每天的宽度

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">项目甘特图</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* 时间轴头部 */}
          <div className="flex mb-2">
            <div className="w-48 flex-shrink-0"></div> {/* 任务名称列的占位 */}
            <div className="flex">
              {ganttData.dateRange.map((date, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 text-center border-r border-gray-200 px-1"
                  style={{ width: `${dayWidth}px` }}
                >
                  <div className="font-medium">{format(date, 'MM/dd')}</div>
                  <div className="text-gray-400">{getChineseWeekday(date)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 任务行 */}
          <div className="space-y-1">
            {ganttData.tasks.map((task) => (
              <div key={task.id} className="flex items-center">
                {/* 任务名称列 */}
                <div className="w-48 flex-shrink-0 pr-4">
                  <div
                    className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                    onClick={() => onTaskClick?.(task)}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(task.createdAt!), 'MM/dd')} - {format(new Date(task.dueDate!), 'MM/dd')}
                  </div>
                </div>

                {/* 甘特图条 */}
                <div className="flex-1 relative h-8 bg-gray-50 border border-gray-200 rounded">
                  <div
                    className={`absolute top-0 h-full rounded ${getTaskColor(task)} ${getPriorityBorder(task)} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                    style={{
                      left: `${(task.startOffset / ganttData.totalDays) * 100}%`,
                      width: `${(task.duration / ganttData.totalDays) * 100}%`,
                      minWidth: '20px'
                    }}
                    onClick={() => onTaskClick?.(task)}
                    title={`${task.title} (${task.duration}天)`}
                  >
                    {/* 进度条 */}
                    {task.progress > 0 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                    )}
                    
                    {/* 任务文本 */}
                    <span className="text-white text-xs font-medium px-1 truncate">
                      {task.duration > 3 ? task.title : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 图例 */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>待办</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>进行中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>已完成</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
              <span>紧急重要</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
              <span>紧急</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
              <span>重要</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;