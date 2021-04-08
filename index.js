import {
    Weeks,
    Today,
    CorrectDate,
    MonthOnly,
    MonthDaysDetailFull,
    initCurrInfo,
    LunarDetail,
    WeekFirstDay,
    YearWeekOrder,
    Months,
    EnOrders,
    DayDetail,
    ConsoleStyle
} from './config'

const CalendarPositions = ['relative', 'absolute', 'fixed']
const CalendarHeight = 820 //日历高度，单位rpx
const Version = '1.0.0'

Component({
    behaviors: ['wx://component-export'],
    options: {
        pureDataPattern: /^_/,
        // multipleSlots: true
    },
    properties: {
        /**
         * 是否选择日期时震动
         */
        _vibrate: {
            type: Boolean,
            value: false
        },
        /**
         * 初始化视图 month, week
         */
        view: {
            type: String,
            value: 'month'
        },
        /**
         * 定位
         */
        _position: {
            type: String,
            value: 'relative'
        },
        /**
         * 绝对定位有用
         */
        _top: {
            type: String,
            optionalTypes: [Number],
            value: '0rpx'
        },
        /**
         * { year: 2021, month: 4, day: 1, type: 'holiday', mark: '愚人节', color: '#2a97ff', bgColor: '#cce6ff' }
         * type: 角标corner，节假日holiday，日程schedule
         */
        _markers: {
            type: Array,
            value: [
                // { year: 2021, month: 4, day: 1, type: 'holiday', mark: '愚人节', color: '#2a97ff', bgColor: '#cce6ff' },
                // { year: 2021, month: 4, day: 4, type: 'holiday', mark: '清明', color: '#2a97ff', bgColor: '#cce6ff' },
                // { year: 2021, month: 4, day: 3, type: 'corner', mark: '休', color: '#61b057' },
                // { year: 2021, month: 4, day: 4, type: 'corner', mark: '休', color: '#61b057' },
                // { year: 2021, month: 4, day: 5, type: 'corner', mark: '休', color: '#61b057' },
                // { year: 2021, month: 4, day: 6, type: 'schedule', mark: '测试一下', color: '#2a97ff', bgColor: '#cce6ff' },
                // { year: 2021, month: 4, day: 6, type: 'schedule', mark: '测试一下哈哈哈', color: '#2a97ff', bgColor: '#cce6ff' },
                // { year: 2021, month: 4, day: 6, type: 'schedule', mark: '测试一下哈哈哈', color: '#2a97ff', bgColor: '#cce6ff' }
            ]
        },
        _markerKey: {
            type: String,
            value: 'id'
        }
    },
    data: {
        Weeks,
        style: 0,
        currTab: 2,
        months: [],
        titleInfo: '',
        minHeight: 0,
        maxHeight: 0,
        panelHeight: 0,
        calendarHeight: 0,
        currView: 1,
        tdOpShow: false,
        monthchange: false,
        barAni: true,
        weektabchange: -1,
        viewchange: '',
        solidDay: true,
        loading: true,
        yearMs: [],
        currYmTab: 2,
        yearPanelShow: false,
        needInitTrans: false,
        _currWeekIdx: 0,
        _markerdays: {},
        _selDay: null,
        _selWeek: 0,
        _rects: [],
        _today: {}
    },
    attached() {
        this._rectsLoading = true
        this._year_panel_show = false
        this._curr_view = this.data.view == 'week' ? 2 : 1
        const current = this.data.currTab
        this.initialize(current, today => {
            this.getRects().then(() => {
                if (this._curr_view == 2) {
                    this.setWeeks(today, current).then(() => {
                        this.getDayCurr(current, today.month)
                        this.bindLoad(true)
                    })
                } else {
                    this.setMonths(today, current).then(() => {
                        this.getDayCurr(current, today.month)
                        this.bindLoad()
                    })
                }
            })
        })
    },
    methods: {
        initialize(current, callback) {
            const _today = Today()
            const system = wx.getSystemInfoSync()
            const _clientWidth = system.windowWidth
            const _otherHeight = Math.floor(200 * _clientWidth / 750)
            const calendarHeight = Math.floor(CalendarHeight * _clientWidth / 750)
            const panelHeight = calendarHeight - _otherHeight
            const maxHeight = Math.floor(system.windowHeight * 0.8)
            const minHeight = panelHeight / 5 + _otherHeight
            this.setData({
                _today,
                style: this.initStyle(),
                maxHeight,
                minHeight,
                calendarHeight,
                panelHeight,
                currView: this._curr_view,
                _selDay: _today,
                _selWeek: _today.week,
                titleInfo: _today.week_name,
                yearMs: this.setYearMs(_today.year, current, _today),
                _markerdays: this.initMarkDays()
            }, () => {
                typeof callback === 'function' && callback.call(this, _today)
            })
        },
        initStyle() {
            const position = CalendarPositions.includes(this.data._position) ? this.data._position : 'relative'
            const top = typeof this.data._top === 'number' ? this.data._top + 'px' : this.data._top
            let style = { position }
            if (position != 'relative') style.top = top
            return Object.keys(style).map(attr => `${ attr }:${ style[attr] };`).join('')
        },
        trigger(event, detail = {}, view = '', eventOptions = {}) {
            let _o = view ? { view } : {}
            detail = Object.assign({}, detail, _o)
            this.triggerEvent(event, detail, eventOptions)
        },
        bindLoad(needInitTrans = false) {
            let setData = { loading: false }
            if (needInitTrans) setData.needInitTrans = true
            const view = this.data.currView == 2 ? 'week' : 'month'
            this.setData(setData, () => {
                this.trigger('load', { date: this.data._selDay }, view)
                this.triggerChange(view)
            })
        },
        triggerChange(type) {
            const detail = this.getTriggerDetail()
            detail.markerCommit = markers => this.handleDynamicMarkers(markers)
            this.trigger('rangechange', detail, type)
        },
        triggerSel(d) {
            this.trigger('datechange', { date: d })
        },
        triggerView(v) {
            this.trigger('viewchange', { view: v == 2 ? 'week' : 'month' })
        },
        getTriggerDetail() {
            const currTab = this.data.currTab
            const _first = this.data.months[(currTab + 3) % 5]
            const _last = this.data.months[(currTab + 2) % 5]
            const _curr = this.data.months[currTab]
            const _detail = this._curr_view == 2 ? this.getTriggerWeekDetail(_curr, _first, _last) : this.getTriggerMonthDetail(_curr, _first, _last)
            return Object.assign({}, _detail, { curr: this.data._selDay })
        },
        getTriggerWeekDetail(_curr, _first, _last) {
            const _l = CorrectDate(_last.wf.year, _last.wf.month, _last.wf.day + 6)
            const _c = CorrectDate(_curr.wf.year, _curr.wf.month, _curr.wf.day + 6)
            const range = [
                { year: _first.wf.year, month: _first.wf.month, day: _first.wf.day },
                { year: _l.year, month: _l.month, day: _l.day }
            ]
            const visual = [
                { year: _curr.wf.year, month: _curr.wf.month, day: _curr.wf.day },
                { year: _c.year, month: _c.month, day: _c.day }
            ]
            return { range, visual }
        },
        getTriggerMonthDetail(_curr, _first, _last) {
            const _f = _first.idays[0]
            const _l = _last.idays[_last.idays.length - 1]
            const range = [
                { year: _f.year, month: _f.month, day: _f.day },
                { year: _l.year, month: _l.month, day: _l.day }
            ]
            const _cf = _curr.idays[0]
            const _cl = _curr.idays[_curr.idays.length - 1]
            const visual = [
                { year: _cf.year, month: _cf.month, day: _cf.day },
                { year: _cl.year, month: _cl.month, day: _cl.day }
            ]
            return { range, visual }
        },
        initMarkDays(_markdays) {
            _markdays = _markdays ? _markdays : this.data._markers
            const _marks = (_ => {
                for (let i = 0; i < _markdays.length; i++) {
                    _ = this.setMarkerItem(_markdays[i], _)
                }
                return _
            })(new Object)
            return _marks
        },
        initMarker(year, month, day) {
            return { year, month, day, corner: [], holiday: [], schedule: [] }
        },
        getMarker(key) {
            const marker = this.data._markerdays[key]
            return marker ? marker : null
        },
        setMarkerItem(marker, markers) {
            let { year, month, day, type, mark, color, bgColor } = marker
            let _key = `d_${ year }_${ month }_${ day }`
            if (!markers.hasOwnProperty(_key)) markers[_key] = this.initMarker(year, month, day)
            if (type == 'corner') mark = mark.substring(0, 2)
            let key = marker[this.data._markerKey] || markers[_key].length
            markers[_key][type].push({ mark, color, bgColor, key })
            return markers
        },
        addMarker(marker) {
            let _markers = this.data._markerdays
            let { year, month, day } = marker
            _markers = this.setMarkerItem(marker, _markers)
            let _key = `d_${ year }_${ month }_${ day }`
            let keys = this.findDateInCurrDateSwiper(year, month, day)
            if (keys.length > 0) {
                this.setData((_ => {
                    for (let i = 0; i < keys.length; i++) {
                        _[keys[i]] = _markers[_key]
                    }
                    return _
                })(new Object))
            }
        },
        editMarker(marker) {
            let _markers = this.data._markerdays
            let { year, month, day, type, mark, color, bgColor } = marker
            let _mkey = `d_${ year }_${ month }_${ day }`
            if (!_markers.hasOwnProperty(_mkey)) return
            let _markerInfo = _markers[_mkey]
            let key = this.data._markerKey
            let setData = new Object
            _markerInfo[type] = _markerInfo[type].map(_ => {
                if (_.key == marker[key]) {
                    _ = { mark, color, bgColor, key }
                }
                return _
            })
            setData[`_markerdays.${ _mkey }.${ type }`] = _markerInfo[type]
            let keys = this.findDateInCurrDateSwiper(year, month, day)
            if (keys.length > 0) {
                for (let i = 0; i < keys.length; i++) {
                    setData[keys[i]] = _markerInfo
                }
            }
            this.setData(setData)
        },
        delMarker({ year, month, day }, type = '', key = '') {
            let setData = new Object
            let _markers = this.data._markerdays
            let _mkey = `d_${ year }_${ month }_${ day }`
            if (!_markers.hasOwnProperty(_mkey)) return
            let _markerInfo = _markers[_mkey]
            if (type != '' && key != '') {
                _markerInfo[type] = _markerInfo[type].filter(_ => _.key != key)
                setData[`_markerdays.${ _mkey }.${ type }`] = _markerInfo[type]
            } else {
                if (type == '') {
                    _markerInfo = null
                    setData[`_markerdays.${ _mkey }`] = null
                } else {
                    _markerInfo[type] = []
                    setData[`_markerdays.${ _mkey }.${ type }`] = []
                }
            }
            let keys = this.findDateInCurrDateSwiper(year, month, day)
            if (keys.length > 0) {
                for (let i = 0; i < keys.length; i++) {
                    setData[keys[i]] = _markerInfo
                }
            }
            this.setData(setData)
        },
        findDateInCurrDateSwiper(year, month, day) {
            let keys = []
            for (let i = 0; i < this.data.months.length; i++) {
                let _month = this.data.months[i]
                if (
                    Math.abs(_month.year - year) < 2 &&
                    Math.abs(_month.month - month) < 2
                ) {

                    let _idx = _month.idays.findIndex(_ => _.year == year && _.month == month && _.day == day)
                    if (_idx >= 0) {
                        let _wdx = Math.floor(_idx / 7)
                        let _widx = _idx % 7
                        keys.push(`months[${ i }].idays[${ _idx }].marker`)
                        keys.push(`months[${ i }].days[${ _wdx }].days[${ _widx }].marker`)
                    }
                }
            }
            return keys
        },
        handleDynamicMarkers(markers) {
            if (Array.isArray(markers) && markers.length > 0) {
                const _ms = markers.filter(_ => _.year && _.month && _.day)
                const _markers = this.initMarkDays(_ms)
                this.setData({ _markerdays: _markers }, () => {
                    this.setDynamicMarkers(_markers)
                })
            }
        },
        setDynamicMarkers(markers) {
            const _markers = Object.keys(markers)
            const months = this.data.months
            for (let i = 0; i < _markers.length; i++) {
                let _marker = markers[_markers[i]]
                for (let j = 0; j < months.length; j++) {
                    let _month = months[j]
                    if (
                        Math.abs(_month.year - _marker.year) < 2 &&
                        Math.abs(_month.month - _marker.month) < 2
                    ) {
                        let _idx = _month.idays.findIndex(_ => _.year == _marker.year && _.month == _marker.month && _.day == _marker.day)
                        if (_idx >= 0) {
                            let _wdx = Math.floor(_idx / 7)
                            let _widx = _idx % 7
                            months[j].idays[_idx].marker = _marker
                            months[j].days[_wdx].days[_widx].marker = _marker
                        }
                    }
                }
            }
            this.setData({ months })
        },
        initCalendarMonth(d, trans = '', wf = null) {
            const { year, month, lunar_order, lunar_year } = d
            const _ds = this.getMonthDays(d)
            const _wds = this.getMonthWeekDays(_ds.days, year, month)
            return {
                key: `m_${ year }_${ month }`,
                year,
                month,
                lunar_order,
                lunar_year,
                idays: _ds.days,
                bar: JSON.parse(JSON.stringify(initCurrInfo)),
                days: _wds,
                count: _ds.count,
                trans: typeof trans === 'function' ? trans.call(this, _ds, _wds) : trans,
                wf
            }
        },
        setMonths(d, current) {
            return new Promise((resolve, reject) => {
                const _trans = this.getMonthsTrans(d, current)
                const months = this.getSwiperMonths(d, current, _trans)
                this.setData({ months }, () => {
                    resolve()
                })
            })
        },
        getSwiperMonths(d, current, trans) {
            return Array.apply(null, { length: 5 }).map((_, i) => {
                if (i === current) return this.initCalendarMonth(d, trans[i])
                return this.initCalendarMonth(DayDetail(d.year, d.month + i - current, 1), trans[i])
            })
        },
        getMonthDays(d) {
            const today = this.data._today
            const { count, days } = MonthDaysDetailFull(d.year, d.month)
            return {
                count,
                days: days.map(item => this.replenishDateInfo(item, today))
            }
        },
        getMonthWeekDays(idays, year, month) {
            return Array.apply(null, { length: idays.length / 7 }).map((w, idx) => {
                return {
                    key: `w_${ year }_${ month }_${ idx + 1 }`,
                    days: Array.apply(null, { length: 7 }).map((_, _i) => idays[idx * 7 + _i])
                }
            })
        },
        replenishDateInfo(d, t) {
            d.isToday = (t.year == d.year && t.month == d.month && t.day == d.day)
            d.key = `d_${ d.year }_${ d.month }_${ d.day }`
            d.marker = this.getMarker(d.key)
            return d
        },
        setWeeks(d, current) {
            return new Promise((resolve, reject) => {
                const { year, month, day } = d
                const months = Array.apply(null, { length: 5 }).map((_, i) => {
                    if (i == current) return this.getMonthByWeekDayInIdx(d)
                    let _d = DayDetail(year, month, day + (i - 2) * 7)
                    return this.getMonthByWeekDayInIdx(_d)
                })
                this.setData({ months }, () => {
                    resolve()
                })
            })
        },
        getRects() {
            this._rectsLoading = true
            return new Promise(resolve => {
                const query = this.createSelectorQuery()
                query.selectAll(`.wd-calendar-week-item`).boundingClientRect(rects => {
                    const _rects = rects.map(item => {
                        item.center = item.left + item.width / 2
                        return item
                    })
                    this.setData({
                        _rects
                    }, () => {
                        this._rectsLoading = false
                        resolve()
                    })
                }).exec()
            })
        },
        initSelBar(i, d, l, w, v) {
            const r = this.data._rects[i % 7]
            return {
                i,
                x: r.center,
                y: `calc(100% / ${ l } * ${ w + 0.5 })`,
                t: d.isToday,
                d: d.day,
                a: true,
                s: true,
                v
            }
        },
        getDayCurr(idx, month, callback = null, vibrate = false) {
            const _month = this.data.months[idx]
            const day = this.data._selDay.day <= _month.count ? this.data._selDay.day : _month.count
            const seekIdx = _month.idays.findIndex(_d => (_d.month == month && _d.day == day))
            if (seekIdx >= 0) {
                const seekDay = _month.idays[seekIdx]
                const wdx = this.getDayInCurrMonthWeek(seekDay)
                let setData = {
                    _currWeekIdx: wdx,
                    [`months[${ idx }].bar`]: this.initSelBar(seekIdx, seekDay, _month.days.length, wdx, vibrate)
                }
                typeof callback === 'function' && (setData = callback(setData, seekDay, seekIdx))
                this.setData(setData, () => {
                    this.setTitleInfo(seekDay)
                    this.triggerSel(seekDay)
                })
            }
        },
        swiperTo(type, d, current) {
            current = current ? current : this.data.currTab
            const _current = type == 'prev' ? (current + 4) % 5 : (current + 1) % 5
            this.setData({
                _selDay: d,
                _selWeek: d.week,
                currTab: _current
            })
        },
        selDate(e) {
            if (this._rectsLoading) return
            const currTab = this.data.currTab
            const { wdx, ddx } = e.currentTarget.dataset
            const idx = wdx * 7 + ddx
            const { idays, month } = this.data.months[currTab]
            const seek = idays[idx]
            if (this.data.currView != 2) {
                if (seek.type == 'prev' || seek.type == 'next') {
                    this.swiperTo(seek.type, seek, currTab)
                } else {
                    this.setDate(idx, currTab, (setData, _s, _w) => {
                        if (_w === this.data._currWeekIdx) return setData
                        setData = Object.assign({}, setData, this.refreshAllTrans(_s))
                        return setData
                    })
                }
            } else {
                if (seek.month != month) {
                    let newMonth = this.getMonthByWeekDayInIdx(seek)
                    this.setData({
                        [`months[${ currTab }]`]: this.handelWeekMonthChange(this.data._selDay, newMonth),
                        monthchange: true,
                        barAni: false
                    }, () => {
                        this.handleWeekMonthChangeSel(seek, currTab, newMonth)
                    })
                } else {
                    this.setDate(idx, currTab)
                }
            }
        },
        handelWeekMonthChange(d, newMonth) {
            const seekIdx = newMonth.idays.findIndex(_d => (_d.month == d.month && _d.day == d.day))
            if (seekIdx >= 0) {
                const seekDay = newMonth.idays[seekIdx]
                newMonth.bar = this.initSelBar(seekIdx, seekDay, newMonth.days.length, Math.floor(seekIdx / 7), false)
            }
            return newMonth
        },
        handleWeekMonthChangeSel(seek, currTab, month) {
            const seekIdx = month.idays.findIndex(_d => (_d.month == seek.month && _d.day == seek.day))
            if (seekIdx >= 0) {
                const seekDay = month.idays[seekIdx]
                const wdx = Math.floor(seekIdx / 7)
                let setData = {
                    _currWeekIdx: wdx,
                    _selDay: seekDay,
                    _selWeek: seekDay.week,
                    barAni: true,
                    [`months[${ currTab }].bar`]: this.initSelBar(seekIdx, seekDay, month.days.length, wdx, true)
                }
                this.setData(setData, () => {
                    this.setTitleInfo(seekDay)
                    this.triggerSel(seekDay)
                })
            }
        },
        setDate(idx, currTab, callback) {
            const month = this.data.months[currTab]
            const seek = month.idays[idx]
            const wdx = this.getDayInCurrMonthWeek(seek)
            let setData = {
                _selDay: seek,
                _selWeek: seek.week,
                _currWeekIdx: wdx,
                [`months[${ currTab }].bar`]: this.initSelBar(idx, seek, month.days.length, wdx, true)
            }
            if (typeof callback === 'function') setData = callback(setData, seek, wdx)
            this.setData(setData, () => {
                this.setTitleInfo(seek)
                this.triggerSel(seek)
            })
        },
        refreshAllTrans(seek) {
            const _trans = this.getMonthsTrans(seek, this.data.currTab)
            return (_ => {
                for (let i = 0; i < 5; i++) {
                    _[`months[${ i }].trans`] = _trans[i]
                }
                return _
            })(new Object)
        },
        handleSelBarAniEnd(e) {
            const currTab = this.data.currTab
            const key = `months[${ currTab }].bar.a`
            this.setData({
                [key]: false,
                tdOpShow: !this.data.months[currTab].bar.t
            })
            if (this.data.months[currTab].bar.v && this.data._vibrate) {
                wx.vibrateShort({
                    type: 'light'
                })
            }
        },
        handleSwiperAniEnd(e) {
            const { current, source } = e.detail
            if (source == 'touch') {
                if (current != this.data.currTab) {
                    this.setCurrTab(current)
                }
            } else {
                this.refrenMonths(current, true)
            }
        },
        setCurrTab(currTab) {
            this.setData({ currTab }, () => {
                this.refrenMonths(currTab)
            })
        },
        refrenMonths(current, v = false) {
            if (this.data.currView == 2) {
                this.refreshMonthWeekStatus(current, v)
            } else {
                this.refreshMonthStatus(current, v)
            }
        },
        refreshMonthStatus(current, v = false) {
            const currMonth = this.data.months[current]
            this.getDayCurr(current, currMonth.month, (setData, seekday) => {
                setData._selDay = seekday
                return setData
            }, v)
            const _trans = this.getMonthsTrans(this.data._selDay, current)
            this.refreshAllMonth(currMonth, current, _trans, setData => {
                setData[`months[${ current }].trans`] = _trans[current]
                return setData
            }, () => {
                this.triggerChange('month')
            })
        },
        refreshAllMonth(currMonth, current, _trans, _scallback, _acallback) {
            const { year, month } = currMonth
            const idx_1 = (current + 3) % 5
            const idx_2 = (current + 4) % 5
            const idx_3 = (current + 1) % 5
            const idx_4 = (current + 2) % 5
            const d1 = DayDetail(year, month - 2, 1)
            const d2 = DayDetail(year, month - 1, 1)
            const d3 = DayDetail(year, month + 1, 1)
            const d4 = DayDetail(year, month + 2, 1)
            let setData = {
                [`months[${ idx_1 }]`]: this.refreshMonth(d1, idx_1, _trans),
                [`months[${ idx_2 }]`]: this.refreshMonth(d2, idx_2, _trans),
                [`months[${ idx_3 }]`]: this.refreshMonth(d3, idx_3, _trans),
                [`months[${ idx_4 }]`]: this.refreshMonth(d4, idx_4, _trans)
            }
            if (typeof _scallback === 'function') setData = _scallback(setData)
            this.setData(setData, () => {
                typeof _acallback === 'function' && _acallback()
            })
        },
        refreshMonth(d, idx, _trans) {
            return this.initCalendarMonth(d, _trans[idx])
        },
        refreshMonthWeekStatus(current, v = false) {
            this.getDayCurrForWeek(current, () => {
                this.setMonthsForWeek(current, setData => {
                    setData.weektabchange = current
                    return setData
                }, () => {
                    this.triggerChange('week')
                })
            }, v)
        },
        getDayCurrForWeek(current, callback, v = false) {
            const month = this.data.months[current]
            const wf = month.wf
            const newSelDay = CorrectDate(wf.year, wf.month, wf.day + this.data._selDay.week)
            const seekIdx = month.idays.findIndex(_d => (_d.month == newSelDay.month && _d.day == newSelDay.day))
            if (seekIdx >= 0) {
                const seekDay = month.idays[seekIdx]
                const wdx = this.getDayInCurrMonthWeek(seekDay)
                this.setData({
                    _selDay: seekDay,
                    _selWeek: seekDay.week,
                    _currWeekIdx: wdx,
                    [`months[${ current }].bar`]: this.initSelBar(seekIdx, seekDay, month.days.length, wdx, v)
                }, () => {
                    this.setTitleInfo(seekDay)
                    this.triggerSel(seekDay)
                    typeof callback === 'function' && callback()
                })
            }
        },
        setTitleInfo(d) {
            const today = this.data._today
            let titleInfo = this.data.titleInfo
            if (d.year == today.year && d.month == today.month && d.day == today.day) {
                titleInfo = this._curr_view == 2 ? `第${ YearWeekOrder(today.year, today.month, today.day) }周  ${ today.week_name }` : today.week_name
            } else {
                const count = this.getDateDiff(new Date(today.year, today.month - 1, today.day), new Date(d.year, d.month - 1, d.day))
                titleInfo = `${ this._curr_view == 2 ? '第' + YearWeekOrder(d.year, d.month, d.day) + '周  ' : ''}${ Math.abs(count) }天${ count < 0 ? '前' : '后' }`
            }
            this.setData({ titleInfo })
        },
        getDateDiff(startDate, endDate) {
            return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        toggleView({ state }) {
            this._curr_view = state
        },
        handleCalendarTransEnd() {
            const noChanged = ((this.data.currView == 1 || this.data.currView == 3) && (this._curr_view == 1 || this._curr_view == 3) || this._curr_view == this.data.currView)
            if (!noChanged) {
                this.triggerView(this._curr_view)
                this.setData({
                    currView: this._curr_view
                }, () => {
                    const { _selDay, currTab } = this.data
                    if (this._curr_view == 2) {
                        this.setMonthsForWeek(currTab, setData => {
                            setData.weektabchange = currTab
                            if (this._curr_view == 1) setData.yearPanelShow = this._year_panel_show
                            return setData
                        }, () => {
                            this.triggerChange('week')
                        })
                    } else {
                        const _trans = this.getMonthsTrans(_selDay, this.data.months[currTab].trans, true)
                        this.refreshAllMonth(_selDay, currTab, _trans, setData => {
                            if (this._curr_view == 1) setData.yearPanelShow = this._year_panel_show
                            return setData
                        }, () => {
                            this.triggerChange('month')
                        })
                    }
                    this.setTitleInfo(_selDay)
                })
            } else if (this._curr_view != this.data.currView) {
                let setData = { currView: this._curr_view }
                if (this._curr_view == 1) setData.yearPanelShow = this._year_panel_show
                this.setData(setData)
            }
        },
        handleOpBarTransEnd() {
            this.setData({
                solidDay: this._curr_view != 2
            })
        },
        toToday() {
            if (this.data.tdOpShow) {
                if (this.data.currView == 2) {
                    this.handleWeekToDate(this.data._today)
                } else {
                    this.handleMonthToToday(this.data._today)
                }
            }
        },
        handleDayInOtherMonth(day, tab, callback) {
            let month = this.data.months[tab]
            if (day.month != month.month) {
                let newMonth = this.getMonthByWeekDayInIdx(day)
                this.setData({
                    [`months[${ tab }]`]: this.handelWeekMonthChange(this.data._selDay, newMonth),
                    monthchange: true,
                    barAni: false
                }, () => {
                    typeof callback === 'function' && callback()
                })
            } else {
                typeof callback === 'function' && callback()
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
            if (isInSwiper >= 0) {
                if (isInSwiper == currTab) {
                    this.handleDayInOtherMonth(date, isInSwiper, () => {
                        const idx = this.getDayInCurrMonth(date)
                        if (idx >= 0) this.setDate(idx, currTab, (setData, _s, _w) => {
                            if (_w === this.data._currWeekIdx) return setData
                            setData = Object.assign({}, setData, this.refreshAllTrans(_s))
                            setData.barAni = true
                            return setData
                        })
                    })
                } else {
                    this.setData({
                        currTab: isInSwiper
                    }, () => {
                        this.handleDayInOtherMonth(date, isInSwiper, () => {
                            const _idx = this.data.months[isInSwiper].idays.findIndex(_d => (_d.month == date.month && _d.day == date.day))
                            this.setDate(_idx, isInSwiper, (setData, _s, _w) => {
                                setData = Object.assign({}, setData, this.refreshAllTrans(_s))
                                setData.barAni = true
                                return setData
                            })
                        })
                    })
                }
            } else {
                this.setData({
                    _selDay: date,
                    _selWeek: date.week
                }, () => {
                    this.setMonthsForWeek(currTab, setData => {
                        let month = this.getMonthByWeekDayInIdx(date)
                        month.wf = setData[`months[${ currTab }].wf`]
                        delete(setData[`months[${ currTab }].wf`])
                        setData[`months[${ currTab }]`] = month
                        setData.monthchange = true
                        setData.weektabchange = this.data.currTab
                        return setData
                    }, () => {
                        this.getDayCurr(currTab, date.month, null, true)
                        this.triggerChange('week')
                    })
                })
            }
        },
        handleMonthToToday(date) {
            const isInSwiper = this.data.months.findIndex(_m => (_m.year == date.year && _m.month == date.month))
            const currTab = this.data.currTab
            if (isInSwiper >= 0) {
                if (currTab == isInSwiper) {
                    const idx = this.getDayInCurrMonth(date)
                    if (idx >= 0) this.setDate(idx, currTab, (setData, _s, _w) => {
                        if (_w === this.data._currWeekIdx) return setData
                        setData = Object.assign({}, setData, this.refreshAllTrans(_s))
                        return setData
                    })
                } else {
                    this.setData({
                        currTab: isInSwiper
                    }, () => {
                        const _idx = this.data.months[isInSwiper].idays.findIndex(_d => (_d.month == date.month && _d.day == date.day))
                        this.setDate(_idx, isInSwiper, (setData, _s, _w) => {
                            setData = Object.assign({}, setData, this.refreshAllTrans(_s))
                            return setData
                        })
                    })

                }
            } else {
                const d = CorrectDate(date.year, date.month, 1)
                const _trans = this.getMonthsTrans(date, currTab)
                this.setData({
                    [`months[${ currTab }]`]: this.refreshMonth(d, currTab, _trans),
                    _selDay: date,
                    _selWeek: date.week
                }, () => {
                    this.getDayCurr(currTab, date.month, null, true)
                })
                this.refreshAllMonth(date, currTab, _trans, null, () => {
                    this.triggerChange('month')
                })
            }
        },
        getDayInCurrMonth(d) {
            const _ = this.data.months[this.data.currTab].idays
            return _.findIndex(_d => (d.year == _d.year && d.month == _d.month && d.day == _d.day))
        },
        getDayInCurrMonthWeek(d) {
            const _ = this.data.months[this.data.currTab].idays
            return this.getDayWeekIdxInMonth(d, _)
        },
        getDayWeekIdxInMonth(d, _) {
            const idx = _.findIndex(_d => (d.month == _d.month && d.day == _d.day))
            return Math.floor(idx / 7)
        },
        setMonthsForWeek(current, callback, userFunc) {
            const currDay = this.data._selDay
            this.setWeekMonths(currDay, current, callback, userFunc)
        },
        setWeekMonths(d, current, callback, userFunc) {
            const { year, month, day } = d
            current = current ? current : this.data.currTab
            const idx_1 = (current + 3) % 5
            const idx_2 = (current + 4) % 5
            const idx_3 = (current + 1) % 5
            const idx_4 = (current + 2) % 5
            const d1 = DayDetail(year, month, day - 14)
            const d2 = DayDetail(year, month, day - 7)
            const d3 = DayDetail(year, month, day + 7)
            const d4 = DayDetail(year, month, day + 14)
            let setData = {
                [`months[${ idx_1 }]`]: this.getMonthByWeekDayInIdx(d1),
                [`months[${ idx_2 }]`]: this.getMonthByWeekDayInIdx(d2),
                [`months[${ current }].wf`]: WeekFirstDay(d.year, d.month, d.day),
                [`months[${ idx_3 }]`]: this.getMonthByWeekDayInIdx(d3),
                [`months[${ idx_4 }]`]: this.getMonthByWeekDayInIdx(d4),
            }
            if (typeof callback === 'function') setData = callback(setData)
            this.setData(setData, () => {
                typeof userFunc === 'function' && userFunc()
            })
        },
        getMonthByWeekDayInIdx(d) {
            return this.initCalendarMonth(
                d,
                (ids, ds) => this.calcTrans(this.getDayWeekIdxInMonth(d, ids.days), ds.length),
                WeekFirstDay(d.year, d.month, d.day)
            )
        },
        calcTrans(wdx, wlength) {
            const defaultDayHeight = this.data.panelHeight / 5
            const currentDayHeight = wlength == 5 ? defaultDayHeight : this.data.panelHeight / wlength
            const dayHeightDifference = wlength == 5 ? 0 : (defaultDayHeight - currentDayHeight) / 2
            return Math.floor((wdx * currentDayHeight - dayHeightDifference) * 100) / 100
        },
        getMonthsTrans(d, current, isCurrTrans = false) {
            const { year, month, day } = d
            const idx_1 = (current + 3) % 5
            const idx_2 = (current + 4) % 5
            const idx_3 = (current + 1) % 5
            const idx_4 = (current + 2) % 5
            const d1 = CorrectDate(year, month, day - 14)
            const d2 = CorrectDate(year, month, day - 7)
            const d3 = CorrectDate(year, month, day + 7)
            const d4 = CorrectDate(year, month, day + 14)
            const arr = Array.apply(null, { length: 5 }).map(_ => 0)
            arr[idx_1] = this.getTransByDayInMonth(d1)
            arr[idx_2] = this.getTransByDayInMonth(d2)
            arr[current] = isCurrTrans ? current : this.getTransByDayInMonth(d)
            arr[idx_3] = this.getTransByDayInMonth(d3)
            arr[idx_4] = this.getTransByDayInMonth(d4)
            return arr
        },
        getTransByDayInMonth(d) {
            const idays = this.getMonthDays(d).days
            return this.calcTrans(this.getDayWeekIdxInMonth(d, idays), idays.length / 7)
        },
        setYearMs(year, current, today) {
            today = today ? today : this.data._today
            let years = Array.apply(null, { length: 5 })
            years[(current + 3) % 5] = year - 2
            years[(current + 4) % 5] = year - 1
            years[current] = year
            years[(current + 1) % 5] = year + 1
            years[(current + 2) % 5] = year + 2
            return Array.apply(null, { length: 5 }).map((_, i) => this.getYearMonth(years[i], today))
        },
        refreshYearMs(year, current, callback) {
            const today = this.data._today
            const idx_1 = (current + 3) % 5
            const idx_2 = (current + 4) % 5
            const idx_3 = (current + 1) % 5
            const idx_4 = (current + 2) % 5
            const y1 = year - 2
            const y2 = year - 1
            const y3 = year + 1
            const y4 = year + 2
            this.setData({
                [`yearMs[${ idx_1 }]`]: this.getYearMonth(y1, today),
                [`yearMs[${ idx_2 }]`]: this.getYearMonth(y2, today),
                [`yearMs[${ idx_3 }]`]: this.getYearMonth(y3, today),
                [`yearMs[${ idx_4 }]`]: this.getYearMonth(y4, today)
            }, () => {
                typeof callback === 'function' && callback()
            })
        },
        getYearMonth(year, today) {
            today = today ? today : this.data._today
            let { lunar_year } = LunarDetail(year, 6, 1)
            return {
                year,
                lunar_year,
                key: `yp_${ year }`,
                months: Months.map(m => {
                    return {
                        month: m,
                        curr: today.year == year && today.month == m,
                        lunar: this.getMonthLunarMonthFirst(year, m)
                    }
                })
            }
        },
        getMonthLunarMonthFirst(year, month) {
            const monthDays = MonthOnly(year, month)
            return monthDays.filter(d => d.ld == 1).map(d => {
                let { day, lunar_month } = d
                return { day, lunar: lunar_month, order: day > 3 ? EnOrders[4] : EnOrders[day] }
            })
        },
        handleYmSwiperAniEnd(e) {
            const { current, source } = e.detail
            const year = this.data.yearMs[current].year
            if (source == 'touch') {
                if (current != this.data.currYmTab) {
                    this.setData({
                        currYmTab: current
                    }, () => {
                        this.refreshYearMs(year, current)
                    })
                }
            } else {
                this.refreshYearMs(year, current)
            }
        },
        justYearPanelShow() {
            this._year_panel_show = true
            this.setData({
                yearPanelShow: true
            })
        },
        handleYearPanelShow() {
            this._year_panel_show = true
        },
        handleYearPanelDayClick(e) {
            const { year, month } = e.currentTarget.dataset
            const currTab = this.data.currTab
            const currMonth = this.data.months[currTab]
            if (currMonth.year == year && currMonth.month == month) {
                this._year_panel_show = false
                this.setData({
                    yearPanelShow: false
                })
            } else {
                const d = this.getMonthDay(year, month, this.data._selDay.day)
                const _trans = this.getMonthsTrans(d, currTab)
                this._year_panel_show = false
                this.setData({
                    [`months[${ currTab }]`]: this.refreshMonth(d, currTab, _trans),
                    _selDay: d,
                    _selWeek: d.week,
                    yearPanelShow: false
                }, () => {
                    this.getDayCurr(currTab, d.month)
                })
                this.refreshAllMonth(d, currTab, _trans, null, () => {
                    this.triggerChange('month')
                })
            }
        },
        getMonthDay(year, month, day) {
            const dayCount = MonthOnly(year, month).length
            const today = this.data._today
            day = day > dayCount ? dayCount : day
            let date = this.replenishDateInfo(DayDetail(year, month, day), today)
            return date
        },
        getCorrectDate() {
            if (arguments.length == 1) {
                let date
                if (typeof arguments[0] === 'string') {
                    const strDates = arguments[0].split('-').map(_ => parseInt(_))
                    if (strDates.length < 3) {
                        this.console('日期格式错误', 'warn')
                        return null
                    }
                    strDates[1] = strDates[1] - 1
                    date = new Date(...strDates)
                } else {
                    date = new Date(arguments[0])
                }
                if (isNaN(date.getTime())) {
                    this.console('日期格式错误', 'warn')
                    return null
                }
                const year = date.getFullYear()
                const month = date.getMonth() + 1
                const day = date.getDate()
                return { year, month, day }
            } else if (arguments.length == 3) {
                const [_y, _m, _d] = arguments
                const [y, m, d] = [_y, _m, _d].map(_ => parseInt(_))
                const { year, month, day } = CorrectDate(y, m, d)
                return { year, month, day }
            } else {
                this.console('日期格式错误', 'warn')
                return null
            }
        },
        calendarToDate() {
            const date = this.getCorrectDate(...arguments)
            if (date) {
                const today = this.data._today
                let d = this.replenishDateInfo(DayDetail(date.year, date.month, date.day), today)
                if (this.data.currView == 2) {
                    this.handleWeekToDate(d)
                } else {
                    this.handleMonthToToday(d)
                }
            }
        },
        calendarToMonth(year, month) {
            const d = DayDetail(year, month, 1)
            if (this.data.currView == 2) {
                this.handleWeekToDate(d)
            } else {
                this.handleMonthToToday(d)
            }
        },
        calendarPrev() {
            const _prev = (this.data.currTab + 4) % 5
            this.setCurrTab(_prev)
        },
        calendarNext() {
            const _next = (this.data.currTab + 1) % 5
            this.setCurrTab(_next)
        },
        switchCalendarView(view) {
            view = view ? view : 'month'
            view = (view != 'month' && view != 'week') ? 'month' : view
            this.setData({
                viewchange: view
            })
        },
        getCalendarDateInfo() {
            const { year, month, day } = this.getCorrectDate(...arguments)
            return this.replenishDateInfo(DayDetail(year, month, day), this.data._today)
        },
        console(tips, type = 'info') {
            const { label, content } = ConsoleStyle[type]
            console.log(`%c${ type.toLocaleUpperCase() } %c${ tips }`, label, content)
        }
    },
    export () {
        if (this.data.loading) {
            this.console('请在bindload回调后执行selectComponent', 'warn')
            return null
        }
        const { minHeight, maxHeight, calendarHeight } = this.data
        const calendarInstance = this
        return {
            name: 'wm-calendar',
            version: Version,
            minHeight,
            maxHeight,
            height: calendarHeight,
            getDateInfo() {
                return calendarInstance.getCalendarDateInfo(...arguments)
            },
            setMarkers() {
                calendarInstance.handleDynamicMarkers(arguments[0])
            },
            addMarker() {
                calendarInstance.addMarker(arguments[0])
            },
            editMarker() {
                calendarInstance.editMarker(arguments[0])
            },
            delMarker() {
                const [date, type, key] = arguments
                calendarInstance.delMarker(date, type, key)
            },
            reloadMarkers() {
                calendarInstance.handleDynamicMarkers(calendarInstance.data._markers)
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
            }
        }
    }
})