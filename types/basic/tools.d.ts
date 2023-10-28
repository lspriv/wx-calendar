import { VIEWS, View } from './constants';
import type { Voidable, Join } from '../utils/shared';
import type { CalendarWeek } from '../interface/component';
export interface CalendarPointer {
    x: string | number;
    y: string | number;
    show: boolean;
    animate: boolean;
    transition: boolean;
}
export type BoundingClientRects = Array<WechatMiniprogram.BoundingClientRectCallbackResult>;
export type ComponentInstance = WechatMiniprogram.Component.Instance<WechatMiniprogram.Component.DataOption, WechatMiniprogram.Component.PropertyOption, WechatMiniprogram.Component.MethodOption>;
interface PropRegExp<T> extends RegExp {
    readonly __content__: T;
}
export declare const propPattern: <T extends readonly string[]>(words: T) => PropRegExp<`^(${Join<T, "|">})$`>;
export declare const createPointer: (opts?: Partial<CalendarPointer>) => CalendarPointer;
export type CalendarView = (typeof VIEWS)[keyof typeof VIEWS];
export declare const viewFlag: (view: CalendarView) => View;
export declare const isView: (view: unknown) => view is View;
export declare const flagView: (flag: number) => "week" | "month" | "schedule";
export declare const middle: (count: number) => number;
export declare const isSkyline: (renderer?: string) => renderer is "skyline";
export declare const isWebview: (renderer?: string) => renderer is "webview";
export declare const circularDiff: (idx: number, curr: number) => number;
export declare const weighted: (idx: number, curr: number) => number;
export declare const weightedSort: (arr: Array<number>, current: number) => number[];
export declare const InitPanels: <T>(prefix: string, mixin?: Record<string, any>) => T[];
export declare const InitWeeks: (weeks?: string, prefix?: string) => CalendarWeek[];
export declare const nextTick: <T extends Voidable<(...args: any[]) => any> = undefined, R = T extends NonNullable<T> ? Awaited<ReturnType<T>> : void>(callback?: T | undefined) => Promise<R>;
export declare const severalTicks: (times: number) => Promise<void>;
export interface Setter {
    (data: Record<string, any> | SetterCallback): void;
}
export interface SetterCallback {
    (): void;
}
export declare const applyAnimated: (instance: ComponentInstance, selector: string, updater: WechatMiniprogram.Component.AnimatedUpdater, options?: WechatMiniprogram.Component.AnimatedUserConfig) => Promise<number>;
export declare const clearAnimated: (instance: ComponentInstance, selector: string, ids: Array<number>) => Promise<void>;
export declare const nodeRect: (component: ComponentInstance) => (selector: string) => Promise<BoundingClientRects>;
export declare const mergeFonts: (...fonts: Array<string>) => string;
export {};
