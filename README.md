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

#### 安装
```bash
npm i @lspriv/wx-calendar -S
```

#### 构建
微信小程序开发工具菜单栏：`工具` --> `构建 npm`
[*官方文档*](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#_2-%E6%9E%84%E5%BB%BA-npm)

#### 引入配置
在页面或全局配置文件中配置
```json
{
    "usingComponents": {
        "calendar": "@lspriv/wx-calendar"
    }
}
```

#### 页面使用
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
        <td>视图，加后缀fixed可固定视图</td>
        <td>month[week|schedule][-fixed]</td>
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
</table>

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
> ```
> 角标内容最好一个字符长度，只对一个字符校正了位置，多出的请自行调整位置

### Events 事件

[***`bindload`***](#bindload)  日历加载完成
```typescript
type LoadEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
}
```

[***`bindchange`***](#bindchange)  日期选中变化
```typescript
type ChangeEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
}
```

[***`bindviewchange`***](#bindviewchange)   面板视图变化
```typescript
type ViewChangeEventDetail = {
    checked: CalenderDay; // 当前选择日期
    view: 'week' | 'month' | 'schedule'; // 当前视图
}
```

### Methods 方法

[***`toDate`***](#toDate) 跳转到指定日期
```typescript
{
  /**
   * @param date 跳转日期
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

### 插件
wx-calendar自带农历插件

#### 插件使用
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar');
const { YourPlugin } = require('anywhere');

// WxCalendar.clearPlugin(); 清理预设插件

WxCalendar.use(YourPlugin, options); // options 插件选项

// 或 WxCalendar.use([YourPlugin]); 这种适合多个无配置选项的

Component({
    ...
})
```

#### 插件开发
自定义插件需要实现Plugin接口
```typescript
import type { 
  Plugin, 
  CalendarDay, 
  WxCalendarYear, 
  TrackDateResult, 
  TrackYearResult, 
  PluginService,
  CalendarEventDetail
} from '@lspriv/wx-calendar';

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
      schedule: [{ text: '', color: '', bgColor: '' }], // 设置日程数组，可选
      corner: { text: '', color: '' }, // 设置角标，可选
      festival: { text: '', color: '' } // 设置节假日，可选
    };
  };
  
  /**
   * 捕获年份，可选择实现该方法
   * @param year 年
   */
  PLUGIN_TRACK_YEAR(year: WxCalendarYear): TrackYearResult {
    // do something...
    return {
      subinfo: '', // 设置年份描述信息，可选
      marks: new Map([
        ['2023-10-1', new Set(['rest'])], // 休息日，置灰
        ['2023-10-7', new Set(['work'])], // 工作日，正常
        ['2023-10-9', new Set(['#F56C6C'])] // 自定义颜色下标
      ])
    }
  };

  /**
   * 插件绑定到日期数据，可选择实现该方法
   * @param date 待绑定日期
   */
  PLUGIN_DATA(date: CalendarDay): any {};

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
  PLUGIN_ON_VIEW_CHANGE(service: PluginService, detail: CalendarEventDetail) {
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
}
```


#### 农历插件
```javascript
const { LUNAR_PLUGIN_KEY } = require('@lspriv/wx-calendar');
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
组件使用多个插件，后引入（use）的先执行，并且每个日期角标和节假日只有一个地方可用，所以先执行的插件捕获该日期有返回角标或节假日数据，则不再使用后续插件的角标和节假日数据，日程则是合并所有插件的日程数据

#### 插件画饼
有计划做的插件
- [ ] *ICS日历订阅插件*
- [ ] *日历快照插件*
- [ ] *Locale本地化插件*

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的小伙伴加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)
 