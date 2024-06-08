# Changelog

## [1.7.0](https://github.com/lspriv/wx-calendar/compare/v1.6.2...v1.7.0) (2024-06-08)


### Features

* 1. 新增日期样式标记 ([bc0f57e](https://github.com/lspriv/wx-calendar/commit/bc0f57e21f2ce0e303cc7705e2dd791392e3cd86))
* 新增年度面板日期渲染样式mark ([ba0ffcb](https://github.com/lspriv/wx-calendar/commit/ba0ffcb429b9ce2f5e9a11ea68876d4634339529))
* 新增手势控制属性viewGesture,移除固定视图 ([0a5cd45](https://github.com/lspriv/wx-calendar/commit/0a5cd451d3db0558b5f6bd3f5d54cd9d0d97dfe5))
* 新增自定义布局区域属性[areas] ([0b3f2ad](https://github.com/lspriv/wx-calendar/commit/0b3f2adbab8846918589273e72ef95ccb66e1189))
* 新增触发器和拦截器 ([d69a327](https://github.com/lspriv/wx-calendar/commit/d69a327db060fdf42f79d31ba17a38d5390b849d))


### Bug Fixes

* 修复固定视图下切换视图出现的bug ([bdc2c54](https://github.com/lspriv/wx-calendar/commit/bdc2c5445d76d34fb92befab83301fdeac6a79c0))
* 修复年面板subinfo的key值 ([63923bf](https://github.com/lspriv/wx-calendar/commit/63923bf0de6ce07312623a3f4e4d986c640ca7c8))
* 调整TrackYearResult字段subinfo的数据结构 ([6a8cbf3](https://github.com/lspriv/wx-calendar/commit/6a8cbf3e1ac457f6fb9321df77dce6c585170394))

## [1.6.2](https://github.com/lspriv/wx-calendar/compare/v1.6.1...v1.6.2) (2024-06-03)


### Bug Fixes

* change事件返回月份范围信息[range] ([96bc506](https://github.com/lspriv/wx-calendar/commit/96bc506782dfbc74267cbd6e8a5340095aafacc3))
* **webview:** 修复部分安卓设备月/周视图滑动bug ([2491fe3](https://github.com/lspriv/wx-calendar/commit/2491fe3baa6a8db3581ab0fa750b61273d41c69c))
* 寄存css变量以供查询 ([f0eccc1](https://github.com/lspriv/wx-calendar/commit/f0eccc1d9a0bf2832697086a22dde90b2f33a190))
* 调整日程为居中 ([d7b3ea6](https://github.com/lspriv/wx-calendar/commit/d7b3ea62b12b10097bdeabd95d23bf8cfe7aa5d2))
* 调整有日程日期上方圆点的样式 ([c376cb5](https://github.com/lspriv/wx-calendar/commit/c376cb5a4e9b98cefb46970a17933c218fb04052))
* 调整设备像素比变量 ([a13f578](https://github.com/lspriv/wx-calendar/commit/a13f578b48cd3fccc26ddc60d8b23f8f6c475df6))

## [1.6.1](https://github.com/lspriv/wx-calendar/compare/v1.6.0...v1.6.1) (2024-02-25)


### Bug Fixes

* wcScheduleInfo类型补充 ([8204953](https://github.com/lspriv/wx-calendar/commit/82049531d386edc1d4545775e5a62f3b413a72b0))
* **webview:** 解决日程视图到年面板再到月试图后日程漏出的问题 ([bed9ea0](https://github.com/lspriv/wx-calendar/commit/bed9ea01836c23fc9cb38a15e23b5abbab2c5166))
* 修复mark删除时的bug ([5cc7b9b](https://github.com/lspriv/wx-calendar/commit/5cc7b9b33604a45528ce4a0f2a06d992706ab42f))
* 修复年度面板删除mark是的问题 ([d23b5bc](https://github.com/lspriv/wx-calendar/commit/d23b5bcc138cbfa0cec991c9a8b45378a1c72052))
* 修复日程点击 ([6c4b6e2](https://github.com/lspriv/wx-calendar/commit/6c4b6e251077f3d5726f22816119ac0ccce326e1))
* 修复深色模式 ([5f41c26](https://github.com/lspriv/wx-calendar/commit/5f41c26da1aa2a45c3563d17d242fbe356ead54b))
* 修复深色模式未开启时的处理 ([b2478ce](https://github.com/lspriv/wx-calendar/commit/b2478cecf38b160fc6f6dfb9ce0d7ec1c67de196))
* 导出Layout ([da329d6](https://github.com/lspriv/wx-calendar/commit/da329d63897478327c215d25ac4f872a1609c96a))
* 导出小程序相关工具类型 ([2086de8](https://github.com/lspriv/wx-calendar/commit/2086de8cf80fd589b87305781271649a4c37ccd0))
* 导出常量 ([9f04953](https://github.com/lspriv/wx-calendar/commit/9f049534f3cd79d9429dd78b6775c3376d288ef2))
* 调整插件方法PLUGIN_TRACK_SCHEDULE参数 ([a898fd1](https://github.com/lspriv/wx-calendar/commit/a898fd11150054201294798a09d5cd59e494ee0c))
* 调整日程显示 ([29b21f7](https://github.com/lspriv/wx-calendar/commit/29b21f7bcdd0d49e7f8d8051177a09838240a2fd))

## [1.6.0](https://github.com/lspriv/wx-calendar/compare/v1.5.6...v1.6.0) (2024-02-20)


### Features

* 新增click事件 ([ecdd8f3](https://github.com/lspriv/wx-calendar/commit/ecdd8f316fb8b25107c786b94a80ae3a3ab54297))


### Bug Fixes

* **webview:** 调整拖拽动画 ([5213468](https://github.com/lspriv/wx-calendar/commit/521346841541bdce79428635ef25a8bb4ff99c31))
* **webview:** 调整拖拽动画 ([c1e4b0a](https://github.com/lspriv/wx-calendar/commit/c1e4b0ae9a4361d7a9ce668345b336dd2571e6c2))
* 移除插件PLUGIN_DATA接口 ([a364002](https://github.com/lspriv/wx-calendar/commit/a364002c03644dce1110f87ea0cd9de3e6e80227))
* 调整service.updateAnnuals方法,调整工具mergeAnnualMarks方法 ([7354b14](https://github.com/lspriv/wx-calendar/commit/7354b14d8203999ad3a431b5e742d23c3beaf4e2))
* 调整属性_loaded_赋值时机 ([2d62bd9](https://github.com/lspriv/wx-calendar/commit/2d62bd91091c8cb2744f5e150249083bb02e50e0))
* 调整年度面板开启动画时机 ([c1ee643](https://github.com/lspriv/wx-calendar/commit/c1ee643f2592b588b01cb2d8743434d41883a4b8))
* 调整年面板标记结构,service新增updateAnnuals方法 ([621df33](https://github.com/lspriv/wx-calendar/commit/621df337499cd6d6d3820982555790e7c688d353))

## [1.5.6](https://github.com/lspriv/wx-calendar/compare/v1.5.5...v1.5.6) (2024-02-08)


### Bug Fixes

* 调整包结构 ([dea564b](https://github.com/lspriv/wx-calendar/commit/dea564bdb8ab380595051173a37efb9016e7747f))

## [1.5.5](https://github.com/lspriv/wx-calendar/compare/v1.5.4...v1.5.5) (2024-02-06)


### Bug Fixes

* 调整选中日期样式一致 ([95d6287](https://github.com/lspriv/wx-calendar/commit/95d6287c5e1d252a6ae2b5856a25ddd8e8855007)), closes [#89](https://github.com/lspriv/wx-calendar/issues/89)

## [1.5.4](https://github.com/lspriv/wx-calendar/compare/v1.5.3...v1.5.4) (2024-02-04)


### Bug Fixes

* 放开组件宽度限制,解决自定义宽度下出现的问题 ([f59fa12](https://github.com/lspriv/wx-calendar/commit/f59fa122b33e05411a95b8b42dc73998060038ee)), closes [#88](https://github.com/lspriv/wx-calendar/issues/88)

## [1.5.3](https://github.com/lspriv/wx-calendar/compare/v1.5.2...v1.5.3) (2024-01-30)


### Bug Fixes

* 调整非自定义导航栏页面下的年面板动画垂直方向平移 ([0467ec6](https://github.com/lspriv/wx-calendar/commit/0467ec61ca2e810616e38b8b7092c8b8a1fa36d4))

## [1.5.2](https://github.com/lspriv/wx-calendar/compare/v1.5.1...v1.5.2) (2024-01-20)


### Bug Fixes

* **webview:** 修复页面滚动后的年度面板月份选择计算出错 ([cf9df64](https://github.com/lspriv/wx-calendar/commit/cf9df64262426ab853bd1fd6daf42b7a9cdb4425)), closes [#79](https://github.com/lspriv/wx-calendar/issues/79)

## [1.5.1](https://github.com/lspriv/wx-calendar/compare/v1.5.0...v1.5.1) (2024-01-14)


### Bug Fixes

* **webview:** 调整拖拽 ([6233c79](https://github.com/lspriv/wx-calendar/commit/6233c79a2588ad5337c35aa7469b1b3d1186564b))
* 修正getPlugin方法参数 ([72b770d](https://github.com/lspriv/wx-calendar/commit/72b770d56667dd67f1bf1ccc23f64978afd6fe3b))
* 修正WxCalendar.clearPlugin方法参数类型 ([3bdf3cd](https://github.com/lspriv/wx-calendar/commit/3bdf3cd3cb02d7b65b58292cbb11294d47af6bd0))
* 调整年度面板月标题透明度 ([0fe2ee0](https://github.com/lspriv/wx-calendar/commit/0fe2ee0454f7db2af8e4b6cf131d29164a9c6acd))
* 调整日期信息变动 ([bc70fc5](https://github.com/lspriv/wx-calendar/commit/bc70fc508c36c52abb8c1f4dd61827847c9a6b1b))
* 调整类型UsePluginService ([6762a3a](https://github.com/lspriv/wx-calendar/commit/6762a3a460f7ba1d37d67704e176d9e239e3c987))

## [1.5.0](https://github.com/lspriv/wx-calendar/compare/v1.4.0...v1.5.0) (2024-01-13)


### Features

* wxCalendar方法clearPlugins新增过滤器参数 ([1ab0845](https://github.com/lspriv/wx-calendar/commit/1ab084510b325e9986c66d817d7a45680229e4bc))
* wxCalendar移除插件方法clearPlugin新增插件key过滤参数 ([6e3d913](https://github.com/lspriv/wx-calendar/commit/6e3d913a864d3d4a2470759690ede1841b37a1e5))
* 插件新增日历销毁处理方法PLUGIN_ON_DETACHED ([0587289](https://github.com/lspriv/wx-calendar/commit/058728939fc404809368ef5161d05deea5ea6ede))
* 新增工具类型UsePluginService ([204e2aa](https://github.com/lspriv/wx-calendar/commit/204e2aa79e0ebd0151d3f3d9a6497be26f628fe9))


### Bug Fixes

* **skyline:** 调整拖拽动画 ([e4b369d](https://github.com/lspriv/wx-calendar/commit/e4b369df5e08e52c73d58a6af916db32e0cedad2))
* **webview:** 调整动画曲线 ([62a918c](https://github.com/lspriv/wx-calendar/commit/62a918c87136db092dfdafcff519f12de009f01b))
* 对 mark 年月日数据处理 ([ec22197](https://github.com/lspriv/wx-calendar/commit/ec2219797acbfda54d3b9633c4f9ea07670ced3f))
* 调整年度面板渲染 ([11ed90f](https://github.com/lspriv/wx-calendar/commit/11ed90f51c09f5d0b15e36a9e278a32534a7daa3))

## [1.4.0](https://github.com/lspriv/wx-calendar/compare/v1.3.0...v1.4.0) (2024-01-11)


### Features

* **webview:** 拖拽新增入角控制 ([a755c69](https://github.com/lspriv/wx-calendar/commit/a755c69f82b049cdacd6af5d5a491e9111a7412d))
* 插件新增PLUGIN_ON_LOAD,PLUGIN_ON_CHANGE和PLUGIN_ON_VIEW_CHANGE三个事件处理接口 ([9551967](https://github.com/lspriv/wx-calendar/commit/95519676a20469bff0a3593caead0f7add6dbaaf))


### Bug Fixes

* **webview:** 调整拖拽动画 ([6e898f0](https://github.com/lspriv/wx-calendar/commit/6e898f0f8f096fcf12647b146c72fdbb9f6ec5ef))

## [1.3.0](https://github.com/lspriv/wx-calendar/compare/v1.2.0...v1.3.0) (2024-01-07)


### Features

* 插件新增PLUGIN_INITIALIZE方法 ([65d0b16](https://github.com/lspriv/wx-calendar/commit/65d0b163f823a850e1884d35dbc0245296644800))
* 新增导出农历插件的PLUGIN_KEY ([bbabd58](https://github.com/lspriv/wx-calendar/commit/bbabd58e3c07beb128ba24fe7a9cb6f18ade0ae3))
* 新增组件导出方法getMarks,获取完整的日期标记 ([d89b375](https://github.com/lspriv/wx-calendar/commit/d89b3759b0f4022c35bcb8e1d240a8e0266aad13))


### Bug Fixes

* **skyline:** 解决viewFixed遗漏 ([b498c78](https://github.com/lspriv/wx-calendar/commit/b498c783d25d6217e3df8f5fe459005ff5b517a4))
* **skyline:** 调整年度面板初始位置变量 ([fdf8361](https://github.com/lspriv/wx-calendar/commit/fdf8361847660112c63324284e4679429a346ea2))

## [1.2.0](https://github.com/lspriv/wx-calendar/compare/v1.1.0...v1.2.0) (2024-01-06)


### Features

* lunar插件新增获取农历信息方法 ([11cc4d2](https://github.com/lspriv/wx-calendar/commit/11cc4d2f9c90b2a535c723383ff049792a63cabb))

## [1.1.0](https://github.com/lspriv/wx-calendar/compare/v1.0.0...v1.1.0) (2024-01-05)


### Features

* 新增固定视图选择 ([191cd35](https://github.com/lspriv/wx-calendar/commit/191cd358c2e46ee30f3663fca6f29273ee3970ff)), closes [#38](https://github.com/lspriv/wx-calendar/issues/38)


### Bug Fixes

* **skyline:** 调整拖拽动画绑定的时机 ([cfe3854](https://github.com/lspriv/wx-calendar/commit/cfe3854fa9288ae2c87500942f2b5622d6bcca21))
* 调整面板数据weeks的值 ([7614eb3](https://github.com/lspriv/wx-calendar/commit/7614eb3808eded2dcd9a1ed85dfbec19a2c0d10d))

## 1.0.0 (2023-12-26)


### Bug Fixes

* 适配日程数量 ([bf4194b](https://github.com/lspriv/wx-calendar/commit/bf4194b1c832060bbd3b62e75676a0738804fb70))
* **skyline:** 解决安卓skyline渲染下swiper滑动误差问题 ([51e979b](https://github.com/lspriv/wx-calendar/commit/51e979ba9c4a0282768586efb9fc1a50cf1b54c8))
