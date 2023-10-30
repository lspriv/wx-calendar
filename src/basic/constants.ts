/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 常量配置
 * @Author: lspriv
 * @LastEditTime: 2023-10-30 15:47:31
 */
declare global {
  var $_VERSION: string;
}

export const VERSION = $_VERSION;

/** 大于3的奇数 */
export const CALENDAR_PANELS = 3;

export const PURE_PROPS = ['date', 'view', 'weekstart', 'vibrate', 'font'] as const;

export const FONT = 'system-ui';
// '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, PingFang SC, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif';

export const WEEKS = '日一二三四五六';

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
