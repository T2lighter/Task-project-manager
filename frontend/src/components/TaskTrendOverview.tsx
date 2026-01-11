import React, { useState } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfYear, endOfYear, getDay, subDays, addDays, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TimeSeriesData } from '../types';

interface TaskTrendOverviewProps {
  data: TimeSeriesData[];
  period: 'day' | 'week' | 'month';
  selectedDate: Date;
  loading?: boolean; // 新增loading状态
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
  onDateChange: (date: Date) => void;
}

const TaskTrendOverview: React.FC<TaskTrendOverviewProps> = ({
  data,
  period,
  selectedDate,
  loading = false, // 默认为false
  onPeriodChange,
  onDateChange
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(selectedDate); // 用于日历导航的日期

  // 计算选定时间范围内的数据
  const getSelectedPeriodData = () => {
    // 如果没有数据，返回空数组而不是测试数据
    if (data.length === 0) {
      console.log('TaskTrendOverview: 没有年度数据');
      return [];
    }
    
    let filteredData: TimeSeriesData[] = [];
    
    switch (period) {
      case 'day':
        // 当天数据
        const dayKey = format(selectedDate, 'yyyy-MM-dd');
        filteredData = data.filter(item => {
          try {
            const itemDate = parseISO(item.date);
            return format(itemDate, 'yyyy-MM-dd') === dayKey;
          } catch {
            return false;
          }
        });
        break;
        
      case 'week':
        // 本周数据
        const weekStart = startOfWeek(selectedDate, { locale: zhCN });
        const weekEnd = endOfWeek(selectedDate, { locale: zhCN });
        filteredData = data.filter(item => {
          try {
            const itemDate = parseISO(item.date);
            return itemDate >= weekStart && itemDate <= weekEnd;
          } catch {
            return false;
          }
        });
        break;
        
      case 'month':
        // 本月数据
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        filteredData = data.filter(item => {
          try {
            const itemDate = parseISO(item.date);
            return itemDate >= monthStart && itemDate <= monthEnd;
          } catch {
            return false;
          }
        });
        break;
    }
    
    return filteredData;
  };

  const selectedPeriodData = getSelectedPeriodData();
  
  // 计算选定时间范围内的总计数据（任务）
  const totalCreated = selectedPeriodData.reduce((sum, item) => sum + item.created, 0);
  const totalCompleted = selectedPeriodData.reduce((sum, item) => sum + item.completed, 0);
  
  // 计算选定时间范围内的总计数据（子任务）
  const totalSubtaskCreated = selectedPeriodData.reduce((sum, item) => sum + (item.subtaskCreated || 0), 0);
  const totalSubtaskCompleted = selectedPeriodData.reduce((sum, item) => sum + (item.subtaskCompleted || 0), 0);
  
  // 计算总活动数
  const totalAllCreated = totalCreated + totalSubtaskCreated;
  const totalAllCompleted = totalCompleted + totalSubtaskCompleted;

  const periods = [
    { value: 'day' as const, label: '当天', description: '高亮显示选定日期' },
    { value: 'week' as const, label: '本周', description: '高亮显示选定日期所在周' },
    { value: 'month' as const, label: '本月', description: '高亮显示选定日期所在月' },
  ];

  const getPeriodDescription = () => {
    // 计算活跃天数（有任务活动的天数，包括子任务）
    const activeDays = selectedPeriodData.filter(item => 
      item.created > 0 || item.completed > 0 || 
      (item.subtaskCreated || 0) > 0 || (item.subtaskCompleted || 0) > 0
    ).length;
    
    // 构建统计信息
    const taskStats = `创建: ${totalCreated}个任务, ${totalSubtaskCreated}个子任务`;
    const completedStats = `完成: ${totalCompleted}个任务, ${totalSubtaskCompleted}个子任务`;
    const totalStats = `总活动: ${totalAllCreated}个创建, ${totalAllCompleted}个完成`;
    const baseStats = `${taskStats} | ${completedStats} | ${totalStats} | 活跃天数: ${activeDays}`;
    
    switch (period) {
      case 'day':
        return `${format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} - ${baseStats}`;
      case 'week':
        const weekStart = startOfWeek(selectedDate, { locale: zhCN });
        const weekEnd = endOfWeek(selectedDate, { locale: zhCN });
        return `${format(weekStart, 'MM月dd日', { locale: zhCN })} - ${format(weekEnd, 'MM月dd日', { locale: zhCN })} - ${baseStats}`;
      case 'month':
        return `${format(selectedDate, 'yyyy年MM月', { locale: zhCN })} - ${baseStats}`;
      default:
        return baseStats;
    }
  };

  // 获取活动强度（基于创建和完成任务的总和，包括子任务）
  const getActivityIntensity = (created: number, completed: number, subtaskCreated: number, subtaskCompleted: number, maxTotal: number) => {
    const total = created + completed + subtaskCreated + subtaskCompleted;
    if (maxTotal === 0 || total === 0) return 0;
    const ratio = total / maxTotal;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  // 获取颜色类名 - 使用更清晰的emerald色系
  const getColorClass = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-100 border-gray-200 hover:bg-gray-150';
      case 1: return 'bg-emerald-100 border-emerald-200 hover:bg-emerald-150';
      case 2: return 'bg-emerald-200 border-emerald-300 hover:bg-emerald-250';
      case 3: return 'bg-emerald-300 border-emerald-400 hover:bg-emerald-350';
      case 4: return 'bg-emerald-400 border-emerald-500 hover:bg-emerald-450';
      case 5: return 'bg-emerald-500 border-emerald-600 hover:bg-emerald-550';
      default: return 'bg-gray-100 border-gray-200 hover:bg-gray-150';
    }
  };

  // 检查日期是否应该高亮
  const shouldHighlight = (date: Date) => {
    switch (period) {
      case 'day':
        return isSameDay(date, selectedDate);
      case 'week':
        const weekStart = startOfWeek(selectedDate, { locale: zhCN });
        const weekEnd = endOfWeek(selectedDate, { locale: zhCN });
        return date >= weekStart && date <= weekEnd;
      case 'month':
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        return date >= monthStart && date <= monthEnd;
      default:
        return false;
    }
  };

  // 根据选择的时间周期生成网格数据 - 统一显示整年视图
  const generateGridData = () => {
    console.log('TaskTrendOverview: 生成网格数据，接收到的数据长度:', data.length);
    if (data.length > 0) {
      console.log('TaskTrendOverview: 数据样本:', data.slice(0, 3));
    }
    
    // 无论选择什么时间周期，都显示整年数据
    const yearStart = startOfYear(selectedDate);
    const yearEnd = endOfYear(selectedDate);
    const firstDayOfWeek = getDay(yearStart);
    const gridStart = subDays(yearStart, firstDayOfWeek);
    const allDays = eachDayOfInterval({
      start: gridStart,
      end: addDays(yearEnd, 6 - getDay(yearEnd))
    });

    // 使用全年数据，而不是过滤后的数据
    const actualData = data.length > 0 ? data : [];
    
    // 创建日期到数据的映射，提高查找效率
    const dataMap = new Map();
    actualData.forEach(item => {
      try {
        const itemDate = parseISO(item.date);
        const dateKey = format(itemDate, 'yyyy-MM-dd');
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { created: 0, completed: 0, subtaskCreated: 0, subtaskCompleted: 0 });
        }
        const existing = dataMap.get(dateKey);
        existing.created += item.created;
        existing.completed += item.completed;
        existing.subtaskCreated += item.subtaskCreated || 0;
        existing.subtaskCompleted += item.subtaskCompleted || 0;
      } catch (error) {
        console.warn('Invalid date in data:', item.date);
      }
    });

    return allDays.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = dataMap.get(dateKey) || { created: 0, completed: 0, subtaskCreated: 0, subtaskCompleted: 0 };
      const currentYear = selectedDate.getFullYear();

      return {
        date,
        created: dayData.created,
        completed: dayData.completed,
        subtaskCreated: dayData.subtaskCreated || 0,
        subtaskCompleted: dayData.subtaskCompleted || 0,
        dateString: dateKey,
        isCurrentYear: date.getFullYear() === currentYear,
        isInRange: true // 所有显示的日期都在范围内
      };
    });
  };

  const gridData = generateGridData();
  const maxTotal = Math.max(...gridData.map(d => d.created + d.completed + d.subtaskCreated + d.subtaskCompleted));

  // 按周分组数据
  const weekGroups = [];
  for (let i = 0; i < gridData.length; i += 7) {
    weekGroups.push(gridData.slice(i, i + 7));
  }

  // 计算月份标签位置
  const getMonthPositions = () => {
    if (gridData.length === 0) return [];
    
    const positions = [];
    const startYear = gridData[0].date.getFullYear();
    const endYear = gridData[gridData.length - 1].date.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);
        const monthStart = startOfMonth(monthDate);
        
        // 检查这个月是否在显示范围内
        const isInRange = gridData.some(day => 
          day.date.getFullYear() === year && day.date.getMonth() === month
        );
        
        if (isInRange) {
          // 找到这个月第一天在网格中的位置
          const daysSinceGridStart = Math.floor((monthStart.getTime() - gridData[0].date.getTime()) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysSinceGridStart / 7);
          
          if (weekIndex >= 0 && weekIndex < weekGroups.length) {
            positions.push({
              month: month + 1,
              year,
              weekIndex,
              label: `${month + 1}月`
            });
          }
        }
      }
    }
    
    return positions;
  };

  const monthPositions = getMonthPositions();

  // 月份标签和星期标签
  const weekDayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  // 渲染自定义日历
  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 周日开始
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    // 按周分组
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="w-60">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
          <button
            onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="上个月"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-sm font-semibold text-gray-800">
            {format(calendarDate, 'yyyy年MM月', { locale: zhCN })}
          </div>
          
          <button
            onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="下个月"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDayLabels.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="space-y-1 mb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day) => {
                const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      onDateChange(day);
                      setShowDatePicker(false);
                    }}
                    className={`
                      w-7 h-7 text-xs rounded-md transition-all duration-200 flex items-center justify-center
                      ${isCurrentMonth 
                        ? 'text-gray-900 hover:bg-emerald-50' 
                        : 'text-gray-300 hover:bg-gray-50'
                      }
                      ${isSelected 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 font-semibold' 
                        : ''
                      }
                      ${isToday && !isSelected 
                        ? 'bg-emerald-100 text-emerald-700 font-semibold' 
                        : ''
                      }
                    `}
                    title={format(day, 'yyyy年MM月dd日', { locale: zhCN })}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => {
              const today = new Date();
              onDateChange(today);
              setCalendarDate(today);
              setShowDatePicker(false);
            }}
            className="flex-1 px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors"
          >
            今天
          </button>
          <button
            onClick={() => setShowDatePicker(false)}
            className="flex-1 px-2 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* 头部区域 */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">任务活动热力图</h3>
            </div>
            <p className="text-xs text-gray-600 font-medium ml-8">{getPeriodDescription()}</p>
          </div>
          
          {/* 时间周期选择器和日历 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex gap-1">
              {periods.map((periodOption) => (
                <button
                  key={periodOption.value}
                  onClick={() => onPeriodChange(periodOption.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    period === periodOption.value
                      ? 'bg-emerald-500 text-white shadow-sm transform scale-105'
                      : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
                  }`}
                  title={periodOption.description}
                >
                  {periodOption.label}
                </button>
              ))}
            </div>
            
            {/* 日期选择器 */}
            <div className="relative">
              <button
                onClick={() => {
                  setCalendarDate(selectedDate); // 同步日历显示月份到当前选中日期
                  setShowDatePicker(!showDatePicker);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              >
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(selectedDate, 'yyyy-MM-dd', { locale: zhCN })}
              </button>
              
              {showDatePicker && (
                <>
                  {/* 遮罩层，点击关闭日历 */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDatePicker(false)}
                  />
                  {/* 日历弹窗 */}
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3">
                    {renderCalendar()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col p-4">

        {/* GitHub风格的年度热力图 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col relative">
          {/* 加载状态覆盖层 */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                {/* 旋转进度条 */}
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* 加载文字 */}
                <div className="text-sm font-medium text-gray-600">
                  正在更新数据...
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 p-4">
            {/* 月份标签 - 精确对齐 */}
            <div className="flex mb-2 h-4">
              <div className="w-12 flex-shrink-0"></div> {/* 空白区域对应星期标签 */}
              <div className="flex-1 flex relative">
                {weekGroups.map((_, weekIndex) => (
                  <div key={weekIndex} className="flex-1 relative">
                    {monthPositions
                      .filter(pos => pos.weekIndex === weekIndex)
                      .map(pos => (
                        <span 
                          key={pos.month} 
                          className="absolute text-xs font-medium text-gray-700 -top-0.5 left-0 whitespace-nowrap z-10"
                          style={{ fontSize: '10px' }}
                        >
                          {pos.label}
                        </span>
                      ))
                    }
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-1 h-full">
              {/* 星期标签 */}
              <div className="flex flex-col justify-between text-xs font-medium text-gray-600 w-12 pr-2 flex-shrink-0">
                {weekDayLabels.map((day, index) => (
                  <div key={index} className="flex-1 flex items-center" style={{ fontSize: '10px' }}>
                    {index % 2 === 1 && <span className="text-right w-full">{day}</span>}
                  </div>
                ))}
              </div>
              
              {/* 热力图网格 */}
              <div className="flex-1 flex gap-0.5">
                {weekGroups.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex-1 flex flex-col gap-0.5">
                    {week.map((day, dayIndex) => {
                      const intensity = getActivityIntensity(day.created, day.completed, day.subtaskCreated, day.subtaskCompleted, maxTotal);
                      const isHighlighted = shouldHighlight(day.date);
                      const isHovered = hoveredCell === day.dateString;
                      const totalActivity = day.created + day.completed + day.subtaskCreated + day.subtaskCompleted;
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`flex-1 aspect-square rounded-sm border cursor-pointer transition-all duration-200 ${
                            getColorClass(intensity)
                          } ${
                            isHighlighted 
                              ? 'ring-1 ring-emerald-500 ring-offset-0 scale-110 shadow-sm z-20 relative' 
                              : ''
                          } ${
                            isHovered ? 'scale-125 z-30 relative shadow-md' : ''
                          } ${
                            !day.isCurrentYear ? 'opacity-30' : ''
                          } ${
                            !day.isInRange ? 'opacity-15' : ''
                          }`}
                          title={`${format(day.date, 'yyyy年MM月dd日', { locale: zhCN })}\n创建: ${day.created}个任务, ${day.subtaskCreated}个子任务\n完成: ${day.completed}个任务, ${day.subtaskCompleted}个子任务\n总活动: ${totalActivity}个`}
                          onClick={() => onDateChange(day.date)}
                          onMouseEnter={() => setHoveredCell(day.dateString)}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 图例和说明 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">活动强度:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">少</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`w-2.5 h-2.5 rounded-sm border ${getColorClass(level)}`}
                      title={`强度等级 ${level}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">多</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>点击选择日期，颜色深度表示活动强度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTrendOverview;