// 农历和节假日工具函数 - 使用专业API（优化版）
import { getLunarInfo as getApiLunarInfo, getCombinedHolidayInfo } from '../services/calendarService';
import { getMonthDays } from './calendarUtils';

// 兼容原有接口 - 扩展版本
export interface Holiday {
  name: string;
  type: 'holiday' | 'workday' | 'festival'; // 恢复三种类型
  color: string;
}

export interface DateInfo {
  lunar: string | null;
  holiday: Holiday | null;
  solarTerm: string | null;
  isWeekend: boolean;
  isWorkday: boolean;
}

// 缓存，避免重复API调用
const holidayCache = new Map<string, Holiday | null>();
const lunarCache = new Map<string, string>();

// 缓存过期时间（1小时）
const CACHE_EXPIRE_TIME = 60 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

// 清除缓存的函数（用于调试）
export const clearCache = () => {
  holidayCache.clear();
  lunarCache.clear();
  cacheTimestamps.clear();
};

// 检查缓存是否过期
const isCacheExpired = (key: string): boolean => {
  const timestamp = cacheTimestamps.get(key);
  if (!timestamp) return true;
  return Date.now() - timestamp > CACHE_EXPIRE_TIME;
};

// 设置缓存时间戳
const setCacheTimestamp = (key: string) => {
  cacheTimestamps.set(key, Date.now());
};

// 获取农历信息（同步版本，直接使用API）
export const getLunarInfo = (date: Date): string | null => {
  const dateKey = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  
  // 检查缓存
  if (lunarCache.has(dateKey) && !isCacheExpired(`lunar_${dateKey}`)) {
    return lunarCache.get(dateKey) || null;
  }
  
  try {
    // 直接调用API获取农历信息
    const lunarInfo = getApiLunarInfo(date);
    const result = lunarInfo.lunar;
    
    // 缓存结果
    lunarCache.set(dateKey, result);
    setCacheTimestamp(`lunar_${dateKey}`);
    return result;
  } catch (error) {
    console.warn('获取农历信息失败:', error);
    // 使用简单的降级方案
    const simpleResult = getSimpleLunar(date);
    lunarCache.set(dateKey, simpleResult);
    setCacheTimestamp(`lunar_${dateKey}`);
    return simpleResult;
  }
};

// 简单的农历计算（降级方案）
const getSimpleLunar = (date: Date): string => {
  const lunarDays = [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ];
  
  // 基于2025年春节（1月29日）的简单推算
  const springFestival2025 = new Date('2025-01-29');
  const diffDays = Math.floor((date.getTime() - springFestival2025.getTime()) / (1000 * 60 * 60 * 24));
  
  // 简单的节气判断
  const dateStr = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  if (dateStr === '2025-12-21') return '冬至';
  if (dateStr === '2025-12-07') return '大雪';
  
  if (Math.abs(diffDays) < 365) {
    const dayIndex = ((diffDays % 30) + 30) % 30;
    return lunarDays[dayIndex] || '初一';
  }
  
  return '农历';
};

// 获取节假日信息（异步）- 使用综合API
export const getHolidayInfo = async (date: Date): Promise<Holiday | null> => {
  const dateKey = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  
  // 检查缓存
  if (holidayCache.has(dateKey) && !isCacheExpired(`holiday_${dateKey}`)) {
    return holidayCache.get(dateKey) || null;
  }
  
  try {
    // 使用综合节日API获取信息
    const combinedInfo = await getCombinedHolidayInfo(date);
    
    let holiday: Holiday | null = null;
    if (combinedInfo) {
      holiday = {
        name: combinedInfo.name,
        type: combinedInfo.type,
        color: getHolidayColor(combinedInfo.type)
      };
    }
    
    // 缓存结果
    holidayCache.set(dateKey, holiday);
    setCacheTimestamp(`holiday_${dateKey}`);
    return holiday;
  } catch (error) {
    console.warn('获取节假日信息失败:', error);
    // API失败时不使用任何本地数据
    holidayCache.set(dateKey, null);
    setCacheTimestamp(`holiday_${dateKey}`);
    return null;
  }
};

// 获取节假日颜色
const getHolidayColor = (type: 'holiday' | 'workday' | 'festival'): string => {
  switch (type) {
    case 'holiday':
      return 'text-red-600';
    case 'workday':
      return 'text-orange-600';
    case 'festival':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

// 同步版本的节假日信息获取（用于兼容）
export const getHolidayInfoSync = (date: Date): Holiday | null => {
  const dateKey = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  
  if (holidayCache.has(dateKey) && !isCacheExpired(`holiday_${dateKey}`)) {
    return holidayCache.get(dateKey) || null;
  }
  
  // 如果缓存中没有或已过期，异步加载但不等待
  getHolidayInfo(date).catch(() => {
    // 静默处理错误
  });
  
  return null;
};

// 检查是否为周末
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// 检查是否为工作日
export const isWorkday = (date: Date): boolean => {
  const holiday = getHolidayInfoSync(date);
  
  // 如果是调休工作日，则为工作日
  if (holiday?.type === 'workday') return true;
  
  // 如果是节假日，则不是工作日
  if (holiday?.type === 'holiday') return false;
  
  // 否则按周末判断
  return !isWeekend(date);
};

// 获取日期的完整信息
export const getDateInfo = (date: Date): DateInfo => {
  const lunar = getLunarInfo(date);
  const holiday = getHolidayInfoSync(date);
  
  return {
    lunar,
    holiday: holiday ?? null,
    solarTerm: null, // 节气信息已包含在lunar中
    isWeekend: isWeekend(date),
    isWorkday: isWorkday(date)
  };
};

// 批量预加载月份数据 - 优化版
export const preloadMonthData = async (year: number, month: number): Promise<void> => {
  try {
    // 获取日历实际显示的所有日期（包括跨月显示的日期）
    const displayDates = getMonthDays(year, month);
    
    // 过滤出需要加载的日期（未缓存或已过期的）
    const datesToLoad = displayDates.filter(date => {
      const dateKey = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
      return !holidayCache.has(dateKey) || isCacheExpired(`holiday_${dateKey}`);
    });
    
    if (datesToLoad.length === 0) {
      return; // 所有数据都已缓存且未过期
    }
    
    // 并行预加载节假日信息
    const loadPromises = datesToLoad.map(async (date) => {
      try {
        await getHolidayInfo(date); // 这会自动缓存结果
      } catch (error) {
        // 静默处理单个日期的错误
      }
    });
    
    await Promise.all(loadPromises);
    
    // 预加载农历信息（本地计算，无需API调用）
    displayDates.forEach(date => {
      getLunarInfo(date); // 同步调用，填充农历缓存
    });
  } catch (error) {
    console.warn(`预加载月份数据失败: ${year}年${month + 1}月`, error);
  }
};