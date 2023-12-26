/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2023-10-30 17:27:02
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

export type Join<T extends ReadonlyArray<string>, S = ',', U = ''> = T extends readonly [
  infer R,
  ...infer P extends ReadonlyArray<string>
]
  ? `${U & string}${R & string}${Join<P, S, S>}`
  : '';

export const promises = <T>(all: T[]) => Promise.all(all.filter(isPromise<T>));

export const values = <T>(obj: Record<string, T>): T[] => Object.keys(obj).map(key => obj[key]);

export const notEmptyObject = (val: Object): boolean => !!Object.keys(val).length;

export const easeInOutSine = (x: number, end: number = 1, start: number = 0): number => {
  const t = end - start;
  return (-(Math.cos(Math.PI * x) - 1) / 2) * t + start;
};

export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) =>
  Object.keys(obj).reduce(
    (acc, key) => {
      if (!keys.includes(key as K)) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, Exclude<keyof T, K>>
  );
