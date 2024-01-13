/*
 * Copyright 2023 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: 声明
 * @Author: lspriv
 * @LastEditTime: 2024-01-13 13:20:48
 */
declare type SkylineStyleObject = Record<string, string | number>;

interface Shared<T> {
  value: T;
}

declare namespace WechatMiniprogram {
  interface Worklet {
    shared<T>(initialValue: T): Shared<T>;
    timing<T>(toValue: T, options: WechatMiniprogram.TimingOption, callback?: (...args: any[]) => any): T;
    spring<T>(toValue: T, options: WechatMiniprogram.SpringOption, callback?: (...args: any[]) => any): T;
    delay<T>(delayMS: number, delayedAnimation: T): T;
    sequence<T>(...args: Array<T>): T;
  }

  interface WorkletEasing {
    in(easing?: Function): any;
    out(easing?: Function): any;
    inOut(easing?: Function): any;
    sin(...args: any[]): any;
    bezier(x1: number, y1: number, x2: number, y2: number): any;
  }

  interface GragGestureEvent<DataSet extends IAnyObject = IAnyObject> {
    state: 0 | 1 | 2 | 3 | 4;
    absoluteX: number;
    absoluteY: number;
    deltaX: number;
    deltaY: number;
    velocityX: number;
    velocityY: number;
    currentTarget: Target<DataSet>;
  }

  // interface GragGestureResponseEvent {
  //   clientX: number;
  //   clientY: number;
  //   deltaX: number;
  //   deltaY: number;
  //   force: number;
  //   identifier: number;
  //   localX: number;
  //   localY: number;
  //   radiusX: number;
  //   radiusY: number;
  //   rotationAngle: number;
  //   tilt: number;
  //   timeStamp: number;
  //   type: string;
  // }

  namespace Component {
    interface AnimatedUpdater {
      (): SkylineStyleObject;
    }

    interface AnimatedUserConfig {
      immediate?: boolean;
      flush?: 'async' | 'sync';
    }

    interface AnimatedResult {
      styleId: number;
    }

    interface InstanceProperties {
      renderer?: 'webview' | 'skyline';
      applyAnimatedStyle(
        selector: string,
        updater: AnimatedUpdater,
        userConfig?: AnimatedUserConfig,
        callback?: (result: AnimatedResult) => void
      ): void;
      clearAnimatedStyle(selector: string, styleIds: Array<number>, callback?: () => void): void;
    }
  }
}

declare interface HTMLCanvasElement {
  /**
   * 在下次进行重绘时执行。 支持在 2D Canvas 和 WebGL Canvas 下使用, 但不支持混用 2D 和 WebGL 的方法。
   * @param callback 执行的 callback
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/canvas/Canvas.requestAnimationFrame.html
   */
  requestAnimationFrame(callback: () => void): number;
  /**
   * 取消由 requestAnimationFrame 添加到计划中的动画帧请求。支持在 2D Canvas 和 WebGL Canvas 下使用, 但不支持混用 2D 和 WebGL 的方法。
   * @param requestID requestAnimationFrame返回的请求 ID
   * @see https://developers.weixin.qq.com/miniprogram/dev/api/canvas/Canvas.cancelAnimationFrame.html
   */
  cancelAnimationFrame(requestID: number): void;
}
