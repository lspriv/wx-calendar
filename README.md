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
直接复制dist/wx-calendar到你的项目

页面json配置：
```json
{
    "usingComponents": {
        "calendar": "/your-path/wx-calendar/index"
    }
}
```
> 

在页面wxml文件中：
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

### 说明

涉及到`日期标记`无论是标记数组还是单个标记，都是形如以下：
>      marker = { year, month, day, type, mark, color, bgColor }
>      markers = [{ year, month, day, type, mark, color, bgColor }]

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
 