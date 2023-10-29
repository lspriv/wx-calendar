/*
 * @Description: 选中日期的背景圆圈 Pointer
 * @Author: lishen
 * @LastEditTime: 2023-10-26 19:03:50
 */
import { findDateIndex } from '../interface/calendar';
import { CalendarHandler } from '../interface/component';

import type { CalendarDay, WxCalendarMonth } from '../interface/calendar';
import type { CalendarData } from '../interface/component';
import type { Voidable } from '../utils/shared';

interface PointerLocation {
  x: string | number;
  y: string | number;
}

interface PointerIndexLocation {
  ddx: number;
  wdx: number;
  len: number;
}

/**
 * 这个最开始是分skyline和webview渲染的，
 * skyline用worklet动画控制，webview用wxs事件changeprop控制，这样最好不过了
 * 后为了方便，skyline和webview又同时有效，就用了一套控制
 * TODO: skyline和worklet分开?
 */
export class Pointer extends CalendarHandler {
  private _vibrate_: boolean;

  public update(
    sets: Voidable<Partial<CalendarData>>,
    vibrate: boolean = false,
    checked?: CalendarDay,
    flush: boolean = false
  ) {
    const instance = this._instance_;
    checked = checked || sets?.checked || instance.data.checked!;
    const current = sets?.current ?? instance.data.current;
    const panel = sets?.panels ? sets.panels[current] : sets?.[`panels[${current}]`] || instance.data.panels[current];

    this._vibrate_ = vibrate;

    const { x, y } = Pointer.calcPosition(panel, checked, instance._centres_);

    if (sets?.pointer) {
      sets.pointer = { ...sets.pointer, x, y, show: true, animate: true };
    } else if (sets) {
      sets[`pointer.x`] = x;
      sets[`pointer.y`] = y;
      sets[`pointer.show`] = true;
      sets[`pointer.animate`] = !flush;
    } else {
      instance.setData({
        [`pointer.x`]: x,
        [`pointer.y`]: y,
        [`pointer.show`]: true,
        [`pointer.animate`]: !flush
      });
    }
  }

  public animationEnd() {
    const instance = this._instance_;
    instance.setData({
      ['pointer.animate']: false
    });
    if (instance.data.vibrate && this._vibrate_) {
      wx.vibrateShort({ type: 'light' });
    }
  }

  public static calcCurrIdx(mon: WxCalendarMonth, checked: CalendarDay): PointerIndexLocation {
    const { month, day } = checked;
    const idx = findDateIndex(mon.weeks, date => date.month == month && date.day == day);
    return { ddx: idx % 7, wdx: Math.floor(idx / 7), len: mon.weeks.length };
  }

  public static calcPosition(mon: WxCalendarMonth, checked: CalendarDay, centres: number[]): PointerLocation {
    const { ddx, wdx, len } = this.calcCurrIdx(mon, checked);

    const x = `${centres[ddx]}px`;
    const y = `calc(100% / ${len} * ${wdx})`;

    return { x, y };
  }
}