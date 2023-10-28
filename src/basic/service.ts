/*
 * @Description: 插件
 * @Author: lishen
 * @LastEditTime: 2023-10-26 23:17:43
 */
import { nextTick } from './tools';
import { notEmptyObject } from '../utils/shared';
import { monthDiff, sameMark, sameSchedules, getWeekDateIdx, GREGORIAN_MONTH_DAYS } from '../interface/calendar';

import type { Nullable, Voidable } from '../utils/shared';
import type { CalendarData, CalendarInstance } from '../interface/component';
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

export interface Plugin {
  pluginData?(date: CalendarDay): any;
  trackDate?(date: CalendarDay): Nullable<TrackDateResult>;
  trackYear?(year: WxCalendarYear): Nullable<TrackYearResult>;
}

export interface PluginConstructor {
  new (options?: Record<string, any>, component?: CalendarInstance): Plugin;
  KEY: string;
  VERSION?: string;
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

export class PluginService<T extends Array<PluginConstructor>> {
  private _component_: CalendarInstance;
  private _services_: Array<RegistPlugin> = [];

  constructor(component: CalendarInstance, services: Array<PluginUse<T>>) {
    this._component_ = component;
    this._services_ = (services || [])
      .filter(service => service.construct.KEY)
      .map(service => ({
        key: service.construct.KEY,
        instance: new service.construct(service.options, component)
      }));
  }

  private walkForDate(date: CalendarDay) {
    const record: TrackDateResult = {};

    for (let i = this._services_.length; i--; ) {
      const service = this._services_[i];
      const result = service.instance.trackDate?.(date);
      if (result) {
        if (result.corner && (!record || !record.corner)) record.corner = result.corner;
        if (result.festival && (!record || !record.festival)) record.festival = result.festival;
        if (result.schedule?.length) {
          record.schedule = (record.schedule || []).concat(result.schedule);
        }
      }
      if (service.instance.pluginData) {
        const pluginRes = service.instance.pluginData(date);
        if (pluginRes) {
          record.plugin = record.plugin || {};
          record.plugin[service.key] = pluginRes;
        }
      }
    }
    return notEmptyObject(record) ? record : null;
  }

  private walkForYear(year: WxCalendarYear) {
    const record: TrackYearResult = {};
    for (let i = this._services_.length; i--; ) {
      if (record.subinfo && record.marks) break;
      const service = this._services_[i];
      const result = service.instance.trackYear?.(year);
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
    await this._component_._annual_.interaction();
    this.setMonth({ year: month.year, month: month.month, days: records });
  }

  public async catchYear(year: WxCalendarYear) {
    const result = await nextTick(() => this.walkForYear(year));
    if (result) this.setYear({ year: year.year, result });
  }

  private setMonth(month: MonthResult) {
    nextTick(() => {
      const panels = this._component_.data.panels;
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
      notEmptyObject(sets) && this._component_.setData(sets);
    });
  }

  private setYear(year: YearResult) {
    nextTick(() => {
      const years = this._component_.data.years;
      const sets: Partial<CalendarData> = {};
      const ydx = years.findIndex(y => y.year === year.year);
      if (ydx >= 0) {
        if (year.result.subinfo) sets[`years[${ydx}].subinfo`] = year.result.subinfo;
        if (year.result.marks) {
          this._component_._years_[ydx].marks = year.result.marks;
          this._component_._printer_.update([ydx]);
        }
      }
      notEmptyObject(sets) && this._component_.setData(sets);
    });
  }

  private setDates(dates: Array<DateResult>) {
    return nextTick(() => {
      const panels = this._component_.data.panels;
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
      notEmptyObject(sets) && this._component_.setData(sets);
    });
  }

  public async updateDates(dates?: Array<CalendarDay>) {
    const panels = this._component_.data.panels;
    dates = dates || panels.flatMap(panel => panel.weeks.flatMap(week => week.days));

    const map = new Map<string, DateResult>();

    for (let i = dates.length; i--; ) {
      const date = dates[i];
      const key = `${date.year}_${date.month}_${date.day}`;
      if (map.has(key)) continue;
      const result = this.walkForDate(date);
      if (result) map.set(key, { year: date.year, month: date.month, day: date.day, record: result });
    }
    await this._component_._annual_.interaction();
    return this.setDates([...map.values()]);
  }

  public getPlugin<K extends PluginKeys<T>>(key: K): Voidable<PulginMap<T>[K]> {
    const service = this._services_.find(s => s.key === key);
    return service?.instance as Voidable<PulginMap<T>[K]>;
  }
}
