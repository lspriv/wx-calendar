/*
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2023-12-26 17:10:11
 */
const sleep = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const SharedProxyHandler = {
  get: function (target, prop) {
    if (prop === 'value') {
      return target.value._value;
    } else {
      return void 0;
    }
  },
  set: function (target, prop, value) {
    if (prop === 'value') {
      target.value.run(Array.isArray(value) ? value : [value]);
    }
  }
};

class Shared {
  constructor(value) {
    this._timer = null;
    this._duration = 0;
    this._value = value;
  }

  async animate(toValue, duration = 0, callback = null) {
    const ts = new Date().getTime();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await Promise.resolve();
      const t = new Date().getTime();
      const deltaT = t - ts;
      if (deltaT >= duration) break;
      this._value = (toValue - this._value) * (deltaT / duration) + this._value;
    }

    this._value = toValue;
    callback && callback();
  }

  async run(...animations) {
    for (const animation of animations) {
      if (animation instanceof Animation) {
        if (animation.delay) await sleep(animation.delay);
        await this.animate(animation.toVal, animation.duration, animation.callback);
      } else {
        this._value = animation;
      }
    }
  }
}

class Animation {
  constructor(toVal, duration = 0, callback = null) {
    this.toVal = toVal;
    this.duration = duration;
    this.callback = callback;
    this.delay = 0;
  }

  setDelay(delay) {
    this.delay = delay;
  }
}

const shared = value => new Proxy({ value: new Shared(value) }, SharedProxyHandler);

const nextTick = callback => setTimeout(callback, 10);

const runOnJS =
  fn =>
  (...args) =>
    fn(...args);

const timing = (toValue, options, callback) => {
  return new Animation(toValue, options.duration, callback);
};

const delay = (delayMS, delayedAnimation) => {
  delayedAnimation.setDelay(delayMS);
  return delayedAnimation;
};

const sequence = (...animationN) => animationN;

const Easing = {
  out: () => {},
  sin: () => {},
  inOut: () => {}
};

const worklet = {
  shared,
  runOnJS,
  timing,
  delay,
  sequence,
  Easing
};

const getSystemInfoSync = () => ({
  SDKVersion: '3.2.5',
  albumAuthorized: true,
  batteryLevel: 78,
  benchmarkLevel: -1,
  bluetoothAuthorized: true,
  bluetoothEnabled: true,
  brand: 'devtools',
  cameraAuthorized: false,
  deviceOrientation: 'portrait',
  devicePixelRatio: 3,
  enableDebug: false,
  fontSizeScaleFactor: 0.85,
  fontSizeSetting: 16,
  host: { env: 'WeChat' },
  language: 'zh_CN',
  locationAuthorized: false,
  locationEnabled: true,
  locationReducedAccuracy: true,
  memorySize: 2048,
  microphoneAuthorized: true,
  mode: 'default',
  model: 'iPhone 12/13 (Pro)',
  notificationAlertAuthorized: true,
  notificationAuthorized: true,
  notificationBadgeAuthorized: true,
  notificationSoundAuthorized: true,
  phoneCalendarAuthorized: false,
  pixelRatio: 3,
  platform: 'devtools',
  safeArea: {
    top: 47,
    left: 0,
    right: 390,
    bottom: 810,
    width: 390
  },
  screenHeight: 844,
  screenTop: 0,
  screenWidth: 390,
  statusBarHeight: 47,
  system: 'iOS 10.0.1',
  theme: 'light',
  version: '8.0.5',
  wifiEnabled: true,
  windowHeight: 844,
  windowWidth: 390
});

const getMenuButtonBoundingClientRect = () => ({
  bottom: 83,
  height: 32,
  left: 296,
  right: 383,
  top: 51,
  width: 87
});

const vibrateShort = () => {};
const onThemeChange = () => {};
const offThemeChange = () => {};

const applyAnimatedStyle = (selector, updater, options, callback) => {
  updater();
  callback && callback({ styleId: Math.floor(Math.random() * 10) });
};

const clearAnimatedStyle = (selector, ids, callback) => {
  callback && callback();
};

module.exports = {
  nextTick,
  worklet,
  getSystemInfoSync,
  getMenuButtonBoundingClientRect,
  vibrateShort,
  onThemeChange,
  offThemeChange,
  applyAnimatedStyle,
  clearAnimatedStyle
};
