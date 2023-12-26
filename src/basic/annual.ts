/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 年度面板控制
 * @Author: lspriv
 * @LastEditTime: 2023-10-31 23:58:36
 */
import { CalendarHandler, CalendarInstance } from '../interface/component';
import { CalendarMonth } from '../interface/calendar';
import { applyAnimated, clearAnimated, isSkyline, nodeRect, severalTicks } from './tools';
import { SELECTOR } from './constants';
import { promises, isFunction } from '../utils/shared';

const { shared, timing, Easing } = wx.worklet;

export class AnnualPanelSwitch extends CalendarHandler {
  private _top_?: Shared<number | string>;
  private _opacity_?: Shared<number>;

  private _calendar_trans_?: Shared<number>;
  private _calendar_alpha_?: Shared<number>;

  private _style_ids_?: Map<string, number>;

  private _interactive_callbacks_: Array<(...args: any) => void> = [];
  private _transforming_: boolean = false;

  constructor(instance: CalendarInstance) {
    super(instance);
    if (isSkyline(instance.renderer)) this.initialize();
  }

  private initialize() {
    this._style_ids_ = new Map();
    this.initializeContainer();
  }

  private async initializeContainer() {
    const top = shared('-150vh');
    const opacity = shared(0);

    const calendar_trans = shared(0);
    const calendar_alpha = shared(1);

    this._top_ = top;
    this._opacity_ = opacity;

    this._calendar_trans_ = calendar_trans;
    this._calendar_alpha_ = calendar_alpha;

    const [yid, cid, hid, bid] = await promises([
      applyAnimated(this._instance_, SELECTOR.ANNUAL, () => {
        'worklet';
        return {
          top: top.value,
          opacity: opacity.value
        };
      }),
      applyAnimated(this._instance_, SELECTOR.CALENDAR, () => {
        'worklet';
        return {
          opacity: 1 - opacity.value
        };
      }),
      applyAnimated(this._instance_, SELECTOR.PANEL_HEADER, () => {
        'worklet';
        return {
          transform: `translateY(${-calendar_trans.value}%)`,
          opacity: calendar_alpha.value
        };
      }),
      applyAnimated(this._instance_, SELECTOR.BAR, () => {
        'worklet';
        return {
          transform: `translateY(${calendar_trans.value}%)`,
          opacity: calendar_alpha.value
        };
      })
    ]);

    this._style_ids_!.set(SELECTOR.ANNUAL, yid);
    this._style_ids_!.set(SELECTOR.CALENDAR, cid);
    this._style_ids_!.set(SELECTOR.PANEL_HEADER, hid);
    this._style_ids_!.set(SELECTOR.BAR, bid);
  }

  private showCalendar() {
    const options = { duration: 280, easing: Easing.out(Easing.sin) };
    this._calendar_trans_!.value = timing(0, options);
    this._calendar_alpha_!.value = timing(1, options);
  }

  private hiddenCalendar() {
    this._calendar_trans_!.value = 200;
    this._calendar_alpha_!.value = 0;
  }

  private async calcCalendarTop() {
    const query = nodeRect(this._instance_);
    const rect = await query(SELECTOR.CALENDAR);
    return rect[0].top;
  }

  public async switch(show: boolean, mon: CalendarMonth) {
    const instance = this._instance_;
    if (this._transforming_) return;
    this._transforming_ = true;
    const isSkylineRender = isSkyline(this._render_);
    if (show) {
      await instance._panel_.toYear(mon.year);
      /**
       * _panel_.toYear方法中setData后触发视图更新，
       * 官方文档称setData数据是同步，但是向视图层传递数据是异步，视图层更新节点树用于下次重渲染
       * 这里要避免上述过程造成的掉帧现象，虽然没有接口获取视图层更新的时机，可以等待几个时间片后执行动画
       */
      await severalTicks(10);
      const top = await this.calcCalendarTop();
      if (isSkylineRender) this._top_!.value = `-${top}px`;
      else instance.setData({ annualTop: 0, annualDuration: 300 });

      await instance._printer_.open(mon, top, () => {
        if (isSkylineRender) this._opacity_!.value = 1;
        else instance.setData({ annualOpacity: 1 });
      });
      isSkylineRender && this.hiddenCalendar();
      this._transforming_ = false;
      this.execInteractiveCallbacks();
    } else {
      await instance._panel_.toAnnualMonth(mon);
      await severalTicks(10);
      await instance._printer_.close(mon);
      if (isSkylineRender) this._opacity_!.value = 0;
      else instance.setData({ annualOpacity: 0 });
      isSkylineRender && this.showCalendar();
      wx.nextTick(() => {
        if (isSkylineRender) this._top_!.value = '-150vh';
        else instance.setData({ annualTop: '-150vh' });

        this._transforming_ = false;
        this.execInteractiveCallbacks();
      });
    }
  }

  /**
   * 清理skyline渲染下所需要成员变量
   */
  public clearSkyline() {
    const instance = this._instance_;
    if (this._style_ids_?.has(SELECTOR.ANNUAL))
      clearAnimated(instance, SELECTOR.ANNUAL, [this._style_ids_.get(SELECTOR.ANNUAL)!]);
    if (this._style_ids_?.has(SELECTOR.CALENDAR))
      clearAnimated(instance, SELECTOR.CALENDAR, [this._style_ids_.get(SELECTOR.CALENDAR)!]);
    if (this._style_ids_?.has(SELECTOR.PANEL_HEADER))
      clearAnimated(instance, SELECTOR.PANEL_HEADER, [this._style_ids_.get(SELECTOR.PANEL_HEADER)!]);
    if (this._style_ids_?.has(SELECTOR.BAR))
      clearAnimated(instance, SELECTOR.BAR, [this._style_ids_.get(SELECTOR.BAR)!]);
    this._style_ids_?.clear();
    this._style_ids_ = void 0;
    this._opacity_ = void 0;
    this._top_ = void 0;
    this._calendar_trans_ = void 0;
    this._calendar_alpha_ = void 0;
  }

  private execInteractiveCallbacks() {
    while (this._interactive_callbacks_.length) {
      const callback = this._interactive_callbacks_.shift();
      isFunction(callback) && callback();
    }
  }

  public interaction() {
    if (!this._transforming_) return Promise.resolve();
    return new Promise<void>(resolve => {
      this._interactive_callbacks_.push(resolve);
    });
  }
}
