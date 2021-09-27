import services from './service'

class DateHandler {

    static Weeks = '日一二三四五六'

    static NeedRegist(service, instance) {
        if (typeof service.handle !== 'function') return false
        if (!service.hasOwnProperty('regist')) return true
        if (typeof service.regist === 'function') return service.regist(instance)
        return !!service.regist
    }

    static MonthDays = (y, m) => (new Date(y, m, 0)).getDate()

    static ResortWeeks(start) {
        return DateHandler.Weeks.slice(start) + DateHandler.Weeks.slice(0, start)
    }

    constructor(instance, weekStart = 0) {
        this.component = instance
        this.serviceNameOrder = 0
        this.weekStart = weekStart
        this.bindServices()
        this.initToday()
    }

    bindInstance(instance) {
        this.component = instance
    }

    bindServices() {
        this.services = Array.isArray(services) ? services.filter(item => DateHandler.NeedRegist(item, this.component)).map(item => {
            const { name, handle } = item
            const _name = name ? name : this.getServiceOrderName()
            return { name: _name, handle }
        }) : DateHandler.NeedRegist(services, this.component) ? [{
            name: services.name ? services.name : this.getServiceOrderName(),
            handle: services.handle
        }] : []
    }

    regist({ name, handle }) {
        if (typeof handle === 'function') {
            name = name ? name : this.getServiceOrderName()
            this.services.push({ name, handle })
        }
    }

    getServiceOrderName() {
        const name = `service_${ this.serviceNameOrder }`
        this.serviceNameOrder++
            return name
    }

    serviceHandle(date) {
        for (const service of this.services) {
            date[service.name] = service.handle(date, this.component)
        }
        return date
    }

    date(date) {
        const { year, month, day } = date
        const { year: ty, month: tm, day: td } = this._today
        const _date = new Date(year, month - 1, day)
        const _y = _date.getFullYear()
        const _m = _date.getMonth() + 1
        const _d = _date.getDate()
        const _w = _date.getDay()

        return this.serviceHandle(Object.assign({}, date, {
            year: _y,
            month: _m,
            day: _d,
            week: _w,
            week_name: DateHandler.Weeks[_w],
            today: _y === ty && _m === tm && _d === td,
            key: `d_${ _y }_${ _m }_${ _d }`
        }))
    }

    initToday() {
        const _today = new Date
        const _y = _today.getFullYear()
        const _m = _today.getMonth() + 1
        const _d = _today.getDate()
        const _w = _today.getDay()
        this._today = this.serviceHandle({
            year: _y,
            month: _m,
            day: _d,
            week: _w,
            week_name: DateHandler.Weeks[_w],
            today: true
        })
    }

    today() {
        return this._today
    }

    monthBefore(monthFirstDay) {
        const { year, month, week } = monthFirstDay
        const beforeLength = Math.abs(week + 7 - this.weekStart) % 7
        return Array.apply(null, { length: beforeLength })
            .map((_, _i) => this.date({ year, month, day: -_i, state: 'prev' }))
            .reverse()
    }

    monthAfter(monthLastDay) {
        const { year, month, day, week } = monthLastDay
        const afterLength = 6 - Math.abs(week + 7 - this.weekStart) % 7
        return Array.apply(null, { length: afterLength })
            .map((_, _i) => this.date({ year, month, day: day + _i + 1, state: 'next' }))
    }

    month(year, month) {
        return Array.apply(null, { length: DateHandler.MonthDays(year, month) })
            .map((_, _i) => this.date({ year, month, day: _i + 1, state: '' }))
    }

    suppleMonth(year, month) {
        const monthDays = this.month(year, month)
        return {
            count: monthDays.length,
            days: this.monthBefore(monthDays[0]).concat(monthDays).concat(this.monthAfter(monthDays[monthDays.length - 1]))
        }
    }

    static NormalDate(year, month, day) {
        const date = new Date(year, month - 1, day)
        return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
    }

    static CorrectDate() {
        if (arguments.length === 1) {
            if (typeof arguments[0] === 'string') {
                const strdate = arguments[0].split('-').map(_ => parseInt(_))
                if (strdate.length < 3) {
                    const date = new Date(strdate[0])
                    if (isNaN(date.getTime())) return null
                    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
                }
                return DateHandler.NormalDate(strdate[0], strdate[1], strdate[2])
            } else if (typeof arguments[0] === 'number') {
                const date = new Date(arguments[0])
                if (isNaN(date.getTime())) return null
                return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
            } else if (Array.isArray(arguments[0])) {
                if (arguments[0].length < 3) return null
                const [year, month, day] = arguments[0]
                return DateHandler.NormalDate(year, month, day)
            } else if (typeof arguments[0] === 'object') {
                const { year, month, day } = arguments[0]
                if (!year || !month || !day) return null
                return DateHandler.NormalDate(year, month, day)
            }
        } else if (arguments.length === 3) {
            const [y, m, d] = arguments
            const [year, month, day] = [y, m, d].map(_ => parseInt(_))
            return DateHandler.NormalDate(year, month, day)
        }
        return null
    }

    static WeekOrder(date) {
        const { year, month, day } = date
        const currDate = new Date(year, month - 1, day)
        const firstDate = new Date(year, 0, 1)
        const diff = Math.round((currDate.valueOf() - firstDate.valueOf()) / 86400000)
        return Math.ceil((diff + ((firstDate.getDay() + 1) - 1)) / 7)
    }

    static DateDiff(start, end) {
        const startDate = new Date(start.year, start.month - 1, start.day)
        const endDate = new Date(end.year, end.month - 1, end.day)
        return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    static WeekFirstDay(date, weekStart = 0) {
        const { year, month, day } = date
        const _date = new Date(year, month - 1, day)
        const week = _date.getDay()
        const weekfirst = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() - Math.abs(week + 7 - weekStart) % 7)
        return { year: weekfirst.getFullYear(), month: weekfirst.getMonth() + 1, day: weekfirst.getDate() }
    }
}

module.exports = DateHandler