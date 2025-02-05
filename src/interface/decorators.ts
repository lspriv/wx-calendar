import { Plugin, PluginTracker, PluginInterception, PluginEventHandler } from '../basic/service';

type TplGetUL<T extends string, P extends string> = T extends `${P}${infer R}`
  ? Uppercase<R> | Lowercase<R> | Capitalize<Lowercase<R>>
  : never;

export function WcPlugin<TKey extends string>(key: TKey) {
  return function decorator<T extends { new (...args: any[]): any }>(constructor: T) {
    return class WCPlugin extends constructor implements Plugin {
      static KEY: TKey = key;
    };
  };
}

function defineTarget(pluginKey: string) {
  return function decorator(target: any, propertyKey: string) {
    Object.defineProperty(target, pluginKey.toUpperCase(), {
      value: function (...args: any[]) {
        return this[propertyKey](...args);
      }
    });
  };
}

const PREFIX_TRACK = 'PLUGIN_TRACK_';
const PREFIX_CATCH = 'PLUGIN_CATCH_';
const PREFIX_ON = 'PLUGIN_ON_';

type TrackKeys = TplGetUL<keyof PluginTracker, typeof PREFIX_TRACK>;
export function Track<TKey extends TrackKeys>(key: TKey) {
  return defineTarget(PREFIX_TRACK + key);
}

type CatchKeys = TplGetUL<keyof PluginInterception, typeof PREFIX_CATCH>;
export function Catch<TKey extends CatchKeys>(key: TKey) {
  return defineTarget(PREFIX_CATCH + key);
}

type OnKeys = TplGetUL<keyof PluginEventHandler, typeof PREFIX_ON>;
export function On<TKey extends OnKeys>(key: TKey) {
  return defineTarget(PREFIX_ON + key);
}

export const Filter = defineTarget('PLUGIN_DATES_FILTER');
