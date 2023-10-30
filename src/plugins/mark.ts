/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 处理组件marks属性的插件
 * @Author: lspriv
 * @LastEditTime: 2023-10-30 15:44:55
 */
import { normalDate } from '../interface/calendar';

import type { Nullable } from '../utils/shared';
import type { Plugin, TrackDateResult } from '../basic/service';
import type { CalendarMark, CalendarDay } from '../interface/calendar';

type WxCalendarMarkTypes = {
  [P in CalendarMark['type']]: P extends 'schedule' ? Nullable<Array<CalendarMark>> : Nullable<CalendarMark>;
};
type WxCalendarMarkMap = Map<string, WxCalendarMarkTypes>;

const formDateByKey = (key: string): CalendarDay => {
  const [year, month, day] = key.split('_');
  return { year: +year, month: +month, day: +day };
};

export class MarkPlugin implements Plugin {
  public static KEY = '_mark_' as const;

  private _marks_: WxCalendarMarkMap;

  public updateMarks(marks: Array<CalendarMark>) {
    const map: WxCalendarMarkMap = new Map();

    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      const date = normalDate(mark.year, mark.month, mark.day);
      const key = `${date.year}_${date.month}_${date.day}`;
      const _mark = map.get(key);
      if (_mark) {
        if (mark.type === 'schedule') {
          if (_mark.schedule) _mark.schedule.push(mark);
          else _mark.schedule = [mark];
        } else {
          _mark[mark.type] = mark;
        }
      } else {
        const form = mark.type === 'schedule' ? { schedule: [mark] } : { [mark.type]: mark };
        map.set(key, form as WxCalendarMarkTypes);
      }
    }

    const deletes = this._marks_
      ? [...this._marks_.entries()].flatMap(([key]) => {
          return map.has(key) ? [] : formDateByKey(key);
        })
      : [];

    const updates = [...map.keys()].map(key => formDateByKey(key));

    this._marks_ = map;
    return [...updates, ...deletes];
  }

  public trackDate(date: CalendarDay): Nullable<TrackDateResult> {
    if (!this._marks_) return null;

    const key = `${date.year}_${date.month}_${date.day}`;
    const mark = this._marks_.get(key);
    if (mark) {
      const result: TrackDateResult = {};

      if (mark.corner) result.corner = { text: mark.corner.text, color: mark.corner.color };
      if (mark.festival) result.festival = { text: mark.festival.text, color: mark.festival.color };
      if (mark.schedule) {
        result.schedule = mark.schedule.map((schedule, i) => ({
          text: schedule.text,
          color: schedule.color,
          bgColor: schedule.bgColor,
          key: `_ms_${date.month}_${date.day}_${i}`
        }));
      }
      return result;
    }

    return null;
  }
}
