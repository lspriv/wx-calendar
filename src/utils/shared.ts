/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-08-06 23:42:37
 */
export type PartRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
export type Voidable<T> = T | undefined;
export type Nullable<T> = T | null;

const toTypeString = (val: unknown): string => Object.prototype.toString.call(val);

export const isDate = (val: unknown): val is Date => toTypeString(val) === '[object Date]';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch);

export const nonNullable = <T>(val: T): val is NonNullable<T> => val !== void 0 && val !== null;
export const isVoid = (val: unknown): val is undefined => val === void 0;

export type Union<T> = T extends [infer R, ...infer P] ? R | Union<P> : never;

// /** 元组 join */
// export type Join<T extends ReadonlyArray<string>, S = ',', U = ''> = T extends readonly [
//   infer R,
//   ...infer P extends ReadonlyArray<string>
// ]
//   ? `${U & string}${R & string}${Join<P, S, S>}`
//   : '';

/** 下划线（snake_case）转小驼峰（lowerCamelCase） */
export type SnakeToLowerCamel<T extends string, K = Lowercase<T>> = K extends `${infer R}_${infer P}`
  ? `${R}${Capitalize<SnakeToLowerCamel<P, P>>}`
  : K;

/** 小驼峰（lowerCamelCase）转下划线（snake_case） */
export type LowerCamelToSnake<T extends string> = T extends `${infer R}${infer P}`
  ? R extends Lowercase<R>
    ? `${R}${LowerCamelToSnake<P>}`
    : `_${Lowercase<R>}${LowerCamelToSnake<P>}`
  : T;

export const camelToSnake = <T extends string>(str: T, separator: string = '_') =>
  str.replace(/([A-Z])/g, `${separator}$1`).toLowerCase() as LowerCamelToSnake<T>;

type AllAwaited<T> = T extends [infer R, ...infer P]
  ? [Awaited<R>, ...AllAwaited<P>]
  : T extends Array<infer Q>
    ? Array<Awaited<Q>>
    : Awaited<T>;

export const promises = <T extends any[]>(all: T) => Promise.all(all.filter(isPromise)) as Promise<AllAwaited<T>>;

export const values = <T>(obj: Record<string, T>): T[] => Object.keys(obj).map(key => obj[key]);

export const notEmptyObject = (val: Object): boolean => !!Object.keys(val).length;

export const easingOpt = (
  duration: number,
  easing: (...args: any[]) => any = wx.worklet.Easing.out(wx.worklet.Easing.sin)
): WechatMiniprogram.TimingOption => ({ duration, easing });

export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) =>
  Object.keys(obj).reduce(
    (acc, key) => {
      if (!keys.includes(key as K)) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, Exclude<keyof T, K>>
  );

export const strToStyle = (str: string) => {
  return str.split(';').reduce(
    (acc, item) => {
      if (item) {
        const [k, v] = item.split(':').map(s => s.trim());
        if (k) acc[k] = v;
      }
      return acc;
    },
    {} as Record<string, string | number>
  );
};
