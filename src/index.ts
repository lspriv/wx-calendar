/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: wx-calendar组件
 * @Author: lspriv
 * @LastEditTime: 2024-11-25 21:44:23
 */

import {
  WxCalendar,
  normalDate,
  sortWeeks,
  isSameDate,
  isSameWeek,
  getDateInfo,
  getScheduleDetail
} from './interface/calendar';
import { VERSION, CALENDAR_PANELS, View, PURE_PROPS, VIEWS, SELECTOR, FONT } from './basic/constants';
import { Pointer, createPointer } from './basic/pointer';
import { PanelTool } from './basic/panel';
import { Layout } from './basic/layout';
import { Dragger } from './basic/drag';
import { AnnualPanelSwitch } from './basic/annual';
import { YearPrinter } from './basic/printer';
import { MARK_PLUGIN_KEY } from './plugins/mark';
import {
  isView,
  viewFlag,
  flagView,
  middle,
  nodeRect,
  isSkyline,
  InitPanels,
  InitWeeks,
  mergeStr,
  onceEmiter,
  layoutHideCls
} from './basic/tools';
import { promises, omit } from './utils/shared';
import { add, sub, div } from './utils/calc';

import type { WcYear, CalendarMark, CalendarStyleMark } from './interface/calendar';
import type { CalendarView } from './basic/tools';
import type {
  CalendarData,
  CalendarProp,
  CalendarMethod,
  CalendarCustomProp,
  CalendarPanel,
  CalendarExport,
  CalendarEventDetail,
  ScheduleEventDetail
} from './interface/component';

const initCurrent = middle(CALENDAR_PANELS);

Component<CalendarData, CalendarProp, CalendarMethod, CalendarCustomProp>({
  behaviors: ['wx://component-export'],
  options: {
    pureDataPattern: PURE_PROPS
  },
  properties: {
    darkmode: {
      type: Boolean,
      value: true
    },
    date: {
      type: Number,
      optionalTypes: [String],
      value: new Date().getTime()
    },
    view: {
      type: String,
      value: VIEWS.MONTH
    },
    marks: {
      type: Array,
      value: []
    },
    weekstart: {
      type: Number,
      value: 0
    },
    vibrate: {
      type: Boolean,
      value: true
    },
    font: {
      type: String,
      value: ''
    },
    style: {
      type: String,
      value: ''
    },
    sameChecked: {
      type: Boolean,
      value: false
    },
    customNavBar: {
      type: Boolean,
      value: true
    },
    viewGesture: {
      type: Boolean,
      value: true
    },
    areas: {
      type: Array
    },
    alignDate: {
      type: String,
      value: 'center'
    },
    showRest: {
      type: Boolean,
      value: true
    }
  },
  data: {
    renderer: 'unknown',
    checked: null,
    panels: InitPanels<CalendarPanel>('panel'),
    years: InitPanels<WcYear>('year'),
    weeks: InitWeeks(),
    current: initCurrent,
    currView: VIEWS.MONTH,
    initView: VIEWS.MONTH,
    transView: null,
    gesture: false,
    annualCurr: null,
    annualTop: '-150vh',
    annualOpacity: 0,
    annualDuration: 300,
    offsetChange: false,
    darkside: true,
    areaHideCls: '',
    layout: null,
    pointer: null,
    fonts: FONT,
    info: ''
  },
  lifetimes: {
    created() {
      Layout.initialize();
      this.initializeShared();
      this.initializeView();
    },
    async attached() {
      await this.initializeRects();
      this.initializeRender();
    },
    detached() {
      this._printer_?.cancelThemeChange();
      this._calendar_.service.dispatchEvent('detached');
    }
  },
  methods: {
    initializeShared() {
      const { shared } = wx.worklet;
      this.$_swiper_trans = shared(0);
      this.$_annual_trans = shared(0);
      this.$_gesture = shared(false);
      this.$_calendar_width = shared(0);
    },
    initializeView() {
      /**
       * 未设置view值或view值不合法时，默认View.month（月视图）
       */
      this._view_ = viewFlag(this.data.view as CalendarView);
      /**
       * 实例化拖拽控制器
       */
      isSkyline(this.renderer) && (this._dragger_ = new Dragger(this));
      /**
       * 实例化WxCalendar处理数据和插件
       */
      this._calendar_ = new WxCalendar(this);
    },
    initializeRender() {
      const isSkylineRender = isSkyline(this.renderer);

      this._pointer_ = new Pointer(this);
      this._panel_ = new PanelTool(this);
      this._annual_ = new AnnualPanelSwitch(this);
      this._printer_ = new YearPrinter(this);

      if (!isSkylineRender) {
        this._swiper_accumulator_ = 0;
        this._swiper_flag_ = false;
      }

      const checked = normalDate(this.data.date) || WxCalendar.today;
      const weeks = InitWeeks(sortWeeks(this.data.weekstart));
      const isWeekView = this._view_ & View.week;

      const panels = isWeekView ? this._panel_.createWeekPanels(checked) : this._panel_.createMonthPanels(checked);
      const _years = this._panel_.createYearPanels(checked);
      const years: Array<WcYear> = _years.map(({ key, year, subinfo }) => ({ key, year, subinfo }));
      this._years_ = _years.map(({ year, months, marks }) => ({ year, months, marks }));

      const fonts = this.data.font ? mergeStr([this.data.font, FONT]) : FONT;
      const initView = flagView(this._view_);
      this.$_gesture.value = this.data.viewGesture;
      const layout = omit(Layout.layout!, ['windowWidth', 'windowHeight']);
      const areaHideCls = layoutHideCls(this.data.areas);

      const sets: Partial<CalendarData> = {
        renderer: this.renderer!,
        fonts,
        checked,
        weeks,
        panels,
        years,
        offsetChange: !!(isWeekView && !isSkylineRender),
        layout,
        annualCurr: isSkylineRender ? null : initCurrent,
        currView: initView,
        initView,
        gesture: this.data.viewGesture,
        info: getDateInfo(checked, this.data.weekstart, isWeekView),
        pointer: createPointer(),
        darkside: this.data.darkmode && Layout.darkmode,
        areaHideCls
      };

      this._pointer_.update(sets);
      this._calendar_.service.dispatchEvent('attach', sets);

      this.setData(sets);
      this._loaded_ = true;

      wx.nextTick(async () => {
        if (isSkylineRender) this._dragger_!.bindAnimations();
        await this._printer_.initialize();
        this.trigger('load');
      });
    },
    async initializeRects() {
      const query = nodeRect(this);
      const [calendar, rects] = await promises([query(SELECTOR.CALENDAR), query(SELECTOR.WEEK_ITEM)]);
      const x = calendar[0].left.toFixed(1);
      const calendarWidth = calendar[0].width;
      this.$_calendar_width.value = isSkyline(this.renderer) ? calendarWidth : Math.round(calendarWidth);
      this._centres_ = rects.map(({ left, width }) => sub(add(left.toFixed(1), div(width.toFixed(1), 2)), x));
    },
    async refreshView({ view }) {
      if (this._view_ & view) return;
      if (!isSkyline(this.renderer)) return void (this._view_ = view);
      await this._panel_.refreshView(view);
      this.trigger('viewchange', { view: flagView(view) });
    },
    toToday() {
      this._panel_.toDate(WxCalendar.today);
    },
    async toggleView(view) {
      const _view = isView(view) ? view : this._view_ & View.week ? View.month : View.week;
      if (isSkyline(this.renderer)) await this._dragger_!.toView(_view, true);
      await this._panel_.refreshView(_view);
      this.trigger('viewchange', { view: flagView(this._view_) });
    },
    async calendarTransitionEnd() {
      if (isSkyline(this.renderer)) return;
      const currView = viewFlag(this.data.currView);
      if (currView === this._view_) return;
      await this._panel_.refreshView(this._view_);
      this.trigger('viewchange', { view: flagView(this._view_) });
    },
    selDate(e) {
      this._calendar_.service.interceptEvent('tap', e, async () => {
        const { wdx, ddx } = e.mark!;
        const panel = this.data.panels[this.data.current];
        const date = panel.weeks[wdx].days[ddx];
        const isWeekView = this._view_ & View.week;
        if (isWeekView && !isSameWeek(this.data.checked!, date, this.data.weekstart)) return;
        this.trigger('click', { checked: date });
        if (isSameDate(date, this.data.checked!)) return;
        const checked = normalDate(date);
        if (date.kind === 'current') {
          const sets = { info: getDateInfo(checked, this.data.weekstart, isWeekView), checked };
          if (!isWeekView) this._panel_.refreshOffsets(sets, this.data.current, checked);
          this._pointer_.update(sets, true);
          this.setData(sets);
          await this._panel_.update();
        } else {
          if (isWeekView) await this._panel_.toWeekAdjoin(date);
          else await this._panel_.refresh(date.kind === 'last' ? -1 : +1, checked, void 0, true);
        }
        this.trigger('change', { checked, source: 'click' });
      });
    },
    handlePointerAnimated() {
      this._pointer_.animationEnd();
    },
    async refreshPanels(...args) {
      await this._panel_.refresh(...args);
      this.trigger('change', { source: 'gesture' });
    },
    refreshAnnualPanels(...args) {
      this._panel_.refreshAnnualPanels(...args);
    },
    swiperTrans(e) {
      if (!this._swiper_flag_) {
        this._swiper_flag_ = true;
        const type = e.currentTarget.dataset.type;
        const calendarWidth = type === 'panel' ? this.$_calendar_width.value : Layout.layout!.windowWidth;
        this._swiper_accumulator_ = e.detail.dx > calendarWidth / 2 ? -initCurrent * calendarWidth : 0;
      }
      this.$_swiper_trans.value = e.detail.dx;
    },
    swiperTransEnd(e) {
      this._swiper_flag_ = false;
      if (e.detail.source !== 'touch') return;
      const type = e.currentTarget.dataset.type;
      const calendarWidth = type === 'panel' ? this.$_calendar_width.value : Layout.layout!.windowWidth;
      this._swiper_accumulator_ += this.$_swiper_trans.value;
      this.$_swiper_trans.value = 0;

      const mod = Math.abs(this._swiper_accumulator_ % calendarWidth);
      const minimumErr = Math.min(mod, calendarWidth - mod);
      const _offset = this._swiper_accumulator_ / calendarWidth;

      if (mod === 0 || minimumErr <= Math.ceil(Math.abs(_offset))) {
        const offset = Math.round(this._swiper_accumulator_ / calendarWidth);
        this._swiper_accumulator_ = 0;
        if (offset) {
          if (type === 'panel') this.refreshPanels(offset);
          else this.refreshAnnualPanels(offset);
        }
      }
    },
    workletSwiperTransEnd(e) {
      'worklet';
      const trans = this.$_swiper_trans;
      const accumulation = trans.value + e.detail.dx;
      const calendarWidth = this.$_calendar_width.value;

      const mod = Math.abs(accumulation % calendarWidth);
      const minimumErr = Math.min(mod, calendarWidth - mod);
      const _offset = accumulation / calendarWidth;

      if (mod === 0 || minimumErr <= Math.ceil(Math.abs(_offset)) * 0.5) {
        const offset = Math.round(_offset);
        this.$_swiper_trans.value = 0;
        if (offset) wx.worklet.runOnJS(this.refreshPanels.bind(this))(offset);
      } else {
        this.$_swiper_trans.value = accumulation;
      }
    },
    workletAnnualSwiperTransEnd(e) {
      'worklet';
      const trans = this.$_annual_trans;
      const accumulation = trans.value + e.detail.dx;
      const calendarWidth = Layout.layout!.windowWidth;

      const mod = Math.abs(accumulation % calendarWidth);
      const minimumErr = Math.min(mod, calendarWidth - mod);
      const _offset = accumulation / calendarWidth;

      if (mod === 0 || minimumErr <= Math.ceil(Math.abs(_offset)) * 0.5) {
        const offset = Math.round(_offset);
        this.$_annual_trans.value = 0;
        if (offset) wx.worklet.runOnJS(this.refreshAnnualPanels.bind(this))(offset);
      } else {
        this.$_annual_trans.value = accumulation;
      }
    },
    workletDragGesture(e) {
      'worklet';
      if (!this.$_gesture.value || e.state === 0) return;
      if (e.state === 1) {
        wx.worklet.runOnJS(this.dragGestureStart.bind(this))();
        this.$_drag_state!.value = 1;
        return;
      }
      if (this.$_drag_state!.value !== 1) return;

      const { dragMax, minHeight, maxHeight, mainHeight } = Layout.layout!;

      const direct = e.deltaY < 0 ? -1 : 1;
      const delta = direct * Math.min(Math.abs(e.deltaY), 10);

      /** 计算面板的高度 */
      const height = this.$_drag_panel_height!.value + delta * 0.6;
      const usefulHeight = Math.min(dragMax, Math.max(minHeight, height));
      this.$_drag_panel_height!.value = usefulHeight;

      /** 计算控制条的角度 */
      const accmulation = direct * 0.5 + this.$_drag_bar_rotate!.value;
      this.$_drag_bar_rotate!.value = Math.max(-20, Math.min(accmulation, 20));

      /** 计算左上角视图控制的位置 */
      const translateX = Math.max(0, Math.min(60, ((mainHeight - usefulHeight) * 60) / (mainHeight - minHeight)));
      this.$_drag_view_bar_translate_!.value = translateX;

      /** 计算日程透明度 */
      const opacity = (usefulHeight - mainHeight) / (maxHeight - mainHeight);
      this.$_drag_schedule_opacity!.value = Math.max(0, Math.min(1, opacity));

      if (e.state > 2) {
        this.$_drag_state!.value = 0;
        wx.worklet.runOnJS(this.dragGestureEnd.bind(this))(e);
      }
    },
    dragGestureStart() {
      this._dragger_!.bindScheduleAnimation();
    },
    async dragGestureEnd(e) {
      const view = await this._dragger_!.dragout(e.velocityY * 0.6);
      wx.nextTick(this.refreshView.bind(this, { view }));
    },
    async selYear() {
      if (!this.$_gesture.value && this._view_ & View.week) return;
      const { year, month } = this.data.panels[this.data.current];
      const mon = { year, month };
      return this._annual_.switch(true, mon);
    },
    async selMonth(e) {
      const { ydx } = e.currentTarget.dataset;
      const { x, y } = e.detail;
      const mon = await this._printer_.getTapMonth(ydx, x, y);
      return this._annual_.switch(false, mon);
    },
    trigger(event, detail, dispatchPlugin = true) {
      detail = detail || <CalendarEventDetail>{};
      detail.checked = detail.checked || this.data.checked!;
      detail.view = detail.view || this.data.currView;

      if (event === 'change' || event === 'load') {
        const panels = this.data.panels;
        const current = this.data.current;
        const half = Math.floor(CALENDAR_PANELS / 2);
        const first = (current - half + CALENDAR_PANELS) % CALENDAR_PANELS;
        const last = (current + half) % CALENDAR_PANELS;
        const { year: sy, month: sm, day: sd } = panels[first].weeks[0].days[0];
        const lastWeeks = panels[last].weeks;
        const lastDays = lastWeeks.slice(-1)[0].days;
        const [{ year: ey, month: em, day: ed }] = lastDays.slice(-1);
        detail.range = [
          { year: sy, month: sm, day: sd },
          { year: ey, month: em, day: ed }
        ];
      }

      const emiter = onceEmiter(this, event);
      dispatchPlugin && this._calendar_.service.dispatchEvent(event, detail, emiter);
      emiter.emit(detail);
    },
    selSchedule(e) {
      const { wdx, ddx } = e.mark!;
      const { sdx, all } = e.currentTarget.dataset;
      const panel = this.data.panels[this.data.current];
      const date = panel.weeks[wdx].days[ddx];
      if (all) {
        const schedules: Array<ScheduleEventDetail> = date.schedules.map(schedule =>
          getScheduleDetail(date, schedule, this._calendar_.service)
        );
        this.triggerEvent('schedule', { schedules, all: true });
      } else {
        const schedule = getScheduleDetail(date, date.schedules[sdx!], this._calendar_.service);
        this.triggerEvent('schedule', { schedule, all: false });
      }
    }
  },
  pageLifetimes: {
    show: function () {
      /**
       * 当组件所在页面重新展示的时候，偶尔出现年度面板画布丢失的情况，需要重新绘制
       */
      if (this._loaded_) this._printer_?.update();
    }
  },
  observers: {
    date: function (date: string | number) {
      if (this._loaded_) this._panel_.toDate(date);
      else this._dragger_?.update();
    },
    marks: function (marks: Array<CalendarMark | CalendarStyleMark>) {
      const mark = this._calendar_.service.getPlugin(MARK_PLUGIN_KEY);
      mark?.update(this, marks);
    },
    view: function (view: string) {
      const _view = viewFlag(view);
      const currView = flagView(_view);
      const isSkylineRender = isSkyline(this.renderer);
      if (this._loaded_) {
        if (isSkylineRender) this.toggleView(_view);
        else this.setData({ transView: currView });
      } else {
        if (isSkylineRender) this._dragger_!.toView(_view, false);
        this._view_ = _view;
      }
    },
    viewGesture: function (gesture: boolean) {
      if (this._loaded_) {
        if (gesture !== this.$_gesture.value) {
          this.$_gesture.value = gesture;
          this.setData({ gesture });
        }
      }
    },
    darkmode: function (darkmode: boolean) {
      if (!darkmode) Layout.theme = 'light';
      if (this._loaded_) {
        const darkside = darkmode && Layout.darkmode;
        if (darkside !== this.data.darkside) {
          this.setData({ darkside });
          if (darkside) this._printer_.bindThemeChange();
          else this._printer_.cancelThemeChange();
        }
      }
    }
  },
  export() {
    if (!this._loaded_) return null as unknown as CalendarExport;
    const instance = this;
    return {
      version: VERSION,
      checked(date) {
        return instance._panel_.toDate(date);
      },
      toggleView(view) {
        const flag = view ? viewFlag(view) : instance._view_ & View.week ? View.month : View.week;
        const _view = flag || View.month;
        if (isSkyline(instance.renderer)) {
          instance.toggleView(_view);
        } else {
          instance.setData({
            transView: flagView(_view)
          });
        }
      },
      openAnuual() {
        return instance.selYear();
      },
      getMarks(date) {
        return instance._calendar_.service.getEntireMarks(date);
      },
      getPlugin(key) {
        return instance._calendar_.service.getPlugin(key);
      },
      updateDates(dates) {
        return instance._calendar_.service.updateDates(dates);
      }
    } as CalendarExport;
  }
});
