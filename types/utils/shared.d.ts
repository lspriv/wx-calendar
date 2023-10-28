export type OF<T> = T extends readonly [infer R, ...infer P] ? R | OF<P> : never;
export type PartRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
export type Voidable<T> = T | undefined;
export type Nullable<T> = T | null;
export declare const isDate: (val: unknown) => val is Date;
export declare const isString: (val: unknown) => val is string;
export declare const isNumber: (val: unknown) => val is number;
export declare const isFunction: (val: unknown) => val is Function;
export declare const isObject: (val: unknown) => val is Record<any, any>;
export declare const isMap: (val: unknown) => val is Map<any, any>;
export declare const isPromise: <T = any>(val: unknown) => val is Promise<T>;
export declare const nonNullable: <T>(val: T) => val is NonNullable<T>;
export declare const isVoid: (val: unknown) => val is undefined;
export type Join<T extends ReadonlyArray<string>, S = ',', U = ''> = T extends readonly [
    infer R,
    ...infer P extends ReadonlyArray<string>
] ? `${U & string}${R & string}${Join<P, S, S>}` : '';
export declare const promises: <T>(all: T[]) => Promise<Awaited<T>[]>;
export declare const values: <T>(obj: Record<string, T>) => T[];
export declare const flatValues: <T>(obj: Record<string, T | T[]>) => T[];
export declare const notEmptyObject: (val: Object) => boolean;
export declare const easeInOutSine: (x: number, end?: number, start?: number) => number;
