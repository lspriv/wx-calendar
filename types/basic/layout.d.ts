import { View } from './constants';
export interface CalendarLayout {
    readonly maxHeight: number;
    readonly mainHeight: number;
    readonly minHeight: number;
    readonly subHeight: number;
    readonly panelHeight: number;
    readonly menuTop: number;
    readonly menuBottom: number;
    readonly windowWidth: number;
    readonly windowHeight: number;
    readonly dragMaxHeight: number;
    readonly safeBottomHeight: number;
}
export type Theme = 'light' | 'dark';
export declare class Layout {
    static layout?: CalendarLayout;
    /** 深浅模式 */
    static theme: Theme;
    /** 小程序规定的屏幕宽度，单位rpx */
    static RatioWidth: number;
    /** 常规状态下（月视图）的日历总高度，单位rpx */
    static CalendarHeight: number;
    /** 顶部operator，week和底部bar组件的总高度，单位rpx */
    static CalendarSubHeight: number;
    /** 日历最大高度下留余高度，单位rpx */
    static CalendarSpareHeight: number;
    static MaxVelocity: number;
    static CriticalVelocity: number;
    static initialize(): void;
    static rpxToPx(rpx: number, windowWidth: number): number;
    static viewHeight(view: View): number | undefined;
}
