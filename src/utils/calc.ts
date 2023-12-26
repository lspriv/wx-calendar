/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 计算
 * @Author: lspriv
 * @LastEditTime: 2023-10-30 15:45:14
 */
/**
 * 是否是科学记数法
 * @param str 数值字符串
 */
const isExp = (str: string) => /^(\+|-)?([.\d]+)e(\+|-)(\d+)$/.test(str);

/**
 * 获取科学记数法中的整数和10幂
 * @param str 数值字符串
 */
const toExpInt$Pow = (str: string): [integer: number, pow: number] | null => {
  if (!isExp(str)) return null;
  if (RegExp.$3 !== '-') return [+str, 0];
  const s = RegExp.$1 === '-' ? -1 : 1;
  const n = RegExp.$2;
  const p = RegExp.$4 || 0;
  const [m, d] = n.split('.');
  const $p = d?.length || 0;
  return [+(m || 0) * s * 10 ** $p + s * +d, +p + $p];
};

/**
 * 化整和负10幂
 */
const toInt$Pow = (...numbers: Array<string | number>): Array<[integer: number, pow: number]> =>
  numbers.map(num => {
    const n = parseFloat(num as string);
    const str = n.toString();
    const exp = toExpInt$Pow(str);
    if (exp) return exp;
    const sign = n < 0 ? -1 : 1;
    const [itg, decimal] = str.split('.');
    const pow = decimal?.length || 0;
    const integer = +(itg || 0) * 10 ** pow + sign * +(decimal || 0);
    return [integer, pow];
  });

/**
 * 加法
 * @param n1 加数
 * @param n2 加数
 */
export const add = (n1: number | string, n2: number | string) => {
  const [[m1, p1], [m2, p2]] = toInt$Pow(n1, n2);
  const pm = Math.max(p1, p2);
  const k1 = m1 * 10 ** (pm - p1);
  const k2 = m2 * 10 ** (pm - p2);
  return (k1 + k2) / 10 ** pm;
};

/**
 * 减法
 * @param n1 被减数
 * @param n2 减数
 */
export const sub = (n1: number | string, n2: number | string) => add(n1, -n2);

/**
 * 乘法
 * @param n1 乘数
 * @param n2 乘数
 */
export const mul = (n1: number | string, n2: number | string) => {
  const [[m1, p1], [m2, p2]] = toInt$Pow(n1, n2);
  return (m1 * m2) / 10 ** (p1 + p2);
};

/**
 * 除法
 * @param n1 被除数
 * @param n2 除数
 */
export const div = (n1: number | string, n2: number | string) => {
  const [[m1, p1], [m2, p2]] = toInt$Pow(n1, n2);
  const m = m1 / m2;
  const p = 10 ** Math.abs(p1 - p2);
  return p2 > p1 ? m * p : m / p;
};
