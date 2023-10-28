import { Nullable } from '../utils/shared';
import type { PluginConstructor, PluginUse, PluginKeys, PulginMap } from '../basic/service';
import type { CalendarInstance } from './component';
import type { Voidable } from '../utils/shared';
export interface CalendarDay {
    year: number;
    month: number;
    day: number;
    week?: number;
    today?: boolean;
}
export interface CalendarMark extends Pick<CalendarDay, 'day' | 'month' | 'year'> {
    type: 'schedule' | 'corner' | 'festival';
    text: string;
    color?: Nullable<string>;
    bgColor?: Nullable<string>;
}
export interface CalendarMonth {
    year: number;
    month: number;
}
export interface PluginMap {
    plugin?: Nullable<Record<string, any>>;
}
export interface CalendarDateMark {
    color?: Nullable<string>;
    text: string;
}
export interface CalendarDateSchedule {
    color?: Nullable<string>;
    bgColor?: Nullable<string>;
    text: string;
    key: string;
}
export interface WxCalendarDay extends Required<CalendarDay>, PluginMap {
    key: string;
    kind: 'last' | 'current' | 'next';
    mark: Nullable<CalendarDateMark>;
    corner: Nullable<CalendarDateMark>;
    schedules: Array<CalendarDateSchedule>;
}
export interface WxCalendarWeek {
    key: string;
    days: Array<WxCalendarDay>;
}
export interface WxCalendarMonth extends Required<CalendarMonth>, PluginMap {
    key: string;
    count: number;
    weeks: Array<WxCalendarWeek>;
}
export interface WxCalendarYMonth {
    key: string;
    year: number;
    month: number;
    weeks: number;
    days: number;
    start: number;
}
export type WxCalendarYearMark = 'rest' | 'work' | (string & {});
export type WxCalendarYearMarks = Map<string, Set<WxCalendarYearMark>>;
export interface WxCalendarYear extends PluginMap {
    key: string;
    year: number;
    subinfo: string;
}
export interface WxCalendarSubYear {
    year: number;
    months: Array<WxCalendarYMonth>;
    marks: WxCalendarYearMarks;
}
export type WxCalendarFullYear = WxCalendarYear & WxCalendarSubYear;
export declare const getAnnualMarkKey: (day: Pick<CalendarDay, 'month' | 'day'>) => string;
/**
 * 获取某个月份的天数
 * @param mon 月份
 */
export declare const getMonthDays: (mon: CalendarMonth) => number;
/**
 * 判断两个日期是否是同一天
 */
export declare const isSameDate: (d1: CalendarDay, d2: CalendarDay) => boolean;
/**
 * 是否今日
 * @param date
 */
export declare const isToday: (date: CalendarDay) => boolean;
export declare function normalDate(fuzzy: string | number | Date | CalendarDay): CalendarDay;
export declare function normalDate(year: number, month: number, day: number): CalendarDay;
/**
 * 计算与指定日期相差几天的日期
 * @param date 指定日期
 * @param offset 差值，单位天
 */
export declare const offsetDate: (date: CalendarDay, offset: number) => CalendarDay;
/**
 * 获取指定某年某月某天的日期，若指定天大于指定月的天数，则返回指定月最后一天
 * @param year 指定年
 * @param month 指定月
 * @param day  指定天
 */
export declare const inMonthDate: (year: number, month: number, day: number) => CalendarDay;
/**
 * 根据指定的周首日对星期重新排序
 * @param weekstart 周首日
 */
export declare const sortWeeks: (weekstart: number) => string;
/**
 * 获取指定日期所在的周
 * @param date 指定日期
 * @param weekstart 周首日
 */
export declare const weekRange: (date: CalendarDay, weekstart?: number) => [start: Date, end: Date];
/**
 * 查找日期
 * @param weeks 月份周数组
 * @param predicate 查找条件
 */
export declare const findInWeeks: (weeks: Array<WxCalendarWeek>, predicate: (value: WxCalendarDay, index: number, obj: WxCalendarDay[]) => boolean) => WxCalendarDay | undefined;
/**
 * 查找日期index
 * @param weeks 月份周数组
 * @param predicate 查找条件
 */
export declare const findDateIndex: (weeks: Array<WxCalendarWeek>, predicate: (value: WxCalendarDay, index: number, obj: WxCalendarDay[]) => boolean) => number;
/**
 * 获取指定日期所在月份的周索引和所在周的日期索引
 * @param date 制定日期
 * @param weeks 所在月份的周数组
 */
export declare const getWeekDateIdx: (date: CalendarDay, weeks: Array<WxCalendarWeek>) => {
    wdx: number;
    ddx: number;
};
/**
 * 计算两个月份相距多少个月（完全不考虑天，纯粹按月计算）
 * @param start 起始月
 * @param end 终止月
 */
export declare const monthDiff: (start: CalendarMonth, end: CalendarMonth) => number;
/**
 * 获取指定日期与今日相距信息和所在周信息
 * @param date 指定日期
 * @param withWeek 周首日
 */
export declare const getDateInfo: (date: CalendarDay, withWeek?: boolean | number) => string;
export declare const sameMark: (m1?: Nullable<CalendarDateMark>, m2?: Nullable<CalendarDateMark>) => boolean;
export declare const sameSchedules: (as1?: Array<CalendarDateSchedule>, as2?: Array<CalendarDateSchedule>) => boolean;
export declare const GREGORIAN_MONTH_DAYS: number[];
export type WxCalendarPlugins<T extends WxCalendar<any>> = T extends WxCalendar<infer R> ? R : never;
export declare class WxCalendar<T extends Array<PluginConstructor> = Array<PluginConstructor>> {
    /** 今天 */
    static today: CalendarDay;
    private static _PLUGINS_;
    private _service_;
    constructor(component: CalendarInstance, services: T | Array<PluginUse<T>>);
    createMonth(mon: CalendarMonth, weekstart?: number): WxCalendarMonth;
    createYear(year: number, weekstart?: number): WxCalendarFullYear;
    getPlugin<K extends PluginKeys<T>>(key: K): Voidable<PulginMap<T>[K]>;
    updateDates(dates?: Array<CalendarDay>): Promise<void>;
    static use(service: PluginConstructor, options?: Record<string, any>): void;
    static use(services: Array<PluginConstructor>): void;
    static clearPlugins(): void;
}
