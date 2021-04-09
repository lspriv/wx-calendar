## WX Calendar

借鉴了`MIUI 12`日历的部分设计，制作适合微信小程序的日历

>     · 周月视图切换
>     · 日期标记
>     · 农历信息

### 预览
![](assets/16179361913641.jpg)

### 使用

页面json配置：
```json
{
    "usingComponents": {
        "calendar": "/components/wx-calendar/index"
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

### Props 属性

<table>
    <tr>
        <th>属性名</th>
        <th>类型</th>
        <th>说明</th>
        <th>默认值</th>
    </tr>
    <tr>
        <td>view</td>
        <td>String</td>
        <td>初始化为月视图或周视图</td>
        <td>month [week]</td>
    </tr>
    <tr>
        <td>_position</td>
        <td>String</td>
        <td>定位</td>
        <td>relative [absolute, fixed]</td>
    </tr>
    <tr>
        <td>_top</td>
        <td>String | Number</td>
        <td>绝对定位有效</td>
        <td>--</td>
    </tr>
    <tr>
        <td>_markers</td>
        <td>Array</td>
        <td>日期标记</td>
        <td>--</td>
    </tr>
    <tr>
        <td>_markerKey</td>
        <td>String</td>
        <td>标记标识字段，用于筛选</td>
        <td>id</td>
    </tr>
    <tr>
        <td>_vibrate</td>
        <td>Boolean</td>
        <td>点选日期是否震动</td>
        <td>true</td>
    </tr>
</table>

### Events 事件

[**`bindload`**](#)  日历加载完成
>     e.detail = { date } 
>     # date为当前选择日期


[**`binddatechange`**](#)  日期选择变化
>     e.detail = { date } 
>     # date为当前选择日期

[**`bindrangechange`**](#)  日期范围变化
>     e.detail = { curr, range, view, visual, markerCommit } 
>     # curr: 当前选择日期
>     # range: 当前swiper日期范围
>     # visual: 可视区域日期范围
>     # view: 当前面板视图，月/周
>     # markerCommit(markers): 提交日期标记的方法，参数markers和属性_markers一致

[**`bindviewchange`**](#)   面板视图变化
>     e.detail = { view } 
>     # view: 当前面板视图，月/周
   
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

[**`toDate`**](#)  跳转到日期
>     function(date|year, month, day)
>     # 接受1个或3个参数
>     # 只有1个参数时，可以为Date|String类型，当为String时形如 2021-4-10
>     # 3个参数时，则为具体的 年,月,日

[**`toMonth`**](#)  跳转到月份
>     function(year, month)
>     # 参数为 年,月

[**`prev`**](#)  向前一个月

[**`next`**](#)  向后一个月

[**`toggleView`**](#)  切换面板视图
>     function(view)
>     # 参数 view 为切换至 月month|周week
 
[**`getDateInfo`**](#)  获取某个日期的信息
>     function(date|year, month, day)
>     # 参数同 toDate

[**`setMarkers`**](#)  设置日期标记
>     function(markers)
>     # 参数 markers 同属性 _markers

[**`addMarker`**](#)  设置日期标记
>     function(marker)
>     # 参数 marker = { year, month, day, type, mark, color, bgColor }

[**`editMarker`**](#) 修改日期标记
>     function(marker)
>     # 参数 marker = { [_markerKey], year, month, day, type, mark, color, bgColor }
>     # [_markerKey] 标记标识字段，可以由属性_markerKey定义，默认为id

[**`delMarker`**](#) 删除日期标记
>     function(date, type, key)
>     # 参数 date = { year, month, day } 某个日期 
>     # 参数 type = holiday|corner|schedule 当type为空时，会删除掉date下的所有类型标记（关于标记类型，后面会说明）
>     # 参数 key 为标记标识字段的值，当key为空时，会删除掉date下的所有type类型的标记

[**`reloadMarkers`**](#) 重新加载所有日期标记

### 说明

涉及到`日期标记`无论是标记数组还是单个标记，都是形如以下：
>      marker = { year, month, day, type, mark, color, bgColor }
>      markers = [{ year, month, day, type, mark, color, bgColor }]

#### marker 说明

>     year,month,day 年月日
>     type = [holiday|corner|schedule] 节假日|角标｜日程 
>     mark 为标记内容
>     color 为字体颜色
>     bgColor 为背景颜色

> 节假日会截取 `mark` 头两个字符，长度最好为2，角标截取 `mark` 头一个字符，长度最好为1

### 关于

>    有任何问题或是需求请到 `Issues` 面板提交
>    忙的时候还请见谅
>    有意开发维护的小伙伴加微信

![WechatIMG707](assets/WechatIMG707.jpeg)
 