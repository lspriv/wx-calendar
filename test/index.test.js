/*
 * @Description: test
 * @Author: lspriv
 * @LastEditTime: 2023-12-26 17:28:24
 */
const path = require('path');
const simulate = require('miniprogram-simulate');
const predef = require('./predefine');

const originalComponent = global.Component;
global.Component = options => {
  options.methods = {
    ...options.methods,
    applyAnimatedStyle: predef.applyAnimatedStyle,
    clearAnimatedStyle: predef.clearAnimatedStyle
  };
  originalComponent(options);
};

test('component', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var wx = predef;

  // 加载自定义组件，返回组件 id
  const id = simulate.load(path.resolve(__dirname, '../dev/components/wx-calendar/index'));

  // 使用 id 渲染自定义组件，返回组件封装实例
  const component = simulate.render(id);

  // 创建容器节点
  const parent = document.createElement('parent-wrapper');
  // 将组件插入到容器节点中，会触发 attached 生命周期
  component.attach(parent);

  // 将组件从容器节点中移除，会触发 detached 生命周期
  component.detach();
});
