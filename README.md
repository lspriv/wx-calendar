## WX Calendar

>

这个项目借鉴了`MIUI`系统日历的设计，制作适合微信小程序的日历

>     · 年月周日程视图
>     · 支持skyline和webview渲染
>     · 支持插件扩展

> [提bug和需求点这里～](https://github.com/lspriv/wx-calendar/issues/new?assignees=&labels=&template=bug_report.md&title=)

### 设计

![demo_img](https://github.com/lspriv/resources/raw/main/wx-calendar.png)



### 使用
小程序库WeChatLib >= '3.0.0'

##### 安装
```bash
npm i @lspriv/wx-calendar -S
```

##### 构建
微信小程序开发工具菜单栏：工具 --> 构建 npm
[官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#_2-%E6%9E%84%E5%BB%BA-npm)

##### 页面json配置：
```json
{
    "usingComponents": {
        "calendar": "@lspriv/wx-calendar"
    }
}
```
> 

##### 在页面wxml文件中：
```html
<calendar id="calendar" bindload="handleLoad" />
```
> 

> **`注意`** 请在 bindload 事件后执行 selectComponent('#calendar') 操作。

### 二次开发
启动
```javascript
npm install
// 启动，默认skyline配置
npm run dev

// 设置webview
npm run dev @webview  //或者 npm run dev @W
```

打包
```javascript
npm run build
```

### Props 属性

<table>
    <tr>
        <th>属性名</th>
        <th>类型</th>
        <th>说明</th>
        <th>是否必填</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>view</td>
        <td>string</td>
        <td>初始化视图</td>
        <td>否</td>
        <td>month [week | schedule]</td>
    </tr>
    <tr>
        <td>marks</td>
        <td>array</td>
        <td>日程、角标和节假日标记</td>
        <td>否</td>
        <td>--</td>
    </tr>
    <tr>
        <td>vibrate</td>
        <td>boolean</td>
        <td>点选日期是否震动</td>
        <td>否</td>
        <td>true</td>
    </tr>
    <tr>
        <td>darkmode</td>
        <td>boolean</td>
        <td>深色模式</td>
        <td>否</td>
        <td>true</td>
    </tr>
    <tr>
        <td>date</td>
        <td>string | number</td>
        <td>选择日期</td>
        <td>否</td>
        <td>xxxx-xx-xx | timestamp</td>
    </tr>
    <tr>
        <td>weekstart</td>
        <td>Number</td>
        <td>周首日，0 | 1 | 2 | 3 | 4 | 5 | 6</td>
        <td>否</td>
        <td>0</td>
    </tr>
    <tr>
        <td>style</td>
        <td>string</td>
        <td>样式，可以设置css变量修改主题</td>
        <td>否</td>
        <td>''</td>
    </tr>
    <tr>
        <td>font</td>
        <td>string</td>
        <td>设置字体</td>
        <td>否</td>
        <td>''</td>
    </tr>
    <tr>
        <td>customNavBar</td>
        <td>boolean</td>
        <td>组件所在页面是否自定义导航栏</td>
        <td>否</td>
        <td>true</td>
    </tr>
</table>

> 关于属性 [marks](#)
> 
> Array<{ year: number; month: number; day: number; type: 'schedule' | 'corner' | 'festival'; text: string; color: string; bgColor?: string; }>
> 其中schedule日程可选bgColor属性，角标和节假日不需要这个属性

### Events 事件

[**`bindload`**](#bindload)  日历加载完成
>     e.detail = { checked, view } 
>     # checked 为当前选择日期
>     # view 当前面板视图


[**`bindchange`**](#bindchange)  日期选择变化
>     e.detail = { checked, view } 
>     # checked 为当前选择日期
>     # view 当前面板视图

[**`bindviewchange`**](#bindviewchange)   面板视图变化
>     e.detail = { checked, view } 
>     # checked 为当前选择日期
>     # view 当前面板视图

### Methods 方法

[**`toDate`**](#toDate)  void 跳转到指定日期
>     (date: string | number | Date | CalendarDay) => Promise<void>;
>     # 可以是 yyyy-mm-dd 格式的日期字符串
>     # 可以是 timestamp时间戳
>     # 可以是 Date日期类型
>     # 可以是 type CalendarDay = { year: number; month: number; day: number; }

[**`toYear`**](#toYear) void 年度面板跳转到指定年
>     (year: number) => Promise<void>;
>     # 参数为 年,月

[**`toggleView`**](#toggleView) void 切换视图
>     (view?: 'month' | 'week' | 'schedule') => void;
>     # 当view未指定时，会在周月视图之间切换


[**`getPlugin`**](#getPlugin) void 获取插件实例
>     (key: string) => InstanceType<PluginConstructor>;
>     # key为插件的KEY属性
 
[**`updatePluginDates`**](#updatePluginDates) object 更新插件数据
>     (dates?: Array<CalendarDay>) => Promise<void>;
>     # 更新插件数据，若不指定哪些日期更新，默认全部已加载日期

> 有需要更多方法的可以提issue

### 样式
可通过传入style属性修改以下css变量调整主题
```css
.wcc {
    /* 浅色主题 */
    --wc-bg-color-light: #FFF; /* 主背景色 */
    --wc-title-color-light: #333; /* 左上角日期标题 */
    --wc-title-sub-color-light: #7A7A7A; /* 左上角日期标题的右侧描述 */
    --wc-operator-bg-light: #D9ECFF; /* 视图控制背景色 */
    --wc-operator-checked-bg-light: #409EFF; /* 视图控制按钮背景色 */
    --wc-operator-color-light: #409EFF; /* 视图控制字体 */
    --wc-operator-checked-color-light: #FFF; /* 视图控制选中字体 */
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

    /* 深色主题 */
    --wc-bg-color-dark: #000;
    --wc-title-color-dark: #E5E5E5;
    --wc-title-sub-color-dark: #7A7A7A;
    --wc-operator-bg-dark: #332D2D80;
    --wc-operator-checked-bg-dark: #409EFF;
    --wc-operator-color-dark: #409EFF;
    --wc-operator-checked-color-dark: #FFF;
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
}
```

### 插件
wx-calendar自带农历插件

#### 插件使用
```javascript
const { WxCalendar } = require('@lspriv/wx-calendar/interface/calendar');
const { YourPlugin } = require('anywhere');

// WxCalendar.clearPlugins(); 执行这一行会清除这个页面之前设置的插件，无奈之举

WxCalendar.use(YourPlugin, options); // options 插件选项

// 或 WxCalendar.use([YourPlugin]); 这种适合多个无配置选项的

Component({
    ...
})
```

#### 插件开发
自定义插件需要实现Plugin接口
```typescript
class MyPlugin implements Plugin {
    /** 需要定义插件的key，必填 */
    static KEY: 'my-plugin' as const;

    constructor(options, calendarInstance) {
        // options 你的插件选项
        // calendarInstance 日历组件实例
    }

    /** 捕获日期，（周/月面板），可选择实现该方法  */
    public trackDate(date: CalendarDay): TrackDateResult {
        // do something...
        return {
            // 设置日程数组，可选
            schedule: [{ text: '', color: '', bgColor: '' }],
            // 设置角标，可选
            corner: { text: '', color: '' },
            // 设置节假日，可选
            festival: { text: '', color: '' }
        }
    }

    /** 捕获年，（年度面板），可选择实现该方法 */
    public trackYear(year: WxCalendarYear): TrackYearResult {
        // do something...
        return {
            // 设置年份描述信息，可选
            subinfo: '',
            // 设置角标，可选
            marks: new Map([
                ['2023-10-1', new Set(['rest'])], // 休息日，置灰
                ['2023-10-7', new Set(['work'])], // 工作日，高亮
                ['2023-10-9', new Set(['#F56C6C'])] // 自定义颜色下标
            ])
        }
    }

    /** 挂载插件数据，可选择实现该方法 */
    public pluginData(date: CalendarDay): any {
        // 返回数据将作为插件数据挂载到日期
        return {};
    }
}
```
> 有需要更多接口的可以提issue

#### 插件说明
组件使用多个插件，后引入（use）的先执行，并且每个日期角标和节假日只有一个地方可用，所以先执行的插件捕获该日期有返回角标或节假日数据，则不再使用后续插件的角标和节假日数据，日程则是合并所有插件的日程数据
#### 插件画饼
有计划做的插件
>     1. ICS日历订阅插件
>     2. 日历快照插件，生成周月和年面板的卡片以及分享卡片
>     3. Locale本地化插件？

### 说明

#### mark说明

>     year,month,day 年月日
>     type = [holiday|corner|schedule] 节假日|角标｜日程 
>     text 为标记内容
>     color 为字体颜色
>     bgColor 为背景颜色

> 角标最好一个字符长度，只对一个字符调整了位置，多出的请自行调整位置

#### 农历说明
 
>     实用于公历 1901 年至 2100 年之间的 200 年 
>     参考了eleworld.com上的算法，并修正了5处节气错误
> 
>     * 2014年3月5日 惊蛰
>     * 2051年3月21日 春分
>     * 2083年2月4日 立春
>     * 2084年3月20日 春分
>     * 2094年6月6日 芒种

### 关于

>     有任何问题或是需求请到 `Issues` 面板提交
>     忙的时候还请见谅
>     有兴趣开发维护的小伙伴加微信

![wx_qr](https://chat.qilianyun.net/static/git/calendar/wx.png)
 