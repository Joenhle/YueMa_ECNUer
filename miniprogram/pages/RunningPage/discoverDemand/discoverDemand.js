// miniprogram/pages/RunningPage/discoverDemand/discoverDemand.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender: ["不限", "男", "女","男女搭配"],
    duration: ["半小时左右", "1小时内", '2小时内', '3小时内','4小时内','5小时内','不限'],
    CustomBar: app.globalData.CustomBar,
    checkbox: [{
      value: 0,
      name: '较慢',
      checked: false,
      hot: false,
    }, {
      value: 1,
      name: '慢',
      checked: true,
      hot: false,
    }, {
      value: 2,
      name: '中等',
      checked: true,
      hot: true,
    }, {
      value: 3,
      name: '快',
      checked: false,
      hot: false,
    }, {
      value: 4,
      name: '很快',
      checked: false,
      hot: false,
    }, {
      value: 5,
      name: '不限',
      checked: false,
      hot: false,
    }]
  },
  
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  ChooseCheckbox(e) {
    let items = this.data.checkbox;
    let values = e.currentTarget.dataset.value;
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].value == values) {
        items[i].checked = !items[i].checked;
        break
      }
    }
    this.setData({
      checkbox: items
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})