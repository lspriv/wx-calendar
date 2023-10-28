import type { Plugin, TrackDateResult, TrackYearResult } from '../basic/service';
import type { CalendarDay, WxCalendarYear } from '../interface/calendar';
export interface LunarDate {
    year?: number;
    month?: number;
    day?: number;
    lunarYear: string;
    lunarMonth: string;
    lunarDay: string;
    solar: string;
}
export declare class LunarPlugin implements Plugin {
    static KEY: "lunar";
    trackDate(date: CalendarDay): TrackDateResult;
    trackYear(year: WxCalendarYear): TrackYearResult;
}
