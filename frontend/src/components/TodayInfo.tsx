import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDateInfo, getHolidayInfo } from '../utils/lunarUtils';
import { getMonthName } from '../utils/calendarUtils';

// 常量定义
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;
const TIMEZONE = 'Asia/Shanghai';

interface TodayData {
  date: string;
  weekday: string;
  lunar: string | null;
  holiday: any;
  isWeekend: boolean;
  currentMonth: string;
  currentYear: number;
}

interface TodayInfoProps {
  currentYear?: number;
  currentMonth?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
}

const TodayInfo: React.FC<TodayInfoProps> = React.memo(({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday
}) => {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);

  // 优化：使用 useCallback 避免重复创建函数
  const loadTodayData = useCallback(async () => {
    try {
      const today = new Date();
      const dateInfo = getDateInfo(today);
      
      // 异步获取节假日信息
      const holidayInfo = await getHolidayInfo(today);
      
      // 格式化日期
      const dateStr = today.toLocaleDateString('zh-CN', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setTodayData({
        date: dateStr,
        weekday: WEEKDAYS[today.getDay()],
        lunar: dateInfo.lunar,
        holiday: holidayInfo,
        isWeekend: dateInfo.isWeekend,
        currentMonth: currentMonth !== undefined ? getMonthName(currentMonth) : getMonthName(today.getMonth()),
        currentYear: currentYear || today.getFullYear()
      });
    } catch (error) {
      console.warn('加载今日信息失败:', error);
      // 降级方案
      const today = new Date();
      const dateInfo = getDateInfo(today);
      const dateStr = today.toLocaleDateString('zh-CN', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setTodayData({
        date: dateStr,
        weekday: WEEKDAYS[today.getDay()],
        lunar: dateInfo.lunar,
        holiday: dateInfo.holiday,
        isWeekend: dateInfo.isWeekend,
        currentMonth: currentMonth !== undefined ? getMonthName(currentMonth) : getMonthName(today.getMonth()),
        currentYear: currentYear || today.getFullYear()
      });
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  // 计算节假日信息样式（优化版本）
  const holidayStyle = useMemo(() => {
    if (!todayData?.holiday) return null;
    
    const baseClass = 'flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ';
    
    switch (todayData.holiday.type) {
      case 'holiday':
        return {
          className: baseClass + 'bg-red-100 text-red-800',
          icon: '🎉'
        };
      case 'workday':
        return {
          className: baseClass + 'bg-orange-100 text-orange-800',
          icon: '💼'
        };
      default:
        return {
          className: baseClass + 'bg-green-100 text-green-800',
          icon: '🎊'
        };
    }
  }, [todayData?.holiday]);

  // 加载状态组件
  if (!todayData || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-3 border border-blue-100">
      {/* 单行布局：所有信息在一行显示 */}
      <div className="flex items-center justify-between">
        {/* 左侧：日期、今天按钮和各种标签 */}
        <div className="flex items-center gap-4">
          {/* 日期 */}
          <div className="text-lg font-semibold text-gray-800">
            {todayData.date}
          </div>
          
          {/* 今天按钮 */}
          {onToday && (
            <button
              onClick={onToday}
              className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              今天
            </button>
          )}
          
          {/* 星期 */}
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
            todayData.isWeekend 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {todayData.weekday}
          </span>
          
          {/* 农历信息 */}
          {todayData.lunar && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 text-amber-800">
              <span className="text-sm">🌙</span>
              <span className="text-sm font-medium">{todayData.lunar}</span>
            </div>
          )}
          
          {/* 节假日信息 */}
          {holidayStyle && (
            <div className={holidayStyle.className}>
              <span className="text-sm">{holidayStyle.icon}</span>
              <span>{todayData.holiday.name}</span>
            </div>
          )}
          
          {/* 工作日/周末标识 */}
          <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
            todayData.isWeekend 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <span className="text-sm">{todayData.isWeekend ? '🏖️' : '💻'}</span>
            <span>{todayData.isWeekend ? '休息日' : '工作日'}</span>
          </div>
        </div>
        
        {/* 右侧：月份导航按钮 */}
        {onPrevMonth && onNextMonth && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="上个月"
              aria-label="上个月"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* 年月显示 */}
            <div className="px-4 py-2 text-lg font-semibold text-gray-800 min-w-[120px] text-center">
              {todayData.currentYear}年{todayData.currentMonth}
            </div>
            
            <button
              onClick={onNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="下个月"
              aria-label="下个月"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

TodayInfo.displayName = 'TodayInfo';

export default TodayInfo;