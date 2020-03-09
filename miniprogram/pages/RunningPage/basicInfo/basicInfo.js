// miniprogram/pages/RunningPage/basicInfo/basicInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     info_id: '',
     poster_info: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var poster_openid = options.poster_openid
    var info_id = ''
    var poster_info = {}
    const db = wx.cloud.database()
    db.collection('userInfo').get({
      success: function (res) {
        console.log('所有人信息', res.data);
        var haveuser = 0;
        for (let i = 0; i < res.data.length; i++) {
          if (poster_openid == res.data[i]._openid) {
            that.setData({
              info_id: res.data[i]._id,
              poster_info: res.data[i],
            })
            info_id = res.data[i]._id
            poster_info = res.data[i]
            console.log('发布需求的人的信息', poster_info);
            haveuser = 1
            break;
          }
        }
        if (haveuser == 0) {
          wx.showToast({
            icon: 'none',
            title: '未找到用户信息'
          })
        }
      
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '访问数据库失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
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