/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 常量配置
 * @Author: lspriv
 * @LastEditTime: 2024-11-12 19:14:56
 */
declare const $_VERSION: string;

export const VERSION = $_VERSION;

/** 大于3的奇数 */
export const CALENDAR_PANELS = 3;

/** 纯数据字段 */
export const PURE_PROPS = /^(date|view|weekstart|darkmode|vibrate|font|areas|viewGesture)$/;

/** 字体 */
export const FONT = 'ui-sans-serif';
// '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, PingFang SC, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif';

export const WEEKS = '日一二三四五六';

export const FULL_LAYOUT = ['header', 'title', 'subinfo', 'today', 'viewbar', 'dragbar'] as const;

export const GREGORIAN_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export const MS_ONE_DAY = 86400000;

export const VIEWS = {
  WEEK: 'week',
  MONTH: 'month',
  SCHEDULE: 'schedule'
} as const;

export enum View {
  week = 1 << 0,
  month = 1 << 1,
  schedule = 1 << 2
}

export const SELECTOR = {
  CALENDAR: '#calendar',
  WEEK_ITEM: '.wc__week-item',
  PANEL_HEADER: '.wc__header',
  PANEL_SWIPER: '.wc__panel-swiper',
  PANEL_CONTAINER: '#panel',
  PANEL: '.wc__panel--idx-',
  VIEW_BAR: '#view_bar',
  VIEW_BAR_1: '#view_bar_1',
  VIEW_BAR_2: '#view_bar_2',
  SCHEDULES: '.wc__panel-schedules',
  BAR: '.wc__bar',
  BAR_1: '#control_1',
  BAR_2: '#control_2',
  ANNUAL: '.wc__annual',
  ANNUAL_SWIPER: '.wc__annual-panel-swiper',
  ANNUAL_CANVAS: '#printer_'
} as const;
