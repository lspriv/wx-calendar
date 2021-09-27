import DateHandler from '../dev/components/handler'

test('first test', () => {
    const handler = new DateHandler({ data: { showLunar: true } })
    const timer1 = (new Date).getTime()
    const t = handler.suppleMonth(2021, 9)
    const timer2 = (new Date).getTime()
    console.log('diff', timer2 - timer1)
    console.log('t', t)
    expect(1 + 2).toBe(3)
})