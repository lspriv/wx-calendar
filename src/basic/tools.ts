/*
 * @Description: Description
 * @Author: lishen
 * @LastEditTime: 2023-10-26 22:43:26
 */

import { WEEKS, VIEWS, CALENDAR_PANELS, View } from './constants';
import { values } from '../utils/shared';

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

export type ComponentInstance = WechatMiniprogram.Component.Instance<
  WechatMiniprogram.Component.DataOption,
  WechatMiniprogram.Component.PropertyOption,
  WechatMiniprogram.Component.MethodOption
>;

interface PropRegExp<T> extends RegExp {
  readonly __content__: T;
}

export const propPattern = <T extends ReadonlyArray<string>>(words: T): PropRegExp<`^(${Join<T, '|'>})$`> =>
  new RegExp(`^(${words.join('|')})$`) as PropRegExp<`^(${Join<T, '|'>})$`>;

export const createPointer = (opts?: Partial<CalendarPointer>) =>
  ({ x: 0, y: 0, show: true, animate: true, transition: true, ...opts }) as CalendarPointer;

export type CalendarView = (typeof VIEWS)[keyof typeof VIEWS];

export const viewFlag = (view: CalendarView): View => Math.max(0, 1 << values(VIEWS).indexOf(view));

export const isView = (view: unknown): view is View =>
  view === View.week || view === View.month || view === View.schedule;

export const flagView = (flag: number) => values(VIEWS)[Math.log2(flag)];

export const middle = (count: number) => Math.floor((count - 1) / 2);

export const isSkyline = (renderer?: string): renderer is 'skyline' => renderer === 'skyline';
export const isWebview = (renderer?: string): renderer is 'webview' => renderer === 'webview';

export const circularDiff = (idx: number, curr: number): number => {
  const half = Math.floor(CALENDAR_PANELS / 2);
  if (idx < curr - half) idx = idx + CALENDAR_PANELS;
  if (idx > curr + half) idx = idx - CALENDAR_PANELS;
  return idx - curr;
};

export const weighted = (idx: number, curr: number): number => Math.abs(circularDiff(idx, curr));

export const weightedSort = (arr: Array<number>, current: number) =>
  arr.sort((a, b) => weighted(a, current) - weighted(b, current));

export const InitPanels = <T>(prefix: string, mixin: Record<string, any> = {}) =>
  Array.from({ length: CALENDAR_PANELS }, (_, i) => ({ key: `${prefix}_${i}`, ...mixin }) as T);

export const InitWeeks = (weeks: string = WEEKS, prefix: string = 'w') =>
  Array.from<unknown, CalendarWeek>({ length: weeks.length }, (_, i) => ({
    key: `${prefix}_${i}`,
    label: weeks[i]
  }));

export const nextTick = <
  T extends Voidable<(...args: any[]) => any> = undefined,
  R = T extends NonNullable<T> ? Awaited<ReturnType<T>> : void
>(
  callback?: T
) => {
  return new Promise<R>(resolve => {
    wx.nextTick(() => {
      resolve(callback?.());
    });
  });
};

export const severalTicks = async (times: number) => {
  while (true) {
    if (!times) break;
    await nextTick();
    times--;
  }
};

export interface Setter {
  (data: Record<string, any> | SetterCallback): void;
}

export interface SetterCallback {
  (): void;
}

export const applyAnimated = (
  instance: ComponentInstance,
  selector: string,
  updater: WechatMiniprogram.Component.AnimatedUpdater,
  options?: WechatMiniprogram.Component.AnimatedUserConfig
) => {
  return new Promise<number>(resolve => {
    instance.applyAnimatedStyle(selector, updater, options, result => {
      resolve(result.styleId);
    });
  });
};

export const clearAnimated = (instance: ComponentInstance, selector: string, ids: Array<number>) => {
  return new Promise<void>(resolve => {
    instance.clearAnimatedStyle(selector, ids, () => {
      resolve();
    });
  });
};

export const nodeRect = (component: ComponentInstance) => {
  const selectorQuery = component.createSelectorQuery().in(component);
  return (selector: string) =>
    new Promise<BoundingClientRects>((resolve, reject) => {
      selectorQuery
        .selectAll(selector)
        .boundingClientRect(results => {
          const rects = results as unknown as BoundingClientRects;
          if (rects.length) resolve(rects);
          else reject(`view not found by selector ${selector}`);
        })
        .exec();
    });
};

export const mergeFonts = (...fonts: Array<string>) => {
  return fonts.flatMap(font => font.split(',').map(f => f.trim())).join(',');
};
