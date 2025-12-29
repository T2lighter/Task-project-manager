// lunar-javascript 类型声明
declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getTerm(): string | null;
    getFestivals(): string[];
  }
  
  export class Lunar {
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getFestivals(): string[];
  }
}