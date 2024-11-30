/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 处理组件marks属性的插件
 * @Author: lspriv
 * @LastEditTime: 2024-11-25 21:28:50
 */
import { normalDate, formDateByStrKey, getMarkKey } from '../interface/calendar';

import type { Nullable } from '../utils/shared';
import type { Plugin, TrackDateResult } from '../basic/service';
import type {
  CalendarMark,
  CalendarStyleMark,
  CalendarDay,
  WcMarkDict,
  WcMarkMap,
  WcScheduleInfo
} from '../interface/calendar';
import type { CalendarInstance } from '../interface/component';

export class MarkPlugin implements Plugin {
  public static KEY = 'mark' as const;

  private _marks_: WcMarkMap;

  public update(instance: CalendarInstance, marks: Array<CalendarMark | CalendarStyleMark>) {
    const map: WcMarkMap = new Map();

    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      const date = mark.date ? normalDate(mark.date) : normalDate(+mark.year!, +mark.month!, +mark.day!);
      const key = `${date.year}_${date.month}_${date.day}`;
      const _mark = map.get(key);
      if (_mark) {
        if (mark.type === 'schedule') {
          if (_mark.schedule) _mark.schedule.push(mark);
          else _mark.schedule = [mark];
        } else {
          _mark[mark.type] = mark as any;
        }
      } else {
        const form = mark.type === 'schedule' ? { schedule: [mark] } : { [mark.type]: mark };
        map.set(key, form as WcMarkDict);
      }
    }

    const deletes = this._marks_
      ? [...this._marks_.entries()].flatMap(([key]) => {
          return map.has(key) ? [] : formDateByStrKey(key);
        })
      : [];

    const updates = [...map.keys()].map(key => formDateByStrKey(key));

    this._marks_ = map;

    if (instance._loaded_) instance._calendar_.service.updateDates([...updates, ...deletes]);
  }

  public PLUGIN_TRACK_DATE(date: CalendarDay): Nullable<TrackDateResult> {
    if (!this._marks_) return null;

    const key = `${date.year}_${date.month}_${date.day}`;
    const mark = this._marks_.get(key);
    if (mark) {
      const result: TrackDateResult = {};

      if (mark.style) result.style = mark.style.style;
      if (mark.solar) result.solar = { text: mark.solar.text, style: mark.solar.style };
      if (mark.corner) result.corner = { text: mark.corner.text, style: mark.corner.style };
      if (mark.festival) result.festival = { text: mark.festival.text, style: mark.festival.style };
      if (mark.schedule) {
        result.schedule = mark.schedule.map((schedule, i) => ({
          text: schedule.text,
          style: schedule.style,
          key: getMarkKey(key, MARK_PLUGIN_KEY)
        }));
      }
      return result;
    }

    return null;
  }

  PLUGIN_TRACK_SCHEDULE(date: CalendarDay, id?: string): Nullable<WcScheduleInfo> {
    if (!id) return null;
    const month = date.month - 1;
    return {
      dtStart: new Date(date.year, month, date.day),
      dtEnd: new Date(date.year, month, date.day + 1),
      origin: 'component_prop_marks'
    };
  }
}

export const MARK_PLUGIN_KEY = MarkPlugin.KEY;
