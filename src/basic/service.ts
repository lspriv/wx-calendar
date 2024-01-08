/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 插件服务
 * @Author: lspriv
 * @LastEditTime: 2024-01-08 16:18:34
 */
import { nextTick } from './tools';
import { camelToSnake, notEmptyObject } from '../utils/shared';
import { monthDiff, sameMark, sameSchedules, getWeekDateIdx, GREGORIAN_MONTH_DAYS } from '../interface/calendar';

import type { LowerCamelCase, Nullable, SnakeCase, Voidable } from '../utils/shared';
import type { CalendarData, CalendarEventDetail, CalendarInstance } from '../interface/component';
import type {
  CalendarDay,
  WxCalendarMonth,
  WxCalendarYear,
  CalendarMark,
  CalendarDateSchedule,
  CalendarDateMark,
  WxCalendarYearMarks
} from '../interface/calendar';

type Schedules = Array<CalendarDateSchedule>;

export type TrackDateResult = {
  [P in CalendarMark['type']]?: P extends 'schedule' ? Schedules : CalendarDateMark;
} & {
  plugin?: Record<string, any>;
};

export type TrackYearResult = {
  subinfo?: string;
  marks?: WxCalendarYearMarks;
};

interface PluginEventHandlers {
  /**
   * 日历组件onLoad事件触发
   * @param detail 事件详情数据
   * @param service PliginService实例
   */
  PLUGIN_ON_LOAD?(detail: CalendarEventDetail, service: PluginService<PluginConstructor[]>): void;
  /**
   * 日期变化触发
   * @param detail 事件详情数据
   * @param service PliginService实例
   */
  PLUGIN_ON_CHANGE?(detail: CalendarEventDetail, service: PluginService<PluginConstructor[]>): void;
  /**
   * 视图变化触发
   * @param detail 事件详情数据
   * @param service PliginService实例
   */
  PLUGIN_ON_VIEW_CHANGE?(detail: CalendarEventDetail, service: PluginService<PluginConstructor[]>): void;
}

export interface Plugin extends PluginEventHandlers {
  /**
   * PliginService初始化完成
   * @param service PliginService实例
   */
  PLUGIN_INITIALIZE?(service: PluginService<PluginConstructor[]>): void;
  /**
   * 插件绑定到日期数据
   * @param date 待绑定日期
   */
  PLUGIN_DATA?(date: CalendarDay): any;
  /**
   * 捕获日期
   * @param date 日期
   */
  PLUGIN_TRACK_DATE?(date: CalendarDay): Nullable<TrackDateResult>;
  /**
   * 捕获年份
   * @param year 年
   */
  PLUGIN_TRACK_YEAR?(year: WxCalendarYear): Nullable<TrackYearResult>;
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

interface YearResult {
  year: number;
  result: TrackYearResult;
}

type PluginMark<T> = T & { key: string };

export type PluginEntireMarks = {
  [P in CalendarMark['type']]: Array<PluginMark<P extends 'schedule' ? CalendarDateSchedule : CalendarDateMark>>;
};

export type PluginKey<T> = T extends PluginConstructor ? T['KEY'] : never;
export type PluginKeys<T extends Array<PluginConstructor>> = T extends [
  infer R,
  ...infer P extends Array<PluginConstructor>
]
  ? PluginKey<R> | PluginKeys<P>
  : never;

type Union<T> = T extends [infer R, ...infer P] ? R | Union<P> : never;

type PluginInstance<T> = T extends abstract new (...args: any) => any ? InstanceType<T> : Plugin;

export type PulginMap<T extends Array<PluginConstructor>> = {
  [P in Union<T> as PluginKey<P>]: PluginInstance<P>;
};

type PluginEventName<T> = T extends `PLUGIN_ON_${infer R}` ? R : never;

export type PluginEventNames = LowerCamelCase<PluginEventName<keyof PluginEventHandlers>>;

type PluginEventHandlerName<T extends PluginEventNames> = `PLUGIN_ON_${Uppercase<SnakeCase<T>>}`;
export class PluginService<T extends Array<PluginConstructor>> {
  /** 日历组件实例 */
  public component: CalendarInstance;

  /** 插件队列 */
  private _services_: Array<RegistPlugin> = [];

  constructor(component: CalendarInstance, services: Array<PluginUse<T>>) {
    this.component = component;
    this._services_ = (services || []).flatMap(service => {
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
    for (let i = this._services_.length; i--; ) {
      const service = this._services_[i];
      service.instance.PLUGIN_INITIALIZE?.(this);
    }
  }

  private walkForDate(date: CalendarDay) {
    const record: TrackDateResult = {};

    for (let i = this._services_.length; i--; ) {
      const service = this._services_[i];
      const result = service.instance.PLUGIN_TRACK_DATE?.(date);
      if (result) {
        if (result.corner && (!record || !record.corner)) record.corner = result.corner;
        if (result.festival && (!record || !record.festival)) record.festival = result.festival;
        if (result.schedule?.length) {
          record.schedule = (record.schedule || []).concat(result.schedule);
        }
      }
      const pluginRes = service.instance.PLUGIN_DATA?.(date);
      if (pluginRes !== void 0) {
        record.plugin = record.plugin || {};
        record.plugin[service.key] = pluginRes;
      }
    }
    return notEmptyObject(record) ? record : null;
  }

  private walkForYear(year: WxCalendarYear) {
    const record: TrackYearResult = {};
    for (let i = this._services_.length; i--; ) {
      if (record.subinfo && record.marks) break;
      const service = this._services_[i];
      const result = service.instance.PLUGIN_TRACK_YEAR?.(year);
      if (result) {
        if (result.subinfo) record.subinfo = result.subinfo;
        if (result.marks?.size) record.marks = result.marks;
      }
    }
    return notEmptyObject(record) ? record : null;
  }

  public async catchMonth(month: WxCalendarMonth) {
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

  public async catchYear(year: WxCalendarYear) {
    const result = await nextTick(() => this.walkForYear(year));
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
            if (record.plugin) sets[`${_key}.plugin`] = record.plugin;
          }
        }
      }
      notEmptyObject(sets) && this.component.setData(sets);
    });
  }

  private setYear(year: YearResult) {
    nextTick(() => {
      const years = this.component.data.years;
      const sets: Partial<CalendarData> = {};
      const ydx = years.findIndex(y => y.year === year.year);
      if (ydx >= 0) {
        if (year.result.subinfo) sets[`years[${ydx}].subinfo`] = year.result.subinfo;
        if (year.result.marks) {
          this.component._years_[ydx].marks = year.result.marks;
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

              if (_day.plugin || record.plugin) {
                sets[`${key}.plugin`] = record.plugin;
              }
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
   * 获取完整日期标记
   * @param date 日期
   */
  public getEntireMarks(date: CalendarDay): PluginEntireMarks {
    const marks: PluginEntireMarks = { corner: [], festival: [], schedule: [] };

    for (let i = this._services_.length; i--; ) {
      const service = this._services_[i];
      const result = service.instance.PLUGIN_TRACK_DATE?.(date);
      if (result) {
        if (result.corner) marks.corner.push({ ...result.corner, key: service.key });
        if (result.festival) marks.festival.push({ ...result.festival, key: service.key });
        if (result.schedule?.length) {
          marks.schedule.push(...result.schedule.map(schedule => ({ ...schedule, key: service.key })));
        }
      }
    }

    return marks;
  }

  /**
   * 响应事件
   * @param event 事件名
   * @param detail 事件详情数据
   */
  public dispatchEventHandle<K extends PluginEventNames>(event: K, detail: CalendarEventDetail): void {
    const handler: PluginEventHandlerName<K> = `PLUGIN_ON_${
      camelToSnake(event).toUpperCase() as Uppercase<SnakeCase<K>>
    }`;
    try {
      for (let i = this._services_.length; i--; ) {
        const service = this._services_[i];
        service.instance[handler]?.call(service, detail, this.component, this);
      }
    } catch (e) {
      return;
    }
  }

  public getPlugin<K extends PluginKeys<T>>(key: K): Voidable<PulginMap<T>[K]> {
    const service = this._services_.find(s => s.key === key);
    return service?.instance as Voidable<PulginMap<T>[K]>;
  }
}
