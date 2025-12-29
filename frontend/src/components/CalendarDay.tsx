import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task } from '../types';
import { isToday, isCurrentMonth } from '../utils/calendarUtils';
import { getDateInfo, getLunarInfo } from '../utils/lunarUtils';
import { getCombinedHolidayInfo } from '../services/calendarService';

// 常量定义
const MIN_HEIGHT = 60;
const HEADER_HEIGHT = 30;
const TASK_HEIGHT = 24;
const TASK_SPACING = 1;
const BASE_TASK_SPACE = 12;
const PADDING_HEIGHT = 8;

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  currentMonth: number;
  maxTaskLayers: number;
  onTaskClick: (task: Task) => void;
  onDayClick: (date: Date) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = React.memo(({
  date,
  currentMonth,
  maxTaskLayers,
  onDayClick
}) => {
  const [dateInfo, setDateInfo] = useState(() => getDateInfo(date));

  // 使用 useMemo 缓存基本计算
  const { isCurrentMonthDay, isTodayDate, dayNumber } = useMemo(() => ({
    isCurrentMonthDay: isCurrentMonth(date, currentMonth),
    isTodayDate: isToday(date),
    dayNumber: date.getDate()
  }), [date, currentMonth]);

  // 优化：使用 useCallback 避免重复创建函数
  const loadDateInfo = useCallback(async () => {
    try {
      const combinedHolidayInfo = await getCombinedHolidayInfo(date);
      
      let holidayInfo = null;
      if (combinedHolidayInfo) {
        holidayInfo = {
          name: combinedHolidayInfo.name,
          type: combinedHolidayInfo.type,
          color: combinedHolidayInfo.type === 'holiday' ? 'text-red-600' : 
                 combinedHolidayInfo.type === 'workday' ? 'text-orange-600' : 'text-green-600'
        };
      }
      
      const lunarInfo = getLunarInfo(date);
      
      setDateInfo(prev => ({
        ...prev,
        holiday: holidayInfo,
        lunar: lunarInfo
      }));
    } catch (error) {
      console.warn('加载日期信息失败:', error);
    }
  }, [date]);

  // 异步加载节假日信息和农历信息
  useEffect(() => {
    let isMounted = true;

    loadDateInfo().then(() => {
      if (!isMounted) {
        setDateInfo(prev => prev); // 防止内存泄漏
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadDateInfo]);

  // 优化点击处理
  const handleDayClick = useCallback(() => {
    onDayClick(date);
  }, [date, onDayClick]);

  // 计算动态高度（优化版本）
  const dynamicHeight = useMemo(() => {
    if (maxTaskLayers === 0) {
      return MIN_HEIGHT;
    }
    
    const taskSpace = BASE_TASK_SPACE + (maxTaskLayers * (TASK_HEIGHT + TASK_SPACING));
    return HEADER_HEIGHT + taskSpace + PADDING_HEIGHT;
  }, [maxTaskLayers]);

  // 计算日期格的样式类（优化版本）
  const dayBackgroundClass = useMemo(() => {
    let baseClass = 'border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col';
    
    if (!isCurrentMonthDay) {
      baseClass += ' bg-gray-100 text-gray-400';
    } else {
      baseClass += ' bg-white';
    }
    
    if (dateInfo.holiday?.type === 'holiday') {
      baseClass += ' bg-red-50';
    } else if (dateInfo.holiday?.type === 'workday') {
      baseClass += ' bg-orange-50';
    }
    
    return baseClass;
  }, [isCurrentMonthDay, dateInfo.holiday?.type]);

  // 计算日期数字样式（优化版本）
  const dateNumberClass = useMemo(() => {
    if (isTodayDate) {
      return 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs';
    }
    return isCurrentMonthDay ? 'text-gray-900' : 'text-gray-400';
  }, [isTodayDate, isCurrentMonthDay]);

  // 计算农历信息样式（优化版本）
  const lunarInfoClass = useMemo(() => {
    const baseClass = 'text-[10px] ';
    
    if (dateInfo.holiday && dateInfo.holiday.type === 'festival') {
      return baseClass + (isCurrentMonthDay ? 'text-green-600 font-medium' : 'text-green-500 font-medium');
    }
    
    return baseClass + (isCurrentMonthDay ? 'text-gray-500' : 'text-gray-400');
  }, [dateInfo.holiday, isCurrentMonthDay]);

  // 计算显示的农历内容（优化版本）
  const lunarContent = useMemo(() => {
    if (dateInfo.holiday && dateInfo.holiday.type === 'festival') {
      return dateInfo.holiday.name;
    }
    return dateInfo.lunar || '';
  }, [dateInfo.holiday, dateInfo.lunar]);

  return (
    <div 
      className={dayBackgroundClass} 
      style={{ height: `${dynamicHeight}px` }}
      onClick={handleDayClick}
    >
      {/* 日期数字和右上角信息 */}
      <div className="flex justify-between items-start mb-2">
        <div className={`text-sm font-medium ${dateNumberClass}`}>
          {dayNumber}
        </div>
        
        {/* 右上角：节假日标识 + 农历信息 */}
        <div className="flex items-center gap-1">
          {/* 法定节假日标识 */}
          {dateInfo.holiday && dateInfo.holiday.type === 'holiday' && (
            <span className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded font-medium">
              休
            </span>
          )}
          
          {/* 调休工作日标识 */}
          {dateInfo.holiday && dateInfo.holiday.type === 'workday' && (
            <span className="text-[10px] bg-orange-600 text-white px-1 py-0.5 rounded font-medium">
              班
            </span>
          )}
          
          {/* 农历信息或传统节日名称 */}
          <div className={lunarInfoClass}>
            {lunarContent}
          </div>
        </div>
      </div>
      
      {/* 任务覆盖层预留空间 */}
      <div className="flex-1"></div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

export default CalendarDay;