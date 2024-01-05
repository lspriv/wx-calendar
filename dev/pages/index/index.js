/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-01-06 02:29:02
 */
Page({
  data: {
    padding: 0,
    markers: [
      { year: 2023, month: 10, day: 1, type: 'festival', text: '国庆节', color: '#409EFF' },
      { year: 2023, month: 10, day: 1, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 2, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 3, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 4, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 5, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 6, type: 'corner', text: '休', color: '#61b057' },
      { year: 2023, month: 10, day: 7, type: 'corner', text: '班', color: '#f37b1d' },
      { year: 2023, month: 10, day: 8, type: 'corner', text: '班', color: '#f37b1d' },
      { year: 2023, month: 10, day: 18, type: 'schedule', text: '今天是个好日子' },
      { year: 2023, month: 10, day: 31, type: 'festival', text: '万圣夜', color: '#409EFF' }
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
  handleChange({ detail }) {
    console.log('calendar-date-change', detail);
  },
  handleViewChange({ detail }) {
    console.log('calendar-view-change', detail);
  }
});
