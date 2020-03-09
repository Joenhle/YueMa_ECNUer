// miniprogram/pages/RunningPage/MainRun/MainRun.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    gridCol: 3,
    skin: false,
    
    
    userinfo: '',
    openid: '',
    run_time: '',
    gender_require: 0,
    gender: ["不限", "男", "女"],
    num_of_people: 0,
    demandPosts:[ ],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function(res) {
        that.setData({
          openid: res.data
        })
      },
    })
    wx.getStorage({
      key: 'userinfo',
      success: function(res) {
        that.setData({
          userinfo: res.data
        })
      },
    })
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间
    const db = wx.cloud.database()
    db.collection('DemandPosts').orderBy('run_time','asc').get({
      success: function (res) {
      
        var vardemandposts = res.data
        for (let i = vardemandposts.length - 1; i >= 0; i--) {
          if (realtime > vardemandposts[i].run_time){      //此时之前的贴子不展示
            vardemandposts.splice(i, 1);
          }          
          else if (vardemandposts[i].max_num == vardemandposts[i].num_of_people)
            vardemandposts.splice(i, 1);   //人数已满的帖子不展示
        }
        that.setData({
          demandPosts: vardemandposts
        })
        console.log('MainRun帖子2', that.data.demandPosts)
      }
    })
    
  },


  TodiscoverDemand: function (options) {
    wx.redirectTo({
      url: '../discoverDemand/discoverDemand',
    })
  },
  TorankingList: function (options) {
    wx.redirectTo({
      url: '../rankingList/rankingList',
    })
  },
  TocreateDemand: function (options) {
    wx.navigateTo({
      url: '../createDemand/createDemand',
    })
  },
  TorunMap: function (options) {
    wx.redirectTo({
      url: '../runMap/runMap',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})