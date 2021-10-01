// index.js
const app = getApp()

Page({
    data: {
        markers: [
            { year: 2021, month: 9, day: 1, type: 'holiday', mark: '愚人节', color: '#2a97ff', bgColor: '#cce6ff' },
            { year: 2021, month: 9, day: 4, type: 'holiday', mark: '清明', color: '#2a97ff', bgColor: '#cce6ff' },
            { year: 2021, month: 9, day: 3, type: 'corner', mark: '休', color: '#61b057' },
            { year: 2021, month: 9, day: 4, type: 'corner', mark: '休', color: '#61b057' },
            { year: 2021, month: 9, day: 5, type: 'corner', mark: '休', color: '#61b057' },
            { year: 2021, month: 9, day: 6, type: 'schedule', mark: '测试一下', color: '#2a97ff', bgColor: '#cce6ff' },
            { year: 2021, month: 9, day: 6, type: 'schedule', mark: '测试一下哈哈哈', color: '#2a97ff', bgColor: '#cce6ff' },
            { year: 2021, month: 9, day: 6, type: 'schedule', mark: '测试一下哈哈哈', color: '#2a97ff', bgColor: '#cce6ff' }
        ]
    },
    onLoad() {

    },
    handleCalendarLoad({ detail }) {
        console.log('calendar-load', detail)
        this.calendar = this.selectComponent('#calendar')

        const timer = setTimeout(() => {
            this.setData({
                markers: [
                    { year: 2021, month: 9, day: 28, type: 'corner', mark: '休', color: '#61b057' }
                ]
            })
            clearTimeout(timer)
        }, 5000)

    },
    handleCalendarDateChange({ detail }) {
        console.log('calendar-date-change', detail)
    },
    handleCalendarRangeChange({ detail }) {
        // console.log('calendar-range-change', detail)
        //以下参考
        // const { curr, range, view, visual, markerCommit } = detail
        // const { year, month, day } = curr
        // setTimeout(() => {
        //     markerCommit([
        //         { year, month, day, type: 'holiday', mark: 'TEST', color: '#2a97ff', bgColor: '#cce6ff' }
        //     ])
        // }, 500)
    },
    handleCalendarPanelViewChange({ detail }) {
        console.log('calendar-view-change', detail)
    }
})