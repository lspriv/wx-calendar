const PanelsCount = count => count < 3 ? 3 : (count & 1 ? count : count + 1)

const PanelCountMiddleIdx = count => Math.floor((PanelsCount(count) - 1) / 2)

const InitBarInfo = { i: 0, x: 0, y: 0, t: false, d: 0, a: false, s: false }

const NodeRect = (selector, instance) => {
    return new Promise((resolve, reject) => {
        const query = instance.createSelectorQuery()
        query.selectAll(selector).boundingClientRect(rects => {
            if (rects.length > 0) resolve(rects)
            else reject(`view not found by selector ${ selector }`)
        }).exec()
    })
}

const EnOrders = ['', 'st', 'nd', 'rd', 'th']

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

const EchoInfo = (tips, type = 'info', ...args) => {
    const { label, content, title } = ConsoleStyle[type]
    console.log(`%cWxCalendar${ title } %c${ tips }`, label, content, ...args)
}

module.exports = {
    NodeRect,
    PanelsCount,
    PanelCountMiddleIdx,
    InitBarInfo,
    EnOrders,
    EchoInfo
}