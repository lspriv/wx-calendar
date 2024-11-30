/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 日期处理
 * @Author: lspriv
 * @LastEditTime: 2024-11-25 22:12:17
 */
import { Layout } from '../basic/layout';
import { WEEKS } from '../basic/constants';
import {
  Nullable,
  isDate,
  isFunction,
  isNumber,
  isString,
  camelToSnake,
  strToStyle,
  compareSame,
  includes
} from '../utils/shared';
import { PluginService } from '../basic/service';
import { MARK_PLUGIN_KEY, MarkPlugin } from '../plugins/mark';

import type { PluginConstructor, PluginKeys, PluginUse, ServicePlugins } from '../basic/service';
import type { CalendarInstance, UsePluginService, ScheduleEventDetail, DEFAULT_PLUGINS } from './component';

export interface CalendarDay {
  year: number;
  month: number;
  day: number;
  week?: number;
  today?: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
}

interface DateMark extends Partial<Pick<CalendarDay, 'day' | 'month' | 'year'>> {
  date?: string | number | Date | CalendarDay;
}

export type DateStyle = Record<string, string | number>;
export interface CalendarMark extends DateMark {
  type: 'schedule' | 'corner' | 'festival' | 'solar';
  text: string;
  style?: string | DateStyle;
}

export interface CalendarStyleMark extends DateMark {
  type: 'style';
  style: string | DateStyle;
}

export type CalendarMarkTypes = CalendarMark['type'] | CalendarStyleMark['type'];

export type WcMark = Pick<CalendarMark, 'text' | 'style'> & {
  key?: string;
};

export type WcScheduleMark = WcMark;

export type WcStyleMark = CalendarStyleMark['style'];

export type MarkDict<T extends CalendarMarkTypes, Style, Schedule, CF> = T extends 'style'
  ? Style
  : T extends 'schedule'
    ? Schedule
    : CF;

export interface WcDate extends Required<CalendarDay> {
  key: string;
  kind: 'last' | 'current' | 'next';
  style: Nullable<string>;
  solar: Nullable<WcMark>;
  mark: Nullable<WcMark>;
  corner: Nullable<WcMark>;
  schedules: Array<WcScheduleMark>;
}

export interface WcWeek {
  key: string;
  days: Array<WcDate>;
}

export interface WcMonth extends Required<CalendarMonth> {
  key: string;
  count: number;
  weeks: Array<WcWeek>;
}

export interface WcAnnualMonth {
  key: string;
  year: number;
  month: number;
  weeks: number;
  days: number;
  start: number;
}

export interface WcDateStyle {
  light: string | number;
  dark: string | number;
}

export type WcAnnualDateStyle = Record<string, WcDateStyle>;
export interface WcAnnualMark {
  rwtype?: 'rest' | 'work';
  sub?: string;
  style?: WcAnnualDateStyle;
}

export type WcAnnualMarks = Map<string, WcAnnualMark>;

export interface WcAnnualSub {
  key?: string;
  color: string;
  text: string;
}

export interface WcYear {
  key: string;
  year: number;
  subinfo?: Array<WcAnnualSub>;
}

export interface WcSubYear {
  year: number;
  months: Array<WcAnnualMonth>;
  marks: WcAnnualMarks;
}

export type WcFullYear = WcYear & WcSubYear;

export type WcMarkDict = {
  [P in CalendarMarkTypes]?: MarkDict<
    P,
    Nullable<CalendarStyleMark>,
    Nullable<Array<CalendarMark>>,
    Nullable<CalendarMark>
  >;
};
export type WcMarkMap = Map<string, WcMarkDict>;

export interface WcScheduleInfo {
  dtStart?: Date;
  dtEnd?: Date;
  origin?: string;
  originKey?: string;
  summary?: string;
  description?: string;
}

export const styleParse = (style: string | DateStyle | null) => {
  if (typeof style === 'string') {
    const trimstr = style.trim();
    if (!trimstr) return {};
    return strToStyle(style);
  }
  return style;
};

export const reorderStyle = (style: string | DateStyle, pick?: Array<string | RegExp>) => {
  if (typeof style === 'string') return styleStringify(styleParse(style), pick);
  return styleStringify(style, pick);
};

export const styleStringify = (style: DateStyle | null, pick?: Array<string | RegExp>) => {
  if (!style) return '';
  let keys = Object.keys(style).map(key => `${camelToSnake(key, '-')}:${style[key]};`);
  if (pick?.length) keys = keys.filter(k => includes(pick, k));
  return keys.sort().join('');
};

export const themeStyle = (style?: WcDateStyle): string | number | undefined => style?.[Layout.theme!] || style?.light;

export const getAnnualMarkKey = (day: Pick<CalendarDay, 'month' | 'day'>) => `${day.month}_${day.day}`;

/**
 * 生成 mark key
 * @param id 插件内部识别id，会整体回传给插件 PLUGIN_MARK_DATA 方法
 * @param pluginKey 插件 KEY
 */
export const getMarkKey = (id: string, pluginKey?: string) => `${pluginKey ? `[[${pluginKey}]]` : ''}${id}`;

const markPluginPattern = /^\[\[(.*?)\]\]/;

export interface WcMarkKeyParse {
  plugin?: string;
  id: string;
}

/**
 * 解析 mark key
 * @param key mark key
 */
export const parseMarkKey = (key?: string): WcMarkKeyParse | undefined => {
  if (!key) return void 0;
  const plugin = key.match(markPluginPattern)?.[1] || void 0;
  const id = key.replace(markPluginPattern, '');
  return { id, plugin };
};

export const getScheduleDetail = (
  date: CalendarDay,
  schedule: WcScheduleMark,
  service: PluginService<DEFAULT_PLUGINS>
): ScheduleEventDetail => {
  const parse = parseMarkKey(schedule.key);
  const plugin = parse?.plugin ? service.getPlugin(parse.plugin as typeof MARK_PLUGIN_KEY) : void 0;
  return {
    text: schedule.text,
    style: schedule.style,
    plugin: parse?.plugin,
    info: plugin?.PLUGIN_TRACK_SCHEDULE?.(date, parse?.id)
  };
};

export const mergeAnnualDateStyle = (s1?: WcAnnualDateStyle, s2?: WcAnnualDateStyle): WcAnnualDateStyle | undefined => {
  if (s1 && s2) {
    const keys = [...new Set([...Object.keys(s1), ...Object.keys(s2)])];
    return keys.reduce((style, key) => {
      style[key] = { ...s1[key], ...s2[key] };
      return style;
    }, {} as WcAnnualDateStyle);
  } else if (s1 || s2) {
    return { ...s1, ...s2 };
  }
};

/**
 * 合并两个年面板标记
 */
export const mergeAnnualMarks = (m1?: WcAnnualMarks, m2?: WcAnnualMarks) => {
  if (!m2) return m1;
  m1 = m1 || new Map();
  const entries = m2.entries();
  for (const [key, mark] of entries) {
    const m = m1.get(key) || ({} as WcAnnualMark);
    mark.rwtype && (m.rwtype = mark.rwtype);
    mark.sub && (m.sub = mark.sub);
    mark.style && (m.style = mergeAnnualDateStyle(m.style, mark.style));
    m1.set(key, m);
  }
  return m1;
};

export const formDateByStrKey = (key: string): CalendarDay => {
  const [year, month, day] = key.split('_');
  return { year: +year, month: +month, day: +day };
};

/**
 * 获取某个月份的天数
 * @param mon 月份
 */
export const getMonthDays = (mon: CalendarMonth) => {
  return new Date(mon.year, mon.month, 0).getDate();
};

/**
 * 是否闰年
 * @param y 年
 */
export const isLeapYear = (y: number) => (y % 100 != 0 && y % 4 === 0) || y % 400 === 0;

/**
 * 创建CalendarDay
 * @param date 日期，可以是模糊的，比如「2024-01-01」可以表示为 { year: 2023, month: 13, day: 1 }
 * @param kind 日期类型 'last' | 'current' | 'next' | 'today'，对应 上个月 ｜ 当前月 ｜ 下个月 ｜ 今天
 */
const createCalendarDay = (date: CalendarDay, kind: WcDate['kind']): WcDate => {
  const { year, month, day, week } = normalDate(date);
  const today = isToday({ year, month, day });
  const key = `${year}_${month}_${day}`;
  return {
    key,
    year,
    month,
    day,
    week: week!,
    kind,
    today,
    style: '',
    mark: null,
    solar: null,
    corner: null,
    schedules: []
  };
};

/**
 * 月份前补日期
 * @param monthFirstDay 月首
 * @param weekstart 周首日
 */
const createMonthLastDays = (monthFirstDay: WcDate, weekstart: number = 0) => {
  const { year, month, week } = monthFirstDay;
  return Array.from({ length: Math.abs(week + 7 - weekstart) % 7 }, (_, i) =>
    createCalendarDay({ year, month, day: -i }, 'last')
  ).reverse();
};

/**
 * 月份后补日期
 * @param monthFinalDay 月末
 * @param weekstart 周首日
 */
const createMonthNextDays = (monthFinalDay: WcDate, weekstart: number = 0) => {
  const { year, month, day, week } = monthFinalDay;
  return Array.from({ length: 6 - (Math.abs(week + 7 - weekstart) % 7) }, (_, i) => {
    const _day = createCalendarDay({ year, month, day: day + i + 1 }, 'next');
    return _day;
  });
};

/**
 * 创建制定月份日期
 * @param mon 月份
 */
const createMonthDays = (mon: CalendarMonth) => {
  return Array.from({ length: getMonthDays(mon) }, (_, i) =>
    createCalendarDay({ year: mon.year, month: mon.month, day: i + 1 }, 'current')
  );
};

/**
 * 月份日期按周分组
 * @param mon 月份
 * @param days 月份日期
 */
const createMonthWeeks = (mon: CalendarMonth, days: Array<WcDate>): Array<WcWeek> => {
  return Array.from({ length: days.length / 7 }, (_, i) => ({
    key: `${mon.year}_${mon.month}_${i}`,
    days: Array.from({ length: 7 }, (_, idx) => days[i * 7 + idx])
  }));
};

/**
 * 判断两个日期是否是同一天
 */
export const isSameDate = (d1: CalendarDay, d2: CalendarDay) => {
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
};

/**
 * 判断两个日期是否同一周
 */
export const isSameWeek = (d1: CalendarDay, d2: CalendarDay, weekstart: number = 0) => {
  const range = weekRange(d1, weekstart);
  const date = +new Date(d2.year, d2.month - 1, d2.day);
  return date >= +range[0] && date <= +range[1];
};

/**
 * 是否今日
 * @param date
 */
export const isToday = (date: CalendarDay) => isSameDate(date, WxCalendar.today || date);

export function normalDate(fuzzy: string | number | Date | CalendarDay): CalendarDay;
export function normalDate(year: number, month: number, day: number): CalendarDay;
export function normalDate(
  fuzzy: string | number | Date | CalendarDay,
  month?: number,
  day?: number
): CalendarDay | null {
  if (!fuzzy) return null;
  const date = isString(fuzzy)
    ? new Date(fuzzy)
    : isNumber(fuzzy)
      ? month !== undefined && day !== undefined
        ? new Date(fuzzy, month - 1, day)
        : new Date(fuzzy)
      : isDate(fuzzy)
        ? fuzzy
        : new Date(fuzzy.year, fuzzy.month - 1, fuzzy.day);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = date.getDay();
  const today = isToday({ year: y, month: m, day: d });
  return { year: y, month: m, day: d, week: w, today };
}

/**
 * 计算与指定日期相差几天的日期
 * @param date 指定日期
 * @param offset 差值，单位天
 */
export const offsetDate = (date: CalendarDay, offset: number) => {
  return normalDate(date.year, date.month, date.day + offset);
};

/**
 * 获取指定某年某月某天的日期，若指定天大于指定月的天数，则返回指定月最后一天
 * @param year 指定年
 * @param month 指定月
 * @param day  指定天
 */
export const inMonthDate = (year: number, month: number, day: number) => {
  return normalDate({ year, month, day: Math.min(day, getMonthDays({ year, month })) });
};

/**
 * 根据指定的周首日对星期重新排序
 * @param weekstart 周首日
 */
export const sortWeeks = (weekstart: number) => {
  return WEEKS.slice(weekstart) + WEEKS.slice(0, weekstart);
};

/**
 * 获取指定日期所在的周
 * @param date 指定日期
 * @param weekstart 周首日
 */
export const weekRange = (date: CalendarDay, weekstart: number = 0): [start: Date, end: Date] => {
  const { year, month, day, week } = normalDate(date);
  const first = new Date(year, month - 1, day - ((week! + 7 - weekstart) % 7));
  const last = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 6);
  return [first, last];
};

/**
 * 查找日期
 * @param weeks 月份周数组
 * @param predicate 查找条件
 */
export const findInWeeks = (
  weeks: Array<WcWeek>,
  predicate: (value: WcDate, index: number, obj: WcDate[]) => boolean
) => {
  return weeks.flatMap(week => week.days).find(predicate);
};

/**
 * 查找日期index
 * @param weeks 月份周数组
 * @param predicate 查找条件
 */
export const findDateIndex = (
  weeks: Array<WcWeek>,
  predicate: (value: WcDate, index: number, obj: WcDate[]) => boolean
) => {
  return weeks.flatMap(week => week.days).findIndex(predicate);
};

/**
 * 获取指定日期所在月份的周索引和所在周的日期索引
 * @param date 制定日期
 * @param weeks 所在月份的周数组
 */
export const getWeekDateIdx = (date: CalendarDay, weeks: Array<WcWeek>): { wdx: number; ddx: number } => {
  let wdx: number = -1;
  let ddx: number = -1;
  for (let i = 0; i < weeks.length; i++) {
    const idx = weeks[i].days.findIndex(({ month, day }) => month === date.month && day === date.day);
    if (idx >= 0) {
      wdx = i;
      ddx = idx;
      break;
    }
  }
  return { wdx, ddx };
};

/**
 * 获取指定日期所在第几周
 * 每年的第一个日历星期有以下等效说法
 * 1. 1月4日所在的星期
 * 2. 本年度第一个至少有4天在同一星期内的星期
 * @param date 指定日期
 */
const weekOrder = (date: CalendarDay, weekstart = 0) => {
  const { year, month, day } = date;
  const curr = new Date(year, month - 1, day);
  /** 以1月4号所在周的周首日作为起始日 */
  const start = new Date(year, 0, 4);
  start.setDate(start.getDate() - ((start.getDay() + 7 - weekstart) % 7));
  // 作为上一年的最后一周
  if (curr < start) return weekOrder({ year, month: 1, day: 0 }, weekstart);
  /** 计算相隔天数 */
  const days = Math.floor((+curr - +start) / 86400000) + 1;
  return Math.ceil(days / 7);
};

/**
 * 计算两个月份相距多少个月（完全不考虑天，纯粹按月计算）
 * @param start 起始月
 * @param end 终止月
 */
export const monthDiff = (start: CalendarMonth, end: CalendarMonth) => {
  const yearDiff = end.year - start.year;
  return yearDiff * 12 + end.month - start.month;
};

/**
 * 创建年度面板的月份
 * @param mon 月份
 * @param weekstart 周首日
 */
const createYearMonth = (mon: CalendarMonth, weekstart: number = 0): WcAnnualMonth => {
  const days = getMonthDays(mon);
  const { year, month } = mon;
  const week = new Date(year, month - 1, 1).getDay();
  const last = Math.abs(week + 7 - weekstart) % 7;
  const weeks = Math.ceil((days + last) / 7);
  return { key: `y_${year}_m_${month}`, year, month, weeks, days: days + last, start: last };
};

/**
 * 获取指定日期与今日相距信息和所在周信息
 * @param date 指定日期
 * @param withWeek 周首日
 */
export const getDateInfo = (date: CalendarDay, weekstart: number, withWeek: boolean | number = false) => {
  const start = new Date(WxCalendar.today.year, WxCalendar.today.month - 1, WxCalendar.today.day);
  const end = new Date(date.year, date.month - 1, date.day);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  const postfix = isToday(date) ? `周${WEEKS[date.week!]}` : `${Math.abs(diff)}天${diff < 0 ? '前' : '后'}`;
  if (withWeek) return `第${weekOrder(date, weekstart)}周 ${postfix}`;
  return postfix;
};

export const sameAnnualMarks = (m1: WcAnnualMarks, m2?: WcAnnualMarks) => {
  if (!m1.size && !m2?.size) return true;
  if (m1.size !== m2?.size) return false;
  const entries = m1.entries();
  for (const [key, mk1] of entries) {
    const mk2 = m2.get(key);
    if (!compareSame(mk1, mk2)) return false;
  }
  return true;
};

export const fillAnnualSubs = (uk: string, year: number, subinfos?: Array<WcAnnualSub>) =>
  subinfos?.map((item, i) => {
    item.key = item.key || `AS_${uk}_${year}_${i}`;
    return item;
  });

export const timestamp = (date: CalendarDay) => +new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);

export type WxCalendarPlugins<T extends WxCalendar<any>> = T extends WxCalendar<infer R> ? R : never;

interface ClearFilter {
  (plugin: PluginUse): boolean;
}
export class WxCalendar<T extends Array<PluginConstructor> = Array<PluginConstructor>> {
  /** 今天 */
  public static today = normalDate(new Date());
  /** 预设插件 */
  private static _PLUGINS_: Array<PluginUse> = [];
  /** 插件服务 */
  public service: PluginService<T>;

  constructor(component: CalendarInstance, services: T | Array<PluginUse<T>> = []) {
    const _services = [...services, ...WxCalendar._PLUGINS_, MarkPlugin].map(service => {
      if ((service as PluginUse<any>).construct) return service as PluginUse<T>;
      return { construct: service } as PluginUse<T>;
    });
    this.service = new PluginService(component, _services);
  }

  public createMonth(mon: CalendarMonth, weekstart: number = 0) {
    const { year, month } = normalDate({ year: mon.year, month: mon.month, day: 1 });
    const currMonthDays = createMonthDays({ year, month });
    const currDaysCount = currMonthDays.length;
    const lastMonthDays = createMonthLastDays(currMonthDays[0], weekstart);
    const nextMonthDays = createMonthNextDays(currMonthDays[currDaysCount - 1], weekstart);
    const days = [...lastMonthDays, ...currMonthDays, ...nextMonthDays];
    const m = {
      key: `${year}_${month}`,
      year,
      month,
      weeks: createMonthWeeks({ year, month }, days),
      count: currDaysCount
    } as WcMonth;
    this.service.catchMonth(m);
    return m;
  }

  public createYear(year: number, weekstart: number = 0) {
    const months: Array<WcAnnualMonth> = Array.from({ length: 12 }, (_, i) =>
      createYearMonth({ year, month: i + 1 }, weekstart)
    );
    const y = { key: `Y_${year}`, year, subinfo: [], months, marks: new Map() } as WcFullYear;
    this.service.catchYear(y);
    return y;
  }

  public static use<T extends PluginConstructor>(plugin: T, options?: ConstructorParameters<T>[0]) {
    const idx = this._PLUGINS_.findIndex(p => p.construct.KEY === plugin.KEY);
    if (idx >= 0) this._PLUGINS_.splice(idx, 1);
    this._PLUGINS_.push({ construct: plugin, options });
    return this;
  }

  /**
   * 移除所有插件
   */
  public static clearPlugin(): void;
  /**
   * 移除某个插件
   * @param key 插件 key
   */
  public static clearPlugin<T extends PluginService = UsePluginService>(key: PluginKeys<ServicePlugins<T>>): void;
  /**
   * 移除符合条件的插件
   * @param filter 过滤条件
   */
  public static clearPlugin(filter: ClearFilter): void;
  public static clearPlugin<T extends PluginService = UsePluginService>(
    filter?: PluginKeys<ServicePlugins<T>> | ClearFilter
  ) {
    if (isString(filter)) {
      this._PLUGINS_ = this._PLUGINS_.filter(plugin => plugin.construct.KEY === filter);
    } else if (isFunction(filter)) {
      this._PLUGINS_ = this._PLUGINS_.filter(plugin => !filter(plugin));
    } else {
      this._PLUGINS_ = [];
    }
  }
}
