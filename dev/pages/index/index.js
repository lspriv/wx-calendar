/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-11-25 22:22:23
 */
Page({
  data: {
    padding: 0,
    markers: [
      // { 
      //   year: 2026, 
      //   month: 1, 
      //   day: 6, 
      //   type: 'style', 
      //   style: { 
      //     backgroundImage: 'radial-gradient(circle at center, #409EFF 50%, transparent 50%)',
      //     backgroundSize: '40rpx 40rpx',
      //     backgroundRepeat: 'no-repeat',
      //     backgroundPosition: 'center calc(100% + 40rpx)'
      //   } 
      // },
    ]
  },
  onLoad() {
    const { bottom } = wx.getMenuButtonBoundingClientRect();
    this.setData({
      padding: bottom
    });
  },
  handleLoad() {
    const calendar = this.selectComponent('#calendar');
    console.log('calendar-load', calendar);
  },
  handleClick({ detail }) {
    console.log('calendar-date-click', detail);
  },
  handleChange({ detail }) {
    console.log('calendar-date-change', detail);
  },
  handleViewChange({ detail }) {
    console.log('calendar-view-change', detail);
  }
});
