import LunarDate from '../plugins/lunar'

module.exports = [{
        name: 'lunar',
        regist: instance => instance.data.showLunar,
        handle: date => {
            const { year, month, day } = date
            const _date = new Date(year, month - 1, day)
            return LunarDate.isOverDate(_date) ? null : LunarDate.lunar(year, month, day)
        }
    },
    {
        name: 'marker',
        regist: instance => instance.data.showMark,
        handle: (date, calendar) => {
            const key = `${ date.year }_${ date.month }_${ date.day }`
            const marker = calendar._dateMarkers.hasOwnProperty(key) ? {...calendar._dateMarkers[key] } : null
            return marker
        }
    }
]