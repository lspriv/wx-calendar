## WX Calendar

>

<!-- https://shields.io/ -->
![NPM Version](https://img.shields.io/npm/v/@lspriv/wx-calendar)
![NPM Downloads](https://img.shields.io/npm/dw/@lspriv/wx-calendar)
![Static Badge](https://img.shields.io/badge/coverage-later-a9a9a9)
![GitHub License](https://img.shields.io/github/license/lspriv/wx-calendar)


微信小程序日历

>     · 年月周日程视图
>     · 支持skyline和webview渲染
>     · 支持插件扩展


### 设计

[![pizCOOg.png](https://s11.ax1x.com/2024/01/06/pizCOOg.png)](https://imgse.com/i/pizCOOg)



### 使用
小程序基础库 `SDKVersion` >= 3.0.0

#### 1.安装
```bash
npm i @lspriv/wx-calendar -S
```

#### 2.构建
微信小程序开发工具菜单栏：`工具` --> `构建 npm`
[*官方文档*](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#_2-%E6%9E%84%E5%BB%BA-npm)

#### 3.引入配置
在页面或全局配置文件中配置
```json
{
    "usingComponents": {
        "calendar": "@lspriv/wx-calendar"
    }
}
```

#### 4.页面使用
在页面wxml文件中使用
```html
<calendar id="calendar" bindload="handleLoad" />
```

> [!IMPORTANT]
> 请在 bindload 事件后执行 selectComponent('#calendar') 操作。

### 二次开发
alpha分支是我的工作分支也是进度最新的分支，issue/*分支是解决issue里提到的问题，develop分支相当于你们的SIT，发pr到master打tag，拉取哪个分支自行考量

#### 启动
```bash
npm install
# 启动，默认skyline配置
npm run dev
# 设置webview
# npm run dev @webview 或者 npm run dev @W
```

#### 打包
```bash
npm run build
```

#### 发包（预览包）
```bash
npm run package
```
> [!NOTE]
> 这个发包命令执行了打包、发包和推送仓库三部分，所以不必重复执行打包命令

#### 测试

测试尚未写完，等我抽空就写 :rofl:

### 类型说明
以下出现的类型定义：
```typescript
type CalendarDay = {
  year: number; // 年
  month: number; // 月
  day: number; // 日
};
```

### Props 属性
以下所有属性都是可选填属性
<table>
    <tr>
        <th>属性</th>
        <th>类型</th>
        <th>说明</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>view</td>
        <td>string</td>
        <td>视图</td>
        <td>month[week|schedule]</td>
    </tr>
    <tr>
        <td>marks</td>
        <td>array</td>
        <td>日程、角标和节假日标记</td>
        <td>[]</td>
    </tr>
    <tr>
        <td>vibrate</td>
        <td>boolean</td>
        <td>点选日期是否震动</td>
        <td>true</td>
    </tr>
    <tr>
        <td>darkmode</td>
        <td>boolean</td>
        <td>深色模式（跟随系统）</td>
        <td>true</td>
    </tr>
    <tr>
        <td>date</td>
        <td>string|number</td>
        <td>选中日期</td>
        <td>xxxx-xx-xx|timestamp</td>
    </tr>
    <tr>
        <td>weekstart</td>
        <td>number</td>
        <td>周首日，0|1|2|3|4|5|6</td>
        <td>0</td>
    </tr>
    <tr>
        <td>style</td>
        <td>string</td>
        <td>设置主题样式变量</td>
        <td>''</td>
    </tr>
    <tr>
        <td>sameChecked</td>
        <td>boolean</td>
        <td>保持选中日期样式一致</td>
        <td>false</td>
    </tr>
    <tr>
        <td>font</td>
        <td>string</td>
        <td>设置字体</td>
        <td>''</td>
    </tr>
    <tr>
        <td>customNavBar</td>
        <td>boolean</td>
        <td>组件所在页面是否自定义导航栏</td>
        <td>true</td>
    </tr>
    <tr>
        <td>areas</td>
        <td>array</td>
        <td>自定义布局区域</td>
        <td>['header', 'title', 'subinfo', 'today', 'viewbar', 'dragbar']</td>
    </tr>
    <tr>
        <td>viewGesture</td>
        <td>boolean</td>
        <td>是否滑动手势控制视图</td>
        <td>true</td>
    </tr>
</table>

> [!TIP] 
> 1.7.0+版本已经移除了固定视图，新增手势控制属性 `viewGesture` ，用一下方式实现固定视图，有更高的自由度

固定视图的新方式
```html
<!-- 固定为周视图 -->
<!-- view 默认初始视图 -->
<!-- view-gesture 取消手势控制 -->
<!-- areas 只保留四个区域，将viewbar和dragbar移除 -->
<calendar 
  view="week"
  view-gesture="{{ false }}"
  areas="{{ ['header', 'title', 'subinfo', 'today'] }}"
/>
```

> [!TIP] 
> 关于属性 `marks`
> ```typescript
> // 标记里的日期，要么输入年月日year｜month｜day，要么输入日期 date
> type Mark = {
>   year?: number; // 年
>   month?: number; // 月 
>   day?: number; // 日
>   date?: string | number | Date; // 日期 yyyy-mm-dd | timestamp | Date
>   type: 'schedule' | 'corner' | 'festival'; // 日程｜角标｜节假日
>   text: string; // 内容
>   color: string; // 文本色
>   bgColor?: string; // 背景色，type为schedule时可选
> }
> // 样式标记
> type StyleMark = {
>   year?: number; // 年
>   month?: number; // 月 
>   day?: number; // 日
>   date?: string | number | Date; // 日期 yyyy-mm-dd | timestamp | 
>   style: string | Record<string, string | number>;
> }
> ```
> 角标内容最好一个字符长度，只对一个字符校正了位置，多出的请自行调整位置

### Events 事件

[***`bindload`***](#bindload)  日历加载完成
```typescript
type LoadEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
    range: [start: CalenderDay, end: CalenderDay]; // 当前渲染的月份范围
}
```
获取组件实例
```html
<calendar id="calendar" bindload="handleLoad" />
```
```typescript
import { CalendarExport } from '@lspriv/wx-calendar/lib';

Page({
  handleLoad() {
    const calendar = this.selectComponent('#calendar') as CalendarExport; 
    // 如果你使用了其他插件，比如 WxCalendar.use(AnyPlugin)，则可以
    // const calendar = ... as CalendarExport<[typeof AnyPlugin]>;
  }
});
```

[***`bindclick`***](#bindload)  日期点击
```typescript
type LoadEventDetail = {
    checked: CalenderDay; // 当前点击日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
}
```
> [!NOTE]
> 日期点击事件，若有必要请自行防抖处理

[***`bindchange`***](#bindchange)  日期选中变化
```typescript
type ChangeEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
    range: [start: CalenderDay, end: CalenderDay]; // 当前渲染的月份范围
}
```

[***`bindviewchange`***](#bindviewchange)   面板视图变化
```typescript
type ViewChangeEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
}
```

[***`bindschedule`***](#bindviewchange)   点击日程触发
```typescript
type ScheduleEventDetail = {
    schedules?: Array<ScheduleEventDetail>; // 所有日程
    schedule?: ScheduleEventDetail; // 当前点击日程
    all: boolean; // 是否所有日程
}
```

### Methods 方法

[***`checked`***](#toDate) 选中日期
```typescript
{
  /**
   * @param date 选中日期
   * yyyy-mm-dd | timestamp | Date | CalendarDay
   */
  (date: string | number | Date | CalendarDay): Promise<void>;
}
```

[***`toggleView`***](#toggleView) 切换视图
```typescript
{
  /**
   * @param [view] 要切换的视图
   * 当view未指定时，会在周月视图之间切换
   */
  (view?: 'month' | 'week' | 'schedule'): void;
}
```

[***`openAnuual`***](#openAnuual) 打开年度面板
```typescript
{
  (): Promise<void>;
}
```

[***`getMarks`***](#getMarks) 获取完整的日期标记
```typescript
{
  /**
   * @param date 获取日期
   */
  (date: CalendarDay): PluginEntireMarks;
}
```

[***`getPlugin`***](#getPlugin) 获取插件实例
```typescript
{
  /**
   * @param key 插件的KEY
   */
  (key: string): InstanceType<PluginConstructor>;
}
```
 
[***`updateDates`***](#updateDates) 更新日期数据
```typescript
{
  /**
   * 若不指定哪些日期更新，默认刷新全部
   */
  (dates?: Array<CalendarDay>): Promise<void>;
}
```


### 样式
组件开启了样式隔离，仅可以调整字体大小和色号，可通过传入style属性修改以下css变量调整主题
```css
.wcc {
    /* 浅色主题 */
    --wc-bg-light: #FFF; /* 主背景色 */
    --wc-title-color-light: #333; /* 左上角日期标题 */
    --wc-title-sub-color-light: #7A7A7A; /* 左上角日期标题的右侧描述 */
    --wc-opt-bg-light: #D9ECFF; /* 视图控制背景色 */
    --wc-opt-checked-bg-light: #409EFF; /* 视图控制按钮背景色 */
    --wc-opt-color-light: #409EFF; /* 视图控制字体 */
    --wc-opt-checked-color-light: #FFF; /* 视图控制选中字体 */
    --wc-week-color-light: #ABABAB; /* 星期 */
    --wc-date-color-light: #333; /* 日期 */
    --wc-mark-color-light: #ABABAB; /* 日期下方信息 */
    --wc-dot-color-light: #ABABAB; /* 日期上方‘･’ */
    --wc-schedule-color-light: #409EFF; /* 日程默认 */
    --wc-schedule-bg-light: #EAEEF2; /* 日程默认背景 */
    --wc-today-color-light: #409EFF; /* 日期（今日） */
    --wc-solar-color-light: #409EFF; /* 日期下方信息默认（节气，节假日） */
    --wc-checked-color-light: #333; /* 被选日期 */
    --wc-checked-mark-color-light: #ABABAB; /* 被选日期下方信息 */
    --wc-checked-dot-color-light: #ABABAB; /* 被选日期上方‘･’ */
    --wc-checked-today-color-light: #FFF; /* 被选日期（今日） */
    --wc-checked-bg-light: #F5F5F5; /* 被选日期背景圆圈 */
    --wc-checked-today-bg-light: #409EFF; /* 被选日期背景圆圈（今日） */
    --wc-control-bg-light: #DFDFDF; /* 底部控制条背景 */
    --wc-annual-bg-light: #FFF; /* 年面板背景 */
    --wc-annual-title-color-light: #333; /* 年面板左上角标题 */
    --wc-annual-title-sub-color-light: #7A7A7A; /* 年面板左上角标题右侧信息 */

    /* 深色主题，以下和浅色主题一一对应 */
    --wc-bg-dark: #000;
    --wc-title-color-dark: #E5E5E5;
    --wc-title-sub-color-dark: #7A7A7A;
    --wc-opt-bg-dark: #332D2D80;
    --wc-opt-checked-bg-dark: #409EFF;
    --wc-opt-color-dark: #409EFF;
    --wc-opt-checked-color-dark: #FFF;
    --wc-week-color-dark: #ABABAB;
    --wc-date-color-dark: #E5E5E5;
    --wc-mark-color-dark: #5F5F5F;
    --wc-dot-color-dark: #ABABAB;
    --wc-schedule-color-dark: #66B1FF;
    --wc-schedule-bg-dark: #332D2D80;
    --wc-today-color-dark: #409EFF;
    --wc-solar-color-dark: #409EFF;
    --wc-checked-color-dark: #E5E5E5;
    --wc-checked-mark-color-dark: #5F5F5F;
    --wc-checked-dot-color-dark: #ABABAB;
    --wc-checked-today-color-dark: #E5E5E5;
    --wc-checked-bg-dark: #262626;
    --wc-checked-today-bg-dark: #409EFF;
    --wc-control-bg-dark: #262626;
    --wc-annual-bg-dark: #000;
    --wc-annual-title-color-dark: #E5E5E5;
    --wc-annual-title-sub-color-dark: #3F3F3F;

    /** 字号 */
    --wc-title-size: 46rpx; /** 左上角日期标题字号 */ 
    --wc-title-sub-size: 20rpx; /** 左上角日期标题右侧描述信息字号 */ 
    --wc-operator-size: 22rpx; /** 视图控制按钮字号 */ 
    --wc-week-size: 20rpx; /** 星期字号 */ 
    --wc-date-size: 36rpx; /** 日期字体字号 */ 
    --wc-mark-size: 20rpx; /** 日期下方信息字体字号 */ 
    --wc-corner-size: 16rpx; /** 日期角标字体字号 */ 
    --wc-schedule-size: 16rpx; /** 日程字体字号 */ 
    --wc-annual-title-size: 50rpx; /** 年面板左上角年份标题字体字号 */ 
    --wc-annual-title-sub-size: 18rpx; /** 年面板左上角年份标题右侧信息字体字号 */ 
}
```
修改样式
```html
<calendar style="--wc-bg-light: #000;" />
```

### 类型检查
由于小程序构建npm的特殊性，本组件又是非纯js库，为了获得正确的的类型提示，需要在小程序根目录的jsconfig.json或是tsconfig.json文件中指明路径。
```json
{
  "compilerOptions": {
    "paths": {
      "@lspriv/wx-calendar/*": [
          "./node_modules/@lspriv/wx-calendar/dist/*"
        ]
    }
  }
}
```

### 插件

#### 插件使用
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/lib');
const { YourPlugin } = require('anywhere');

// WxCalendar.clearPlugin(); 清理预设插件

WxCalendar.use(YourPlugin, options); // options 插件选项

Component({
    ...
})
```

#### 插件开发
自定义插件需要实现Plugin接口
```typescript
import { 
  Plugin, 
  WcYear,
  CalendarDay,  
  TrackDateResult, 
  TrackYearResult, 
  PluginService,
  WcScheduleInfo,
  CalendarEventDetail,
  DateRange,
  getMarkKey,
  getAnnualMarkKey
} from '@lspriv/wx-calendar/lib';

class MyPlugin implements Plugin {
  /** 需要定义插件的key，必填 */
  static KEY = 'my-plugin' as const;

  constructor(options?: Record<string, any>) {
    // options 引入时的插件选项
  }

  /**
   * PliginService初始化完成，可选择实现该方法
   * @param service PliginService实例
   */
  PLUGIN_INITIALIZE(service: PluginService) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 捕获日期，可选择实现该方法
   * @param date 日期
   */
  PLUGIN_TRACK_DATE(date: CalendarDay): TrackDateResult {
    // do something...
    return {
      schedule: [{ text: '', color: '', bgColor: '', key: getMarkKey('id', MyPlugin.KEY) }], // 设置日程数组，可选
      corner: { text: '', color: '' }, // 设置角标，可选
      festival: { text: '', color: '' }, // 设置节假日，可选
      style: { backgroundColor: '', color: '' } // 设置日期样式，也可传字符串形式（如 'background-color: #409EFF;color: #fff;'），可选
    };
  };
  
  /**
   * 捕获年份，可选择实现该方法
   * @param year 年
   */
  PLUGIN_TRACK_YEAR(year: WcYear): TrackYearResult {
    // do something...

    return {
      subinfo: [
        { text: '乙巳蛇年', color: '#F56C6C' },
        { text: '农历初一', color: '#409EFF' }
      ], 
      marks: new Map([
        [getAnnualMarkKey({ month: 10, day: 6 }), { rwtype: 'rest' }], // 休息日，置灰
        [getAnnualMarkKey({ month: 10, day: 7 }), { rwtype: 'work' }], // 工作日，正常
        [getAnnualMarkKey({ month: 10, day: 12 }), { sub: '#F56C6C' }] // 自定义颜色下标
        [getAnnualMarkKey({ month: 10, day: 20 }), { 
          style: {
            color: { light: '#fff', dark: '#000' }, // 日期字体颜色
            bgColor: { light: '#409EFF', dark: '#409EFF' }, // 日期背景颜色
            opacity: { light: 1, dark: 1 }, // 不支持 0
            bgTLRadius: { light: 50, dark: 50 }, // 日期背景左上圆角半径
            bgTRRadius: { light: 0, dark: 0 }, // 日期背景右上圆角半径
            bgBLRadius: { light: 0, dark: 0 }, // 日期背景左下圆角半径
            bgBRRadius: { light: 50, dark: 50 }, // 日期背景右下圆角半径
            bgWidth: { light: 'dateCol', dark: 'dateCol' } // 日期背景宽度，deteCol为列宽
          } 
        }]
      ])
    }
  };

  /**
   * 获取日程信息（点击日程时执行）
   * @param date 日期
   * @param id 插件内标记, 由 getMarkKey 生成 key 时传入的 id，详见 PLUGIN_TRACK_DATE
   */
  PLUGIN_TRACK_SCHEDULE(date: CalendarDay, id:? string): WcScheduleInfo {}

  /**
   * 注册日历组件attach阶段处理方法，可选择实现该方法
   * 此时组件内部工具类初始化完成
   * @param service PliginService实例
   */
  PLUGIN_ON_ATTACH(service: PluginService) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 注册日历加载完成事件处理方法，可选择实现该方法
   * @param service PliginService实例
   * @param detail 事件数据
   */
  PLUGIN_ON_LOAD(service: PluginService, detail: CalendarEventDetail) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 注册日期点击事件处理方法，可选择实现该方法
   * @param service PliginService实例
   * @param detail 事件数据
   */
  PLUGIN_ON_CLICK(service: PluginService, detail: CalendarEventDetail) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 注册日期变化事件处理方法，可选择实现该方法
   * @param service PliginService实例
   * @param detail 事件数据
   */
  PLUGIN_ON_CHANGE(service: PluginService, detail: CalendarEventDetail) {
    // 获取日历组件实例
    const component = service.component;
  }
  
  /**
   * 注册视图变化事件处理方法，可选择实现该方法
   * @param service PliginService实例
   * @param detail 事件数据
   */
  PLUGIN_ON_VIEWCHANGE(service: PluginService, detail: CalendarEventDetail) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 注册日历组件实例销毁事件处理方法，可选择实现该方法
   * @param service PliginService实例
   */
  PLUGIN_ON_DETACHED(service: PluginService) {
    // 获取日历组件实例
    const component = service.component;
  }

  /**
   * 拦截日期点击动作，可选择实现该方法
   * @param service PliginService实例
   * @param event 事件参数
   * @param intercept 拦截器
   */
  PLUGIN_CATCH_TAP(service: PluginService, event: TouchEvent, intercept: EventIntercept) {
     // 获取日历组件实例
    const component = service.component;
    // 若不想事件继续传播
    if (...) intercept();

    // intercept(0) 直接退出 intercept(1) 继续向自身和其他插件传播，但不会执行默认行为
  }

  /**
   * 日期过滤器（提供给其他组件调用的），可选择实现该方法
   * @param service PliginService实例
   * @param dates 待过滤的日期数组
   * @param type range范围  multi多点
   */
  PLUGIN_DATES_FILTER(service: PluginService, dates: Array<CalendarDay | DateRange>): Array<Calendar | DateRange> {
     // 获取日历组件实例
    const component = service.component;

    return [
      [{ year: 2024, month: 6, day: 1 } , { year: 2024, month: 6, day: 28 }], // 日期范围
      { year: 2024, month: 7, day: 1 } // 单点日期
    ]
  }
}
```


#### 农历插件
wx-calendar自带农历插件
```javascript
const { LUNAR_PLUGIN_KEY } = require('@lspriv/wx-calendar/lib');
// 你的页面中
const calendar = this.selectComponent('#calendar');
const lunarPlugin = calendar.getPlugin(LUNAR_PLUGIN_KEY);
// 获取农历信息
const lunarDate = lunarPlugin.getLunar({ year: 2023, month: 10, day: 26 });
```
农历信息
```typescript
type LunarDate = {
  year: number; // 公历年
  month: number; // 公历月
  day: number; // 公历日
  lunarYear: string; // 农历年
  lunarMonth: string; // 农历月
  lunarDay: string; // 农历日
  solar: string; // 节气
}
```

#### 插件说明
- `标记数据` 后引入的插件数据覆盖先引入的插件数据
- `响应事件` 按插件的引入顺序响应事件，先引入的先响应
- `动作捕获` 后引入的先执行

#### 已完成插件
- [x] <a href="https://github.com/lspriv/wc-plugin-disabled" target="_blank">**@lspriv/wc-plugin-disabled 日历禁用插件**</a>
- [x] <a href="https://github.com/lspriv/wc-plugin-multiple" target="_blank">**@lspriv/wc-plugin-multiple 日历多选插件**</a>
- [x] <a href="https://github.com/lspriv/wc-plugin-ics" target="_blank">**@lspriv/wc-plugin-ics ICS日历订阅插件**</a>
- [ ] *Locale本地化插件*

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的道友加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)
 