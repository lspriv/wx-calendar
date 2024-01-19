/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 工具方法
 * @Author: lspriv
 * @LastEditTime: 2024-01-19 22:21:33
 */

import { WEEKS, VIEWS, CALENDAR_PANELS, View } from './constants';
import { values } from '../utils/shared';

import type { Voidable } from '../utils/shared';
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

export const createPointer = (opts?: Partial<CalendarPointer>) =>
  ({ x: 0, y: 0, show: true, animate: true, transition: true, ...opts }) as CalendarPointer;

export type CalendarView = (typeof VIEWS)[keyof typeof VIEWS];

export const viewFlag = (view: string, defaultView = VIEWS.MONTH): View => {
  const inputView = view.match(/^(\w+)(?:-fixed)?$/)?.[1] || defaultView;
  return Math.max(0, 1 << values(VIEWS).indexOf(inputView as CalendarView));
};

export const isViewFixed = (view: string): boolean => {
  return new RegExp(`^(${Object.values(VIEWS).join('|')})-fixed$`).test(view);
};

export const isView = (view: unknown): view is View =>
  view === View.week || view === View.month || view === View.schedule;

export const flagView = (flag: number) => values(VIEWS)[Math.log2(flag)];

export const middle = (count: number) => Math.floor((count - 1) / 2);

export const isSkyline = (renderer?: string): renderer is 'skyline' => renderer === 'skyline';

export const circularDiff = (idx: number, curr: number): number => {
  const half = Math.floor(CALENDAR_PANELS / 2);
  if (idx < curr - half) idx = idx + CALENDAR_PANELS;
  if (idx > curr + half) idx = idx - CALENDAR_PANELS;
  return idx - curr;
};

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

/**
 * 绑定 worklet动画
 */
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

/**
 * 取消 worklet 动画绑定
 */
export const clearAnimated = (instance: ComponentInstance, selector: string, ids: Array<number>) => {
  return new Promise<void>(resolve => {
    instance.clearAnimatedStyle(selector, ids, () => {
      resolve();
    });
  });
};

/**
 * 获取节点信息
 * @param component 组件实例
 */
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

/**
 * 获取页面偏移
 * @param component 组件实例
 */
export const viewportOffset = (component: ComponentInstance) => {
  return new Promise<WechatMiniprogram.ScrollOffsetCallbackResult>(resolve => {
    component.createSelectorQuery().selectViewport().scrollOffset(resolve).exec();
  });
};

/**
 * 合并字体
 * @param fonts 字体
 */
export const mergeFonts = (...fonts: Array<string>) => {
  return fonts.flatMap(font => font.split(',').map(f => f.trim())).join(',');
};
