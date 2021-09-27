class  LunarDate {

    static ChineseCalendars = [
        0x00, 0x04, 0xad, 0x08, 0x5a, 0x01, 0xd5, 0x54, 0xb4, 0x09, 0x64, 0x05, 0x59, 0x45,
        0x95, 0x0a, 0xa6, 0x04, 0x55, 0x24, 0xad, 0x08, 0x5a, 0x62, 0xda, 0x04, 0xb4, 0x05,
        0xb4, 0x55, 0x52, 0x0d, 0x94, 0x0a, 0x4a, 0x2a, 0x56, 0x02, 0x6d, 0x71, 0x6d, 0x01,
        0xda, 0x02, 0xd2, 0x52, 0xa9, 0x05, 0x49, 0x0d, 0x2a, 0x45, 0x2b, 0x09, 0x56, 0x01,
        0xb5, 0x20, 0x6d, 0x01, 0x59, 0x69, 0xd4, 0x0a, 0xa8, 0x05, 0xa9, 0x56, 0xa5, 0x04,
        0x2b, 0x09, 0x9e, 0x38, 0xb6, 0x08, 0xec, 0x74, 0x6c, 0x05, 0xd4, 0x0a, 0xe4, 0x6a,
        0x52, 0x05, 0x95, 0x0a, 0x5a, 0x42, 0x5b, 0x04, 0xb6, 0x04, 0xb4, 0x22, 0x6a, 0x05,
        0x52, 0x75, 0xc9, 0x0a, 0x52, 0x05, 0x35, 0x55, 0x4d, 0x0a, 0x5a, 0x02, 0x5d, 0x31,
        0xb5, 0x02, 0x6a, 0x8a, 0x68, 0x05, 0xa9, 0x0a, 0x8a, 0x6a, 0x2a, 0x05, 0x2d, 0x09,
        0xaa, 0x48, 0x5a, 0x01, 0xb5, 0x09, 0xb0, 0x39, 0x64, 0x05, 0x25, 0x75, 0x95, 0x0a,
        0x96, 0x04, 0x4d, 0x54, 0xad, 0x04, 0xda, 0x04, 0xd4, 0x44, 0xb4, 0x05, 0x54, 0x85,
        0x52, 0x0d, 0x92, 0x0a, 0x56, 0x6a, 0x56, 0x02, 0x6d, 0x02, 0x6a, 0x41, 0xda, 0x02,
        0xb2, 0xa1, 0xa9, 0x05, 0x49, 0x0d, 0x0a, 0x6d, 0x2a, 0x09, 0x56, 0x01, 0xad, 0x50,
        0x6d, 0x01, 0xd9, 0x02, 0xd1, 0x3a, 0xa8, 0x05, 0x29, 0x85, 0xa5, 0x0c, 0x2a, 0x09,
        0x96, 0x54, 0xb6, 0x08, 0x6c, 0x09, 0x64, 0x45, 0xd4, 0x0a, 0xa4, 0x05, 0x51, 0x25,
        0x95, 0x0a, 0x2a, 0x72, 0x5b, 0x04, 0xb6, 0x04, 0xac, 0x52, 0x6a, 0x05, 0xd2, 0x0a,
        0xa2, 0x4a, 0x4a, 0x05, 0x55, 0x94, 0x2d, 0x0a, 0x5a, 0x02, 0x75, 0x61, 0xb5, 0x02,
        0x6a, 0x03, 0x61, 0x45, 0xa9, 0x0a, 0x4a, 0x05, 0x25, 0x25, 0x2d, 0x09, 0x9a, 0x68,
        0xda, 0x08, 0xb4, 0x09, 0xa8, 0x59, 0x54, 0x03, 0xa5, 0x0a, 0x91, 0x3a, 0x96, 0x04,
        0xad, 0xb0, 0xad, 0x04, 0xda, 0x04, 0xf4, 0x62, 0xb4, 0x05, 0x54, 0x0b, 0x44, 0x5d,
        0x52, 0x0a, 0x95, 0x04, 0x55, 0x22, 0x6d, 0x02, 0x5a, 0x71, 0xda, 0x02, 0xaa, 0x05,
        0xb2, 0x55, 0x49, 0x0b, 0x4a, 0x0a, 0x2d, 0x39, 0x36, 0x01, 0x6d, 0x80, 0x6d, 0x01,
        0xd9, 0x02, 0xe9, 0x6a, 0xa8, 0x05, 0x29, 0x0b, 0x9a, 0x4c, 0xaa, 0x08, 0xb6, 0x08,
        0xb4, 0x38, 0x6c, 0x09, 0x54, 0x75, 0xd4, 0x0a, 0xa4, 0x05, 0x45, 0x55, 0x95, 0x0a,
        0x9a, 0x04, 0x55, 0x44, 0xb5, 0x04, 0x6a, 0x82, 0x6a, 0x05, 0xd2, 0x0a, 0x92, 0x6a,
        0x4a, 0x05, 0x55, 0x0a, 0x2a, 0x4a, 0x5a, 0x02, 0xb5, 0x02, 0xb2, 0x31, 0x69, 0x03,
        0x31, 0x73, 0xa9, 0x0a, 0x4a, 0x05, 0x2d, 0x55, 0x2d, 0x09, 0x5a, 0x01, 0xd5, 0x48,
        0xb4, 0x09, 0x68, 0x89, 0x54, 0x0b, 0xa4, 0x0a, 0xa5, 0x6a, 0x95, 0x04, 0xad, 0x08,
        0x6a, 0x44, 0xda, 0x04, 0x74, 0x05, 0xb0, 0x25, 0x54, 0x03
    ]
    static BigLeapMonthYears = [6, 14, 19, 25, 33, 36, 38, 41, 44, 52, 55, 79, 117, 136, 147, 150, 155, 158, 185, 193]
    static DaysInGregorianMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    static SectionalTermMap = [
        [7, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5],
        [5, 4, 5, 5, 5, 4, 4, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4, 3, 3, 4, 4, 3, 3, 3],
        [6, 6, 6, 7, 6, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 6, 5, 5, 5, 6, 5, 5, 5, 5, 4, 5, 5, 5, 5],
        [5, 5, 6, 6, 5, 5, 5, 6, 5, 5, 5, 5, 4, 5, 5, 5, 4, 4, 5, 5, 4, 4, 4, 5, 4, 4, 4, 4, 5],
        [6, 6, 6, 7, 6, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 6, 5, 5, 5, 6, 5, 5, 5, 5, 4, 5, 5, 5, 5],
        [6, 6, 7, 7, 6, 6, 6, 7, 6, 6, 6, 6, 5, 6, 6, 6, 5, 5, 6, 6, 5, 5, 5, 6, 5, 5, 5, 5, 4, 5, 5, 5, 5],
        [7, 8, 8, 8, 7, 7, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 6, 7, 7, 7, 6, 6, 7, 7, 6, 6, 6, 7, 7],
        [8, 8, 8, 9, 8, 8, 8, 8, 7, 8, 8, 8, 7, 7, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 6, 7, 7, 7, 6, 6, 7, 7, 7],
        [8, 8, 8, 9, 8, 8, 8, 8, 7, 8, 8, 8, 7, 7, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 6, 7, 7, 7, 7],
        [9, 9, 9, 9, 8, 9, 9, 9, 8, 8, 9, 9, 8, 8, 8, 9, 8, 8, 8, 8, 7, 8, 8, 8, 7, 7, 8, 8, 8],
        [8, 8, 8, 8, 7, 8, 8, 8, 7, 7, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 6, 7, 7, 7, 6, 6, 7, 7, 7],
        [7, 8, 8, 8, 7, 7, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 6, 7, 7, 7, 6, 6, 7, 7, 6, 6, 6, 7, 7]
    ]
    static SectionalTermYear = [
        [13, 49, 85, 117, 149, 185, 201, 250, 250],
        [13, 45, 81, 117, 149, 185, 201, 250, 250],
        [13, 48, 84, 112, 148, 184, 200, 201, 250],
        [13, 45, 76, 108, 140, 172, 200, 201, 250],
        [13, 44, 72, 104, 132, 168, 200, 201, 250],
        [5, 33, 68, 96, 124, 152, 188, 200, 201],
        [29, 57, 85, 120, 148, 176, 200, 201, 250],
        [13, 48, 76, 104, 132, 168, 196, 200, 201],
        [25, 60, 88, 120, 148, 184, 200, 201, 250],
        [16, 44, 76, 108, 144, 172, 200, 201, 250],
        [28, 60, 92, 124, 160, 192, 200, 201, 250],
        [17, 53, 85, 124, 156, 188, 200, 201, 250]
    ]
    static PrincipleTermMap = [
        [21, 21, 21, 21, 21, 20, 21, 21, 21, 20, 20, 21, 21, 20, 20, 20, 20, 20, 20, 20, 20, 19, 20, 20, 20, 19, 19, 20],
        [20, 19, 19, 20, 20, 19, 19, 19, 19, 19, 19, 19, 19, 18, 19, 19, 19, 18, 18, 19, 19, 18, 18, 18, 18, 18, 18, 18],
        [21, 21, 21, 22, 21, 21, 21, 21, 20, 21, 21, 21, 20, 20, 21, 21, 20, 20, 20, 21, 20, 20, 20, 20, 19, 20, 20, 20, 20],
        [20, 21, 21, 21, 20, 20, 21, 21, 20, 20, 20, 21, 20, 20, 20, 20, 19, 20, 20, 20, 19, 19, 20, 20, 19, 19, 19, 20, 20],
        [21, 22, 22, 22, 21, 21, 22, 22, 21, 21, 21, 22, 21, 21, 21, 21, 20, 21, 21, 21, 20, 20, 21, 21, 20, 20, 20, 21, 21],
        [22, 22, 22, 22, 21, 22, 22, 22, 21, 21, 22, 22, 21, 21, 21, 22, 21, 21, 21, 21, 20, 21, 21, 21, 20, 20, 21, 21, 21],
        [23, 23, 24, 24, 23, 23, 23, 24, 23, 23, 23, 23, 22, 23, 23, 23, 22, 22, 23, 23, 22, 22, 22, 23, 22, 22, 22, 22, 23],
        [23, 24, 24, 24, 23, 23, 24, 24, 23, 23, 23, 24, 23, 23, 23, 23, 22, 23, 23, 23, 22, 22, 23, 23, 22, 22, 22, 23, 23],
        [23, 24, 24, 24, 23, 23, 24, 24, 23, 23, 23, 24, 23, 23, 23, 23, 22, 23, 23, 23, 22, 22, 23, 23, 22, 22, 22, 23, 23],
        [24, 24, 24, 24, 23, 24, 24, 24, 23, 23, 24, 24, 23, 23, 23, 24, 23, 23, 23, 23, 22, 23, 23, 23, 22, 22, 23, 23, 23],
        [23, 23, 23, 23, 22, 23, 23, 23, 22, 22, 23, 23, 22, 22, 22, 23, 22, 22, 22, 22, 21, 22, 22, 22, 21, 21, 22, 22, 22],
        [22, 22, 23, 23, 22, 22, 22, 23, 22, 22, 22, 22, 21, 22, 22, 22, 21, 21, 22, 22, 21, 21, 21, 22, 21, 21, 21, 21, 22]
    ]
    static PrincipleTermYear = [
        [13, 45, 81, 113, 149, 185, 201],
        [21, 57, 93, 125, 161, 193, 201],
        [21, 56, 88, 120, 152, 188, 200, 201],
        [21, 49, 81, 116, 144, 176, 200, 201],
        [17, 49, 77, 112, 140, 168, 200, 201],
        [28, 60, 88, 116, 148, 180, 200, 201],
        [25, 53, 84, 112, 144, 172, 200, 201],
        [29, 57, 89, 120, 148, 180, 200, 201],
        [17, 45, 73, 108, 140, 168, 200, 201],
        [28, 60, 92, 124, 160, 192, 200, 201],
        [16, 44, 80, 112, 148, 180, 200, 201],
        [17, 53, 88, 120, 156, 188, 200, 201]
    ]

    static StemNames = '甲乙丙丁戊己庚辛壬癸'
    static BranchNames = '子丑寅卯辰巳午未申酉戌亥'
    static ZodiacSigns = '鼠牛虎兔龙蛇马羊猴鸡狗猪'
    static LunarMonths = '正二三四五六七八九十冬腊'
    static PrincipleTermNames = ["大寒", "雨水", "春分", "谷雨", "小满", "夏至", "大暑", "处暑", "秋分", "霜降", "小雪", "冬至"]
    static SectionalTermNames = ["小寒", "立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"]
    static ChineseNums = '十一二三四五六七八九十'

    static LunarMinDate = (new Date(1901, 0, 1)).getTime()
    static LunarMaxDate = (new Date(2100, 0, 1)).getTime()

    static BaseDate = {
        year: 1901,
        month: 1,
        day: 1,
        index: 0,
        chineseYear: 4598 - 1,
        chineseMonth: 11,
        chineseDate: 11
    }

    static SolarTermRevises = [
        { solar: LunarDate.SectionalTermNames[2], year: 2014, month: 3, wrong: 5, correct: 6 },
        { solar: LunarDate.PrincipleTermNames[2], year: 2051, month: 3, wrong: 21, correct: 20 },
        { solar: LunarDate.SectionalTermNames[1], year: 2083, month: 2, wrong: 4, correct: 3 },
        { solar: LunarDate.PrincipleTermNames[2], year: 2084, month: 3, wrong: 20, correct: 19 },
        { solar: LunarDate.SectionalTermNames[5], year: 2094, month: 6, wrong: 6, correct: 5 }
    ]

    static isGregorianLeapYear = y => y % 100 != 0 && y % 4 === 0 || y % 400 === 0

    static daysInGregorianMonth = (y, m) => {
        let d = LunarDate.DaysInGregorianMonths[m - 1]
        return 2 == m && LunarDate.isGregorianLeapYear(y) ? d + 1 : d
    }

    static dayOfYear = (y, m, d) => {
        let c = 0
        for (let i = 1; i < m; i++) {
            c = c + LunarDate.daysInGregorianMonth(y, i)
        }
        c = c + d
        return c
    }

    static dayOfWeek = (y, m, d) => {
        let w = 1 // 公历一年一月一日是星期一，所以起始值为星期日
        y = (y - 1) % 400 + 1 // 公历星期值分部 400 年循环一次
        let ly = (y - 1) / 4 // 闰年次数
        ly = ly - (y - 1) / 100
        ly = ly + (y - 1) / 400
        let ry = y - 1 - ly // 常年次数
        w = w + ry // 常年星期值增一
        w = w + 2 * ly // 闰年星期值增二
        w = w + LunarDate.dayOfYear(y, m, d)
        w = (w - 1) % 7 + 1
        return w
    }

    static daysInChineseMonth = (y, m) => {
        // 注意：闰月 m < 0
        let index = y - LunarDate.BaseDate.chineseYear + LunarDate.BaseDate.index
        let v = 0
        let l = 0
        let d = 30
        if (1 <= m && m <= 8) {
            v = LunarDate.ChineseCalendars[2 * index]
            l = m - 1
            if (((v >> l) & 0x01) == 1) d = 29
        } else if (9 <= m && m <= 12) {
            v = LunarDate.ChineseCalendars[2 * index + 1]
            l = m - 9
            if (((v >> l) & 0x01) == 1) d = 29
        } else {
            v = LunarDate.ChineseCalendars[2 * index + 1]
            v = (v >> 4) & 0x0F
            if (v != Math.abs(m)) {
                d = 0
            } else {
                d = 29
                for (let i = 0; i < LunarDate.BigLeapMonthYears.length; i++) {
                    if (LunarDate.BigLeapMonthYears[i] == index) {
                        d = 30
                        break
                    }
                }
            }
        }
        return d
    }

    static nextChineseMonth = (y, m) => {
        let n = Math.abs(m) + 1
        if (m > 0) {
            let index = y - LunarDate.BaseDate.chineseYear + LunarDate.BaseDate.index
            let v = LunarDate.ChineseCalendars[2 * index + 1]
            v = (v >> 4) & 0x0F
            if (v == m) n = -m
        }
        if (n == 13) n = 1
        return n
    }

    static sectionalTerm = (y, m) => {
        if (y < 1901 || y > 2100) return 0
        let index = 0
        let ry = y - LunarDate.BaseDate.year + 1
        while (ry >= LunarDate.SectionalTermYear[m - 1][index]) { index++ }
        return LunarDate.SectionalTermMap[m - 1][4 * index + ry % 4]
    }

    static principleTerm = (y, m) => {
        if (y < 1901 || y > 2100) return 0
        let index = 0
        let ry = y - LunarDate.BaseDate.year + 1
        while (ry >= LunarDate.PrincipleTermYear[m - 1][index]) { index++ }
        return LunarDate.PrincipleTermMap[m - 1][4 * index + ry % 4]
    }

    static checkSolarTerm = (y, m, d) => {
        let filterYear = LunarDate.SolarTermRevises.filter(item => item.year == y)
        if (filterYear.length > 0) {
            filterYear = filterYear[0]
            if (filterYear.month == m) {
                if (filterYear.wrong == d) return { correct: false, type: 'wroung' }
                if (filterYear.correct == d) return { correct: false, type: 'revise', solar: filterYear.solar }
            }
        }
        return { correct: true }
    }

    static lunarYear = chineseYear => LunarDate.StemNames[(chineseYear - 1) % 10] + LunarDate.BranchNames[(chineseYear - 1) % 12] + LunarDate.ZodiacSigns[(chineseYear - 1) % 12] + '年'

    static lunarMonth = chineseMonth => chineseMonth > 0 ? `${ LunarDate.LunarMonths[chineseMonth - 1] }月` : `闰${ LunarDate.LunarMonths[-chineseMonth - 1] }月`

    static lunarDay = chineseDay => {
        if (chineseDay < 1 || chineseDay > 30) return ''
        if (chineseDay <= 10) return `初${LunarDate.ChineseNums[chineseDay]}`
        else if (chineseDay < 20) return `十${ LunarDate.ChineseNums[chineseDay % 10] }`
        else if (chineseDay == 20) return `二十`
        else if (chineseDay < 30) return `廿${ LunarDate.ChineseNums[chineseDay % 10] }`
        return '三十'
    }

    static isOverDate = date => {
        const queryTime = date.getTime()
        return queryTime < LunarDate.LunarMinDate || queryTime >= LunarDate.LunarMaxDate
    }

    static lunar = (year, month, day) => (new LunarDate(year, month, day)).getLunarDate()

    //获取星座
    // static getAstro = (gregorianMonth, gregorianDay) => Astro.substr(gregorianMonth * 2 - (gregorianDay < AstroDays[gregorianMonth - 1] ? 2 : 0), 2) + "\u5ea7"

    constructor(gregorianYear, gregorianMonth, gregorianDay) {
        this.setGregorian(gregorianYear, gregorianMonth, gregorianDay)
    }

    setGregorian(gregorianYear, gregorianMonth = 1, gregorianDay = 1) {
        this.gregorianYear = gregorianYear
        this.gregorianMonth = gregorianMonth
        this.gregorianDate = gregorianDay
        this.isGregorianLeap = LunarDate.isGregorianLeapYear(gregorianYear)
        this.dayOfYear = LunarDate.dayOfYear(gregorianYear, gregorianMonth, gregorianDay)
        this.dayOfWeek = LunarDate.dayOfWeek(gregorianYear, gregorianMonth, gregorianDay)
        this.reviseInfo = LunarDate.checkSolarTerm(gregorianYear, gregorianMonth, gregorianDay)
        this.computeChineseFields()
        this.computeSolarTerms()
    }

    getReviseInfo() {
        return this.reviseInfo
    }

    computeChineseFields() {
        if (this.gregorianYear < 1901 || this.gregorianYear > 2100) return 1
        const { year, month, day, chineseYear, chineseMonth, chineseDate } = LunarDate.BaseDate
        let startYear = year
        let startMonth = month
        let startDate = day
        this.chineseYear = chineseYear
        this.chineseMonth = chineseMonth
        this.chineseDate = chineseDate
        if (this.gregorianYear >= 2000) {
            // 第二个对应日，用以提高计算效率
            // 公历 2000 年 1 月 1 日，对应农历 4697 年 11 月 25 日
            startYear = year + 99
            startMonth = 1
            startDate = 1
            this.chineseYear = chineseYear + 99
            this.chineseMonth = 11
            this.chineseDate = 25
        }
        let daysDiff = 0
        for (let i = startYear; i < this.gregorianYear; i++) {
            daysDiff += 365
            if (LunarDate.isGregorianLeapYear(i)) daysDiff += 1
        }
        for (let i = startMonth; i < this.gregorianMonth; i++) {
            daysDiff += LunarDate.daysInGregorianMonth(this.gregorianYear, i)
        }
        daysDiff += this.gregorianDate - startDate
        this.chineseDate += daysDiff
        let lastDate = LunarDate.daysInChineseMonth(this.chineseYear, this.chineseMonth)
        let nextMonth = LunarDate.nextChineseMonth(this.chineseYear, this.chineseMonth)
        while (this.chineseDate > lastDate) {
            if (Math.abs(nextMonth) < Math.abs(this.chineseMonth)) { this.chineseYear++ }
            this.chineseMonth = nextMonth
            this.chineseDate -= lastDate
            lastDate = LunarDate.daysInChineseMonth(this.chineseYear, this.chineseMonth)
            nextMonth = LunarDate.nextChineseMonth(this.chineseYear, this.chineseMonth)
        }
        return 0
    }

    computeSolarTerms() {
        if (this.gregorianYear < 1901 || this.gregorianYear > 2100) return 1
        this.sectionalTerm = LunarDate.sectionalTerm(this.gregorianYear, this.gregorianMonth)
        this.principleTerm = LunarDate.principleTerm(this.gregorianYear, this.gregorianMonth)
        return 0
    }

    getLunarDate() {
        let lunar_day = '',
            lunar_type = '',
            lunar_date = LunarDate.lunarDay(this.chineseDate)
        if (this.reviseInfo.correct) {
            if (this.gregorianDate == this.sectionalTerm) {
                lunar_day = LunarDate.SectionalTermNames[this.gregorianMonth - 1]
                lunar_type = 'solar'
            } else if (this.gregorianDate == this.principleTerm) {
                lunar_day = LunarDate.PrincipleTermNames[this.gregorianMonth - 1]
                lunar_type = 'solar'
            } else if (this.chineseDate == 1 && this.chineseMonth > 0) {
                lunar_day = LunarDate.LunarMonths[this.chineseMonth - 1] + '月'
            } else if (this.chineseDate == 1 && this.chineseMonth < 0) {
                lunar_day = '闰' + LunarDate.LunarMonths[-this.chineseMonth - 1] + '月'
            } else {
                lunar_day = lunar_date
            }
        } else {
            if (this.reviseInfo.type == 'wroung') {
                if (this.chineseDate == 1 && this.chineseMonth > 0) {
                    lunar_day = LunarDate.LunarMonths[this.chineseMonth - 1] + '月'
                } else if (this.chineseDate == 1 && this.chineseMonth < 0) {
                    lunar_day = '闰' + LunarDate.LunarMonths[-this.chineseMonth - 1] + '月'
                } else {
                    lunar_day = lunar_date
                }
            } else {
                lunar_day = this.reviseInfo.solar
                lunar_type = 'solar'
            }
        }
        return {
            year: this.gregorianYear,
            month: this.gregorianMonth,
            day: this.gregorianDate,
            lunar_order: this.chineseYear,
            lunar_year: LunarDate.lunarYear(this.chineseYear),
            lunar_month: LunarDate.lunarMonth(this.chineseMonth),
            lunar_day,
            lunar_date,
            lunar_type,
            lm: this.chineseMonth,
            ld: this.chineseDate

            // astro: LunarDate.getAstro(this.gregorianMonth, this.gregorianDate)
        }
    }
}

module.exports = LunarDate