import { CalendarHandler } from '../interface/component';
import type { CalendarDay, WxCalendarMonth } from '../interface/calendar';
import type { CalendarData } from '../interface/component';
import type { Voidable } from '../utils/shared';
interface PointerLocation {
    x: string | number;
    y: string | number;
}
interface PointerIndexLocation {
    ddx: number;
    wdx: number;
    len: number;
}
/**
 * 这个最开始是分skyline和webview渲染的，
 * skyline用worklet动画控制，webview用wxs事件changeprop控制，这样最好不过了
 * 后为了方便，skyline和webview又同时有效，就用了一套控制
 * TODO: skyline和worklet分开?
 */
export declare class Pointer extends CalendarHandler {
    private _vibrate_;
    update(sets: Voidable<Partial<CalendarData>>, vibrate?: boolean, checked?: CalendarDay, flush?: boolean): void;
    animationEnd(): void;
    static calcCurrIdx(mon: WxCalendarMonth, checked: CalendarDay): PointerIndexLocation;
    static calcPosition(mon: WxCalendarMonth, checked: CalendarDay, centres: number[]): PointerLocation;
}
export {};
