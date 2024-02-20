/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-19 14:44:02
 */
export * from './utils/shared';

export type * from './interface/component';
export type * from './basic/service';

export * from './interface/calendar';
export { nextTick, severalTicks, viewFlag, flagView, isViewFixed, isSkyline } from './basic/tools';
export { LUNAR_PLUGIN_KEY } from './plugins/lunar';
export { MARK_PLUGIN_KEY } from './plugins/mark';
