/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 年度面板绘制
 * @Author: lspriv
 * @LastEditTime: 2024-06-11 02:15:55
 */
import { CalendarHandler } from '../interface/component';
import { WxCalendar, getAnnualMarkKey, isToday, inMonthDate, sortWeeks, themeStyle } from '../interface/calendar';
import { Layout } from './layout';
import { CALENDAR_PANELS, SELECTOR } from './constants';
import { Nullable, promises } from '../utils/shared';
import { hasLayoutArea, nodeRect, viewportOffset } from './tools';

import type { CalendarDay, CalendarMonth, WcAnnualDateStyle, WcAnnualMonth, WcFullYear } from '../interface/calendar';
import type { Theme } from './layout';

const ANIMATE_FRAMES = 20;

interface CanvasElementSize {
  width: number;
  height: number;
}

interface CanvasElementResult extends CanvasElementSize {
  node: HTMLCanvasElement;
}

interface Canvas extends CanvasElementSize {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  frame: number;
  state: PrinterState;
  rendered: boolean;
  year?: number;
}

interface Location {
  x: number;
  y: number;
}

interface StateValue {
  min: number;
  max: number;
}

enum PrinterState {
  minimize = 1 << 0,
  maximize = 1 << 1
}

interface TitleFrames {
  titleHeight: number;
  titleOffsetY: number;
  titleFontSize: number;
  titlePaddingX: number;
  titleColor: string;
}

interface MonthFrames {
  monthPaddingX: number;
}

interface WeekFrames {
  weekHeight: number;
  weekFontSize: number;
  weekPaddingY: number;
  weekColor: string;
}

interface DateFrames {
  dateRow: number;
  dateCol: number;
  dateFontSize: number;
  dateHeight: number;
  dateOuterHeight?: number;
  dateColor: string;
  restColor: string;
  checkedRadius: number;
  checkedOffset: number;
}

interface MarkFrames {
  markWidth: number;
  markHeight: number;
}

interface AnnualFrames extends MonthFrames, TitleFrames, WeekFrames, DateFrames, MarkFrames {
  alpha: number;
  padding: number;
  width: number;
  height: number;
  row: number;
  translateX: number;
  translateY: number;
  checked?: Nullable<CalendarDay>;
  todayIsChecked?: boolean;
  todayCheckedColor?: string;
}

const createState = (max: number, min: number = 0) => {
  return { min, max } as StateValue;
};

const createCanvas = (
  node: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
  width: number,
  height: number
): Canvas => ({ canvas: node, ctx, width, height, frame: 0, state: PrinterState.minimize, rendered: false });

const iframe = (from: number, to: number, frame: number): number => {
  if (frame <= 0) return from;
  if (frame >= ANIMATE_FRAMES) return to;
  const c = Math.sin(((frame / ANIMATE_FRAMES) * Math.PI) / 2);
  return c * (to - from) + from;
};

/** 主题色 */
const PrimaryColor = '#409EFF';

/** 深浅模式色号 */
const PrinterTheme = {
  light: {
    title: '#333',
    week: '#ABABAB',
    date: '#333',
    rest: '#ABABAB',
    checked: '#FFF',
    checkedBg: '#F5F5F5'
  },
  dark: {
    title: '#D9D9D9',
    week: '#484848',
    date: '#D9D9D9',
    rest: '#484848',
    checked: '#D9D9D9',
    checkedBg: '#262626'
  }
} as const;

type PrinterThemeMode = (typeof PrinterTheme)['dark' | 'light'];
type PrinterThemeKey = keyof PrinterThemeMode;
const color = <K extends PrinterThemeKey>(key: K): PrinterThemeMode[K] => PrinterTheme[Layout.theme!][key];

interface ThemeListener {
  (res: { theme?: Theme }): void;
}

export class YearPrinter extends CalendarHandler {
  private _canvas_: Array<Canvas> = [];
  private _weeks_: string;

  private _week_size_: StateValue;
  private _week_height_: number;
  private _week_padding_y_: StateValue;

  private _date_size_: StateValue;
  private _date_height_: number;

  private _pannel_padding_: StateValue;
  private _month_padding_: StateValue;

  private _title_size_: StateValue;
  private _title_height_: number;
  private _title_padding_x_: number;
  private _title_padding_y_: number;

  private _mark_width_: StateValue;
  private _mark_height_: StateValue;

  private _checked_radius_max_: number;
  private _checked_offset_max_: number;

  /** 最大化状态下面板水平偏移量（根据选择月份计算） */
  private _translate_x_: number = 0;
  /** 最大化状态下面板垂直偏移量（根据选择月份计算） */
  private _translate_y_: number = 0;
  /** 日历组件左侧处于页面中的位置 */
  private _calendar_x_: number = 0;
  /** 日历组件顶端处于页面中的位置 */
  private _calendar_y_: number = 0;
  /** 非自定义页面导航栏的情况下年度面板需要考虑头部高度 */
  private _header_offset_: number = 0;

  /** 字体 */
  private _font_: string;

  /** 处理系统深色模式的监听 */
  private _theme_listener_?: ThemeListener;

  public renderCheckedBg: boolean = true;

  public async initialize() {
    const { fonts, weekstart, darkside } = this._instance_.data;
    this._font_ = fonts;
    this._weeks_ = sortWeeks(weekstart);
    if (darkside) this.bindThemeChange();
    this.initializeSize();
    return this.initializeRender();
  }

  private initializeSize() {
    const titleSizeMin = Layout.rpxToPx(40);
    const titleSizeMax = Layout.rpxToPx(60);
    this._title_size_ = createState(titleSizeMax, titleSizeMin);

    const weekSizeMin = Layout.rpxToPx(16);
    const weekSizeMax = Layout.rpxToPx(20);
    this._week_size_ = createState(weekSizeMax, weekSizeMin);

    const weekPaddingY = Layout.rpxToPx(10);
    this._week_padding_y_ = createState(weekPaddingY);

    const dateSizeMin = Layout.rpxToPx(20);
    const dateSizeMax = Layout.rpxToPx(36);
    this._date_size_ = createState(dateSizeMax, dateSizeMin);

    const pannelPaddingMin = Layout.rpxToPx(16);
    const pannelPaddingMax = Layout.rpxToPx(0);
    this._pannel_padding_ = createState(pannelPaddingMax, pannelPaddingMin);

    this._title_padding_x_ = Layout.rpxToPx(20);

    const monthPaddingMin = Layout.rpxToPx(16);
    const monthPaddingMax = Layout.rpxToPx(10);
    this._month_padding_ = createState(monthPaddingMax, monthPaddingMin);

    const markWidthMin = Layout.rpxToPx(14);
    const markWidthMax = Layout.rpxToPx(24);
    this._mark_width_ = createState(markWidthMax, markWidthMin);

    const markHeightMin = Layout.rpxToPx(4);
    const markHeightMax = Layout.rpxToPx(8);
    this._mark_height_ = createState(markHeightMax, markHeightMin);

    this._title_height_ = Layout.rpxToPx(100);
    this._title_padding_y_ = Layout.rpxToPx(20);
    this._week_height_ = Layout.rpxToPx(50);
    this._date_height_ = Layout.rpxToPx(100 - 24);
    this._checked_radius_max_ = Layout.rpxToPx(50);
    this._checked_offset_max_ = Layout.rpxToPx(12);

    if (!this._instance_.data.customNavBar) {
      this._header_offset_ = Layout.layout!.menuBottom - this._title_height_;
    }
    const hasHeader = hasLayoutArea(this._instance_.data.areaHideCls, 'header');
    this._header_offset_ -= hasHeader ? 0 : Layout.rpxToPx(80);
  }

  private initializeCanvas(id: string) {
    return new Promise<Canvas>(resolve => {
      const query = this._instance_.createSelectorQuery().in(this._instance_);
      query
        .select(id)
        .fields({ node: true, size: true, context: true })
        .exec((res: Array<CanvasElementResult>) => {
          const { node, width, height } = res[0];
          const ctx = node?.getContext('2d');
          const dpr = Layout.dpr;
          node && (node.width = width * dpr);
          node && (node.height = height * dpr);
          ctx?.scale(dpr, dpr);

          resolve(createCanvas(node, ctx, width, height));
        });
    });
  }

  private async initializeRender() {
    if (!this.skyline) {
      this._canvas_ = await promises(
        Array.from({ length: CALENDAR_PANELS }, (_, i) => {
          return this.initializeCanvas(`${SELECTOR.ANNUAL_CANVAS}${i}`);
        })
      );
      this._canvas_.forEach((canvas, i) => {
        this.render(canvas, this._instance_._panel_.getFullYear(i));
      });
    }
  }

  private renderFrame(canvas: Canvas): AnnualFrames {
    const { state, frame } = canvas;
    const isMax = state & PrinterState.maximize;

    /** 全局透明度 */
    const _alpha = isMax ? 1 : +iframe(1, 0, frame).toFixed(1);

    const alpha = state & PrinterState.minimize && frame ? Math.max((_alpha * 10 * 15 - 50) / 100, 0) : _alpha;

    /** 面板内边距 */
    const paddingFr = isMax ? this._pannel_padding_.max : this._pannel_padding_.min;
    const paddingTo = isMax ? this._pannel_padding_.min : this._pannel_padding_.max;
    const padding = iframe(paddingFr, paddingTo, frame);

    /** 面板水平偏移 */
    const translateXFr = isMax ? this._translate_x_ + this._calendar_x_ : 0;
    const translateXTo = isMax ? 0 : this._translate_x_ + this._calendar_x_;
    const translateX = iframe(translateXFr, translateXTo, frame);

    /** 面板垂直偏移 */
    const translateYTt = this._translate_y_ + this._header_offset_;
    const translateYFr = isMax ? translateYTt : 0;
    const translateYTo = isMax ? 0 : translateYTt;
    const translateY = iframe(translateYFr, translateYTo, frame);

    const minWidth = (canvas.width - padding * 2) / 3;
    const minHeight = (canvas.height - padding) / 4;

    const calendarWidth = this._instance_.$_calendar_width.value;

    /** 月份宽度 */
    const widthFr = isMax ? calendarWidth : minWidth;
    const widthTo = isMax ? minWidth : calendarWidth;
    const width = iframe(widthFr, widthTo, frame);

    /** 月份高度 */
    const heightFr = isMax ? canvas.width : minHeight;
    const heightTo = isMax ? minHeight : canvas.width;
    const height = iframe(heightFr, heightTo, frame);

    /** 月份单位高度 */
    const row = height / 10;

    /** 月份水平内边距 */
    const monthPaddingXFr = isMax ? this._month_padding_.max : this._month_padding_.min;
    const monthPaddingXTo = isMax ? this._month_padding_.min : this._month_padding_.max;
    const monthPaddingX = iframe(monthPaddingXFr, monthPaddingXTo, frame);

    /** 日期单位高度和宽度 */
    const dateRow = (height - 3 * row) / 6;
    const dateCol = (width - monthPaddingX * 2) / 7;

    /** 月标题高度 */
    const titleHeightFr = isMax ? this._title_height_ : row * 2;
    const titleHeightTo = isMax ? row! * 2 : this._title_height_;
    const titleHeight = iframe(titleHeightFr, titleHeightTo, frame);

    const titleYMax = this._title_height_ / 2 + this._title_padding_y_ / 2 + this._title_size_.max / 2;
    const titleYMin = row + row / 2 + this._week_size_.min / 2;

    /** 月标题字体垂直偏移 */
    const titleOffsetYFr = isMax ? titleYMax : titleYMin;
    const titleOffsetYTo = isMax ? titleYMin : titleYMax;
    const titleOffsetY = iframe(titleOffsetYFr, titleOffsetYTo, frame);

    /** 月标题字体大小 */
    const titleSizeFr = isMax ? this._title_size_.max : this._title_size_.min;
    const titleSizeTo = isMax ? this._title_size_.min : this._title_size_.max;
    const titleFontSize = iframe(titleSizeFr, titleSizeTo, frame);

    /** 星期字体大小 */
    const weekSizeFr = isMax ? this._week_size_.max : this._week_size_.min;
    const weekSizeTo = isMax ? this._week_size_.min : this._week_size_.max;
    const weekFontSize = iframe(weekSizeFr, weekSizeTo, frame);

    /** 星期字体大小 */
    const weekHeightFr = isMax ? this._week_height_ : row;
    const weekHeightTo = isMax ? row : this._week_height_;
    const weekHeight = iframe(weekHeightFr, weekHeightTo, frame);

    /** 星期垂直内边距 */
    const weekPaddingYFr = isMax ? this._week_padding_y_.max : this._week_padding_y_.min;
    const weekPaddingYTo = isMax ? this._week_padding_y_.min : this._week_padding_y_.max;
    const weekPaddingY = iframe(weekPaddingYFr, weekPaddingYTo, frame);

    /** 日期字体大小 */
    const dateSizeFr = isMax ? this._date_size_.max : this._date_size_.min;
    const dateSizeTo = isMax ? this._date_size_.min : this._date_size_.max;
    const dateFontSize = iframe(dateSizeFr, dateSizeTo, frame);

    /** 日期内部高度 */
    const dateHeightFr = isMax ? this._date_height_ : row!;
    const dateHeightTo = isMax ? row! : this._date_height_;
    const dateHeight = iframe(dateHeightFr, dateHeightTo, frame);

    const markWidthFr = isMax ? this._mark_width_.max : this._mark_width_.min;
    const markWidthTo = isMax ? this._mark_width_.min : this._mark_width_.max;
    const markWidth = iframe(markWidthFr, markWidthTo, frame);

    const markHeightFr = isMax ? this._mark_height_.max : this._mark_height_.min;
    const markHeightTo = isMax ? this._mark_height_.min : this._mark_height_.max;
    const markHeight = iframe(markHeightFr, markHeightTo, frame);

    const radiusMin = Math.min((minWidth - monthPaddingX * 2) / 14, (minHeight - 3 * row) / 12);
    const checkedRadiusFr = isMax ? this._checked_radius_max_ : radiusMin;
    const checkedRadiusTo = isMax ? radiusMin : this._checked_radius_max_;
    const checkedRadius = iframe(checkedRadiusFr, checkedRadiusTo, frame);

    const checkedOffsetFr = isMax ? this._checked_offset_max_ : 0;
    const checkedOffsetTo = isMax ? 0 : this._checked_offset_max_;
    const checkedOffset = iframe(checkedOffsetFr, checkedOffsetTo, frame);

    return {
      alpha,
      padding,
      width,
      height,
      row,
      translateX,
      translateY,
      monthPaddingX,
      titleHeight,
      titleOffsetY,
      titleFontSize,
      titlePaddingX: this._title_padding_x_,
      titleColor: color('title'),
      weekHeight,
      weekFontSize,
      weekPaddingY,
      weekColor: color('week'),
      dateRow,
      dateCol,
      dateFontSize,
      dateHeight,
      dateColor: color('date'),
      restColor: color('rest'),
      markWidth,
      markHeight,
      checkedRadius,
      checkedOffset
    };
  }

  private calcDateOuterHeight(canvas: Canvas, month: WcAnnualMonth, frame: AnnualFrames): number {
    const isMax = canvas.state & PrinterState.maximize;
    const { mainHeight } = Layout.layout!;
    const heightMax = mainHeight / month.weeks;
    const heightFr = isMax ? heightMax : frame.dateRow;
    const heightTo = isMax ? frame.dateRow : heightMax;
    return iframe(heightFr, heightTo, canvas.frame);
  }

  private attachChecked(frame: AnnualFrames, canvas: Canvas, year: number, month?: number) {
    const isMax = canvas.state & PrinterState.maximize;
    const checked = this._instance_.data.checked!;
    frame.checked = isMax || !month ? null : inMonthDate(year, month, checked.day);
    frame.todayIsChecked = !!frame.checked && isToday(frame.checked);
    frame.todayCheckedColor =
      this.renderCheckedBg && (frame.todayIsChecked || isMax || !canvas.frame) ? color('checked') : PrimaryColor;
  }

  public render(canvas: Canvas, year: WcFullYear, month?: number) {
    if (!canvas || !canvas.ctx) return;
    if (canvas.year !== year.year) canvas.year = year.year;
    const { ctx } = canvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const frame = this.renderFrame(canvas);
    this.attachChecked(frame, canvas, year.year, month);

    for (let i = 0; i < 12; i++) {
      const x = frame.translateX + frame.padding + (i % 3) * frame.width;
      const y = frame.translateY + frame.padding + Math.floor(i / 3) * frame.height;
      this.renderMonth(canvas, year, i, { x, y }, frame, month);
    }

    if (!canvas.rendered) canvas.rendered = true;
  }

  private renderMonth(
    canvas: Canvas,
    year: WcFullYear,
    i: number,
    locate: Location,
    frame: AnnualFrames,
    month?: number
  ) {
    const { x, y } = locate;
    const mon = year.months[i];

    const alpha = !month || month === mon.month ? 1 : frame.alpha;
    canvas.ctx!.globalAlpha = alpha;

    this.renderMonthTitle(canvas, mon, { x, y }, frame, alpha);
    this.renderWeek(canvas, { x, y: y + frame.titleHeight }, frame);
    const _y = y + frame.titleHeight + frame.weekHeight;
    frame.dateOuterHeight = this.calcDateOuterHeight(canvas, mon, frame);
    if (this.renderCheckedBg) this.renderChecked(canvas, mon, { x, y: _y }, frame);
    this.renderDates(canvas, mon, year.marks, { x, y: _y }, frame, alpha);
  }

  private renderMonthTitle(canvas: Canvas, mon: WcAnnualMonth, locate: Location, frame: AnnualFrames, alpha: number) {
    const { ctx, state } = canvas;
    const { x, y } = locate;

    /** 回到主面板时月份标题隐藏 */
    ctx!.globalAlpha = state & PrinterState.maximize ? alpha : frame.alpha;

    const { year, month } = WxCalendar.today;
    const curr = mon.year === year && mon.month === month;

    ctx!.font = `bold ${frame.titleFontSize}px ${this._font_}`;
    ctx!.textBaseline = 'bottom';
    ctx!.textAlign = 'left';
    ctx!.fillStyle = curr ? PrimaryColor : frame.titleColor;
    ctx!.fillText(`${mon.month}月`, x + frame.titlePaddingX, y + frame.titleOffsetY);
    ctx!.globalAlpha = alpha;
  }

  private renderWeek(canvas: Canvas, locate: Location, frame: AnnualFrames) {
    const { ctx } = canvas;
    const { x, y } = locate;

    const _y = y + (frame.weekHeight + frame.weekPaddingY) / 2;

    ctx!.font = `${frame.weekFontSize}px ${this._font_}`;
    ctx!.textBaseline = 'middle';
    ctx!.textAlign = 'center';
    ctx!.fillStyle = frame.weekColor;

    for (let i = 0; i < 7; i++) {
      const _x = x + frame.monthPaddingX + i * frame.dateCol + frame.dateCol / 2;
      ctx!.fillText(this._weeks_[i], _x, _y);
    }
  }

  private renderChecked(canvas: Canvas, month: WcAnnualMonth, locate: Location, frame: AnnualFrames) {
    const today = WxCalendar.today;
    const hasToday = month.year === today.year && month.month === today.month;

    const { ctx, state } = canvas;
    const { x, y } = locate;

    const isMax = state & PrinterState.maximize;

    if (isMax && !hasToday) return;

    if (hasToday) {
      const ti = today.day - 1 + month.start;
      const tw = ti % 7;
      const trdx = Math.floor(ti / 7);

      const tx = x + frame.monthPaddingX + tw * frame.dateCol + frame.dateCol / 2;
      const ty = y + trdx * frame.dateOuterHeight! + frame.dateHeight / 2;

      if (isMax || frame.todayIsChecked || !canvas.frame) {
        ctx!.fillStyle = PrimaryColor;
        ctx!.beginPath();
        ctx!.arc(tx, ty + frame.checkedOffset, frame.checkedRadius, 0, 2 * Math.PI);
        ctx!.fill();
      }
    }

    if (!frame.todayIsChecked && frame.checked && frame.checked.month === month.month && canvas.frame) {
      const ci = frame.checked!.day - 1 + month.start;
      const cw = ci % 7;
      const crdx = Math.floor(ci / 7);

      const cx = x + frame.monthPaddingX + cw * frame.dateCol + frame.dateCol / 2;
      const cy = y + crdx * frame.dateOuterHeight! + frame.dateHeight / 2;

      ctx!.fillStyle = color('checkedBg');
      ctx!.beginPath();
      ctx!.arc(cx, cy + frame.checkedOffset, frame.checkedRadius, 0, 2 * Math.PI);
      ctx!.fill();
    }
  }

  private renderDates(
    canvas: Canvas,
    month: WcAnnualMonth,
    marks: WcFullYear['marks'],
    locate: Location,
    frame: AnnualFrames,
    alpha: number
  ) {
    const { ctx, state, frame: fr } = canvas;
    const { x, y } = locate;
    const height = frame.dateOuterHeight!;
    const showRest = state & PrinterState.maximize || !fr;

    ctx!.font = `bold ${frame.dateFontSize}px ${this._font_}`;
    ctx!.textBaseline = 'middle';
    ctx!.textAlign = 'center';

    for (let i = 0; i < month.days; i++) {
      if (i < month.start) continue;
      const w = i % 7;
      const rdx = Math.floor(i / 7);

      const _x = x + frame.monthPaddingX + w * frame.dateCol + frame.dateCol / 2;
      const _y = y + rdx * height + frame.dateHeight / 2;
      const locate = { x: _x, y: _y };

      const day = i - month.start + 1;
      const date = { year: month.year, month: month.month, day };
      const mark = marks.get(getAnnualMarkKey(date));

      const opacity = <number>themeStyle(mark?.style?.opacity);
      if (opacity) ctx!.globalAlpha = opacity;

      if (mark?.style?.bgColor) {
        this.renderDateBg(canvas, mark.style, locate, frame);
      }

      const color = <string>themeStyle(mark?.style?.color);

      ctx!.fillStyle =
        (color !== 'initial' && color) ||
        (isToday(date)
          ? frame.todayCheckedColor!
          : showRest && (mark?.rwtype === 'rest' || (this.isWeekend(w) && mark?.rwtype !== 'work'))
            ? frame.restColor
            : frame.dateColor);

      ctx!.fillText(`${day}`, _x, _y);
      ctx!.globalAlpha = alpha;

      this.renderMark(canvas, date, marks, locate, frame, alpha);
    }
  }

  private renderMark(
    canvas: Canvas,
    day: CalendarDay,
    marks: WcFullYear['marks'],
    locate: Location,
    frame: AnnualFrames,
    alpha: number
  ) {
    const mark = marks.get(getAnnualMarkKey(day));

    if (mark?.sub) {
      const ctx = canvas.ctx!;
      const _x = locate.x - frame.markWidth / 2;
      const _y = locate.y + frame.dateFontSize / 2 + this._mark_height_.min;
      const radius = frame.markHeight / 2;
      ctx.globalAlpha = canvas.state & PrinterState.maximize ? 1 : frame.alpha;
      ctx.fillStyle = mark.sub;

      ctx.save();
      ctx.beginPath();
      ctx.arc(_x + radius, _y + radius, radius, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.arc(_x + frame.markWidth - radius, _y + radius, radius, -0.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath();
      ctx.clip();
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = alpha;
    }
  }

  private renderDateBg(canvas: Canvas, style: WcAnnualDateStyle, locate: Location, frame: AnnualFrames) {
    const ctx = canvas.ctx!;
    const { x, y } = locate;
    const bgTLRadius = this.dateBgRadius(frame.checkedRadius, <number>themeStyle(style.bgTLRadius));
    const bgTRRadius = this.dateBgRadius(frame.checkedRadius, <number>themeStyle(style.bgTRRadius));
    const bgBLRadius = this.dateBgRadius(frame.checkedRadius, <number>themeStyle(style.bgBLRadius));
    const bgBRRadius = this.dateBgRadius(frame.checkedRadius, <number>themeStyle(style.bgBRRadius));

    const ws = themeStyle(style.bgWidth);
    const hw = ws ? Math.ceil((frame[ws] * 10) / 2) / 10 : frame.checkedRadius;
    const hh = frame.checkedRadius;
    const cy = y + frame.checkedOffset;

    ctx.fillStyle = <string>themeStyle(style.bgColor) || 'rgba(0,0,0,0)';

    ctx.save();
    ctx.beginPath();
    // top-left
    if (bgTLRadius) ctx.arc(x - hw + bgTLRadius, cy - hh + bgTLRadius, bgTLRadius, 1 * Math.PI, 1.5 * Math.PI);
    else ctx.moveTo(x - hw, cy - hh);

    // top-right
    if (bgTRRadius) ctx.arc(x + hw - bgTRRadius, cy - hh + bgTRRadius, bgTRRadius, 1.5 * Math.PI, 2 * Math.PI);
    else ctx.lineTo(x + hw, cy - hh);

    // bottom-right
    if (bgBRRadius) ctx.arc(x + hw - bgBRRadius, cy + hh - bgBRRadius, bgBRRadius, 0, 0.5 * Math.PI);
    else ctx.lineTo(x + hw, cy + hh);

    // bottom-left
    if (bgBLRadius) ctx.arc(x - hw + bgBLRadius, cy + hh - bgBLRadius, bgBLRadius, 0.5 * Math.PI, 1 * Math.PI);
    else ctx.lineTo(x - hw, cy + hh);

    ctx.closePath();
    ctx.clip();
    ctx.fill();
    ctx.restore();
  }

  private dateBgRadius(checkedRadius: number, radius?: number): number {
    if (!radius) return 0;
    if (radius > 50) return checkedRadius;
    return Math.floor((radius * checkedRadius * 2) / 100);
  }

  /**
   * 是否周末日
   * @param wdx 周内index
   */
  private isWeekend(wdx: number) {
    const mod = (wdx + this._instance_.data.weekstart) % 7;
    return mod === 0 || mod === 6;
  }

  private requestAnimation(canvas: Canvas, year: WcFullYear, month?: number) {
    return new Promise<void>(resolve => {
      this.requestAnimationFrame(canvas, year, month, resolve);
    });
  }

  private requestAnimationFrame(canvas: Canvas, year: WcFullYear, month?: number, callback?: () => void): void {
    if (canvas.frame >= ANIMATE_FRAMES) {
      canvas.frame = 0;
      return void callback?.();
    } else {
      canvas.canvas?.requestAnimationFrame(() => {
        canvas.frame++;
        this.render(canvas, year, month);
        this.requestAnimationFrame(canvas, year, month, callback);
      });
    }
  }

  private async getCanvas(idx: number): Promise<Canvas> {
    if (this._canvas_[idx]) return this._canvas_[idx];
    const canvas = await this.initializeCanvas(`${SELECTOR.ANNUAL_CANVAS}${idx}`);
    this._canvas_[idx] = canvas;
    return canvas;
  }

  private async inintializeTransform(canvas: Canvas, mdx: number) {
    const calendarWidth = this._instance_.$_calendar_width.value;
    this._translate_x_ = -calendarWidth * (mdx % 3);
    this._translate_y_ = -canvas.width * Math.floor(mdx / 3) + (this._calendar_y_ - Layout.layout!.menuBottom);
  }

  /**
   * 检查有未初始化的画布
   * @param excludes 排除检查的画布索引
   */
  private checkInitializeRender(excludes: number[] = []) {
    for (let i = 0; i < CALENDAR_PANELS; i++) {
      if (excludes.includes(i)) continue;
      const canvas = this._canvas_[i];
      const year = this._instance_._panel_.getFullYear(i);
      if (canvas && canvas.rendered && canvas.state & PrinterState.minimize && !canvas.frame) continue;

      (async () => {
        const canvas = await this.getCanvas(i);
        this.renderMinimize(canvas, year);
      })();
    }
  }

  /**
   *  重置为最小化状态
   * @param canvas 画布
   * @param year 年度
   */
  public renderMinimize(canvas: Canvas, year: WcFullYear) {
    canvas.frame = 0;
    canvas.state = PrinterState.minimize;
    this.render(canvas, year);
  }

  /**
   * 年度面板打开动画
   * @param mon 指定月份
   * @param rect 日历在页面的位置信息
   * @param prepose 动画开始之前的操作
   */
  public async open(
    mon: CalendarMonth,
    rect: WechatMiniprogram.BoundingClientRectCallbackResult,
    prepose?: () => void
  ) {
    this._calendar_x_ = rect.left;
    this._calendar_y_ = rect.top;

    const current = this._instance_.data.annualCurr!;
    const canvas = await this.getCanvas(current);
    await this.inintializeTransform(canvas, mon.month - 1);

    const year = this._instance_._panel_.getFullYear(current);

    const state = canvas.state;

    /** 重置状态和帧 */
    canvas.state = PrinterState.maximize;
    canvas.frame = 0;

    /** 渲染第0帧 */
    if (state & PrinterState.minimize) {
      this.render(canvas, year);
    }

    /** 执行动画前置操作 */
    prepose?.();

    /** 执行动画 */
    await this.requestAnimation(canvas, year);
    canvas.state = PrinterState.minimize;
    /** 检查并渲染其他面板 */
    this.checkInitializeRender([current]);
  }

  /**
   * 年度面板关闭动画
   * @param mon 指定月份
   */
  public async close(mon: CalendarMonth) {
    const current = this._instance_.data.annualCurr!;
    const canvas = this._canvas_[current];
    await this.inintializeTransform(canvas, mon.month - 1);

    const year = this._instance_._panel_.getFullYear(current);

    /** 重置状态和帧 */
    canvas.state = PrinterState.minimize;
    canvas.frame = 0;

    /** 执行动画 */
    await this.requestAnimation(canvas, year, mon.month);
    canvas.state = PrinterState.maximize;
  }

  /**
   * 点击画布获取对应的月份
   * @param ydx 年度数组索引
   * @param x 点击位置水平坐标
   * @param y 点击位置垂直坐标
   */
  public async getTapMonth(ydx: number, x: number, y: number): Promise<CalendarMonth> {
    const canvas = this._canvas_[ydx];
    const padding = this._pannel_padding_.min;

    const query = nodeRect(this._instance_);
    const [offset, rect] = await promises([viewportOffset(this._instance_), query(`${SELECTOR.ANNUAL_CANVAS}${ydx}`)]);

    const _y = y - (rect[0].top ?? 0) - offset.scrollTop;

    if (x < padding || _y < padding || x > canvas.width - padding) throw new Error('beyond the boundary');

    const width = (canvas.width - padding * 2) / 3;
    const height = (canvas.height - padding) / 4;

    const px = x - padding;
    const py = _y - padding;

    const mdx = Math.floor(px / width);
    const sdx = Math.floor(py / height);

    const month = sdx * 3 + mdx + 1;

    return { year: this._instance_.data.years[ydx].year, month };
  }

  /**
   * 更新
   * @param idxs 年度数组索引
   */
  public update(idxs?: number[]) {
    idxs = idxs || Array.from({ length: CALENDAR_PANELS }, (_, i) => i);
    idxs = [...new Set(idxs)];
    for (const idx of idxs) {
      const canvas = this._canvas_[idx];
      const year = this._instance_._panel_.getFullYear(idx);
      canvas && canvas.rendered && !canvas.frame && this.render(canvas, year);
    }
  }

  /**
   * 绑定系统主题改变事件的监听
   */
  public bindThemeChange() {
    this._theme_listener_ = res => {
      if (res.theme) {
        Layout.theme = res.theme;
        this.update();
      }
    };
    wx.onThemeChange(this._theme_listener_);
  }

  /**
   * 移除系统主题改变事件的监听
   */
  public cancelThemeChange() {
    if (this._theme_listener_) wx.offThemeChange(this._theme_listener_);
    this._theme_listener_ = void 0;
  }
}
