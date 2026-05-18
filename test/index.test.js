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

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

let calendarId;

const getCalendarId = () => {
  if (!calendarId) calendarId = simulate.load(path.resolve(__dirname, '../dev/components/wx-calendar/index'));
  return calendarId;
};

const renderCalendar = properties => {
  const id = getCalendarId();
  const component = simulate.render(id, properties);
  const parent = document.createElement('parent-wrapper');
  component.attach(parent);
  return { component, parent };
};

const getPanelDate = (component, day) => {
  const panel = component.data.panels[component.data.current];
  return panel.weeks.flatMap(week => week.days).find(date => date.month === 5 && date.day === day);
};

test('component', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var wx = predef;

  // 加载自定义组件，返回组件 id
  const id = getCalendarId();

  // 使用 id 渲染自定义组件，返回组件封装实例
  const component = simulate.render(id);

  // 创建容器节点
  const parent = document.createElement('parent-wrapper');
  // 将组件插入到容器节点中，会触发 attached 生命周期
  component.attach(parent);

  // 将组件从容器节点中移除，会触发 detached 生命周期
  component.detach();
});

test('disabled dates include mode only enables configured dates', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var wx = predef;

  const { component } = renderCalendar({
    date: '2026-05-01',
    disabledDates: ['2026-05-02'],
    disabledDatesMode: 'include'
  });
  await wait(30);

  expect(component.data.checked.day).toBe(2);
  expect(getPanelDate(component, 1).disabled).toBe(true);
  expect(getPanelDate(component, 2).disabled).toBe(false);
  expect(getPanelDate(component, 3).disabled).toBe(true);

  await component.instance._panel_.toDate('2026-05-03');
  expect(component.data.checked.day).toBe(2);

  component.detach();
});

test('disabled dates default mode keeps configured dates disabled', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var wx = predef;

  const { component } = renderCalendar({
    date: '2026-05-01',
    disabledDates: ['2026-05-02']
  });
  await wait(30);

  expect(getPanelDate(component, 1).disabled).toBe(false);
  expect(getPanelDate(component, 2).disabled).toBe(true);

  component.detach();
});

test('header date displays year outside current year', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var wx = predef;

  const year = new Date().getFullYear() + 1;
  const { component } = renderCalendar();
  await wait(30);
  await component.instance._panel_.toDate(`${year}-05-13`);

  expect(component.data.info).toBe(`${year}年5月13日`);

  component.detach();
});
