import { Lunar } from './lunar'

const LunarMinDate = (new Date(1901, 0, 1)).getTime()
const LunarMaxDate = (new Date(2100, 0, 1)).getTime()
const Weeks = ['日', '一', '二', '三', '四', '五', '六']
const Months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const EnOrders = ['', 'st', 'nd', 'rd', 'th']
const initCurrInfo = { i: 0, x: 0, y: 0, t: false, d: 0, a: false, v: false, s: false }
const ConsoleStyle = {
    info: {
        label: 'color: #409EFF; font-weight:bold',
        content: 'color: #8cc5ff',
        title: '提示'
    },
    warn: {
        label: 'color: #f37b1d; font-weight:bold',
        content: 'color: #fcdabd',
        title: '警告'
    }
}

const Today = () => {
    const _today = new Date;
    return DayDetail(_today.getFullYear(), _today.getMonth() + 1, _today.getDate())
}

const isOverDate = date => {
    const queryTime = date.getTime()
    return queryTime < LunarMinDate || queryTime >= LunarMaxDate
}

const LunarDetail = (gregorianYear, gregorianMonth, gregorianDay) => {
    Lunar.resetInitGregorian(gregorianYear, gregorianMonth, gregorianDay)
    Lunar.setGregorian(gregorianYear, gregorianMonth, gregorianDay)
    return Lunar.getLunarDate()
}

const DayDetail = (year, month, day, type = '') => {
    const date = new Date(year, month - 1, day)
    const _year = date.getFullYear()
    const _month = date.getMonth() + 1
    const _day = date.getDate()
    const week = date.getDay()
    const week_name = `周${ Weeks[week] }`
    const { lunar_order, lunar_year, lunar_month, lunar_day, lunar_date, lunar_type } = (isOverDate(date) ? emptyLunar() : LunarDetail(_year, _month, _day))
    return { year: _year, month: _month, day: _day, week, week_name, lunar_order, lunar_year, lunar_month, lunar_day, lunar_type, lunar_date, type }
}

const emptyLunar = () => {
    return { lunar_order: '', lunar_year: '', lunar_month: '', lunar_day: '', lunar_date: '', lunar_type: '' }
}

const MonthDaysCount = (year, month) => {
    return (new Date(year, month, 0)).getDate()
}

const DayShort = (year, month, day) => {
    const date = new Date(year, month - 1, day)
    const _year = date.getFullYear()
    const _month = date.getMonth() + 1
    const _day = date.getDate()
    const { lunar_month, lm, ld } = LunarDetail(_year, _month, _day)
    return { year: _year, month: _month, day: _day, lunar_month, lm, ld }
}

const MonthOnly = (year, month) => {
    const _count = MonthDaysCount(year, month)
    return Array.apply(null, { length: _count }).map((_, _i) => DayShort(year, month, _i + 1))
}

const MonthDaysDetail = (year, month) => {
    const _count = MonthDaysCount(year, month)
    return Array.apply(null, { length: _count }).map((_, _i) => DayDetail(year, month, _i + 1))
}

const MonthDaysDetailFull = (year, month) => {
    const _days = MonthDaysDetail(year, month)
    const _beforeDays = Array.apply(null, { length: _days[0].week }).map((_, _i) => DayDetail(year, month, -_i, 'prev')).reverse()
    const _lastDay = _days[_days.length - 1]
    const _afterDays = Array.apply(null, { length: 6 - _lastDay.week }).map((_, _i) => DayDetail(year, month, _lastDay.day + _i + 1, 'next'))
    return {
        count: _days.length,
        days: _beforeDays.concat(_days).concat(_afterDays)
    }
}

const CorrectDate = (gregorianYear, gregorianMonth, gregorianDay) => {
    const _date = new Date(gregorianYear, gregorianMonth - 1, gregorianDay)
    return { year: _date.getFullYear(), month: _date.getMonth() + 1, day: _date.getDate() }
}

const WeekFirstDay = (gregorianYear, gregorianMonth, gregorianDay) => {
    const _date = new Date(gregorianYear, gregorianMonth - 1, gregorianDay)
    const week = _date.getDay()
    const wf = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() - week)
    return { year: wf.getFullYear(), month: wf.getMonth() + 1, day: wf.getDate() }
}

const YearWeekOrder = (gregorianYear, gregorianMonth, gregorianDay) => {
    const currDate = new Date(gregorianYear, gregorianMonth - 1, gregorianDay)
    const firstDate = new Date(gregorianYear, 0, 1)
    const diff = Math.round((currDate.valueOf() - firstDate.valueOf()) / 86400000)
    return Math.ceil((diff + ((firstDate.getDay() + 1) - 1)) / 7)
}

module.exports = {
    Weeks,
    Today,
    DayDetail,
    MonthDaysCount,
    MonthDaysDetail,
    MonthDaysDetailFull,
    initCurrInfo,
    CorrectDate,
    LunarDetail,
    WeekFirstDay,
    YearWeekOrder,
    Months,
    MonthOnly,
    EnOrders,
    ConsoleStyle
}