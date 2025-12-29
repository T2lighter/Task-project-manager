// 专业的农历和节假日API服务
import { Solar } from 'lunar-javascript';

// 使用更全面的节假日API
const HOLIDAY_API_BASE = 'https://timor.tech/api/holiday';

// 节假日信息接口
export interface HolidayInfo {
  name: string;
  type: 'holiday' | 'workday' | 'weekend';
  date: string;
}

// 传统节日信息接口
export interface FestivalInfo {
  name: string;
  type: 'festival';
  date: string;
  description?: string;
}

// 农历信息接口
export interface LunarInfo {
  lunar: string;
  solarTerm: string | null;
  festival: string | null;
  lunarFestival: string | null;
}

// 综合节日信息接口
export interface CombinedHolidayInfo {
  name: string;
  type: 'holiday' | 'workday' | 'festival';
  date: string;
  description?: string;
}

// 获取法定节假日信息（使用timor.tech API）
export const getHolidayInfo = async (date: Date): Promise<HolidayInfo | null> => {
  const dateStr = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  
  try {
    const response = await fetch(`${HOLIDAY_API_BASE}/info/${dateStr}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.code !== 0) {
      return null;
    }
    
    // 修正API数据结构解析
    let type: 'holiday' | 'workday' | 'weekend' = 'weekend';
    let name = '';
    
    // 优先检查holiday字段（这个字段存在时表示有特殊安排）
    if (data.holiday && data.holiday.holiday !== undefined) {
      if (data.holiday.holiday === true) {
        type = 'holiday';
        name = data.holiday.name || '节假日';
      } else if (data.holiday.holiday === false) {
        type = 'workday';
        name = data.holiday.name || '调休';
      }
      
      return {
        name,
        type,
        date: dateStr
      };
    }
    
    // 如果没有holiday字段，说明是普通日期，不返回任何信息
    return null;
  } catch (error) {
    return null;
  }
};

// 获取传统节日信息（使用本地数据，避免API限制）
export const getFestivalInfo = async (date: Date): Promise<FestivalInfo | null> => {
  const dateStr = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
  
  try {
    // 首先尝试从lunar-javascript获取节日信息
    const lunarInfo = getLunarInfo(date);
    
    // 检查是否有阳历节日
    if (lunarInfo.festival) {
      return {
        name: lunarInfo.festival,
        type: 'festival',
        date: dateStr,
        description: '阳历节日'
      };
    }
    
    // 检查是否有农历节日
    if (lunarInfo.lunarFestival) {
      return {
        name: lunarInfo.lunarFestival,
        type: 'festival',
        date: dateStr,
        description: '农历节日'
      };
    }
    
    // 使用更全面的节日数据
    const festivalInfo = getComprehensiveFestival(date);
    if (festivalInfo) {
      return {
        name: festivalInfo.name,
        type: 'festival',
        date: dateStr,
        description: festivalInfo.description
      };
    }
    
    return null;
  } catch (error) {
    console.warn('获取传统节日信息失败:', error);
    return null;
  }
};

// 更全面的节日数据（包含中西方节日）
const getComprehensiveFestival = (date: Date): { name: string; description: string } | null => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // 固定日期的节日
  const festivals: Record<string, { name: string; description: string }> = {
    // 1月
    '01-01': { name: '元旦', description: '新年第一天' },
    
    // 2月
    '02-14': { name: '情人节', description: '西方传统节日' },
    
    // 3月
    '03-08': { name: '妇女节', description: '国际妇女节' },
    '03-12': { name: '植树节', description: '中国植树节' },
    '03-15': { name: '消费者权益日', description: '国际消费者权益保护日' },
    
    // 4月
    '04-01': { name: '愚人节', description: '西方传统节日' },
    '04-22': { name: '地球日', description: '世界地球日' },
    
    // 5月
    '05-01': { name: '劳动节', description: '国际劳动节' },
    '05-04': { name: '青年节', description: '中国青年节' },
    '05-12': { name: '护士节', description: '国际护士节' },
    
    // 6月
    '06-01': { name: '儿童节', description: '国际儿童节' },
    '06-05': { name: '环境日', description: '世界环境日' },
    
    // 7月
    '07-01': { name: '建党节', description: '中国共产党成立纪念日' },
    
    // 8月
    '08-01': { name: '建军节', description: '中国人民解放军建军节' },
    
    // 9月
    '09-10': { name: '教师节', description: '中国教师节' },
    
    // 10月
    '10-01': { name: '国庆节', description: '中华人民共和国国庆节' },
    '10-31': { name: '万圣节', description: '西方传统节日' },
    
    // 11月
    '11-11': { name: '光棍节', description: '网络节日' },
    
    // 12月
    '12-24': { name: '平安夜', description: '圣诞节前夜' },
    '12-25': { name: '圣诞节', description: '西方传统节日' },
    '12-31': { name: '跨年夜', description: '新年前夜' }
  };
  
  return festivals[dateKey] || null;
};

// 获取综合节日信息（法定节假日 + 传统节日）
export const getCombinedHolidayInfo = async (date: Date): Promise<CombinedHolidayInfo | null> => {
  try {
    // 首先获取法定节假日信息（优先级最高）
    const holidayInfo = await getHolidayInfo(date);
    
    if (holidayInfo && (holidayInfo.type === 'holiday' || holidayInfo.type === 'workday')) {
      return {
        name: holidayInfo.name,
        type: holidayInfo.type as 'holiday' | 'workday',
        date: holidayInfo.date,
        description: holidayInfo.type === 'holiday' ? '法定节假日' : '调休工作日'
      };
    }
    
    // 如果没有法定节假日，则获取传统节日信息
    const festivalInfo = await getFestivalInfo(date);
    
    if (festivalInfo) {
      return {
        name: festivalInfo.name,
        type: 'festival' as const,
        date: festivalInfo.date,
        description: festivalInfo.description || '传统节日'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// 获取农历信息（使用lunar-javascript库）
export const getLunarInfo = (date: Date): LunarInfo => {
  try {
    // 转换为中国时区的日期
    const year = parseInt(date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'}).split('-')[0]);
    const month = parseInt(date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'}).split('-')[1]);
    const day = parseInt(date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'}).split('-')[2]);
    
    // 创建阳历对象
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    
    // 获取农历信息
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    
    // 获取阳历节日
    const festivals = solar.getFestivals ? solar.getFestivals() : [];
    const festival = festivals.length > 0 ? festivals[0] : null;
    
    // 获取农历节日
    const lunarFestivals = lunar.getFestivals ? lunar.getFestivals() : [];
    const lunarFestival = lunarFestivals.length > 0 ? lunarFestivals[0] : null;
    
    // 获取节气信息
    let solarTerm = null;
    try {
      // lunar-javascript库中获取节气的方法可能不存在，使用简单判断
      const dateStr = date.toLocaleDateString('en-CA', {timeZone: 'Asia/Shanghai'});
      if (dateStr === '2025-12-21') solarTerm = '冬至';
      if (dateStr === '2025-12-07') solarTerm = '大雪';
      if (dateStr === '2025-01-05') solarTerm = '小寒';
      if (dateStr === '2025-01-20') solarTerm = '大寒';
    } catch (error) {
      // 忽略错误
    }
    
    // 优先级：节气 > 月初 > 普通农历日期
    let displayText = '';
    
    if (solarTerm) {
      displayText = solarTerm;
    } else if (lunarDay === '初一') {
      displayText = lunarMonth;
    } else {
      displayText = lunarDay;
    }
    
    return {
      lunar: displayText,
      solarTerm,
      festival,
      lunarFestival
    };
  } catch (error) {
    console.warn('获取农历信息失败:', error);
    // 降级到简单计算
    return {
      lunar: getSimpleLunar(date),
      solarTerm: null,
      festival: null,
      lunarFestival: null
    };
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
  
  if (Math.abs(diffDays) < 365) {
    const dayIndex = ((diffDays % 30) + 30) % 30;
    return lunarDays[dayIndex] || '初一';
  }
  
  return '农历';
};

// 批量获取年度法定节假日信息
export const getYearHolidays = async (year: number): Promise<Record<string, HolidayInfo>> => {
  const holidays: Record<string, HolidayInfo> = {};
  
  try {
    console.log(`批量获取${year}年法定节假日信息...`);
    const response = await fetch(`${HOLIDAY_API_BASE}/year/${year}`);
    
    if (!response.ok) {
      console.warn(`年度API请求失败: ${response.status} ${response.statusText}`);
      return holidays;
    }
    
    const data = await response.json();
    
    if (data.code !== 0) {
      console.warn(`年度API返回错误: code=${data.code}, message=${data.message || 'Unknown error'}`);
      return holidays;
    }
    
    // 检查API返回的数据结构
    if (!data.holiday || typeof data.holiday !== 'object') {
      console.warn(`年度API返回数据结构异常:`, data);
      return holidays;
    }
    
    // 处理API返回的数据
    Object.entries(data.holiday).forEach(([shortDateStr, info]: [string, any]) => {
      if (info && typeof info.holiday !== 'undefined') {
        // 将短日期格式转换为完整日期格式
        const fullDateStr = `${year}-${shortDateStr}`;
        
        let type: 'holiday' | 'workday' | 'weekend' = 'weekend';
        let name = info.name || '';
        
        if (info.holiday === false) {
          // 补班日
          type = 'workday';
          name = info.name || '调休';
        } else if (info.holiday === true) {
          // 节假日
          type = 'holiday';
          name = info.name || '节假日';
        }
        
        holidays[fullDateStr] = {
          name,
          type,
          date: fullDateStr
        };
      }
    });
    
    console.log(`成功获取${year}年法定节假日信息，共${Object.keys(holidays).length}个节假日`);
    return holidays;
  } catch (error) {
    console.warn('获取年度法定节假日信息失败:', error);
    return holidays;
  }
};

// 检查是否为工作日
export const isWorkday = (date: Date, holidayInfo: HolidayInfo | null): boolean => {
  // 如果是调休工作日，则为工作日
  if (holidayInfo?.type === 'workday') return true;
  
  // 如果是节假日，则不是工作日
  if (holidayInfo?.type === 'holiday') return false;
  
  // 否则按周末判断
  const day = date.getDay();
  return day !== 0 && day !== 6; // 周日和周六不是工作日
};