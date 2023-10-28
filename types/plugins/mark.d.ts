import type { Nullable } from '../utils/shared';
import type { Plugin, TrackDateResult } from '../basic/service';
import type { CalendarMark, CalendarDay } from '../interface/calendar';
export declare class MarkPlugin implements Plugin {
    static KEY: "_mark_";
    private _marks_;
    updateMarks(marks: Array<CalendarMark>): CalendarDay[];
    trackDate(date: CalendarDay): Nullable<TrackDateResult>;
}
