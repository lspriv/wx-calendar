/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 选中日期的背景圆圈 Pointer
 * @Author: lspriv
 * @LastEditTime: 2024-08-07 21:02:56
 */
import { nextTick } from './tools';
import { findDateIndex } from '../interface/calendar';
import { CalendarHandler } from '../interface/component';

import type { CalendarDay, WcMonth } from '../interface/calendar';
import type { CalendarData, CalendarPanel } from '../interface/component';

interface PointerLocation {
  x: string | number;
  y: string | number;
}

interface PointerIndexLocation {
  ddx: number;
  wdx: number;
  len: number;
}

export interface CalendarPointer {
  x: string | number;
  y: string | number;
  show: boolean;
  animate: boolean;
  transition: boolean;
}

export const createPointer = (opts?: Partial<CalendarPointer>) =>
  ({ x: 0, y: 0, show: false, animate: true, transition: true, ...opts }) as CalendarPointer;

const calcCurrIdx = (mon: WcMonth, checked: CalendarDay): PointerIndexLocation => {
  const { month, day } = checked;
  const idx = findDateIndex(mon.weeks, date => date.month == month && date.day == day);
  return { ddx: idx % 7, wdx: Math.floor(idx / 7), len: mon.weeks.length };
};

const calcPosition = (mon: WcMonth, checked: CalendarDay, centres: number[]): PointerLocation => {
  const { ddx, wdx, len } = calcCurrIdx(mon, checked);
  const x = `${centres[ddx]}px`;
  const y = `calc(100% / ${len} * ${wdx})`;
  return { x, y };
};

/**
 * 这个最开始是分skyline和webview渲染的，
 * skyline用worklet动画控制，webview用wxs事件changeprop控制，这样最好不过了
 * 后为了方便，skyline和webview又同时有效，就用了一套控制
 * TODO: skyline和worklet分开?
 */
export class Pointer extends CalendarHandler {
  /** 控制显隐 */
  public show: boolean = true;

  private _vibrate_: boolean;

  public update(
    sets?: Partial<CalendarData>,
    vibrate: boolean = false,
    checked?: CalendarDay,
    flush: boolean = false
  ): void {
    const instance = this._instance_;
    checked = checked || sets?.checked || instance.data.checked!;
    const current = sets?.current ?? instance.data.current;
    const panel: CalendarPanel = sets?.panels
      ? sets.panels[current]
      : sets?.[`panels[${current}]`] || instance.data.panels[current];

    this._vibrate_ = vibrate;

    const { x, y } = calcPosition(panel, checked, instance._centres_);

    if (sets?.pointer) {
      sets.pointer = { ...sets.pointer, x, y, show: this.show, animate: true };
    } else if (sets) {
      sets[`pointer.x`] = x;
      sets[`pointer.y`] = y;
      sets[`pointer.show`] = this.show;
      sets[`pointer.animate`] = !flush;
    } else {
      instance.setData({
        [`pointer.x`]: x,
        [`pointer.y`]: y,
        [`pointer.show`]: this.show,
        [`pointer.animate`]: !flush
      });
    }
  }

  public animationEnd() {
    const instance = this._instance_;
    instance.setData({
      ['pointer.animate']: false
    });
    if (instance.data.vibrate && this._vibrate_ && this.show) {
      wx.vibrateShort({ type: 'light' });
    }
  }

  public async resetOffsetY(date: CalendarDay) {
    const instance = this._instance_;
    const month = instance._calendar_.createMonth(date, instance.data.weekstart);
    const { y } = calcPosition(month, date, instance._centres_);
    instance.setData({
      [`pointer.y`]: y,
      [`pointer.show`]: false,
      [`pointer.animate`]: false
    });
    await nextTick();
  }
}
