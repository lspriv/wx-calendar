import { CalendarHandler } from '../interface/component';
import { View } from './constants';
import type { CalendarData, CalendarPanel } from '../interface/component';
import type { CalendarDay, CalendarMonth, WxCalendarFullYear } from '../interface/calendar';
export declare class PanelTool extends CalendarHandler {
    createMonthPanels(checked: CalendarDay): CalendarPanel[];
    createWeekPanels(checked: CalendarDay): CalendarPanel[];
    createYearPanels(checked: CalendarDay): WxCalendarFullYear[];
    private refreshPanels;
    /**
     * 刷新面板数据
     * @param offset 偏移量，单位月视图下为月，周视图下为周
     * @param checked 要设置的选中日期，不传则由offset计算出偏移后的月份同天或同星期日
     * @param curr 要设置的面板滑块的index，不传则由offset计算得出偏移后的index
     */
    refresh(offset: number, checked?: CalendarDay, current?: number, vibrate?: boolean): Promise<void>;
    refreshView(view: View): Promise<void>;
    refreshOffsets(sets: Partial<CalendarData>, current?: number, checked?: CalendarDay): void;
    refreshOffsets(sets: Partial<CalendarData>, excludes?: number[]): void;
    refreshAnnualPanels(offset: number, curr?: number, nonAnimate?: boolean): Promise<void>;
    /**
     * 创建单个月/周面板
     * @param date
     */
    createPanel(date: CalendarDay, key: number, offset: number, panels?: Array<CalendarPanel>): CalendarPanel;
    createYearPanel(year: number, key: number): WxCalendarFullYear;
    private findWeekPanelIdx;
    toDate(date: string | number | Date | CalendarDay): Promise<void>;
    toWeekAdjoin(checked: CalendarDay, vibrate?: boolean): Promise<void>;
    toAnnualMonth(mon: CalendarMonth): Promise<void>;
    toYear(year: number): Promise<void>;
    getFullYear(idx: number): WxCalendarFullYear;
    update(): Promise<void>;
    private calcWeekOffset;
    static calcPanelOffset(date: CalendarDay, weekstart: number): number;
}
