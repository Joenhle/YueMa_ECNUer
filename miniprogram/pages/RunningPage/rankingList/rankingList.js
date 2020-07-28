// pages/leftSwiperDel/index.js
const db = wx.cloud.database();//连接数据库
Page({
  data: {
    listData: [],//获取数据库的数组.''是字符串。{}是字符串的集合,[]是字符串的集合的集合
    navbar: ['一诺千金榜', '运动达人榜'],//导航栏
    currentTab: 0,//当前tab页面
  },
  //切换bar
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    console.log(this.data.currentTab)
    this.onLoad()
  },
  onLoad: function (options) {
    if (this.data.currentTab == 0) this.score_get() //如果刚进这个页面则默认刷新一诺千金榜
    else this.exercise_get() //如果点运动达人榜则需要重新得到数据库信息
  },
  //当用户点了积分的图片时触发操作
  score_get: function () {
    db.collection("mine").orderBy('score', 'desc').get({  //从数据库获取数据
      success: res => {
        console.log(res.data)
        this.setData({
          listData: res.data,
        })
      },
      fail: err => {
        wx.showModal({
          title: '获取数据库失败',
          showCancel: false
        })
        console.error('获取数据库失败：', err)
      }
    })
    //延迟1秒后显现，显示一诺千金榜加载完毕
    var that = this
    setTimeout(function () {
      console.log("获取一诺千金第一人物名称为" + that.data.listData[0].id)
      wx.showToast({
        title: '一诺千金榜加载完毕',
        icon: 'success',
      })
    }, 1000)
  },
  //如果点运动达人榜则需要重新得到数据库信息
  exercise_get: function () {
    db.collection("mine").orderBy('exercise', 'desc').get({ //从数据库获取数据
      success: res => {
        console.log(res.data)
        this.setData({
          listData: res.data,
        })
      },
      fail: err => {
        wx.showModal({
          title: '获取数据库失败',
          showCancel: false
        })
        console.error('获取数据库失败：', err)
      }
    })
    var that = this
    setTimeout(function () {  //延迟1秒后显现，显示运动达人榜榜加载完毕
      console.log('运动达人第一姓名为', that.data.listData[0].id)
      wx.showToast({
        title: '运动达人榜加载完毕',
        icon: 'success',
      })
    }, 1000)
  },
})