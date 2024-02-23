/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 插件服务
 * @Author: lspriv
 * @LastEditTime: 2024-02-24 06:23:37
 */
import { nextTick } from './tools';
import { camelToSnake, notEmptyObject } from '../utils/shared';
import {
  monthDiff,
  sameMark,
  sameSchedules,
  getWeekDateIdx,
  mergeAnnualMarks,
  GREGORIAN_MONTH_DAYS
} from '../interface/calendar';

import type { Union, SnakeToLowerCamel, LowerCamelToSnake, Nullable, Voidable } from '../utils/shared';
import type { CalendarData, CalendarEventDetail, CalendarInstance } from '../interface/component';
import type {
  CalendarDay,
  WcMonth,
  WcYear,
  CalendarMark,
  WcScheduleMark,
  WcMark,
  WcAnnualMarks,
  WcScheduleInfo
} from '../interface/calendar';

const PLUGIN_EVENT_HANDLE_PREFIX = 'PLUGIN_ON_';
type PEH_PRE = typeof PLUGIN_EVENT_HANDLE_PREFIX;

type Schedules = Array<WcScheduleMark>;

export type TrackDateResult = {
  [P in CalendarMark['type']]?: P extends 'schedule' ? Schedules : WcMark;
};

export type TrackYearResult = {
  subinfo?: string;
  marks?: WcAnnualMarks;
};

interface PluginEventHandler {
  /**
   * 日历组件onLoad事件触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_LOAD?(service: PluginService, detail: CalendarEventDetail): void;
  /**
   * 日期点击触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_CLICK?(service: PluginService, detail: CalendarEventDetail): void;
  /**
   * 日期变化触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_CHANGE?(service: PluginService, detail: CalendarEventDetail): void;
  /**
   * 视图变化触发
   * @param service PliginService实例
   * @param detail 事件详情数据
   */
  PLUGIN_ON_VIEWCHANGE?(service: PluginService, detail: CalendarEventDetail): void;
  /**
   * 视图变化触发
   * @param service PliginService实例
   */
  PLUGIN_ON_DETACHED?(service: PluginService): void;
}

export interface Plugin extends PluginEventHandler {
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
   * @param id plugin内部id
   */
  PLUGIN_TRACK_SCHEDULE?(id?: string): Nullable<WcScheduleInfo>;
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
  record: TrackDateResult;
}

interface DateResult {
  year: number;
  month: number;
  day: number;
  record: TrackDateResult;
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
  [P in CalendarMark['type']]: Array<PluginMark<P extends 'schedule' ? WcScheduleMark : WcMark>>;
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

export type PluginEventNames = SnakeToLowerCamel<PluginEventName<keyof PluginEventHandler>>;

type PluginEventHandlerName<T extends PluginEventNames> = `${PEH_PRE}${Uppercase<LowerCamelToSnake<T>>}`;

export type ServicePlugins<T> = T extends PluginService<infer R> ? R : never;
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
    const record: TrackDateResult = {};

    this.traversePlugins(plugin => {
      /** 处理日期标记 */
      const result = plugin.PLUGIN_TRACK_DATE?.(date);
      if (result) {
        if (result.corner && (!record || !record.corner)) record.corner = result.corner;
        if (result.festival && (!record || !record.festival)) record.festival = result.festival;
        if (result.schedule?.length) {
          record.schedule = (record.schedule || []).concat(result.schedule);
        }
      }
    });

    return notEmptyObject(record) ? record : null;
  }

  private walkForYear(year: WcYear) {
    const record: TrackYearResult = {};
    this.traversePlugins(plugin => {
      if (record.subinfo && record.marks) return;
      const result = plugin.PLUGIN_TRACK_YEAR?.(year);
      if (result) {
        if (result.subinfo) record.subinfo = result.subinfo;
        if (result.marks?.size) record.marks = mergeAnnualMarks(record.marks, result.marks);
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
          if (record) records.push({ wdx: i, ddx: j, record });
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
            if (record.corner && !sameMark(record.corner, day.corner)) sets[`${_key}.corner`] = record.corner;
            if (record.festival && !sameMark(record.festival, day.mark)) sets[`${_key}.mark`] = record.festival;
            if (record.schedule?.length && !sameSchedules(record.schedule, day.schedules))
              sets[`${_key}.schedules`] = record.schedule;
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
        if (year.result.subinfo) sets[`years[${ydx}].subinfo`] = year.result.subinfo;
        if (year.result.marks?.size) {
          this.component._years_[ydx].marks = mergeAnnualMarks(this.component._years_[ydx].marks, year.result.marks)!;
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
              if (!sameMark(_day.corner, record.corner)) sets[`${key}.corner`] = record.corner;
              if (!sameMark(_day.mark, record.festival)) sets[`${key}.mark`] = record.festival;
              if (!sameSchedules(_day.schedules, record.schedule)) sets[`${key}.schedules`] = record.schedule || [];
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
      const date = dates[i];
      const key = `${date.year}_${date.month}_${date.day}`;
      if (map.has(key)) continue;
      const result = this.walkForDate(date);
      if (result) map.set(key, { year: date.year, month: date.month, day: date.day, record: result });
    }
    await this.component._annual_.interaction();
    return this.setDates([...map.values()]);
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
          if (result.subinfo) sets[`years[${ydx}].subinfo`] = result.subinfo;
          if (result.marks?.size) {
            this.component._years_[ydx].marks = mergeAnnualMarks(this.component._years_[ydx].marks, result.marks)!;
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
    const marks: PluginEntireMarks = { corner: [], festival: [], schedule: [] };

    this.traversePlugins((plugin, key) => {
      const result = plugin.PLUGIN_TRACK_DATE?.(date);
      if (result) {
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
  public dispatchEventHandle<K extends PluginEventNames>(event: K, detail?: any): void {
    const handler: PluginEventHandlerName<K> = `${PLUGIN_EVENT_HANDLE_PREFIX}${
      camelToSnake(event).toUpperCase() as Uppercase<LowerCamelToSnake<K>>
    }`;
    try {
      this.traversePlugins(plugin => {
        plugin[handler]?.call(plugin, this, detail);
      });
    } catch (e) {
      return;
    }
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
   * 遍历插件
   * @param callback 执行
   */
  private traversePlugins(callback: TraverseCallback): void {
    for (let i = this._plugins_.length; i--; ) {
      const plugin = this._plugins_[i];
      callback(plugin.instance, plugin.key);
    }
  }
}
