/*
 * @Description: Description
 * @Author: lishen
 * @Date: 2023-08-31 16:46:44
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-10-27 00:59:33
 */
// index.js
const app = getApp();

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
  onTap() {
    this.setData({
      markers: [
        // { year: 2022, month: 1, day: 10, type: 'holiday', mark: '愚人节', color: '#2a97ff', bgColor: '#cce6ff' },
        { year: 2022, month: 1, day: 11, type: 'corner', mark: '休', color: '#61b057' }
        // {
        //   year: 2022,
        //   month: 1,
        //   day: 12,
        //   type: 'schedule',
        //   mark: '测试一下哈哈哈',
        //   color: '#2a97ff',
        //   bgColor: '#cce6ff'
        // },
        // {
        //   year: 2022,
        //   month: 1,
        //   day: 12,
        //   type: 'schedule',
        //   mark: '测试一下哈哈哈',
        //   color: '#2a97ff',
        //   bgColor: '#cce6ff'
        // }
      ]
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
