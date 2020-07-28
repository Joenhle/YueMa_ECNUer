// miniprogram/pages/RunningPage/MainRun/MainRun.js
const app = getApp();
const db = wx.cloud.database();
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
    currentPage: 1,
    demandPosts: [],
    has_new_data: false,
    is_first_load: true,

  },
  onTabItemTap:function(e){
    app.globalData.yueqiu_or_yuepao =  e.text
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('判断MainRun里onload的参数', options)
    var that = this;
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        if(res.data='oGuXN4k9UOlvkvRHjfCs6VpYWtTs') 
          that.send() //发送订阅消息
        that.setData({
          openid: res.data
        })
      },
    })
    wx.getStorage({
      key: 'userinfo',
      success: function (res) {
        that.setData({
          userinfo: res.data
        })
      },
    })
    that.myUpdate()
    //实时的进行数据库数据监控,监控跑步帖子
    const watcher = db.collection('DemandPosts').orderBy('run_time', 'asc')
      .watch({
        onChange: function (snapshot) {
          console.log('监听数组变化', snapshot)
          if(that.data.is_first_load){
            that.setData({
              is_first_load: false
            })
          }else{
            that.setData({
              has_new_data: true
            })
          }
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    // ...
    // 等到需要关闭监听的时候调用 close() 方法
    //watcher.close()
    that.deletePosts()
  },

  //跳转到搜索需求页面
  TodiscoverDemand: function (options) {
        //先判断有没有登录
        if(app.globalData.is_denglu==false){
          wx.showModal({
            title: '提示',
            content: '请先完成登录',
            success (res) {
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
      url: '../discoverDemand/discoverDemand',
    })
  },
  //跳转到跑步排行榜页面
  TorankingList: function (options) {
        //先判断有没有登录
        if(app.globalData.is_denglu==false){
          wx.showModal({
            title: '提示',
            content: '请先完成登录',
            success (res) {
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
      url: '../../rank/rank',
    })
  },
  //跳转到创建需求帖子页面
  TocreateDemand: function (options) {
        //先判断有没有登录
        if(app.globalData.is_denglu==false){
          wx.showModal({
            title: '提示',
            content: '请先完成登录',
            success (res) {
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
      url: '../createDemand/createDemand',
    })
  },
  //跳转到跑步页面
  TorunMap: function (options) {
        //先判断有没有登录
        if(app.globalData.is_denglu==false){
          wx.showModal({
            title: '提示',
            content: '请先完成登录',
            success (res) {
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
      url: '../startRun/startRun',
    })
  },
  //改变当前页面的demandposts，一般被下一页面回调
  ChangePosts: function (options) {
    console.log('根据需求搜索页面更改参数', options)
    this.setData({
      demandPosts: options,
      has_new_data: true,
      currentPage: 1,
    })
  },
  //更新页面函数
  myUpdate: function () {
    console.log('调用MainBall更新页面函数')
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间
    //从云函数获取数据
    db.collection('DemandPosts').orderBy('run_time', 'asc').get({
      success: function (res) {
        var vardemandposts = res.data
        console.log('首次获取到的MainRuns帖子', vardemandposts)
        for (let i = vardemandposts.length - 1; i >= 0; i--) {
          if (realtime > vardemandposts[i].run_time) { //此时之前的贴子不展示
            vardemandposts.splice(i, 1);
          } else if (vardemandposts[i].max_num <= vardemandposts[i].num_of_people)
            vardemandposts.splice(i, 1); //人数已满的帖子不展示
        }
        that.setData({
          demandPosts: vardemandposts,
          has_new_data: false,
          currentPage: 1,
        })
        console.log('小小筛选后的MainRuns帖子', vardemandposts)
      },
      fail: err => {
        console.log('[数据库]demandposts[查询记录]失败：', err)
      }
    })
  },
  //获取数据库DemandPosts里帖子总数
  getListCount: function () {
    return new Promise((resolve, reject) => {
      db.collection('DemandPosts').count().then(res => {
        resolve(res.total);
      }).catch(e => {
        console.log(e)
        reject("查询失败")
      })
    })
  },
  //单次查询获取函数
  getListIndexSkip: function (skip) {
    return new Promise((resolve, reject) => {
      let statusList = []
      let selectPromise;
      if (skip > 0) {
        selectPromise = db.collection('DemandPosts').orderBy('run_time', 'asc').skip(skip).get()
      } else {
        //skip值为0时，会报错
        selectPromise = db.collection('DemandPosts').orderBy('run_time', 'asc').get()
      }
      selectPromise.then(res => {
        resolve(res.data);
      }).catch(e => {
        console.error(e)
        reject("查询失败!")
      })
    })
  },
  /**
   * 加载下一页数据
   */
  loadMoreData: function () {
    var that = this
    var currentPage = that.data.currentPage; // 获取当前页码
    var tips = "加载第" + (currentPage + 1) + "页";
    console.log("load page " + (currentPage+1));
    wx.showLoading({
      title: tips,
    })
    new Promise((resolve, reject) => {
      that.getListCount().then(res => {
        console.log('帖子总数', res)
        let count = res
        let list = that.data.demandPosts
        var skip = currentPage * 20
        if (skip < res) {
          that.getListIndexSkip(skip).then(res => {
              console.log('单次搜索数组', res)
              list = list.concat(res);
              console.log('拼接数组', list)
              if (list.length == count) {
                resolve(list)
              }
            })
            .catch(e => {
              console.error(e)
              reject("整合查询失败")
            })
          currentPage++
          wx.hideLoading();
          setTimeout(function () { //延迟时间 这里是1秒
            console.log('所有数据', list)
            that.setData({
              demandPosts: list,
              currentPage: currentPage
            })
          }, 1000)
        } else {
          wx.showToast({
            title: '没有更多了',
          })
        }
      })
    })
    that.deletePosts()
  },
  //删除过期的帖子
  deletePosts: function() {
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间
    db.collection('DemandPosts').orderBy('finish_time', 'asc').get({
      success:function(res){
          var demandposts = res.data
          console.log('删除时获取到的MainRuns帖子', demandposts)
          for(let i=0;i<demandposts.length;i++){
            if(demandposts[i].finish_time<realtime){
              db.collection('DemandPosts').doc(demandposts[i]._id).remove({
                success: mineres => {
                  console.log('数据库demandposts删除成功', mineres)
                },
                fail: err => {
                  wx.showToast({
                    icon: 'none',
                    title: '删除失败',
                  })
                  console.error('[数据库]demandposts[删除记录] 失败：', err)
                }
              })
            }else{
              break;
            }
          }
      },
      fail: err => {
        console.log('[数据库]demandposts[查询记录]失败2：', err)
      }
    })
  },
  //实现在满足条件的时候给用户发送模板消息
  //像二手物品交易中，将用户的物品信息存储起来，等到其他人购买，提醒用户发货
  //就可以在别人下单的函数中，给卖家发送模板消息。
  send(){
    wx.cloud.callFunction({
      name: 'subscribeMessagesend',
      success(res){
        console.log('成功返回值',res)
      },
      fail(re){
        console.log('失败返回值',re)
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
    // 下拉触底，先判断是否有请求正在进行中
    // 以及检查当前请求页数是不是小于数据总页数，如符合条件，则发送请求
    console.log('上拉触底')
    this.loadMoreData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})