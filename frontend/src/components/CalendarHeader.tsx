import React from 'react';
import { getMonthName } from '../utils/calendarUtils';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {year}年 {getMonthName(month)}
        </h1>
        <button
          onClick={onToday}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          今天
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="上个月"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="下个月"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;