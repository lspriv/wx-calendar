import { CalendarHandler } from '../interface/component';
import type { CalendarMonth, WxCalendarFullYear } from '../interface/calendar';
interface CanvasElementSize {
    width: number;
    height: number;
}
interface Canvas extends CanvasElementSize {
    ctx: CanvasRenderingContext2D | null;
    canvas: HTMLCanvasElement | null;
    frame: number;
    state: PrinterState;
    rendered: boolean;
    year?: number;
}
declare enum PrinterState {
    minimize = 1,
    maximize = 2
}
export declare class YearPrinter extends CalendarHandler {
    private _canvas_;
    private _weeks_;
    private _dpr_;
    private _week_size_;
    private _week_height_;
    private _week_padding_y_;
    private _date_size_;
    private _date_height_;
    private _pannel_padding_;
    private _month_padding_;
    private _title_size_;
    private _title_height_;
    private _title_padding_x_;
    private _title_padding_y_;
    private _mark_width_;
    private _mark_height_;
    private _checked_radius_max_;
    private _checked_offset_max_;
    private _translate_x_;
    private _translate_y_;
    private _calendar_top_;
    private _font_;
    private _theme_listener_?;
    initialize(): Promise<void>;
    private initializeSize;
    private initializeCanvas;
    private initializeRender;
    private renderFrame;
    private calcDateOuterHeight;
    private attachChecked;
    private render;
    private renderMonth;
    private renderMonthTitle;
    private renderWeek;
    private renderChecked;
    private renderDates;
    private renderMark;
    private getMark;
    /**
     * 是否周末日
     * @param wdx 周内index
     */
    private isWeekend;
    private requestAnimation;
    private requestAnimationFrame;
    private getCanvas;
    private inintializeTransform;
    private checkInitializeRender;
    renderMinimize(canvas: Canvas, year: WxCalendarFullYear): void;
    open(mon: CalendarMonth, top: number, callback?: () => void): Promise<void>;
    close(mon: CalendarMonth): Promise<void>;
    getTapMonth(ydx: number, x: number, y: number): Promise<CalendarMonth>;
    update(idxs?: number[]): void;
    private bindThemeChange;
    cancelThemeChange(): void;
}
export {};
