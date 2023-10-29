/*
 * @Description: Description
 * @Author: lishen
 * @LastEditTime: 2023-10-22 16:40:17
 */
export type OF<T> = T extends readonly [infer R, ...infer P] ? R | OF<P> : never;
export type PartRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
export type Voidable<T> = T | undefined;
export type Nullable<T> = T | null;

const toTypeString = (val: unknown): string => Object.prototype.toString.call(val);

export const isDate = (val: unknown): val is Date => toTypeString(val) === '[object Date]';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isNumber = (val: unknown): val is number => typeof val === 'number';
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';
export const isMap = (val: unknown): val is Map<any, any> => toTypeString(val) === '[object Map]';
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

type Flat<T> = T extends Array<infer R> ? R : T;

export const flatValues = <T>(obj: Record<string, T | T[]>): T[] => Object.keys(obj).flatMap(key => obj[key]);

export const notEmptyObject = (val: Object): boolean => !!Object.keys(val).length;

export const easeInOutSine = (x: number, end: number = 1, start: number = 0): number => {
  const t = end - start;
  return (-(Math.cos(Math.PI * x) - 1) / 2) * t + start;
};