/*
 * @Description: wx-calendar组件
 * @Author: lishen
 * @LastEditTime: 2023-10-29 15:36:48
 */
import { WxCalendar, normalDate, sortWeeks, isSameDate, getDateInfo } from './interface/calendar';
import { VERSION, CALENDAR_PANELS, PURE_PROPS, View, VIEWS, SELECTOR, FONT } from './basic/constants';
import { Pointer } from './basic/pointer';
import { PanelTool } from './basic/panel';
import { Layout } from './basic/layout';
import { Dragger } from './basic/drag';
import { AnnualPanelSwitch } from './basic/annual';
import { YearPrinter } from './basic/printer';
import { LunarPlugin } from './plugins/lunar';
import {
  isView,
  viewFlag,
  flagView,
  middle,
  nodeRect,
  isSkyline,
  InitPanels,
  InitWeeks,
  mergeFonts,
  createPointer,
  propPattern
} from './basic/tools';
import { promises } from './utils/shared';
import { add, sub, div } from './utils/calc';

import type { WxCalendarYear, CalendarMark, WxCalendarDay, CalendarDay } from './interface/calendar';
import type { CalendarView } from './basic/tools';
import type {
  CalendarData,
  CalendarProp,
  CalendarMethod,
  CalendarCustomProp,
  CalendarPanel,
  CalendarExport
} from './interface/component';

export type * from './interface/component';
export type * from './interface/calendar';
export type * from './basic/service';

const initCurrent = middle(CALENDAR_PANELS);

Component<CalendarData, CalendarProp, CalendarMethod, CalendarCustomProp>({
  behaviors: ['wx://component-export'],
  options: {
    pureDataPattern: propPattern(PURE_PROPS)
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
    customNavBar: {
      type: Boolean,
      value: true
    }
  },
  data: {
    renderer: 'unknown',
    checked: null,
    panels: InitPanels<CalendarPanel>('panel'),
    years: InitPanels<WxCalendarYear>('year'),
    weeks: InitWeeks(),
    current: initCurrent,
    currView: VIEWS.MONTH,
    initView: VIEWS.MONTH,
    transView: null,
    annualCurr: null,
    annualTop: '-150vh',
    annualOpacity: 0,
    annualDuration: 300,
    offsetChange: false,
    layout: null,
    fonts: FONT,
    pointer: null,
    info: ''
  },
  lifetimes: {
    created() {
      Layout.initialize();
      this.initializeView();
      this.initializeShared();
    },
    async attached() {
      console.log('renderer', this.renderer);
      await this.initializeRects();
      this.initializeRender();
    },
    detached() {
      if (this.data.darkmode) this._printer_.cancelThemeChange();
    }
  },
  methods: {
    initializeShared() {
      this.$_swiper_trans = wx.worklet.shared(0);
      this.$_annual_trans = wx.worklet.shared(0);
      this._dragger_ = new Dragger(this);
    },
    initializeView() {
      const flag = viewFlag(this.data.view as CalendarView);
      /**
       * 未设置view值或view值不合法时，默认View.month（月视图）
       */
      this._view_ = flag || View.month;
      console.log('view', this._view_);
      /**
       * 初始化calendar处理额外的服务
       */
      this._calendar_ = new WxCalendar(this, [LunarPlugin]);
    },
    initializeRender() {
      const isSkylineRender = isSkyline(this.renderer);

      this._pointer_ = new Pointer(this);
      this._panel_ = new PanelTool(this);
      this._annual_ = new AnnualPanelSwitch(this);
      this._printer_ = new YearPrinter(this);

      if (!isSkylineRender) {
        this._dragger_?.clear();
        this._annual_.clearSkyline();
        this._swiper_accumulator_ = 0;
        this._swiper_flag_ = false;
      }

      const checked = normalDate(this.data.date) || WxCalendar.today;
      const weeks = InitWeeks(sortWeeks(this.data.weekstart));
      const isWeekView = this._view_ & View.week;

      const panels = isWeekView ? this._panel_.createWeekPanels(checked) : this._panel_.createMonthPanels(checked);
      const _years = this._panel_.createYearPanels(checked);
      const years: Array<WxCalendarYear> = _years.map(({ key, year, subinfo }) => ({ key, year, subinfo }));
      this._years_ = _years.map(({ year, months, marks }) => ({ year, months, marks }));

      const fonts = this.data.font ? mergeFonts(this.data.font, FONT) : FONT;
      const initView = flagView(this._view_);

      const sets: Partial<CalendarData> = {
        renderer: this.renderer!,
        fonts,
        checked,
        weeks,
        panels,
        years,
        offsetChange: !!(isWeekView && !isSkylineRender),
        layout: Layout.layout!,
        annualCurr: isSkylineRender ? null : initCurrent,
        currView: initView,
        initView,
        info: getDateInfo(checked, isWeekView),
        pointer: createPointer()
      };
      this._pointer_.update(sets);
      this.setData(sets);
      wx.nextTick(() => {
        this._printer_.initialize();
        this.triggerLoad();
      });
    },
    async initializeRects() {
      const query = nodeRect(this);
      const [calendar, rects] = await promises([query(SELECTOR.CALENDAR), query(SELECTOR.WEEK_ITEM)]);
      const x = calendar[0].left.toFixed(1);
      this._centres_ = rects.map(({ left, width }) => sub(add(left.toFixed(1), div(width.toFixed(1), 2)), x));
    },
    async refreshView({ view }) {
      if (this._view_ & view) return;
      if (!isSkyline(this.renderer)) return void (this._view_ = view);
      await this._panel_.refreshView(view);
      this.triggerViewChange(view);
    },
    toToday() {
      this._panel_.toDate(WxCalendar.today);
    },
    async toggleView(view) {
      const _view = isView(view) ? view : this._view_ & View.week ? View.month : View.week;
      if (isSkyline(this.renderer)) await this._dragger_!.toView(_view, true);
      await this._panel_.refreshView(_view);
      this.triggerViewChange(this._view_);
    },
    async calendarTransitionEnd() {
      if (isSkyline(this.renderer)) return;
      const currView = viewFlag(this.data.currView);
      if (currView === this._view_) return;
      await this._panel_.refreshView(this._view_);
      this.triggerViewChange(this._view_);
    },
    async selDate(e) {
      const { wdx, ddx } = e.currentTarget.dataset;
      const panel = this.data.panels[this.data.current];
      const date = panel.weeks[wdx].days[ddx];
      if (isSameDate(date, this.data.checked!)) return;
      const checked = normalDate(date);
      const isWeekView = this._view_ & View.week;
      if (date.kind === 'current') {
        const sets = { info: getDateInfo(checked), checked };
        if (!isWeekView) this._panel_.refreshOffsets(sets, this.data.current, checked);
        this._pointer_.update(sets, true);
        this.setData(sets);
        await this._panel_.update();
      } else {
        if (isWeekView) await this._panel_.toWeekAdjoin(date);
        else await this._panel_.refresh(date.kind === 'last' ? -1 : +1, checked, void 0, true);
      }
      this.triggerDateChange(checked);
    },
    handlePointerAnimated() {
      this._pointer_.animationEnd();
    },
    async refreshPanels(...args) {
      await this._panel_.refresh(...args);
      this.triggerDateChange();
    },
    refreshAnnualPanels(...args) {
      this._panel_.refreshAnnualPanels(...args);
    },
    swiperTrans(e) {
      if (!this._swiper_flag_) {
        this._swiper_flag_ = true;
        const { windowWidth } = Layout.layout!;
        this._swiper_accumulator_ = e.detail.dx > windowWidth / 2 ? -initCurrent * windowWidth : 0;
        if (e.detail.dx > windowWidth / 2) {
          this._swiper_accumulator_ = -initCurrent * windowWidth;
        }
      }
      this.$_swiper_trans.value = e.detail.dx;
    },
    swiperTransEnd(e) {
      this._swiper_flag_ = false;
      if (e.detail.source !== 'touch') return;
      this._swiper_accumulator_ += this.$_swiper_trans.value;
      this.$_swiper_trans.value = 0;
      if (this._swiper_accumulator_ % Layout.layout!.windowWidth === 0) {
        const offset = this._swiper_accumulator_ / Layout.layout!.windowWidth;
        this._swiper_accumulator_ = 0;
        if (offset) {
          const type = e.currentTarget.dataset.type;
          if (type === 'panel') this.refreshPanels(offset);
          else this.refreshAnnualPanels(offset);
        }
      }
    },
    workletSwiperTransEnd(e) {
      'worklet';
      const trans = this.$_swiper_trans;
      const accumulation = trans.value + e.detail.dx;
      if (accumulation % Layout.layout!.windowWidth === 0) {
        this.$_swiper_trans.value = 0;
        const offset = accumulation / Layout.layout!.windowWidth;
        if (offset) wx.worklet.runOnJS(this.refreshPanels.bind(this))(offset);
      } else {
        this.$_swiper_trans.value = accumulation;
      }
    },
    workletAnnualSwiperTransEnd(e) {
      'worklet';
      const trans = this.$_annual_trans;
      const accumulation = trans.value + e.detail.dx;
      if (accumulation % Layout.layout!.windowWidth === 0) {
        this.$_annual_trans.value = 0;
        const offset = accumulation / Layout.layout!.windowWidth;
        if (offset) wx.worklet.runOnJS(this.refreshAnnualPanels.bind(this))(offset);
      } else {
        this.$_annual_trans.value = accumulation;
      }
    },
    workletDragGesture(e) {
      'worklet';
      if (e.state === 0) return;
      if (e.state === 1) {
        wx.worklet.runOnJS(this.dragGestureStart.bind(this))();
        this.$_drag_state!.value = 1;
        return;
      }
      if (this.$_drag_state!.value !== 1) return;

      const { dragMaxHeight, minHeight, maxHeight, mainHeight } = Layout.layout!;

      const direct = e.deltaY < 0 ? -1 : 1;
      const delta = direct * Math.min(Math.abs(e.deltaY), 10);

      /** 计算面板的高度 */
      const height = this.$_drag_calendar_height!.value + delta * 0.5;
      const usefulHeight = Math.min(dragMaxHeight, Math.max(minHeight, height));
      this.$_drag_calendar_height!.value = usefulHeight;

      /** 计算控制条的角度 */
      const accmulator = e.deltaY > 0 ? 0.5 : -0.5;
      const accmulation = accmulator + this.$_drag_bar_rotate!.value;
      const deg = Math.max(-20, Math.min(accmulation, 20));
      this.$_drag_bar_rotate!.value = deg;

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
      const view = await this._dragger_!.dragout(e.velocityY);
      wx.nextTick(this.refreshView.bind(this, { view }));
    },
    selYear() {
      const { year, month } = this.data.panels[this.data.current];
      const mon = { year, month };
      this._annual_.switch(true, mon);
    },
    async selMonth(e) {
      const { ydx } = e.currentTarget.dataset;
      const { x, y } = e.detail;
      const mon = await this._printer_.getTapMonth(ydx, x, y);
      this._annual_.switch(false, mon);
    },
    triggerLoad() {
      this._loaded_ = true;
      const checked = this.data.checked;
      const view = this.data.currView;
      this.triggerEvent('load', { checked, view });
    },
    triggerDateChange(date) {
      date = date || (this.data.checked! as WxCalendarDay);
      const view = this.data.currView;
      this.triggerEvent('change', { checked: date, view });
    },
    triggerViewChange(view) {
      const _view = flagView(view || this._view_);
      const checked = this.data.checked;
      this.triggerEvent('viewchange', { checked, view: _view });
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
    },
    marks: function (marks: Array<CalendarMark>) {
      const plugin = this._calendar_.getPlugin('_mark_');
      const updates = plugin?.updateMarks(marks);
      if (this._loaded_) this._calendar_.updateDates(updates);
    }
  },
  export() {
    if (!this._loaded_) return null as unknown as CalendarExport;
    const instance = this;
    return {
      version: VERSION,
      toDate(date) {
        return instance._panel_.toDate(date);
      },
      toYear(year) {
        return instance._panel_.toYear(year);
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
      getPlugin(key) {
        return instance._calendar_.getPlugin(key);
      },
      updatePluginDates(dates?: Array<CalendarDay>) {
        return instance._calendar_.updateDates(dates);
      }
    } as CalendarExport;
  }
});
