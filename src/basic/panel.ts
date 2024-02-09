/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 面板数据处理
 * @Author: lspriv
 * @LastEditTime: 2024-02-09 13:27:43
 */
import { CalendarHandler } from '../interface/component';
import { Layout } from './layout';
import { CALENDAR_PANELS, View } from './constants';
import { circularDiff, flagView, nextTick, middle } from './tools';
import { mul, div } from '../utils/calc';
import { nonNullable } from '../utils/shared';
import {
  getMonthDays,
  normalDate,
  offsetDate,
  inMonthDate,
  weekRange,
  findInWeeks,
  monthDiff,
  isSameDate,
  getDateInfo
} from '../interface/calendar';

import type { PartRequired } from '../utils/shared';
import type { CalendarData, CalendarPanel } from '../interface/component';
import type { CalendarDay, CalendarMonth, WxCalendarFullYear } from '../interface/calendar';

type RefreshFields = PartRequired<CalendarData, 'current' | 'checked'>;

export class PanelTool extends CalendarHandler {
  public createMonthPanels(checked: CalendarDay) {
    const current = this._instance_.data.current;
    const { year, month, day } = checked;
    return Array.from({ length: CALENDAR_PANELS }, (_, i) => {
      const date = inMonthDate(year, month + i - current, day);
      return this.createPanel(date, i, this.calcWeekOffset(offsetDate(checked, (i - current) * 7)));
    });
  }

  public createWeekPanels(checked: CalendarDay) {
    const current = this._instance_.data.current;
    const panels: Array<CalendarPanel> = [];
    for (let i = 0; i < CALENDAR_PANELS; i++) {
      const date = offsetDate(checked, (i - current) * 7);
      panels.push(this.createPanel(date, i, this.calcWeekOffset(date), panels));
    }
    return panels;
  }

  public createYearPanels(checked: CalendarDay) {
    const current = this._instance_.data.current;
    return Array.from({ length: CALENDAR_PANELS }, (_, i) => this.createYearPanel(checked.year + i - current, i));
  }

  private refreshPanels(sets: RefreshFields) {
    const { current, checked } = sets;
    const isWeekView = this._instance_._view_ & View.week;
    const offsetChange = !this.skyline && !!isWeekView;
    const panels: Array<CalendarPanel> = [];
    for (let i = 0; i < CALENDAR_PANELS; i++) {
      const panel = this._instance_.data.panels[i];
      const diff = circularDiff(i, current);
      const weekdate = offsetDate(checked!, diff * 7);
      const offset = this.calcWeekOffset(weekdate);
      const date = isWeekView ? weekdate : inMonthDate(checked!.year, checked!.month + diff, checked!.day);
      if (panel.year !== date.year || panel.month !== date.month) {
        const _panel = this.createPanel(date, i, offset, panels);
        sets[`panels[${i}]`] = _panel;
        panels.push(_panel);
        if (offsetChange) sets.offsetChange = true;
      } else if (panel.offset !== offset) {
        sets[`panels[${i}].offset`] = offset;
        if (offsetChange) sets.offsetChange = true;
      }
    }
  }

  /**
   * 刷新面板数据
   * @param offset 偏移量，单位月视图下为月，周视图下为周
   * @param checked 要设置的选中日期，不传则由offset计算出偏移后的月份同天或同星期日
   * @param curr 要设置的面板滑块的index，不传则由offset计算得出偏移后的index
   */
  public async refresh(offset: number, checked?: CalendarDay, current?: number, vibrate?: boolean) {
    const instance = this._instance_;
    const isWeekView = instance._view_ & View.week;
    const mod = (instance.data.current + offset) % CALENDAR_PANELS;
    current = current ?? (mod >= 0 ? mod : mod + CALENDAR_PANELS);
    if (!checked) {
      const { year, month, day } = instance.data.checked!;
      checked = isWeekView ? normalDate(year, month, day + offset * 7) : inMonthDate(year, month + offset, day);
    }

    const sets: RefreshFields = { current, info: getDateInfo(checked, isWeekView), checked };

    this.refreshPanels(sets);

    instance._pointer_.update(sets, vibrate);
    instance.setData(sets);
    await this.update();
  }

  public async refreshView(view: View, fixed?: boolean) {
    const instance = this._instance_;
    const { current, checked } = instance.data;
    instance._view_ = view;

    const currView = flagView(view);
    const isWeekView = view & View.week;

    const sets: RefreshFields = { currView, info: getDateInfo(checked!, isWeekView), checked, current };
    this.refreshPanels(sets);

    if (nonNullable(fixed)) sets.viewFixed = fixed;

    instance.setData(sets);
    await this.update();
  }

  public refreshOffsets(sets: Partial<CalendarData>, current?: number, checked?: CalendarDay): void;
  public refreshOffsets(sets: Partial<CalendarData>, excludes?: number[]): void;

  public refreshOffsets(sets: Partial<CalendarData>, excludes?: number | number[], checked?: CalendarDay) {
    const instance = this._instance_;

    const isExcludes = Array.isArray(excludes);

    const $current = sets.current ?? instance.data.current;
    const $checked = sets.checked ?? instance.data.checked!;

    const _current = isExcludes ? $current : <number>excludes ?? $current;
    const _checked = isExcludes ? $checked : checked || $checked;

    const _exclude = isExcludes ? excludes : [];

    const offsetChange = !this.skyline && !!(instance._view_ & View.week);

    for (let i = 0; i < CALENDAR_PANELS; i++) {
      if (_exclude.includes(i)) continue;
      const panel = this._instance_.data.panels[i];
      const diff = circularDiff(i, _current);
      const offset = this.calcWeekOffset(offsetDate(_checked, diff * 7));
      if (panel.offset !== offset) {
        sets[`panels[${i}].offset`] = offset;
        if (offsetChange) sets.offsetChange = true;
      }
    }
  }

  public async refreshAnnualPanels(offset: number, curr?: number, nonAnimate: boolean = false) {
    const instance = this._instance_;
    const annualCurr = instance.data.annualCurr ?? middle(CALENDAR_PANELS);
    const year = instance.data.years[annualCurr].year + offset;
    const mod = (annualCurr + offset) % CALENDAR_PANELS;
    const current = curr ?? (mod >= 0 ? mod : mod + CALENDAR_PANELS);

    const sets: Partial<CalendarData> = { annualCurr: current };
    if (nonAnimate) sets.annualDuration = 0;
    const idxs: number[] = [];
    for (let i = 0; i < CALENDAR_PANELS; i++) {
      const annual = instance.data.years[i];
      const diff = circularDiff(i, current);
      const y = year + diff;
      if (annual.year !== y) {
        const panel = this.createYearPanel(y, i);
        sets[`years[${i}]`] = { key: panel.key, year: panel.year, subinfo: panel.subinfo };
        instance._years_.splice(i, 1, { year: panel.year, months: panel.months, marks: panel.marks });
        idxs.push(i);
      }
    }
    instance.setData(sets);
    await nextTick();
    instance._printer_.update(idxs);
  }

  /**
   * 创建单个月/周面板
   * @param date
   */
  public createPanel(date: CalendarDay, key: number, offset: number, panels: Array<CalendarPanel> = []): CalendarPanel {
    const instance = this._instance_;
    const panelKey = `panel_${key}`;
    const panel = [...instance.data.panels, ...panels].find(p => p.year === date.year && p.month === date.month);

    if (panel) {
      const { year, month, weeks, count } = panel;
      return { year, month, weeks, count, key: panelKey, offset };
    }

    const weekstart = instance.data.weekstart;
    const month = instance._calendar_.createMonth({ year: date.year, month: date.month }, weekstart);

    return { ...month, key: panelKey, offset };
  }

  public createYearPanel(year: number, key: number) {
    const instance = this._instance_;
    const weekstart = instance.data.weekstart;
    const panel = instance._calendar_.createYear(year, weekstart);
    return { ...panel, key: `y_${key}` } as typeof panel;
  }

  private findWeekPanelIdx(date: CalendarDay): number {
    const { checked, current, weekstart } = this._instance_.data;
    const d = new Date(date.year, date.month - 1, date.day);
    for (let i = 0; i < CALENDAR_PANELS; i++) {
      const diff = circularDiff(i, current);
      const [start, end] = weekRange(offsetDate(checked!, diff * 7), weekstart);
      if (d >= start && d <= end) return i;
    }
    return -1;
  }

  public async toDate(date: string | number | Date | CalendarDay) {
    const instance = this._instance_;
    const { current, panels, checked } = instance.data;
    const d = normalDate(date);
    if (isSameDate(d, checked!)) return;
    const isWeekView = instance._view_ & View.week;
    const idx = isWeekView
      ? this.findWeekPanelIdx(d)
      : panels.findIndex(mon => mon.year === d.year && mon.month === d.month);

    if (idx === current) {
      if (isWeekView) {
        const find = findInWeeks(panels[idx].weeks, _d => isSameDate(_d, d));
        find && (await this.toWeekAdjoin(find, false));
      } else {
        const sets: Partial<CalendarData> = { info: getDateInfo(d, isWeekView), checked: d };
        this.refreshOffsets(sets, current, d);
        instance._pointer_.update(sets);
        instance.setData(sets);
        await this.update();
      }
    } else {
      const pannel = instance.data.panels[current];
      const offset = monthDiff(pannel, { year: d.year, month: d.month });
      await this.refresh(offset, d, idx >= 0 ? idx : current);
    }
    instance.triggerDateChange(d);
  }

  public async toWeekAdjoin(checked: CalendarDay, vibrate: boolean = true) {
    const instance = this._instance_;
    const current = instance.data.current;
    const sets: Partial<CalendarData> = { info: getDateInfo(checked, true), checked };
    const offset = this.calcWeekOffset(checked);
    sets[`panels[${current}]`] = this.createPanel(checked, current, offset);
    instance._pointer_.update(sets, false, instance.data.checked!, true);
    if (!this.skyline) sets.offsetChange = true;
    instance.setData(sets);
    await nextTick();
    await this.update();
    instance._pointer_.update(void 0, vibrate);
  }

  public async toAnnualMonth(mon: CalendarMonth, toMonthView: boolean = true) {
    const instance = this._instance_;
    const { checked, current, panels } = instance.data;

    const currPanel = panels[current];
    const isCurrMonth = currPanel.year === mon.year && currPanel.month === mon.month;
    if (isCurrMonth && (instance._view_ & View.month || !toMonthView)) return;

    const date = inMonthDate(mon.year, mon.month, checked!.day);

    const idx = panels.findIndex(p => p.year === mon.year && p.month === mon.month);

    const sets: RefreshFields = { current: idx >= 0 ? idx : current, checked: date };

    if (toMonthView && !(instance._view_ & View.month)) {
      const currView = flagView(View.month);
      sets.currView = currView;
      sets.info = getDateInfo(date, false);
      if (this.skyline) instance._dragger_?.toView(View.month, false);
      else sets.initView = 'month';
      instance._view_ = View.month;
    }

    this.refreshPanels(sets);
    instance._pointer_.update(sets, false, void 0, true);
    instance.setData(sets);
    await this.update();

    if (!isSameDate(date, checked!)) instance.triggerDateChange(date);
  }

  public toYear(year: number) {
    const instance = this._instance_;
    const current = instance.data.annualCurr ?? middle(CALENDAR_PANELS);
    const annual = instance.data.years[current];
    if (nonNullable(instance.data.annualCurr) && annual.year === year) return Promise.resolve();

    const idx = instance.data.years.findIndex(y => y.year === year);
    const offset = year - annual.year;
    return this.refreshAnnualPanels(offset, idx >= 0 ? idx : current, !this.skyline);
  }

  public getFullYear(idx: number): WxCalendarFullYear {
    return { ...this._instance_.data.years[idx], ...this._instance_._years_[idx] };
  }

  public async update() {
    await nextTick();
    if (this.skyline) this._instance_._dragger_!.update();
  }

  private calcWeekOffset(date: CalendarDay) {
    if (this.skyline) return 0;
    return PanelTool.calcPanelOffset(date, this._instance_.data.weekstart);
  }

  public static calcPanelOffset(date: CalendarDay, weekstart: number): number {
    const { year, month, day } = date;
    const first = new Date(year, month - 1, 1);
    const lastLen = Math.abs(first.getDay() + 7 - weekstart) % 7;
    const len = getMonthDays({ year, month });
    const weeksLen = Math.ceil((lastLen + len) / 7);
    const idx = Math.ceil((day + lastLen) / 7) - 1;
    return mul(idx, div(Layout.layout!.mainHeight, weeksLen));
  }
}
