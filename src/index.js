import LayoutCalc from './utils/device'
import DateHandler from './utils/handler'
import { NodeRect, PanelsCount, PanelCountMiddleIdx, InitBarInfo, EnOrders, EchoInfo } from './utils/tools'

const VERSION = '2.0.0'
const CALENDAR_PANELS = 5
const INIT_TAB = PanelCountMiddleIdx(CALENDAR_PANELS)

Component({
    behaviors: ['wx://component-export'],
    options: {
        pureDataPattern: /^_/
    },
    properties: {
        /**
         * @type {boolean} true | false
         * @description 选择日期时震动
         */
        _vibrate: {
            type: Boolean,
            value: true
        },
        /**
         * @type {string} month | week
         * @description 初始视图
         */
        view: {
            type: String,
            value: 'month'
        },
        /**
         * @type {array} [{ year, month, day, type, mark, color, bgColor }]
         * @description 日期标记
         */
        _markers: {
            type: Array,
            value: []
        },
        /**
         * @type {boolean} false | true
         * @description 深色模式
         */
        darkmode: {
            type: Boolean,
            value: false
        },
        /**
         * @type {number|string|array|object} attach timestamp
         * @description 初始选择日期
         */
        _date: {
            type: Number,
            optionalTypes: [String, Array, Object],
            value: (new Date).getTime()
        },
        /**
         * @type {boolean} true | false
         * @description 日期选中状态显示
         */
        checkedShow: {
            type: Boolean,
            value: true
        },
        /**
         * @type {number} 0 | 1 | 2 | 3 | 4 | 5 | 6
         * @description 一周开始日
         */
        _startWeek: {
            type: Number,
            value: 0
        },
        /**
         * @type {boolean} true | false
         * @description 是否显示农历
         */
        showLunar: {
            type: Boolean,
            value: true
        },
        /**
         * @type {boolean} true | false
         * @description 是否显示标记
         */
        showMark: {
            type: Boolean,
            value: true
        }
    },
    data: {
        loading: true,
        months: [],
        maxHeight: 0,
        minHeight: 0,
        calendarHeight: 0,
        panelHeight: 0,
        currView: 1,
        currViewName: 'month',
        titleInfo: '',
        weeks: '',
        solidDay: false,
        barAnimation: true,
        currTab: INIT_TAB,
        panels: PanelsCount(CALENDAR_PANELS),
        tdOpShow: false,
        weektabchange: -1,
        monthchange: false,
        needInitTrans: false,
        viewchange: '',
        yearPanelShow: false,
        yearMs: [],
        currYearsTab: INIT_TAB
    },
    attached() {
        this._rects = []
        this._today = null
        this._selDay = null
        this._currWeekIdx = 0
        this._rectsLoading = true
        this._yearPanelShow = false
        this._weekStart = this.data._startWeek
        this._currView = this.data.view === 'week' ? 2 : 1
        if (this.data.showMark) this._dateMarkers = this.initMarkers()
        this._handler = new DateHandler(this, this._weekStart)

        this.initialize(() => {
            this.calcWeekRects(() => {
                if (this._currView == 2) {
                    this.initWeeks()
                } else {
                    this.initMonths()
                }
                this.bindLoad()
                this.setSelBar()
            })
        })
    },
    methods: {

        /** initialize */
        initialize(callback) {

            const layout = new LayoutCalc
            const { mainHeight, panelHeight, maxHeight, minHeight } = layout.layout()
            const initSelDate = DateHandler.CorrectDate(this.data._date)

            this._today = this._handler.today()
            this._selDay = initSelDate ? this._handler.date(initSelDate) : this._today

            const titleInfo = this.titleInfo(this._selDay, this._today)
            const weeks = DateHandler.ResortWeeks(this._weekStart)

            this.setData({
                weeks,
                maxHeight,
                minHeight,
                panelHeight,
                titleInfo,
                calendarHeight: mainHeight,
                currView: this._currView,
                currViewName: this.data.view,
                yearMs: this.setYearMs(this._selDay, this.data.currTab)
            }, () => {
                typeof callback === 'function' && callback()
            })
        },
        calcWeekRects(callback) {
            this._rectsLoading = true
            Promise.all([
                NodeRect('#calendar', this),
                NodeRect('.wx-calendar-weeks-item', this)
            ]).then(([calendar, rects]) => {
                const _initX = calendar[0].left
                this._rects = rects.map(item => {
                    item.center = item.left + item.width / 2 - _initX
                    return item
                })
                this._rectsLoading = false
                typeof callback === 'function' && callback()
            }).catch(err => {
                console.error('calcWeekRects error: ', err)
            })
        },
        initMonths() {
            const { year, month, day } = this._selDay
            const months = Array.apply(null, { length: this.data.panels }).map((_, i) => {
                const _month = month + i - this.data.currTab
                return this.initMonth({ year, month: _month, day })
            })
            this.setData({ months })
        },
        /** initialize */

        /** calendar swiper */
        calendarSwiperEnd(e) {
            const { current, source } = e.detail
            if (source == 'touch') {
                if (current != this.data.currTab) {
                    this.refreshPanel(current)
                    this.bindDateChange(this._selDay)
                }
            } else {
                this.changePanel(current)
                this.bindDateChange(this._selDay)
            }
        },
        refreshPanel(current) {
            if (this.data.currView == 2) {
                this.refreshWeeksPanel(current, false, true)
            } else {
                this.refreshMonthPanel(current)
            }
        },
        refreshMonthPanel(current, refreshAll = false, refreshCurrentTrans = false, refreshSelbar = true) {
            if (current != this.data.currTab) this.setData({ currTab: current })
            const _month = this.data.months[current]
            const { year, month } = _month
            let setData = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    if (idx != current || refreshAll) {
                        _[`months[${ idx }]`] = this.initMonth({ year, month: month + i - edgeDiff, day: this._selDay.day })
                    }
                }
                return _
            })(new Object)
            if (!refreshAll && refreshCurrentTrans) {
                const wdx = this.getDayWeekIdxInMonth(this._selDay, _month.idays)
                setData[`months[${ current }].trans`] = this.calcMonthPanelTrans(wdx, _month.days.length)
            }
            this.setData(setData)
            if (refreshSelbar) this.setSelBar()
        },
        changePanel(current) {
            if (this.data.currView == 2) {
                this.refreshWeeksPanel(this.data.currTab, false, true)
            } else {
                this.refreshMonthPanel(current, false, true)
            }
        },

        /** calendar swiper */

        /** select date */
        selDate(e) {
            if (this._rectsLoading) return
            const { wdx, ddx } = e.currentTarget.dataset
            const currTab = this.data.currTab
            const idx = wdx * 7 + ddx
            const { idays, month } = this.data.months[currTab]
            const selDay = idays[idx]
            if (selDay.year === this._selDay.year && selDay.month === this._selDay.month && selDay.day === this._selDay.day) return
            if (this.data.currView == 2) {
                if (selDay.month != month) this.refreshCurrentWeekPanel(selDay)
                else this.setSelDate(idx)
                this.bindDateChange(selDay, false)
            } else {
                if (selDay.state == 'prev' || selDay.state == 'next') {
                    this._selDay = selDay
                    const _current = selDay.state == 'prev' ? (currTab - 1 + this.data.panels) % this.data.panels : (currTab + 1) % this.data.panels
                    this.setData({ currTab: _current })
                } else {
                    this.setSelDate(idx)
                    this.bindDateChange(selDay, false)
                }
            }
        },
        refreshCurrentWeekPanel(selDay) {
            this.setData({
                [`months[${ this.data.currTab }]`]: this.initWeekMonth(selDay),
                monthchange: true,
                barAnimation: false
            }, () => {
                this._selDay = selDay
                this.setSelBar()
            })
        },
        setSelDate(idx) {
            const currTab = this.data.currTab
            const month = this.data.months[currTab]
            this._selDay = {...month.idays[idx] }
            const wdx = Math.floor(idx / 7)
            let setData = {
                titleInfo: this.titleInfo(this._selDay),
                [`months[${ currTab }].bar`]: this.initSelBar(idx)
            }
            if (wdx != this._currWeekIdx) {
                for (let i = 0; i < this.data.months.length; i++) {
                    const month = this.data.months[i]
                    const xday = this._selDay.day <= month.count ? this._selDay.day : month.count
                    const date = { year: month.year, month: month.month, day: xday }
                    setData[`months[${ i }].trans`] = this.calcMonthPanelTrans(this.getDayWeekIdxInMonth(date, month.idays), month.days.length)
                }
            }
            this._currWeekIdx = wdx
            this.setData(setData)
        },
        handleSelBarAniEnd(e) {
            const currTab = this.data.currTab
            const key = `months[${ currTab }].bar.a`
            this.setData({
                [key]: false,
                tdOpShow: !this.data.months[currTab].bar.t
            })
            if (this.data._vibrate) {
                wx.vibrateShort({
                    type: 'light'
                })
            }
        },
        /** select date */

        /** toggle view */
        toggleView({ state }) {
            this._currView = state
            this.setData({ currViewName: state == 2 ? 'week' : 'month' })
        },
        calendarTransEnd() {
            const viewNoChanged = [1, 3].includes(this._currView) && [1, 3].includes(this.data.currView) || this._currView == this.data.currView
            if (this._currView != this.data.currView) {
                let setData = { currView: this._currView, currViewName: this._currView == 2 ? 'week' : 'month' }
                if (this._currView == 1) setData.yearPanelShow = this._yearPanelShow
                this.setData(setData)
            }
            if (!viewNoChanged) {
                if (this._currView == 2) {
                    this.refreshWeeksPanel(this.data.currTab, false, false)
                } else {
                    this.refreshMonthPanel(this.data.currTab, false, false, false)
                }
                this.setData({
                    titleInfo: this.titleInfo(this._selDay)
                }, () => {
                    this.bindViewChange(this._currView)
                })
            }
        },
        initWeeks() {
            const { year, month, day } = this._selDay
            const months = Array.apply(null, { length: this.data.panels }).map((_, i) => {
                const _date = DateHandler.NormalDate(year, month, day + (i - this.data.currTab) * 7)
                return this.initMonth(_date)
            })
            this.setData({ months })
        },
        refreshWeeksPanel(current, refreshAll = false, refreshSelbar = true) {
            if (current != this.data.currTab) this.setData({ currTab: current })
            const { year, month, day } = this.getMonthWeekDay(current)
            let setData = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    if (idx != current || refreshAll) {
                        _[`months[${ idx }]`] = this.initWeekMonth({ year, month, day: day + (i - edgeDiff) * 7 })
                    }
                }
                return _
            })(new Object)
            setData[`months[${ current }].wf`] = DateHandler.WeekFirstDay({ year, month, day }, this._weekStart)
            setData.weektabchange = this.data.currTab
            this.setData(setData)
            if (refreshSelbar) this.setSelBarForWeek(current)
        },
        handleOpBarTransEnd() {
            this.setData({
                solidDay: this._currView == 2
            })
        },
        /** toggle view */

        /** to today */
        toToday() {
            if (this._selDay.year == this._today.year && this._selDay.month == this._today.month && this._selDay.day == this._today.day) return
            if (this.data.tdOpShow) {
                this._selDay = this._today
                if (this.data.currView == 2) {
                    this.handleWeekToDate(this._today)
                } else {
                    this.handleMonthToDate(this._today)
                }
            }
        },
        handleWeekToDate(date) {
            const todayDate = (new Date(date.year, date.month - 1, date.day)).getTime()
            const isInSwiper = this.data.months.findIndex(_m => {
                let startDate = (new Date(_m.wf.year, _m.wf.month - 1, _m.wf.day)).getTime()
                let endDate = (new Date(_m.wf.year, _m.wf.month - 1, _m.wf.day + 7)).getTime()
                return startDate <= todayDate && endDate > todayDate
            })
            const currTab = this.data.currTab
            if (isInSwiper === currTab) {
                const month = this.data.months[currTab]
                if (date.month != month.month) {
                    this.refreshCurrentWeekPanel(date)
                } else {
                    const idx = month.idays.findIndex(d => d.month == date.month && d.day == date.day)
                    this.setSelDate(idx)
                }
                this.bindDateChange(this._today, false)
            } else if (isInSwiper >= 0) {
                this.setData({ currTab: isInSwiper })
            } else {
                this.refreshWeeksPanelByDate(this._today)
                this.bindDateChange(this._today)
            }
        },
        handleMonthToDate(date) {
            const isInSwiper = this.data.months.findIndex(_m => (_m.year == date.year && _m.month == date.month))
            const currTab = this.data.currTab
            if (currTab === isInSwiper) {
                const month = this.data.months[currTab]
                const findIdx = month.idays.findIndex(_date => (_date.month == month.month && _date.day == date.day))
                this.setSelDate(findIdx)
                this.bindDateChange(this._today, false)
            } else if (isInSwiper >= 0) {
                this.setData({ currTab: isInSwiper })
            } else {
                this.refreshMonthsPanelByDate(this._today)
                this.bindDateChange(this._today)
            }
        },
        refreshMonthsPanelByDate(date) {
            const { year, month } = date
            const current = this.data.currTab
            let setData = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    _[`months[${ idx }]`] = this.initMonth({ year, month: month + i - edgeDiff, day: this._selDay.day })
                }
                return _
            })(new Object)
            this.setData(setData)
            this.setSelBar()
        },
        refreshWeeksPanelByDate(date) {
            const { year, month, day } = date
            const current = this.data.currTab
            let setData = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    _[`months[${ idx }]`] = this.initWeekMonth({ year, month, day: day + (i - edgeDiff) * 7 })
                }
                return _
            })(new Object)
            setData.weektabchange = this.data.currTab
            setData.monthchange = true
            this.setData(setData)
            this.setSelBarForWeek(current)
        },
        /** to today */

        getMonthWeekDay(idx) {
            const month = this.data.months[idx]
            const delta = (this._selDay.week + 7 - this._weekStart) % 7
            const weekFirst = month.wf ? month.wf : DateHandler.WeekFirstDay(this._selDay, this._weekStart)
            return DateHandler.NormalDate(weekFirst.year, weekFirst.month, weekFirst.day + delta)
        },
        setSelBarForWeek(idx) {
            // const idx = this.data.currTab
            const month = this.data.months[idx]
            const delta = (this._selDay.week + 7 - this._weekStart) % 7
            const selDay = DateHandler.NormalDate(month.wf.year, month.wf.month, month.wf.day + delta)
            const findIdx = month.idays.findIndex(date => (date.month == selDay.month && date.day == selDay.day))
            this._selDay = {...month.idays[findIdx] }
            this._currWeekIdx = this.getDayWeekIdxInMonth(this._selDay, month.idays)
            this.setData({
                titleInfo: this.titleInfo(this._selDay),
                [`months[${ idx }].bar`]: this.initSelBar(findIdx)
            }, () => {
                // this.triggerSel(seekDay)
            })
        },
        setSelBar() {
            const idx = this.data.currTab
            const month = this.data.months[idx]
            const day = this._selDay.day <= month.count ? this._selDay.day : month.count
            const findIdx = month.idays.findIndex(date => (date.month == month.month && date.day == day))
            this._selDay = {...month.idays[findIdx] }
            this._currWeekIdx = this.getDayWeekIdxInMonth(this._selDay, month.idays)
            this.setData({
                titleInfo: this.titleInfo(this._selDay),
                [`months[${ idx }].bar`]: this.initSelBar(findIdx)
            }, () => {
                // this.triggerSel(seekDay)
            })
        },
        initSelBar(i) {
            const r = this._rects[i % 7]
            const { today, day } = this._selDay
            const length = this.data.months[this.data.currTab].days.length
            const wdx = Math.floor(i / 7)
            return {
                i,
                x: r.center,
                y: `calc(100% / ${ length } * ${ wdx + 0.5 })`,
                t: today,
                d: day,
                a: true,
                s: true
            }
        },
        initWeekSelBar(i, days) {
            const r = this._rects[i % 7]
            const { today, day } = this._selDay
            const wdx = Math.floor(i / 7)
            return {
                i,
                x: r.center,
                y: `calc(100% / ${ days.length } * ${ wdx + 0.5 })`,
                t: today,
                d: day,
                a: true,
                s: true
            }
        },
        initWeekMonth(date) {
            const normalDate = DateHandler.NormalDate(date.year, date.month, date.day)
            const { year, month, day } = normalDate
            const { days, count } = this.getMonthDays(normalDate)
            const weekdays = this.getMonthWeekDays(year, month, days)
            const _dateIdx = days.findIndex(({ year: y, month: m, day: d }) => y === year && m === month && d === day)
            const _date = days[_dateIdx]
            const lunarinfo = this.data.showLunar ? { lunar_order: _date.lunar.lunar_order, lunar_year: _date.lunar.lunar_year } : {}

            return Object.assign({
                key: `m_${ year }_${ month }`,
                year: year,
                month: month,
                count,
                idays: days,
                days: weekdays,
                bar: {...InitBarInfo },
                trans: this.calcMonthPanelTrans(this.getDayWeekIdxInMonth(_date, days), weekdays.length),
                wf: DateHandler.WeekFirstDay(_date, this._weekStart)
            }, lunarinfo)

        },
        initMonth(date) {
            const normalDate = DateHandler.NormalDate(date.year, date.month, 1)
            const { days, count } = this.getMonthDays(normalDate)
            const xday = date.day <= count ? date.day : count

            const { year, month } = normalDate
            const _date = days[days.findIndex(({ year: y, month: m, day: d }) => y === year && m === month && d === xday)]
            const weekdays = this.getMonthWeekDays(year, month, days)
            const lunarinfo = this.data.showLunar ? { lunar_order: _date.lunar.lunar_order, lunar_year: _date.lunar.lunar_year } : {}

            return Object.assign({
                key: `m_${ year }_${ month }`,
                year,
                month,
                count,
                idays: days,
                days: weekdays,
                bar: {...InitBarInfo },
                trans: this.calcMonthPanelTrans(this.getDayWeekIdxInMonth(_date, days), weekdays.length),
                wf: null
            }, lunarinfo)
        },
        getMonthDays(date) {
            const { year, month } = date
            return this._handler.suppleMonth(year, month)
        },
        getMonthWeekDays(year, month, days) {
            return Array.apply(null, { length: days.length / 7 }).map((w, idx) => {
                return {
                    key: `w_${ year }_${ month }_${ idx + 1 }`,
                    days: Array.apply(null, { length: 7 }).map((_, _i) => days[idx * 7 + _i])
                }
            })
        },
        // 预处理计算[PANEL] month -> week视图 面板需要平移的距离
        calcMonthPanelTrans(weekidx, weekdayslength) {
            const defaultDayHeight = this.data.panelHeight / 5
            const currentDayHeight = weekdayslength == 5 ? defaultDayHeight : this.data.panelHeight / weekdayslength
            const dayHeightDifference = weekdayslength == 5 ? 0 : (defaultDayHeight - currentDayHeight) / 2
            return Math.floor((weekidx * currentDayHeight - dayHeightDifference) * 10) / 10
        },
        // 日期所在月份第几周
        getDayWeekIdxInMonth(date, monthdays) {
            const { month: m, day: d } = date
            const idx = monthdays.findIndex(({ month, day }) => (m === month && d === day))
            return Math.floor(idx / 7)
        },
        // 处理[TITLE]日期描述信息
        titleInfo(date, today = null) {
            today = today ? today : this._today
            const orderWeekInfo = `第${ DateHandler.WeekOrder(date) }周`
            if (date.year == today.year && date.month == today.month && date.day == today.day) {
                return this._currView == 2 ? `${ orderWeekInfo }  周${ date.week_name }` : `周${ date.week_name }`
            }
            const daysCount = DateHandler.DateDiff(today, date)
            const prefixInfo = this._currView == 2 ? `${ orderWeekInfo }  ` : ''
            return `${ prefixInfo }${ Math.abs(daysCount) }天${ daysCount < 0 ? '前' : '后' }`
        },
        /** YEAR PANEL */
        yearsSwiperAniEnd(e) {
            const { current, source } = e.detail
            const year = this.data.yearMs[current].year
            if (source == 'touch') {
                if (current != this.data.currYearsTab) {
                    this.setData({
                        currYearsTab: current
                    }, () => {
                        this.refreshYearMs(year, current)
                    })
                }
            } else {
                this.refreshYearMs(year, current)
            }
        },
        setYearMs(date, current) {
            const { year } = date
            const years = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    _[idx] = year + i - edgeDiff
                }
                return _
            })(Array.apply(null, { length: this.data.panels }))
            return Array.apply(null, { length: this.data.panels }).map((_, i) => this.getYearMonth(years[i]))
        },
        refreshYearMs(year, current) {
            const setData = (_ => {
                const edgeDiff = Math.floor((this.data.panels - 1) / 2)
                for (let i = 0; i < this.data.panels; i++) {
                    const idx = (current + edgeDiff + i + 1) % this.data.panels
                    if (idx != current) _[`yearMs[${ idx }]`] = this.getYearMonth(year + i - edgeDiff)
                }
                return _
            })(new Object)
            this.setData(setData)
        },
        getYearMonth(year) {
            const { year: ty, month: tm } = this._today
            return {
                year,
                lunar_year: this.data.showLunar ? this._handler.date({ year, month: 6, day: 1 }).lunar.lunar_year : null,
                key: `yp_${ year }`,
                months: Array.apply(null, { length: 12 }).map((_, i) => {
                    const m = i + 1
                    return {
                        month: m,
                        curr: ty == year && tm == m,
                        lunar: this.data.showLunar ? this.getMonthLunarMonthFirst(year, m) : null
                    }
                })
            }
        },
        getMonthLunarMonthFirst(year, month) {
            const monthDays = this._handler.month(year, month)
            return monthDays.filter(d => d.lunar.ld == 1).map((d, i) => {
                let { day, lunar } = d
                const key = `yml_${ year }_${ month }_${ i }`
                return { key, day, lunar: lunar.lunar_month, order: day > 3 ? EnOrders[4] : EnOrders[day] }
            })
        },
        justYearPanelShow() {
            this._yearPanelShow = true
            this.setData({
                yearPanelShow: true
            })
        },
        handleYearPanelShow() {
            this._yearPanelShow = true
        },
        handleYearsMonthSel(e) {
            const { year, month } = e.currentTarget.dataset
            const currTab = this.data.currTab
            const currMonth = this.data.months[currTab]
            if (currMonth.year == year && currMonth.month == month) {
                this._yearPanelShow = false
                this.setData({
                    yearPanelShow: false
                })
            } else {
                this._yearPanelShow = false
                this.setData({ yearPanelShow: false })
                this.refreshMonthsPanelByDate({ year, month, day: 1 })
                this.bindDateChange(this._selDay)
            }
        },
        /** YEAR PANEL */

        /** markers */
        initMarkers() {
            let markers = {}
            for (const marker of this.data._markers) {
                const { year, month, day, type, mark, color, bgColor } = marker
                if (['holiday', 'corner', 'schedule'].includes(type)) {
                    const key = `${ year }_${ month }_${ day }`
                    const _marker = markers[key] ? {...markers[key] } : {}
                    _marker[type] = _marker[type] ? _marker[type] : []
                    const _mark = type == 'corner' ? mark.substring(0, 2) : mark
                    _marker[type].push({ mark: _mark, color, bgColor })
                    markers[key] = _marker
                }
            }
            return markers
        },
        refreshPanelDays() {
            if (this.data.loading) return
            const setData = (_ => {
                for (let i = 0; i < this.data.months.length; i++) {
                    const { year, month } = this.data.months[i]
                    const { days } = this._handler.suppleMonth(year, month)
                    _[`months[${ i }].idays`] = days
                    _[`months[${ i }].days`] = this.getMonthWeekDays(year, month, days)
                }
                return _
            })(new Object)
            this.setData(setData)
        },
        /** markers */

        /** export functions */
        getDateInfo() {
            const date = DateHandler.CorrectDate(...arguments)
            return date ? this._handler.date(date) : null
        },
        calendarToDate() {
            const date = DateHandler.CorrectDate(...arguments)
            if (date) {
                this._selDay = this._handler.date(date)
                if (this.data.currView == 2) {
                    this.handleWeekToDate(this._selDay)
                } else {
                    this.handleMonthToDate(this._selDay)
                }
            }
        },
        calendarToMonth(year, month) {
            const date = DateHandler.CorrectDate(year, month, 1)
            if (date) {
                this._selDay = this._handler.date(date)
                if (this.data.currView == 2) {
                    this.handleWeekToDate(this._selDay)
                } else {
                    this.handleMonthToDate(this._selDay)
                }
            }
        },
        switchCalendarView(view) {
            view = view ? view : 'month'
            view = (view != 'month' && view != 'week') ? 'month' : view
            this.setData({
                viewchange: view
            })
        },
        calendarPrev() {
            const prev = (this.data.currTab - 1 + this.data.panels) % this.data.panels
            this.refreshPanel(prev)
        },
        calendarNext() {
            const next = (this.data.currTab + 1) % this.data.panels
            this.refreshPanel(next)
        },
        reloadPos() {
            return new Promise((resolve, reject) => {
                this.calcWeekRects().then(() => {
                    this.setSelBar()
                    resolve()
                }).catch(err => {
                    reject(err)
                })
            })
        },
        /** export functions */

        /** events */
        bindLoad() {
            let setData = { loading: false }
            if (this._currView == 2) setData.needInitTrans = true
            const view = this._currView == 2 ? 'week' : 'month'
            this.setData(setData, () => {
                EchoInfo('欢迎到%chttps:\/\/github.com\/lspriv\/wx-calendar\/issues%c提出建议或Bug或✭', 'info', 'font-weight:bold;margin: 0 2px;', 'color: #8cc5ff')
                const { range, visual } = this.rangeDetail()
                const { year, month } = this.data.months[this.data.currTab]
                this.triggerEvent('load', { date: this._selDay, view, range, visual, visualMonth: { year, month } })
            })
        },
        bindDateChange(date, rangeChange = true) {
            const view = this._currView == 2 ? 'week' : 'month'
            const { range, visual } = this.rangeDetail()
            const { year, month } = this.data.months[this.data.currTab]
            this.triggerEvent('datechange', { date, view, range, visual, visualMonth: { year, month }, rangeChange })
        },
        bindViewChange(view) {
            this.triggerEvent('viewchange', { view: view == 2 ? 'week' : 'month' })
        },
        bindRangeChange() {
            const detail = this.rangeDetail()
            this.triggerEvent('rangechange', detail)
        },
        /** events */

        /** about range change */
        rangeDetail() {
            const current = this.data.currTab
            const edgeDiff = Math.floor((this.data.panels - 1) / 2)
            const first = this.data.months[(current + this.data.panels - edgeDiff) % this.data.panels]
            const last = this.data.months[(current + edgeDiff) % 5]
            const detail = this._currView == 2 ? this.rangeWeekDetail(first, last) : this.rangeMonthDetail(first, last)
            return {...detail, curr: this._selDay }
        },
        rangeWeekDetail(first, last) {
            const range = [
                DateHandler.NormalDate(first.wf.year, first.wf.month, first.wf.day),
                DateHandler.NormalDate(last.wf.year, last.wf.month, last.wf.day + 6)
            ]
            const month = this.data.months[this.data.currTab]
            const visual = [
                DateHandler.NormalDate(month.wf.year, month.wf.month, month.wf.day),
                DateHandler.NormalDate(month.wf.year, month.wf.month, month.wf.day + 6)
            ]
            return { range, visual }
        },
        rangeMonthDetail(first, last) {
            const fd = first.idays[0]
            const ld = last.idays[last.idays.length - 1]
            const range = [
                DateHandler.NormalDate(fd.year, fd.month, fd.day),
                DateHandler.NormalDate(ld.year, ld.month, ld.day)
            ]
            const month = this.data.months[this.data.currTab]
            const cfd = month.idays[0]
            const cld = month.idays[month.idays.length - 1]
            const visual = [
                { year: cfd.year, month: cfd.month, day: cfd.day },
                { year: cld.year, month: cld.month, day: cld.day }
            ]
            return { range, visual }
        }
        /** about range change */
    },
    observers: {
        _markers: function(markers) {
            if (!this.data.showMark) return
            if (this.data.loading) return
            this._dateMarkers = this.initMarkers()
            this.refreshPanelDays()
        }
    },
    export () {
        if (this.data.loading) {
            EchoInfo('请在bindload回调后执行selectComponent', 'warn')
            return null
        }
        const { minHeight, maxHeight, calendarHeight } = this.data
        const calendarInstance = this
        return {
            name: 'wx-calendar',
            version: VERSION,
            minHeight,
            maxHeight,
            height: calendarHeight,
            getDateInfo() {
                return calendarInstance.getDateInfo(...arguments)
            },
            reloadMarkers() {
                calendarInstance.initMarkers()
            },
            toDate() {
                calendarInstance.calendarToDate(...arguments)
            },
            toMonth() {
                const [year, month] = arguments
                calendarInstance.calendarToMonth(year, month)
            },
            toggleView() {
                calendarInstance.switchCalendarView(arguments[0])
            },
            prev() {
                calendarInstance.calendarPrev()
            },
            next() {
                calendarInstance.calendarNext()
            },
            reloadPos() {
                return calendarInstance.reloadPos()
            }
        }
    }
})