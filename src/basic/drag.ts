/*
 * @Description: Description
 * @Author: lishen
 * @LastEditTime: 2023-10-26 13:46:52
 */
import { CalendarHandler, CalendarInstance } from '../interface/component';
import { applyAnimated, clearAnimated, circularDiff } from './tools';
import { SELECTOR, View, CALENDAR_PANELS } from './constants';
import { Layout } from './layout';
import { PanelTool } from './panel';
import { offsetDate, normalDate } from '../interface/calendar';
import { promises, easeInOutSine } from '../utils/shared';

import type { CalendarDay } from '../interface/calendar';

const { shared, timing, sequence, Easing, delay, runOnJS } = wx.worklet;

export class Dragger extends CalendarHandler {
  private _style_ids_: Map<string, number> = new Map();

  private _schdule_selector_?: string;

  constructor(instance: CalendarInstance) {
    super(instance);
    this.initialize();
  }

  private initialize() {
    this.initailizeShared();
    this.bindPanelAnimation();
    this.bindBarAnimation();
    this.bindViewBarAnimation();
  }

  private initailizeShared() {
    const instance = this._instance_;
    instance.$_drag_state = shared(0);
    instance.$_current = shared(instance.data.current);
    instance.$_drag_schedule_opacity = shared(0);
  }

  public update() {
    this._instance_.$_current!.value = this._instance_.data.current;
    this.setPanelTrans();
  }

  private async bindPanelAnimation() {
    const instance = this._instance_;
    const calendarHeight = shared(Layout.viewHeight(instance._view_)!);
    instance.$_drag_calendar_height = calendarHeight;

    const { mainHeight, minHeight, dragMaxHeight } = Layout.layout!;

    (async () => {
      const id = await applyAnimated(instance, SELECTOR.CALENDAR, () => {
        'worklet';
        return {
          height: `${calendarHeight.value}px`
        };
      });
      this._style_ids_.set(SELECTOR.CALENDAR, id);
    })();

    const dragTransArr: Array<Shared<number>> = [];

    const trans = Array.from<number, number>({ length: CALENDAR_PANELS }, () => 0);

    const checked = instance.data.checked || normalDate(instance.data.date);

    trans.forEach(async (_, idx) => {
      const selector = SELECTOR.PANEL + idx;
      const trans = shared(this.calcPanelOffset(idx, checked));
      dragTransArr[idx] = trans;
      const id = await applyAnimated(instance, selector, () => {
        'worklet';
        const usefulHeight = Math.min(dragMaxHeight, Math.max(minHeight, calendarHeight.value));
        const offset =
          usefulHeight >= mainHeight ? 0 : (trans.value * (mainHeight - usefulHeight)) / (mainHeight - minHeight);
        return {
          transform: `translateY(${-offset}px)`
        };
      });
      this._style_ids_.set(selector, id);
    });

    instance.$_drag_panel_trans = shared(dragTransArr);
  }

  private async bindBarAnimation() {
    const instance = this._instance_;
    const deg = shared(0);
    instance.$_drag_bar_rotate = deg;

    const [bar1Id, bar2Id] = await promises([
      applyAnimated(instance, SELECTOR.BAR_1, () => {
        'worklet';
        return {
          transform: `rotate(${deg.value}deg)`
        };
      }),
      applyAnimated(instance, SELECTOR.BAR_2, () => {
        'worklet';
        return {
          transform: `rotate(${-deg.value}deg)`
        };
      })
    ]);
    this._style_ids_.set(SELECTOR.BAR_1, bar1Id);
    this._style_ids_.set(SELECTOR.BAR_2, bar2Id);
  }

  private async bindViewBarAnimation() {
    const instance = this._instance_;
    const translateX = shared(instance._view_ & View.week ? 60 : 0);
    instance.$_drag_view_bar_translate_ = translateX;

    const [id, bid1, bid2] = await promises([
      applyAnimated(instance, SELECTOR.VIEW_BAR, () => {
        'worklet';
        return {
          transform: `translateX(${translateX.value}rpx) translateZ(0px)`
        };
      }),
      applyAnimated(instance, SELECTOR.VIEW_BAR_1, () => {
        'worklet';
        const width = Math.max(52 - translateX.value, 8);
        return {
          width: `${width}rpx`
        };
      }),
      applyAnimated(instance, SELECTOR.VIEW_BAR_2, () => {
        'worklet';
        const width = Math.max(translateX.value - 8, 8);
        return {
          width: `${width}rpx`
        };
      })
    ]);
    this._style_ids_.set(SELECTOR.VIEW_BAR, id);
    this._style_ids_.set(SELECTOR.VIEW_BAR_1, bid1);
    this._style_ids_.set(SELECTOR.VIEW_BAR_2, bid2);
  }

  public async bindScheduleAnimation() {
    const instance = this._instance_;
    instance.$_drag_schedule_opacity!.value = instance._view_ & View.schedule ? 1 : 0;
    this.clearScheduleAnimation();

    const current = instance.data.current;
    this._schdule_selector_ = `${SELECTOR.PANEL}${current} ${SELECTOR.SCHEDULES}`;

    const id = await applyAnimated(instance, this._schdule_selector_, () => {
      'worklet';
      return {
        opacity: this._instance_.$_drag_schedule_opacity!.value
      };
    });
    this._style_ids_.set(this._schdule_selector_, id);
  }

  private clearScheduleAnimation() {
    const id = this._style_ids_.get(this._schdule_selector_!);
    if (id) {
      clearAnimated(this._instance_, this._schdule_selector_!, [id]);
      this._style_ids_.delete(this._schdule_selector_!);
    }
  }

  private calcPanelOffset(idx: number, checked: CalendarDay): number {
    const data = this._instance_.data;
    return PanelTool.calcPanelOffset(offsetDate(checked, circularDiff(idx, data.current) * 7), data.weekstart);
  }

  private setPanelTrans() {
    const instance = this._instance_;
    instance.$_drag_panel_trans!.value.forEach((_, i) => {
      const trans = this.calcPanelOffset(i, instance.data.checked!);
      instance.$_drag_panel_trans!.value[i].value = trans;
    });
  }

  /**
   * 处理拖拽结束
   * @param velocity 拖拽结束时纵向速度
   */
  public dragout(velocity: number): Promise<View> {
    const instance = this._instance_;
    const { minHeight, maxHeight, mainHeight, panelHeight } = Layout.layout!;

    const maxBounce = panelHeight / 5;
    const criticalMin = mainHeight - maxBounce;
    const criticalMax = mainHeight + maxBounce;

    const calendarHeight = instance.$_drag_calendar_height!.value;
    const animOpts = { duration: 280, easing: Easing.out(Easing.sin) };

    return new Promise<View>(resolve => {
      const view = shared(0) as unknown as Shared<View>;

      const callback = () => {
        'worklet';
        runOnJS(resolve)(view.value);
      };

      if (!velocity || calendarHeight <= minHeight) {
        const toMinPanel = calendarHeight < criticalMin;
        const toMaxPanel = calendarHeight > criticalMax;
        const usefulHeight = toMinPanel ? minHeight : toMaxPanel ? maxHeight : mainHeight;
        instance.$_drag_calendar_height!.value = timing(usefulHeight, animOpts);
        instance.$_drag_bar_rotate!.value = timing(0, animOpts, callback);
        view.value = toMinPanel ? View.week : toMaxPanel ? View.schedule : View.month;
      } else {
        const bounceOpts = { duration: 200, easing: Easing.inOut(Easing.sin) };
        const velocityAbs = Math.min(Math.abs(velocity), Layout.MaxVelocity);
        const criticalDiff = velocityAbs - Layout.CriticalVelocity;
        const maxCriticalDiff = Layout.MaxVelocity - Layout.CriticalVelocity;
        const critical = criticalDiff > 0;
        if (calendarHeight < mainHeight) {
          if (velocity > 0) {
            const bounce = Math.floor(
              critical
                ? easeInOutSine(criticalDiff / maxCriticalDiff, maxBounce)
                : easeInOutSine(velocityAbs / Layout.CriticalVelocity, maxBounce)
            );
            const height = critical ? maxHeight : mainHeight;
            view.value = critical ? View.schedule : View.month;
            instance.$_drag_calendar_height!.value = sequence(
              timing(height + bounce, animOpts, callback),
              timing(height, bounceOpts)
            );
          } else {
            const bounce = Math.floor(easeInOutSine(velocityAbs / Layout.MaxVelocity, maxBounce));
            view.value = View.week;
            instance.$_drag_calendar_height!.value = sequence(
              timing(minHeight - bounce, animOpts, callback),
              timing(minHeight, bounceOpts)
            );
          }
        } else {
          if (velocity < 0) {
            const bounce = Math.floor(
              critical
                ? easeInOutSine(criticalDiff / maxCriticalDiff, maxBounce)
                : easeInOutSine(velocityAbs / Layout.CriticalVelocity, maxBounce)
            );
            const height = critical ? minHeight : mainHeight;
            view.value = critical ? View.week : View.month;
            instance.$_drag_calendar_height!.value = sequence(
              timing(height - bounce, animOpts, callback),
              timing(height, bounceOpts)
            );
          } else {
            const bounce = Math.floor(easeInOutSine(velocityAbs / Layout.MaxVelocity, maxBounce));
            view.value = View.schedule;
            instance.$_drag_calendar_height!.value = sequence(
              timing(maxHeight + bounce, animOpts, callback),
              timing(maxHeight, bounceOpts)
            );
          }
        }
        instance.$_drag_bar_rotate!.value = delay(280, timing(0, bounceOpts));
      }
      instance.$_drag_view_bar_translate_!.value = timing(view.value & View.week ? 60 : 0, animOpts);
      instance.$_drag_schedule_opacity!.value = timing(view.value & View.schedule ? 1 : 0, animOpts);
    });
  }

  toView(view: View, animate: boolean = false) {
    const instance = this._instance_;
    if (instance._view_ & view) return Promise.resolve();
    const { minHeight, maxHeight, mainHeight } = Layout.layout!;
    const animOpts = { duration: 280, easing: Easing.out(Easing.sin) };

    return new Promise<void>(resolve => {
      const callback = () => {
        'worklet';
        runOnJS(resolve)();
      };
      const height = view & View.week ? minHeight : view & View.schedule ? maxHeight : mainHeight;
      const viewBarTrans = view & View.week ? 60 : 0;
      const scheduleOpacity = view & View.schedule ? 1 : 0;
      instance.$_drag_calendar_height!.value = animate ? timing(height, animOpts, callback) : height;
      instance.$_drag_view_bar_translate_!.value = animate ? timing(viewBarTrans, animOpts) : viewBarTrans;
      instance.$_drag_schedule_opacity!.value = animate ? timing(scheduleOpacity, animOpts) : scheduleOpacity;
      if (!animate) resolve();
    });
  }

  public clear() {
    const instance = this._instance_;

    const keys = [...this._style_ids_.keys()];
    for (const key of keys) {
      const id = this._style_ids_.get(key);
      if (id) clearAnimated(instance, key, [id]);
    }
    this._style_ids_.clear();

    instance.$_current = void 0;
    instance.$_drag_state = void 0;
    instance.$_drag_calendar_height = void 0;
    instance.$_drag_panel_trans = void 0;
    instance.$_drag_bar_rotate = void 0;
    instance._dragger_ = void 0;
  }
}
