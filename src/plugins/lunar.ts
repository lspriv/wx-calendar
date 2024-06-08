/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 农历计算 1901年-2100年
 * @Author: lspriv
 * @LastEditTime: 2024-06-08 18:48:28
 */
import { GREGORIAN_MONTH_DAYS } from '../basic/constants';
import { getAnnualMarkKey, isLeapYear } from '../interface/calendar';

import type { Plugin, TrackDateResult, TrackYearResult } from '../basic/service';
import type { CalendarDay, WcYear, WcAnnualMark, WcAnnualMarks } from '../interface/calendar';

const CN_CALENDARS = [
  0x00, 0x04, 0xad, 0x08, 0x5a, 0x01, 0xd5, 0x54, 0xb4, 0x09, 0x64, 0x05, 0x59, 0x45, 0x95, 0x0a, 0xa6, 0x04, 0x55,
  0x24, 0xad, 0x08, 0x5a, 0x62, 0xda, 0x04, 0xb4, 0x05, 0xb4, 0x55, 0x52, 0x0d, 0x94, 0x0a, 0x4a, 0x2a, 0x56, 0x02,
  0x6d, 0x71, 0x6d, 0x01, 0xda, 0x02, 0xd2, 0x52, 0xa9, 0x05, 0x49, 0x0d, 0x2a, 0x45, 0x2b, 0x09, 0x56, 0x01, 0xb5,
  0x20, 0x6d, 0x01, 0x59, 0x69, 0xd4, 0x0a, 0xa8, 0x05, 0xa9, 0x56, 0xa5, 0x04, 0x2b, 0x09, 0x9e, 0x38, 0xb6, 0x08,
  0xec, 0x74, 0x6c, 0x05, 0xd4, 0x0a, 0xe4, 0x6a, 0x52, 0x05, 0x95, 0x0a, 0x5a, 0x42, 0x5b, 0x04, 0xb6, 0x04, 0xb4,
  0x22, 0x6a, 0x05, 0x52, 0x75, 0xc9, 0x0a, 0x52, 0x05, 0x35, 0x55, 0x4d, 0x0a, 0x5a, 0x02, 0x5d, 0x31, 0xb5, 0x02,
  0x6a, 0x8a, 0x68, 0x05, 0xa9, 0x0a, 0x8a, 0x6a, 0x2a, 0x05, 0x2d, 0x09, 0xaa, 0x48, 0x5a, 0x01, 0xb5, 0x09, 0xb0,
  0x39, 0x64, 0x05, 0x25, 0x75, 0x95, 0x0a, 0x96, 0x04, 0x4d, 0x54, 0xad, 0x04, 0xda, 0x04, 0xd4, 0x44, 0xb4, 0x05,
  0x54, 0x85, 0x52, 0x0d, 0x92, 0x0a, 0x56, 0x6a, 0x56, 0x02, 0x6d, 0x02, 0x6a, 0x41, 0xda, 0x02, 0xb2, 0xa1, 0xa9,
  0x05, 0x49, 0x0d, 0x0a, 0x6d, 0x2a, 0x09, 0x56, 0x01, 0xad, 0x50, 0x6d, 0x01, 0xd9, 0x02, 0xd1, 0x3a, 0xa8, 0x05,
  0x29, 0x85, 0xa5, 0x0c, 0x2a, 0x09, 0x96, 0x54, 0xb6, 0x08, 0x6c, 0x09, 0x64, 0x45, 0xd4, 0x0a, 0xa4, 0x05, 0x51,
  0x25, 0x95, 0x0a, 0x2a, 0x72, 0x5b, 0x04, 0xb6, 0x04, 0xac, 0x52, 0x6a, 0x05, 0xd2, 0x0a, 0xa2, 0x4a, 0x4a, 0x05,
  0x55, 0x94, 0x2d, 0x0a, 0x5a, 0x02, 0x75, 0x61, 0xb5, 0x02, 0x6a, 0x03, 0x61, 0x45, 0xa9, 0x0a, 0x4a, 0x05, 0x25,
  0x25, 0x2d, 0x09, 0x9a, 0x68, 0xda, 0x08, 0xb4, 0x09, 0xa8, 0x59, 0x54, 0x03, 0xa5, 0x0a, 0x91, 0x3a, 0x96, 0x04,
  0xad, 0xb0, 0xad, 0x04, 0xda, 0x04, 0xf4, 0x62, 0xb4, 0x05, 0x54, 0x0b, 0x44, 0x5d, 0x52, 0x0a, 0x95, 0x04, 0x55,
  0x22, 0x6d, 0x02, 0x5a, 0x71, 0xda, 0x02, 0xaa, 0x05, 0xb2, 0x55, 0x49, 0x0b, 0x4a, 0x0a, 0x2d, 0x39, 0x36, 0x01,
  0x6d, 0x80, 0x6d, 0x01, 0xd9, 0x02, 0xe9, 0x6a, 0xa8, 0x05, 0x29, 0x0b, 0x9a, 0x4c, 0xaa, 0x08, 0xb6, 0x08, 0xb4,
  0x38, 0x6c, 0x09, 0x54, 0x75, 0xd4, 0x0a, 0xa4, 0x05, 0x45, 0x55, 0x95, 0x0a, 0x9a, 0x04, 0x55, 0x44, 0xb5, 0x04,
  0x6a, 0x82, 0x6a, 0x05, 0xd2, 0x0a, 0x92, 0x6a, 0x4a, 0x05, 0x55, 0x0a, 0x2a, 0x4a, 0x5a, 0x02, 0xb5, 0x02, 0xb2,
  0x31, 0x69, 0x03, 0x31, 0x73, 0xa9, 0x0a, 0x4a, 0x05, 0x2d, 0x55, 0x2d, 0x09, 0x5a, 0x01, 0xd5, 0x48, 0xb4, 0x09,
  0x68, 0x89, 0x54, 0x0b, 0xa4, 0x0a, 0xa5, 0x6a, 0x95, 0x04, 0xad, 0x08, 0x6a, 0x44, 0xda, 0x04, 0x74, 0x05, 0xb0,
  0x25, 0x54, 0x03
];

const BIG_LEAP_MYS = [6, 14, 19, 25, 33, 36, 38, 41, 44, 52, 55, 79, 117, 136, 147, 150, 155, 158, 185, 193];

const SECTIONAL_TERMS = [
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
];

const SECTIONAL_TERM_YEARS = [
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
];

const PRINCIPLE_TERMS = [
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
];

const PRINCIPLE_TERM_YEARS = [
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
];

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const ZODIACS = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
const LUNAR_MONTHS = '正二三四五六七八九十冬腊';

/** 中气 */
const PRINCIPLE_TERM_NAMES = [
  '大寒',
  '雨水',
  '春分',
  '谷雨',
  '小满',
  '夏至',
  '大暑',
  '处暑',
  '秋分',
  '霜降',
  '小雪',
  '冬至'
];

/** 节令 */
const SECTIONAL_TERM_NAMES = [
  '小寒',
  '立春',
  '惊蛰',
  '清明',
  '立夏',
  '芒种',
  '小暑',
  '立秋',
  '白露',
  '寒露',
  '立冬',
  '大雪'
];

const CN_NUMS = '〇一二三四五六七八九十';

// const MIN_DATE = new Date(1901, 0, 1).getTime();
// const MAX_DATE = new Date(2100, 0, 1).getTime();

const BASE_DATE = {
  YEAR: 1901,
  MONTH: 1,
  DAY: 1,
  INDEX: 0,
  CN_YEAR: 4598 - 1,
  CN_MONTH: 11,
  CN_DAY: 11
};

interface LunarRevise {
  solar: string;
  year: number;
  month: number;
  wrong: number;
  correct: number;
}

const SOLAR_TERM_REVISES: Array<LunarRevise> = [
  { solar: SECTIONAL_TERM_NAMES[2], year: 2014, month: 3, wrong: 5, correct: 6 },
  { solar: PRINCIPLE_TERM_NAMES[2], year: 2051, month: 3, wrong: 21, correct: 20 },
  { solar: SECTIONAL_TERM_NAMES[1], year: 2083, month: 2, wrong: 4, correct: 3 },
  { solar: PRINCIPLE_TERM_NAMES[2], year: 2084, month: 3, wrong: 20, correct: 19 },
  { solar: SECTIONAL_TERM_NAMES[5], year: 2094, month: 6, wrong: 6, correct: 5 }
];

const absFloor = (number: number) => {
  if (number < 0) {
    // -0 -> 0
    return Math.ceil(number) || 0;
  } else {
    return Math.floor(number);
  }
};

export interface LunarDate {
  year?: number;
  month?: number;
  day?: number;
  lunarYear: string;
  lunarMonth: string;
  lunarDay: string;
  solar: string;
}

class Lunar {
  public static lunar(year: number, month: number, day: number): LunarDate {
    const revise = Lunar.reviseSolarTerm(year, month, day);

    let cnYear: number | undefined = void 0;
    let cnMonth: number | undefined = void 0;
    let cnDay: number | undefined = void 0;

    let sectional: number | undefined = void 0;
    let principle: number | undefined = void 0;

    if (year >= 1901 && year < 2100) {
      /** 计算农历年月日 */
      let startYear = BASE_DATE.YEAR;
      let startMonth = BASE_DATE.MONTH;
      let startDay = BASE_DATE.DAY;

      cnYear = BASE_DATE.CN_YEAR;
      cnMonth = BASE_DATE.CN_MONTH;
      cnDay = BASE_DATE.CN_DAY;

      if (year >= 2000) {
        // 第二个对应日，用以提高计算效率
        // 公历 2000 年 1 月 1 日，对应农历 4697 年 11 月 25 日
        startYear = BASE_DATE.YEAR + 99;
        startMonth = 1;
        startDay = 1;
        cnYear = BASE_DATE.CN_YEAR + 99;
        cnMonth = 11;
        cnDay = 25;
      }

      const d1 = new Date(startYear, startMonth - 1, startDay);
      const d2 = new Date(year, month - 1, day);
      const diff = absFloor((+d2 - +d1) / 864e5);
      cnDay += diff;

      let lastDate = Lunar.cnMonthDays(cnYear, cnMonth);
      let nextMonth = Lunar.nextCnMonth(cnYear, cnMonth);

      while (cnDay > lastDate) {
        if (Math.abs(nextMonth) < Math.abs(cnMonth)) cnYear++;
        cnMonth = nextMonth;
        cnDay -= lastDate;
        lastDate = Lunar.cnMonthDays(cnYear, cnMonth);
        nextMonth = Lunar.nextCnMonth(cnYear, cnMonth);
      }

      /** 计算节气 */
      sectional = Lunar.sectionalTerm(year, month);
      principle = Lunar.principleTerm(year, month);
    }

    let lunarDay: string = Lunar.lunarDay(cnDay);
    let solar: string = '';

    if (day === sectional) {
      solar = SECTIONAL_TERM_NAMES[month - 1];
    } else if (day === principle) {
      solar = PRINCIPLE_TERM_NAMES[month - 1];
    } else if (cnDay === 1 && cnMonth! > 0) {
      lunarDay = LUNAR_MONTHS[cnMonth! - 1] + '月';
    } else if (cnDay === 1 && cnMonth! < 0) {
      lunarDay = `闰${LUNAR_MONTHS[-cnMonth! - 1]}月`;
    }

    if (revise === true) {
      solar = '';
    } else if (revise) {
      solar = revise;
    }

    return {
      year: cnYear,
      month: cnMonth,
      day: cnDay,
      lunarYear: Lunar.lunarYear(cnYear),
      lunarMonth: Lunar.lunarMonth(cnMonth),
      lunarDay,
      solar
    };
  }

  /**
   * 获取节令
   * @param year 年
   * @param month 月
   */
  private static sectionalTerm(year: number, month: number) {
    if (year < 1901 || year > 2100) return 0;
    let index = 0;
    let ry = year - BASE_DATE.YEAR + 1;
    while (ry >= SECTIONAL_TERM_YEARS[month - 1][index]) {
      index++;
    }
    return SECTIONAL_TERMS[month - 1][4 * index + (ry % 4)];
  }

  /**
   * 获取中气
   * @param year 年
   * @param month 月
   */
  private static principleTerm(year: number, month: number) {
    if (year < 1901 || year > 2100) return 0;
    let index = 0;
    let ry = year - BASE_DATE.YEAR + 1;
    while (ry >= PRINCIPLE_TERM_YEARS[month - 1][index]) {
      index++;
    }
    return PRINCIPLE_TERMS[month - 1][4 * index + (ry % 4)];
  }

  /**
   * 节气修正
   * @param year 年
   * @param month 月
   * @param day 日
   */
  private static reviseSolarTerm(year: number, month: number, day: number) {
    const revise = SOLAR_TERM_REVISES.find(item => item.year == year);

    if (revise?.month === month) {
      if (revise.wrong === day) return true;
      if (revise.correct === day) return revise.solar;
    }

    return false;
  }

  /**
   * 获取干支
   * @param cnYear 年
   */
  private static lunarYear(year?: number) {
    return year ? STEMS[(year - 1) % 10] + BRANCHES[(year - 1) % 12] + ZODIACS[(year - 1) % 12] + '年' : '';
  }

  private static lunarMonth(month?: number) {
    if (month === void 0 || month === null) return '';
    return month > 0 ? `${LUNAR_MONTHS[month - 1]}月` : `闰${LUNAR_MONTHS[-month - 1]}月`;
  }

  private static lunarDay(day?: number) {
    if (!day) return '';
    if (day > 0 && day <= 10) return `初${CN_NUMS[day]}`;
    else if (day < 20) return `十${CN_NUMS[day % 10]}`;
    else if (day == 20) return `二十`;
    else if (day < 30) return `廿${CN_NUMS[day % 10]}`;
    else if (day === 30) return '三十';
    return '';
  }

  /**
   * 获取农历下个月
   * @param year 年
   * @param month 月
   */
  private static nextCnMonth(year: number, month: number) {
    let n = Math.abs(month) + 1;
    if (month > 0) {
      const index = year - BASE_DATE.CN_YEAR + BASE_DATE.INDEX;
      let v = CN_CALENDARS[2 * index + 1];
      v = (v >> 4) & 0x0f;
      if (v == month) n = -month;
    }
    if (n == 13) n = 1;
    return n;
  }
  /**
   * 获取农历月份天数
   * @param year 年
   * @param month 月
   */
  private static cnMonthDays(year: number, month: number) {
    // 注意：闰月 m < 0
    const index = year - BASE_DATE.CN_YEAR + BASE_DATE.INDEX;
    let v = 0;
    let l = 0;
    let d = 30;
    if (1 <= month && month <= 8) {
      v = CN_CALENDARS[2 * index];
      l = month - 1;
      if (((v >> l) & 0x01) == 1) d = 29;
    } else if (9 <= month && month <= 12) {
      v = CN_CALENDARS[2 * index + 1];
      l = month - 9;
      if (((v >> l) & 0x01) == 1) d = 29;
    } else {
      v = CN_CALENDARS[2 * index + 1];
      v = (v >> 4) & 0x0f;
      if (v != Math.abs(month)) {
        d = 0;
      } else {
        d = 29;
        for (let i = 0; i < BIG_LEAP_MYS.length; i++) {
          if (BIG_LEAP_MYS[i] == index) {
            d = 30;
            break;
          }
        }
      }
    }
    return d;
  }
}

export class LunarPlugin implements Plugin {
  public static KEY = 'lunar' as const;

  public getLunar(date: CalendarDay): LunarDate {
    return Lunar.lunar(date.year, date.month, date.day);
  }

  public PLUGIN_TRACK_DATE(date: CalendarDay): TrackDateResult {
    const lunar = Lunar.lunar(date.year, date.month, date.day);

    return {
      festival: {
        text: lunar.solar || lunar.lunarDay,
        color: lunar.solar ? 'var(--wc-solar-color)' : null
      }
    };
  }

  public PLUGIN_TRACK_YEAR(year: WcYear): TrackYearResult {
    let lunarYear: string = '';
    const marks: WcAnnualMarks = new Map();
    for (let i = 0; i < 12; i++) {
      const days = i === 1 && isLeapYear(year.year) ? GREGORIAN_MONTH_DAYS[i] + 1 : GREGORIAN_MONTH_DAYS[i];
      const month = i + 1;
      for (let j = 0; j < days; j++) {
        const day = j + 1;
        const lunar = Lunar.lunar(year.year, month, day);
        if (month === 10 && day === 1) lunarYear = lunar.lunarYear;
        if (lunar.day === 1) {
          const key = getAnnualMarkKey({ month, day });
          const set: WcAnnualMark = {};
          set.sub = lunar.month === 1 ? '#F56C6C' : '#409EFF';
          marks.set(key, set);
        }
      }
    }

    return {
      subinfo: [
        { text: lunarYear, color: '#F56C6C' },
        { text: '农历初一', color: '#409EFF' }
      ],
      marks
    };
  }
}

export const LUNAR_PLUGIN_KEY = LunarPlugin.KEY;
