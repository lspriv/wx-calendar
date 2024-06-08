/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 年度面板控制
 * @Author: lspriv
 * @LastEditTime: 2024-06-07 23:14:45
 */
import { CalendarHandler, CalendarInstance } from '../interface/component';
import { CalendarMonth } from '../interface/calendar';
import { applyAnimated, clearAnimated, nextTick, nodeRect, severalTicks } from './tools';
import { SELECTOR } from './constants';
import { promises, isFunction } from '../utils/shared';

const { shared, timing, Easing } = wx.worklet;

/** skyline下年度面板初始位置 */
const ANNUAL_TRANSFORM = '-150vh';

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
    if (this.skyline) this.initialize();
  }

  private initialize() {
    this._style_ids_ = new Map();
    this.bindAnimations();
  }

  /**
   * 绑定动画（年度面板，日历主体，日历头，日历拖拽bar）
   */
  private async bindAnimations() {
    const top = shared(ANNUAL_TRANSFORM);
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

  /**
   * 日历头和drag bar的显示动画
   */
  private showCalendar() {
    const options = { duration: 280, easing: Easing.out(Easing.sin) };
    this._calendar_trans_!.value = timing(0, options);
    this._calendar_alpha_!.value = timing(1, options);
  }

  /**
   * 日历头和drag bar的隐藏动画
   */
  private hiddenCalendar() {
    this._calendar_trans_!.value = 200;
    this._calendar_alpha_!.value = 0;
  }

  /**
   * 计算日历顶端在页面中的位置
   */
  private async getCalendarRect() {
    const query = nodeRect(this._instance_);
    const rect = await query(SELECTOR.CALENDAR);
    return rect[0];
  }

  /**
   * 年度面板开关
   * @param show 开/关 true/false
   * @param mon  指定月份
   */
  public async switch(show: boolean, mon: CalendarMonth) {
    const instance = this._instance_;
    if (this._transforming_) return;
    /** 设置动画状态为正在进行 */
    this._transforming_ = true;

    /** 是否 skyline 渲染 */
    const isSkyline = this.skyline;

    if (show) {
      /** 跳转到指定年份 */
      await instance._panel_.toYear(mon.year);
      /**
       * 获取日历顶端在页面的位置
       * 用来处理年度面板动画垂直方向的初始偏移量
       */
      const rect = await this.getCalendarRect();
      if (isSkyline) {
        this._top_!.value = `-${rect.top}px`;
      } else {
        instance.setData({
          annualTop: 0,
          annualDuration: 300,
          annualOpacity: 1
        });
      }

      /**
       * _panel_.toYear方法中setData后触发视图更新
       * 虽然没有接口获取视图层更新的时机，可以等待几个时间片后执行动画
       */
      await severalTicks(10);

      /** 执行年度面板打开动画 */
      await instance._printer_.open(mon, rect, () => {
        if (isSkyline) this._opacity_!.value = 1;
      });

      /**
       * skyline下执行日历头部和拖拽bar的隐藏动画
       * webview由annualOpacity控制，无需操作
       */
      isSkyline && this.hiddenCalendar();
    } else {
      /** 日历跳转到指定月 */
      await instance._panel_.toAnnualMonth(mon, instance.$_gesture.value);
      /** 等待视图更新 */
      await severalTicks(10);
      /** 执行年度面板关闭动画 */
      await instance._printer_.close(mon);
      /** 设置年度面板为隐藏 */
      if (isSkyline) this._opacity_!.value = 0;
      else instance.setData({ annualOpacity: 0 });
      /**
       * skyline下执行日历头和 bar 的隐藏动画
       * webview由annualOpacity控制，无需操作
       */
      isSkyline && this.showCalendar();

      await nextTick();

      /** 年度面板垂直方向归位，移出屏幕外 */
      if (isSkyline) this._top_!.value = ANNUAL_TRANSFORM;
      else instance.setData({ annualTop: ANNUAL_TRANSFORM });
    }

    /** 设置动画状态为结束 */
    this._transforming_ = false;

    /** 执行动画结束后的等待操作 */
    this.execInteractiveCallbacks();
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

  /** 执行动画结束后的等待操作 */
  private execInteractiveCallbacks() {
    while (this._interactive_callbacks_.length) {
      const callback = this._interactive_callbacks_.shift();
      isFunction(callback) && callback();
    }
  }

  /** 等待动画交互 */
  public interaction() {
    if (!this._transforming_) return Promise.resolve();
    return new Promise<void>(resolve => {
      this._interactive_callbacks_.push(resolve);
    });
  }
}
