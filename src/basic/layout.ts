/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 布局
 * @Author: lspriv
 * @LastEditTime: 2024-06-07 16:30:13
 */
import { View } from './constants';

export interface CalendarLayout {
  readonly maxHeight: number;
  readonly mainHeight: number;
  readonly minHeight: number;
  readonly menuTop: number;
  readonly menuBottom: number;
  readonly windowWidth: number;
  readonly windowHeight: number;
  readonly dragMax: number;
  readonly safeBottom: number;
  readonly maxScheduleSize: number;
}

export type Theme = 'light' | 'dark';

/** 小程序规定的屏幕宽度，单位rpx */
const RATIO_WIDTH = 750;

export class Layout {
  public static layout?: CalendarLayout;
  /** 深浅模式是否开启 */
  public static darkmode: boolean = true;
  /** 深浅模式 */
  public static theme?: Theme;
  /** 设备像素比 */
  public static dpr: number = 1;
  /** 常规状态下（月视图）的日历主面板高度，单位rpx */
  public static CalendarMainHeight: number = 600;
  /** 日历头部高度，单位rpx */
  public static CalendarHeaderHeight: number = 100;
  /** 星期容器高度，单位rpx */
  public static CalendarWeekHeight: number = 50;
  /** 底部bar容器高度，单位rpx */
  public static CalendarBarHeight: number = 50;
  /** 日历最大高度下留余高度，单位rpx */
  public static CalendarSpareHeight: number = 100;

  public static initialize() {
    if (Layout.layout) return;

    const { safeArea, windowWidth, windowHeight, theme, pixelRatio } = wx.getSystemInfoSync();
    const { top, bottom } = wx.getMenuButtonBoundingClientRect();

    Layout.theme = theme || 'light';
    Layout.darkmode = !!theme;
    Layout.dpr = pixelRatio;

    const subHeight = Layout.rpxToPx(
      Layout.CalendarHeaderHeight + Layout.CalendarWeekHeight + Layout.CalendarBarHeight,
      windowWidth
    );
    const spareHeight = Layout.rpxToPx(Layout.CalendarSpareHeight, windowWidth);

    const mainHeight = Layout.rpxToPx(Layout.CalendarMainHeight, windowWidth);
    const maxHeight = (safeArea?.bottom ?? windowHeight) - bottom - spareHeight - subHeight;
    const minHeight = mainHeight / 5;

    const dragMax = minHeight + maxHeight;
    const safeBottom = windowHeight - (safeArea?.bottom ?? windowHeight);

    Layout.layout = Object.freeze({
      menuTop: top,
      menuBottom: bottom,
      safeBottom: safeBottom > 0 ? safeBottom : Layout.rpxToPx(60, windowWidth),
      mainHeight,
      maxHeight,
      minHeight,
      dragMax,
      windowWidth,
      windowHeight,
      maxScheduleSize: Layout.calcSchedulesMaxSize(maxHeight, windowWidth)
    });
  }

  private static calcSchedulesMaxSize(maxPanelHeight: number, windowWidth: number): number {
    /** 按每个月最大有6行计算最小行高度 */
    const minUnitHeight = maxPanelHeight / 6;
    /** 计算日期主体高度 */
    const dateInnerHeight = Layout.rpxToPx(100, windowWidth);
    /** 计算日程间距 */
    const margin = Layout.rpxToPx(4, windowWidth);
    /** 计算单个日程高度 */
    const scheduleHeight = Layout.rpxToPx(24, windowWidth);
    /** 计算能容纳的最大日程数量 */
    return Math.floor((minUnitHeight - dateInnerHeight) / (scheduleHeight + margin));
  }

  public static rpxToPx(rpx: number, windowWidth?: number) {
    windowWidth = windowWidth || Layout.layout?.windowWidth;
    if (!windowWidth) throw new Error('missing parameter [windowWidth]');
    return Math.floor((rpx * windowWidth) / RATIO_WIDTH);
  }

  public static viewHeight(view: View) {
    if (view & View.week) return Layout.layout?.minHeight;
    if (view & View.month) return Layout.layout?.mainHeight;
    if (view & View.schedule) return Layout.layout?.maxHeight;
  }
}
