import { CalendarHandler, CalendarInstance } from '../interface/component';
import { View } from './constants';
export declare class Dragger extends CalendarHandler {
    private _style_ids_;
    private _schdule_selector_?;
    constructor(instance: CalendarInstance);
    private initialize;
    private initailizeShared;
    update(): void;
    private bindPanelAnimation;
    private bindBarAnimation;
    private bindViewBarAnimation;
    bindScheduleAnimation(): Promise<void>;
    private clearScheduleAnimation;
    private calcPanelOffset;
    private setPanelTrans;
    /**
     * 处理拖拽结束
     * @param velocity 拖拽结束时纵向速度
     */
    dragout(velocity: number): Promise<View>;
    toView(view: View, animate?: boolean): Promise<void>;
    clear(): void;
}
