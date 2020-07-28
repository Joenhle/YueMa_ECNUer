var app = getApp()
Page({
  data: {
    userInfo: {},
    modalName:'',
  },

  //打印机
  printer: function (e) {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //二手物品
  usedobject: function () {
     //先判断有没有登录
     if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }
    wx.navigateTo({
      url: '../more_usedobject/more_usedobject'
    })
  },
  
  //疑惑解答
  question: function () {
     //先判断有没有登录
     if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }
    wx.navigateTo({
      url: '../more_question/more_question'
    })
  },

  //运动市场
   market: function () {
      //先判断有没有登录
    if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }
    wx.navigateTo({
      url: '../../mine_all/mine_zixun/mine_zixun'
    })
  },

  //拼单奶茶
  buytogether: function () {
     //先判断有没有登录
     if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }
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