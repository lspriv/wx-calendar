/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 布局
 * @Author: lspriv
 * @LastEditTime: 2023-10-30 17:17:01
 */
import { View } from './constants';

export interface CalendarLayout {
  readonly maxHeight: number;
  readonly mainHeight: number;
  readonly minHeight: number;
  readonly subHeight: number;
  readonly panelHeight: number;
  readonly menuTop: number;
  readonly menuBottom: number;
  readonly windowWidth: number;
  readonly windowHeight: number;
  readonly dragMaxHeight: number;
  readonly safeBottom: number;
  readonly maxScheduleSize: number;
}

export type Theme = 'light' | 'dark';

export class Layout {
  public static layout?: CalendarLayout;
  /** 深浅模式 */
  public static theme: Theme = 'light';
  /** 小程序规定的屏幕宽度，单位rpx */
  public static RatioWidth: number = 750;
  /** 常规状态下（月视图）的日历总高度，单位rpx */
  public static CalendarHeight: number = 800;
  /** 顶部operator，week和底部bar组件的总高度，单位rpx */
  public static CalendarSubHeight: number = 200;
  /** 日历最大高度下留余高度，单位rpx */
  public static CalendarSpareHeight: number = 100;

  public static MaxVelocity: number = 8000;
  public static CriticalVelocity: number = 6000;

  public static initialize() {
    if (Layout.layout) return;

    const { safeArea, windowWidth, windowHeight, theme } = wx.getSystemInfoSync();
    const { top, bottom } = wx.getMenuButtonBoundingClientRect();

    console.log('system', wx.getSystemInfoSync());

    const subHeight = Layout.rpxToPx(Layout.CalendarSubHeight, windowWidth);
    const mainHeight = Layout.rpxToPx(Layout.CalendarHeight, windowWidth);
    const panelHeight = mainHeight - subHeight;

    const spareHeight = Layout.rpxToPx(Layout.CalendarSpareHeight, windowWidth);
    const maxHeight = (safeArea?.bottom ?? windowHeight) - bottom - spareHeight;
    const minHeight = panelHeight / 5 + subHeight;
    const dragMaxHeight = panelHeight / 5 + maxHeight;

    const safeBottom = windowHeight - (safeArea?.bottom ?? windowHeight);

    Layout.layout = Object.freeze({
      menuTop: top,
      menuBottom: bottom,
      safeBottom: safeBottom > 0 ? safeBottom : Layout.rpxToPx(60, windowWidth),
      subHeight,
      panelHeight,
      mainHeight,
      maxHeight,
      minHeight,
      dragMaxHeight,
      windowWidth,
      windowHeight,
      maxScheduleSize: Layout.calcSchedulesMaxSize(maxHeight - subHeight, windowWidth)
    }) as CalendarLayout;

    console.log('layout', Layout.layout);

    if (theme === 'dark') Layout.theme = 'dark';
  }

  private static calcSchedulesMaxSize(maxPanelHeight: number, windowWidth: number): number {
    /** 按每个月最大有6行计算最小行高度 */
    const minUnitHeight = maxPanelHeight / 6;
    /** 计算日期主体高度 */
    const dateInnerHeight = Layout.rpxToPx(100, windowWidth);
    /** 计算日程间距 */
    const margin = Layout.rpxToPx(4, windowWidth);
    /** 计算耽搁日程高度 */
    const scheduleHeight = Layout.rpxToPx(24, windowWidth);
    /** 计算能容纳的最大日程数量 */
    return Math.floor((minUnitHeight - dateInnerHeight) / (scheduleHeight + margin));
  }

  public static rpxToPx(rpx: number, windowWidth: number) {
    return Math.floor((rpx * windowWidth) / Layout.RatioWidth);
  }

  // public static pxToRpx(px: number, windowWidth: number) {
  //   return Math.floor((px * Layout.RatioWidth) / windowWidth);
  // }

  public static viewHeight(view: View) {
    if (view & View.week) return Layout.layout?.minHeight;
    if (view & View.month) return Layout.layout?.mainHeight;
    if (view & View.schedule) return Layout.layout?.maxHeight;
  }
}
