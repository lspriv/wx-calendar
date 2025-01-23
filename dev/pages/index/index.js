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
      { year: 2024, month: 11, day: 19, type: 'festival', text: '国庆节', style: { color: '#409EFF' } },
      {
        year: 2024,
        month: 11,
        day: 19,
        type: 'corner',
        text: '休',
        style: { color: '#409EFF' }
      },
      {
        year: 2025,
        month: 1,
        day: 25,
        type: 'schedule',
        text: '呵呵',
        style: { color: '#409EFF' }
      }
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
