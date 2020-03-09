var app = getApp()
Page({
  data: {
    userInfo: {}
  },

  //打印机
  printer: function () {
    wx.navigateTo({
      url: '../more_printer/more_printer'
    })
  },

  //二手物品
  usedobject: function () {
    wx.navigateTo({
      url: '../more_usedobject/more_usedobject'
    })
  },
  
  //疑惑解答
  question: function () {
    wx.navigateTo({
      url: '../more_question/more_question'
    })
  },

  //运动市场
   market: function () {
    wx.navigateTo({
      url: '../more_market/more_market'
    })
  },

  //拼单奶茶
  buytogether: function () {
    wx.navigateTo({
      url: '../more_buytogether/more_buytogether'
    })
  },

  onLoad: function () {
    console.log('onLoad')
    //调用应用实例的方法获取全局数据
    /*app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
      wx.setStorageSync('userInfo', userInfo),
        console.log(userInfo)

    })*/
    this.setData({
      userInfo:wx.getStorageSync('userInfo'),
    })
    console.log('获取到的userInfo信息为' + this.data.userInfo.nickName)
  }
  })