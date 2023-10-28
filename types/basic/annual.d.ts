import { CalendarHandler, CalendarInstance } from '../interface/component';
import { CalendarMonth } from '../interface/calendar';
export declare class AnnualPanelSwitch extends CalendarHandler {
    private _top_?;
    private _opacity_?;
    private _calendar_trans_?;
    private _calendar_alpha_?;
    private _style_ids_?;
    private _interactive_callbacks_;
    private _transforming_;
    constructor(instance: CalendarInstance);
    private initialize;
    private initializeContainer;
    private showCalendar;
    private hiddenCalendar;
    private calcCalendarTop;
    switch(show: boolean, mon: CalendarMonth): Promise<void>;
    /**
     * 清理skyline渲染下所需要成员变量
     */
    clearSkyline(): void;
    private execInteractiveCallbacks;
    interaction(): Promise<void>;
}
