import type { Nullable, Voidable } from '../utils/shared';
import type { CalendarInstance } from '../interface/component';
import type { CalendarDay, WxCalendarMonth, WxCalendarYear, CalendarMark, CalendarDateSchedule, CalendarDateMark, WxCalendarYearMarks } from '../interface/calendar';
type Schedules = Array<CalendarDateSchedule>;
export type TrackDateResult = {
    [P in CalendarMark['type']]?: P extends 'schedule' ? Schedules : CalendarDateMark;
} & {
    plugin?: Record<string, any>;
};
export type TrackYearResult = {
    subinfo?: string;
    marks?: WxCalendarYearMarks;
};
export interface Plugin {
    pluginData?(date: CalendarDay): any;
    trackDate?(date: CalendarDay): Nullable<TrackDateResult>;
    trackYear?(year: WxCalendarYear): Nullable<TrackYearResult>;
}
export interface PluginConstructor {
    new (options?: Record<string, any>, component?: CalendarInstance): Plugin;
    KEY: string;
    VERSION?: string;
    REQUIER_VERSION?: string;
}
type ConstructorUse<T extends Array<PluginConstructor>> = T extends Array<infer R> ? R : never;
export interface PluginUse<T extends Array<PluginConstructor> = Array<PluginConstructor>> {
    construct: ConstructorUse<T>;
    options?: Record<string, any>;
}
export type PluginKey<T> = T extends PluginConstructor ? T['KEY'] : never;
export type PluginKeys<T extends Array<PluginConstructor>> = T extends [
    infer R,
    ...infer P extends Array<PluginConstructor>
] ? PluginKey<R> | PluginKeys<P> : never;
type Union<T> = T extends [infer R, ...infer P] ? R | Union<P> : never;
type PluginInstance<T> = T extends abstract new (...args: any) => any ? InstanceType<T> : Plugin;
export type PulginMap<T extends Array<PluginConstructor>> = {
    [P in Union<T> as PluginKey<P>]: PluginInstance<P>;
};
export declare class PluginService<T extends Array<PluginConstructor>> {
    private _component_;
    private _services_;
    constructor(component: CalendarInstance, services: Array<PluginUse<T>>);
    private walkForDate;
    private walkForYear;
    catchMonth(month: WxCalendarMonth): Promise<void>;
    catchYear(year: WxCalendarYear): Promise<void>;
    private setMonth;
    private setYear;
    private setDates;
    updateDates(dates?: Array<CalendarDay>): Promise<void>;
    getPlugin<K extends PluginKeys<T>>(key: K): Voidable<PulginMap<T>[K]>;
}
export {};
