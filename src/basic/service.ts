/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 插件服务
 * @Author: lspriv
 * @LastEditTime: 2024-06-10 05:47:19
 */
import { nextTick, OnceEmiter } from './tools';
import { CALENDAR_PANELS, GREGORIAN_MONTH_DAYS, MS_ONE_DAY } from './constants';
import { camelToSnake, notEmptyObject } from '../utils/shared';
import {
  monthDiff,
  sameMark,
  sameSchedules,
  sameAnnualMarks,
  getWeekDateIdx,
  mergeAnnualMarks,
  styleParse,
  styleStringify,
  timestamp,
  normalDate,
  sameAnnualSubs,
  fillAnnualSubs
} from '../interface/calendar';

import type { Union, SnakeToLowerCamel, LowerCamelToSnake, Nullable, Voidable } from '../utils/shared';
import type { CalendarData, CalendarEventDetail, CalendarInstance } from '../interface/component';
import type {
  CalendarDay,
  WcMonth,
  WcYear,
  MarkDict,
  CalendarMarkTypes,
  DateStyle,
  WcStyleMark,
  WcScheduleMark,
  WcMark,
  WcAnnualMarks,
  WcScheduleInfo,
  WcAnnualSub
} from '../interface/calendar';

const PLUGIN_EVENT_HANDLE_PREFIX = 'PLUGIN_ON_';
const PLUGIN_EVENT_INTERCEPT_PREFIX = 'PLUGIN_CATCH_';
type PEH_PRE = typeof PLUGIN_EVENT_HANDLE_PREFIX;
type PEI_PRE = typeof PLUGIN_EVENT_INTERCEPT_PREFIX;

type Schedules = Array<WcScheduleMark>;

export type TrackDateResult = {
  [P in CalendarMarkTypes]?: MarkDict<P, WcStyleMark, Schedules, WcMark>;
};

type TrackDateRecord = {
  [P in keyof TrackDateResult]: P extends 'style' ? DateStyle : TrackDateResult[P];
};

type WalkDateRecord = {
  [P in keyof TrackDateResult]: P extends 'style' ? string : TrackDateResult[P];
};

export type TrackYearResult = {
  subinfo?: Array<WcAnnualSub>;
  marks?: WcAnnualMarks;
};

export interface EventIntercept {
  (signal?: number): never;
}
interface PluginInterception {
  /**
   * 捕获日期点击动作
   * @param service PliginService实例
   * @param event 事件
   * @param intercept 拦截
   */
  PLUGIN_CATCH_TAP?(
    service: PluginService,
    event: WechatMiniprogram.TouchEvent<{}, { wdx: number; ddx: number }>,
    intercept: EventIntercept
  ): void;
}

interface PluginEventHandler {
  /**
   * 日历组件attche阶段
   * @param service PliginService实例
   * @param sets 视图初次渲染数据
   */
  PLUGIN_ON_ATTACH?(service: PluginService, sets: Partial<CalendarData>): void;
  /**
   * 日历组件onLoad事件触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_LOAD?(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter): void;
  /**
   * 日期点击触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_CLICK?(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter): void;
  /**
   * 日期变化触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_CHANGE?(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter): void;
  /**
   * 视图变化触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_VIEWCHANGE?(service: PluginService, detail: CalendarEventDetail, emiter: OnceEmiter): void;
  /**
   * 视图变化触发
   * @param service PliginService实例
   */
  PLUGIN_ON_DETACHED?(service: PluginService): void;
}

export interface Plugin extends PluginEventHandler, PluginInterception {
  /**
   * PliginService初始化完成
   * @param service PliginService实例
   */
  PLUGIN_INITIALIZE?(service: PluginService): void;
  /**
   * 捕获日期
   * @param date 日期
   */
  PLUGIN_TRACK_DATE?(date: CalendarDay): Nullable<TrackDateResult>;
  /**
   * 捕获年份
   * @param year 年
   */
  PLUGIN_TRACK_YEAR?(year: WcYear): Nullable<TrackYearResult>;
  /**
   * 获取日程数据
   * @param date 日期
   * @param id plugin内部id
   */
  PLUGIN_TRACK_SCHEDULE?(date: CalendarDay, id?: string): Nullable<WcScheduleInfo>;
  /**
   * 对已提供的有效日期进行过滤
   * @param service PliginService实例
   * @param dates 日期数组
   */
  PLUGIN_DATES_FILTER?(service: PluginService, dates: Array<CalendarDay | DateRange>): Array<CalendarDay | DateRange>;
}

export interface PluginConstructor {
  new (options?: Record<string, any>): Plugin;
  /**
   * 插件 key
   */
  KEY: string;
  /**
   * 插件版本
   */
  VERSION?: string;
  /**
   * 日历组件版本
   */
  REQUIER_VERSION?: string;
  /**
   * 原型
   */
  readonly prototype: Plugin;
}

interface TraverseCallback {
  (plugin: Plugin, key: string): void;
}

type ConstructorUse<T extends Array<PluginConstructor>> = T extends Array<infer R> ? R : never;

export interface PluginUse<T extends Array<PluginConstructor> = Array<PluginConstructor>> {
  construct: ConstructorUse<T>;
  options?: Record<string, any>;
}

interface RegistPlugin {
  readonly key: string;
  readonly instance: Plugin;
}

interface WalkResult {
  wdx: number;
  ddx: number;
  record: WalkDateRecord;
}

interface DateResult {
  year: number;
  month: number;
  day: number;
  record: WalkDateRecord;
}

interface MonthResult {
  year: number;
  month: number;
  days: Array<WalkResult>;
}

export interface AnnualResult {
  year: number;
  result: TrackYearResult;
}

type PluginMark<T> = T & { key: string };

export type PluginEntireMarks = {
  [P in CalendarMarkTypes]: Array<PluginMark<MarkDict<P, DateStyle, WcScheduleMark, WcMark>>>;
};

export type PluginKey<T> = T extends PluginConstructor ? T['KEY'] : never;
export type PluginKeys<T extends Array<PluginConstructor>> = T extends [
  infer R,
  ...infer P extends Array<PluginConstructor>
]
  ? PluginKey<R> | PluginKeys<P>
  : never;

type PluginInstance<T> = T extends abstract new (...args: any) => any ? InstanceType<T> : Plugin;

export type ServicePluginMap<T extends Array<PluginConstructor>> = {
  [P in Union<T> as PluginKey<P>]: PluginInstance<P>;
};

type PluginEventName<T> = T extends `${PEH_PRE}${infer R}` ? R : never;
type PluginInterceptName<T> = T extends `${PEI_PRE}${infer R}` ? R : never;

export type PluginEventNames = SnakeToLowerCamel<PluginEventName<keyof PluginEventHandler>>;
export type PluginInterceptNames = SnakeToLowerCamel<PluginInterceptName<keyof PluginInterception>>;

type PluginEventHandlerName<T extends PluginEventNames> = `${PEH_PRE}${Uppercase<LowerCamelToSnake<T>>}`;
type PluginEventInterceptName<T extends PluginInterceptNames> = `${PEI_PRE}${Uppercase<LowerCamelToSnake<T>>}`;

type PluginInterceptDetail<T extends PluginInterceptNames> = Parameters<
  Required<PluginInterception>[PluginEventInterceptName<T>]
>[1];

export type ServicePlugins<T> = T extends PluginService<infer R> ? R : never;

export type DateRange = Array<[start: CalendarDay, end?: CalendarDay]>;

class PluginInterceptError extends Error {
  public code: number;
  constructor(message?: string, code: number = 0) {
    super(message);
    this.code = code;
  }
}

/**
 * 拦截器
 * @param signal 0直接退出循环，1继续循环但不执行默认行为
 */
export const intercept = (signal?: number): never => {
  throw new PluginInterceptError(void 0, signal);
};
export class PluginService<T extends PluginConstructor[] = PluginConstructor[]> {
  /** 日历组件实例 */
  public component: CalendarInstance;

  /** 插件队列 */
  private _plugins_: Array<RegistPlugin> = [];

  constructor(component: CalendarInstance, services: Array<PluginUse<T>>) {
    this.component = component;
    this._plugins_ = (services || []).flatMap(service => {
      return service.construct.KEY
        ? {
            key: service.construct.KEY,
            instance: new service.construct(service.options)
          }
        : [];
    });
    this.initialize();
  }

  private initialize() {
    this.traversePlugins(plugin => {
      plugin.PLUGIN_INITIALIZE?.(this);
    });
  }

  private walkForDate(date: CalendarDay) {
    const record: TrackDateRecord = {};

    this.traversePlugins(plugin => {
      /** 处理日期标记 */
      const result = plugin.PLUGIN_TRACK_DATE?.(date);
      if (result) {
        if (result.corner && !record.corner) record.corner = result.corner;
        if (result.festival && !record.festival) record.festival = result.festival;
        if (result.schedule?.length) {
          record.schedule = (record.schedule || []).concat(result.schedule);
        }
        if (result.style) {
          const style = styleParse(result.style);
          record.style = { ...style, ...record.style };
        }
      }
    });

    return notEmptyObject(record) ? record : null;
  }

  private walkForYear(year: WcYear) {
    const record: TrackYearResult = {};
    this.traversePlugins((plugin, key) => {
      const result = plugin.PLUGIN_TRACK_YEAR?.(year);
      if (result) {
        if (result.subinfo)
          record.subinfo = [...(fillAnnualSubs(key, year.year, result.subinfo) || []), ...(record.subinfo || [])];
        if (result.marks?.size) record.marks = mergeAnnualMarks(result.marks, record.marks);
      }
    });
    return notEmptyObject(record) ? record : null;
  }

  public async catchMonth(month: WcMonth) {
    const records = await nextTick(() => {
      const records: Array<WalkResult> = [];
      for (let i = month.weeks.length; i--; ) {
        const week = month.weeks[i];
        for (let j = week.days.length; j--; ) {
          const date = week.days[j];
          const record = this.walkForDate(date);
          if (record) {
            record.style && (record.style = styleStringify(record.style) as unknown as DateStyle);
            records.push({ wdx: i, ddx: j, record: record as WalkDateRecord });
          }
        }
      }
      return records;
    });
    await this.component._annual_.interaction();
    this.setMonth({ year: month.year, month: month.month, days: records });
  }

  public async catchYear(year: WcYear) {
    const result = await nextTick(() => this.walkForYear(year));
    await this.component._annual_.interaction();
    if (result) this.setYear({ year: year.year, result });
  }

  private setMonth(month: MonthResult) {
    nextTick(() => {
      const panels = this.component.data.panels;
      const sets: Partial<CalendarData> = {};
      for (let k = panels.length; k--; ) {
        const panel = panels[k];
        if (panel.year === month.year && panel.month === month.month) {
          for (let i = month.days.length; i--; ) {
            const { wdx, ddx, record } = month.days[i];
            const day = panels[k].weeks[wdx].days[ddx];
            const _key = `panels[${k}].weeks[${wdx}].days[${ddx}]`;
            if (!sameMark(record.corner, day.corner)) sets[`${_key}.corner`] = record.corner || null;
            if (!sameMark(record.festival, day.mark)) sets[`${_key}.mark`] = record.festival || null;
            if (!sameSchedules(record.schedule, day.schedules)) sets[`${_key}.schedules`] = record.schedule || null;
            if (record.style !== day.style) sets[`${_key}.style`] = record.style || '';
          }
        }
      }
      notEmptyObject(sets) && this.component.setData(sets);
    });
  }

  private setYear(year: AnnualResult) {
    nextTick(() => {
      const years = this.component.data.years;
      const sets: Partial<CalendarData> = {};
      const ydx = years.findIndex(y => y.year === year.year);
      if (ydx >= 0) {
        if (!sameAnnualSubs(year.result.subinfo, years[ydx].subinfo))
          sets[`years[${ydx}].subinfo`] = year.result.subinfo || null;
        if (!sameAnnualMarks(this.component._years_[ydx].marks, year.result.marks)) {
          this.component._years_[ydx].marks = year.result.marks || new Map();
          this.component._printer_.update([ydx]);
        }
      }
      notEmptyObject(sets) && this.component.setData(sets);
    });
  }

  private setDates(dates: Array<DateResult>) {
    return nextTick(() => {
      const panels = this.component.data.panels;
      const sets: Partial<CalendarData> = {};
      for (let i = dates.length; i--; ) {
        const { year, month, day, record } = dates[i];
        for (let j = panels.length; j--; ) {
          const panel = panels[j];
          if (
            (panel.year === year && panel.month === month) ||
            (monthDiff({ year, month }, panel) === -1 && day <= 7) ||
            (monthDiff({ year, month }, panel) === 1 && day >= GREGORIAN_MONTH_DAYS[month - 1] - 7)
          ) {
            const { wdx, ddx } = getWeekDateIdx({ year, month, day }, panel.weeks);
            if (wdx >= 0) {
              const key = `panels[${j}].weeks[${wdx}].days[${ddx}]`;
              const _day = panel.weeks[wdx].days[ddx];
              if (!sameMark(_day.corner, record.corner)) sets[`${key}.corner`] = record.corner || null;
              if (!sameMark(_day.mark, record.festival)) sets[`${key}.mark`] = record.festival || null;
              if (!sameSchedules(_day.schedules, record.schedule)) sets[`${key}.schedules`] = record.schedule || null;
              if (record.style !== _day.style) sets[`${key}.style`] = record.style || '';
            }
          }
        }
      }
      notEmptyObject(sets) && this.component.setData(sets);
    });
  }

  public async updateDates(dates?: Array<CalendarDay>) {
    const panels = this.component.data.panels;
    dates = dates || panels.flatMap(panel => panel.weeks.flatMap(week => week.days));

    const map = new Map<string, DateResult>();

    for (let i = dates.length; i--; ) {
      const date = dates![i];
      this.setUpdateRecord(map, date);
    }

    await this.component._annual_.interaction();
    return this.setDates([...map.values()]);
  }

  /**
   * 范围更新
   */
  public async updateRange(range: DateRange) {
    const panels = this.component.data.panels;
    const current = this.component.data.current;

    const half = Math.floor(CALENDAR_PANELS / 2);
    const pstart = timestamp(panels[(current - half + CALENDAR_PANELS) % CALENDAR_PANELS].weeks[0].days[0]);
    const lastPanel = panels[(current + half) % CALENDAR_PANELS];
    const lastDays = lastPanel.weeks[lastPanel.weeks.length - 1];
    const pend = timestamp(lastDays.days[lastDays.days.length - 1]);

    const map = new Map<string, DateResult>();

    for (let i = 0; i < range.length; i++) {
      const rangeItem = range[i];
      if (!rangeItem.length) continue;
      if (rangeItem.length === 1) {
        this.setUpdateRecord(map, rangeItem[0]);
      } else {
        const rstart = timestamp(rangeItem[0]);
        const rend = timestamp(rangeItem[1]!);

        if (rstart > pend || rend < pstart) continue;

        let st = Math.max(rstart, pstart);
        let ed = Math.min(rend, pend);

        while (st <= ed) {
          const date = normalDate(st);
          this.setUpdateRecord(map, date);
          st += MS_ONE_DAY;
        }
      }
    }

    await this.component._annual_.interaction();
    return this.setDates([...map.values()]);
  }

  private setUpdateRecord(map: Map<string, DateResult>, date: CalendarDay) {
    const key = `${date.year}_${date.month}_${date.day}`;
    if (!map.has(key)) {
      const result = this.walkForDate(date);
      if (result) {
        result.style && (result.style = styleStringify(result.style) as unknown as DateStyle);
        map.set(key, { year: date.year, month: date.month, day: date.day, record: result as WalkDateRecord });
      }
    }
  }

  /**
   * 刷新年度面板
   */
  public async updateAnnuals(annuals?: Array<number>) {
    if (!annuals?.length) return;
    const years = this.component.data.years;
    const sets: Partial<CalendarData> = {};
    const ydxs: number[] = [];
    for (let i = annuals.length; i--; ) {
      const ydx = years.findIndex(y => y.year === annuals[i]);
      if (ydx >= 0) {
        const year = years[ydx];
        const result = this.walkForYear(year);
        if (result) {
          if (!sameAnnualSubs(result.subinfo, year.subinfo)) sets[`years[${ydx}].subinfo`] = result.subinfo || null;
          if (!sameAnnualMarks(this.component._years_[ydx].marks, result.marks)) {
            this.component._years_[ydx].marks = result.marks || new Map();
            ydxs.push(ydx);
          }
        }
      }
    }
    await this.component._annual_.interaction();
    ydxs.length && this.component._printer_.update(ydxs);
    notEmptyObject(sets) && this.component.setData(sets);
  }

  /**
   * 获取完整日期标记
   * @param date 日期
   */
  public getEntireMarks(date: CalendarDay): PluginEntireMarks {
    const marks: PluginEntireMarks = { corner: [], festival: [], schedule: [], style: [] };

    this.traversePlugins((plugin, key) => {
      const result = plugin.PLUGIN_TRACK_DATE?.(date);
      if (result) {
        if (result.style) marks.style.push({ ...styleParse(result.style), key });
        if (result.corner) marks.corner.push({ ...result.corner, key });
        if (result.festival) marks.festival.push({ ...result.festival, key });
        if (result.schedule?.length) {
          marks.schedule.push(...result.schedule.map(schedule => ({ ...schedule, key })));
        }
      }
    });

    return marks;
  }

  /**
   * 响应事件
   * @param event 事件名
   * @param detail 事件详情数据
   */
  public dispatchEvent<K extends PluginEventNames>(event: K, ...detail: any[]) {
    const handler: PluginEventHandlerName<K> = `${PLUGIN_EVENT_HANDLE_PREFIX}${
      camelToSnake(event).toUpperCase() as Uppercase<LowerCamelToSnake<K>>
    }`;
    try {
      for (let i = 0; i < this._plugins_.length; i++) {
        const plugin = this._plugins_[i];
        plugin.instance[handler]?.call(plugin.instance, this, ...detail);
      }
    } catch (e) {
      return;
    }
  }

  /**
   * 事件拦截
   * @param event 事件名
   * @param action 默认行为
   */
  public interceptEvent<K extends PluginInterceptNames>(
    name: K,
    detail: PluginInterceptDetail<K>,
    action?: (...args: any[]) => any
  ) {
    const handler: PluginEventInterceptName<K> = `${PLUGIN_EVENT_INTERCEPT_PREFIX}${
      camelToSnake(name).toUpperCase() as Uppercase<LowerCamelToSnake<K>>
    }`;

    let execAction = true;

    for (let i = this._plugins_.length; i--; ) {
      const plugin = this._plugins_[i].instance;
      try {
        plugin[handler]!.call(plugin, this, detail, intercept);
      } catch (e) {
        if (e instanceof PluginInterceptError) {
          if (!e.code) return;
          execAction = false;
        }
      }
    }

    execAction && action?.();
  }

  /**
   * 获取插件
   * @param key 插件 key
   */
  public getPlugin<K extends PluginKeys<T>>(key: K): Voidable<ServicePluginMap<T>[K]> {
    const service = this._plugins_.find(s => s.key === key);
    return service?.instance as Voidable<ServicePluginMap<T>[K]>;
  }

  /**
   * 倒序遍历插件
   * @param callback 执行
   */
  public traversePlugins(callback: TraverseCallback): void {
    for (let i = this._plugins_.length; i--; ) {
      const plugin = this._plugins_[i];
      callback(plugin.instance, plugin.key);
    }
  }
}
