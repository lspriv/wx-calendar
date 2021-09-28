## WX Calendar 2.0

>

借鉴了`MIUI 12`日历的部分设计，制作适合微信小程序的日历

>     · 周月视图切换
>     · 日期标记
>     · 农历信息

> [wx-calendar2.0已发布，欢迎到issues面板提出建议和BUG](https://github.com/lspriv/wx-calendar/issues/new?assignees=&labels=&template=bug_report.md&title=)

### 预览

![demo_img](https://chat.qilianyun.net/static/git/calendar/demo.jpg)



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
npm run dev
```

目录结构：  
```
├─dev（直接用微信开发工具打开此目录，用其它工具编辑代码可响应变化）
├─dist（组件代码生成目录）
├─gulpfile.js（gulp配置）
├─test（测试）
├─src（主要开发目录）
│   ├─plugins
│   │  └─lunar.js（农历）
│   ├─utils
│   │  ├─handler.js（日期处理）
│   │  ├─service.js（服务注册）
│   │  ├─tools.js（工具方法）
│   │  └─device.js（设备布局） 
│   ├─styles
│   │     ├─theme.scss（主题色和字体）
│   │     ├─mixin.scss（混入）
│   │     ├─functions.scss（公共方法）
│   │     ├─animation.scss（动画）
│   │     ├─container.scss（基本样式）
│   │     ├─topinfo.scss（标题和视图控制样式）
│   │     ├─panel.scss（星期和月面板样式）
│   │     ├─bar.scss（底部控制条样式）
│   │     ├─year.scss（年面板样式）
│   │     └─darkmode.scss（深色模式）
|   ├─index.js
|   ├─index.wxml
|   ├─index.scss
|   ├─index.json
|   └─index.wxs
├─.babelrc（babel配置）
└─package.json（项目配置）
```
对src/styles/theme.scss定义的变量修改可满足基本的样式修改

测试目录test没有完成，因为我发现用微信开发工具导入dev目录，用其他开发工具编辑代码效果很好

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
        <th>默认值</th>
        <th>版本</th>
    </tr>
    <tr>
        <td>view</td>
        <td>String</td>
        <td>初始化为月视图或周视图</td>
        <td>month [week]</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td><s>_position</s></td>
        <td>String</td>
        <td>定位</td>
        <td>relative [absolute, fixed]</td>
        <td>1.0</td>
    </tr>
    <tr>
        <td><s>_top</s></td>
        <td>String | Number</td>
        <td>绝对定位有效</td>
        <td>--</td>
        <td>1.0</td>
    </tr>
    <tr>
        <td>_markers</td>
        <td>Array</td>
        <td>日期标记</td>
        <td>--</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td><s>_markerKey</s></td>
        <td>String</td>
        <td>标记标识字段，用于筛选</td>
        <td>id</td>
        <td>1.0</td>
    </tr>
    <tr>
        <td>_vibrate</td>
        <td>Boolean</td>
        <td>点选日期是否震动</td>
        <td>true</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td>darkmode</td>
        <td>Boolean</td>
        <td>黑暗模式</td>
        <td>false</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td>_date</td>
        <td>String|Number|Array|Object</td>
        <td>选择初始日期</td>
        <td>xxxx-xx-xx | timestamp | [xxxx, xx, xx] | { year, month, day }</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td>checkedShow</td>
        <td>Boolean</td>
        <td>选中状态显示</td>
        <td>true</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td>_startWeek</td>
        <td>Number</td>
        <td>一周开始日</td>
        <td>0 | 1 | 2 | 3 | 4 | 5 | 6</td>
        <td>2.0</td>
    </tr>
    <tr>
        <td>showLunar</td>
        <td>Boolean</td>
        <td>显示农历</td>
        <td>true</td>
        <td>2.0</td>
    </tr>
   <tr>
        <td>showMark</td>
        <td>Boolean</td>
        <td>显示标记</td>
        <td>true</td>
        <td>2.0</td>
    </tr>
</table>

> 关于 [_markers](#说明)
> 
> 版本号显示2.0的属性时wx-calendar2.0新增或延续的属性，版本号显示1.0的属性在2.0中已废弃

### Events 事件

[**`bindload`**](#bindload)  日历加载完成
>     e.detail = { date, range, visual, view } 
>     # date为当前选择日期
>     # range: 当前swiper日期范围
>     # visual: 可视区域日期范围
>     # visualMonth: 当前月
>     # view: 当前面板视图，月/周


[**`binddatechange`**](#binddatechange)  日期选择变化
>     e.detail = { date, range, visual, view, visualMonth, rangeChange } 
>     # date为当前选择日期
>     # range: 当前swiper日期范围
>     # visual: 可视区域日期范围
>     # visualMonth: 当前月
>     # view: 当前面板视图，月/周
>     # rangeChange: 日期范围是否变化


<s>bindrangechange  日期范围变化</s>，2.0已废弃
>     e.detail = { curr, range, view, visual, markerCommit } 
>     # curr: 当前选择日期
>     # range: 当前swiper日期范围
>     # visual: 可视区域日期范围
>     # view: 当前面板视图，月/周
>     # markerCommit(markers): 提交日期标记的方法，参数markers和属性_markers一致

[**`bindviewchange`**](#bindviewchange)   面板视图变化
>     e.detail = { view } 
>     # view: 当前面板视图，月/周

> bindrangechange事件已于2.0版本中废弃，考虑到日期范围变化是日期选择变化的充分条件，继续注册这个事件没有多大意义，其核心字段range,visual已移到binddatechange事件中，注意日期范围变化非日期选择变化的必要条件，请对range前后比较后判断日期范围是否变化
   
### Slots 插槽

<table>
    <tr>
        <th>名称</th>
        <th>说明</th>
    </tr>
    <tr>
        <td>—</td>
        <td>试一下就知道了，没啥可说的</td>
    </tr>
</table>

### Methods 方法

[**`toDate`**](#toDate)  void 跳转到日期
>     function(date|year, [month], [day])
>     # 接受1个或3个参数
>     # 只有1个参数时，可以为[Date|String]类型，当为String时形如 2021-4-10
>     # 3个参数时，则为具体的 年,月,日

[**`toMonth`**](#toMonth) void 跳转到月份
>     function(year, month)
>     # 参数为 年,月

[**`prev`**](#prev) void 向前一个月

[**`next`**](#next) void 向后一个月

[**`toggleView`**](#toggleView) void 切换面板视图
>     function(view)
>     # 参数 view 为切换至 月month|周week
 
[**`getDateInfo`**](#getDateInfo) object 获取某个日期的信息
>     function(date|year, [month], [day])
>     # 参数同 toDate

<s>setMarkers void 设置日期标记</s>，2.0已废弃
>     function(markers)
>     # 参数 markers 同属性 _markers

<s>addMarker void 新增日期标记</s>，2.0已废弃
>     function(marker)
>     # 参数 marker = { year, month, day, type, mark, color, bgColor }

<s>editMarker void 修改日期标记</s>，2.0已废弃
>     function(marker)
>     # 参数 marker = { [_markerKey], year, month, day, type, mark, color, bgColor }
>     # [_markerKey] 标记标识字段，可以由属性_markerKey定义，默认为id

<s>delMarker void 删除日期标记</s>，2.0已废弃
>     function(date, type, key)
>     # 参数 date = { year, month, day } 某个日期 
>     # 参数 type = [holiday|corner|schedule] 当type为空时，会删除掉date下的所有类型标记
>     # 参数 key 为标记标识字段的值，当key为空时，会删除掉date下的所有type类型的标记
> 关于 [marker.type](#marker说明)

<s>reloadMarkers void 重新加载所有日期标记</s>，2.0已废弃

[**`reloadPos`**](#reloadPos) Promise 重新计算calendar和选中状态的位置

> 关于日期标记的5个方法setMarkers，addMarker，editMarker，delMarker和reloadMarkers在2.0版本中已全部废弃，主要是因为对属性_markers加了监听器，如下

### 监听器

[**`_markers`**](#_markers)
>     2.0版本对属性_markers添加了监听器，
>     只需对传入的_makers进行更改，calendar即可相应变化，
>     注意，请在bindload事件之后对传入的_makers进行变动，
>     在日历加载期间，会略过_markers变动，不响应变化
>     当然，赋初始值不受任何影响

### 说明

涉及到`日期标记`无论是标记数组还是单个标记，都是形如以下：
>      marker = { year, month, day, type, mark, color, bgColor }
>      markers = [{ year, month, day, type, mark, color, bgColor }]

#### marker说明

>     year,month,day 年月日
>     type = [holiday|corner|schedule] 节假日|角标｜日程 
>     mark 为标记内容
>     color 为字体颜色
>     bgColor 为背景颜色

> 节假日会截取 `mark` 头两个字符，长度最好为2，角标截取 `mark` 头一个字符，长度最好为1

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
 