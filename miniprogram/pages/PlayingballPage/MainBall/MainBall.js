// miniprogram/pages/PlayingballPage/MainBall/MainBall.js
const app = getApp();
const db = wx.cloud.database()
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
  onTabItemTap: function (e) {
    app.globalData.yueqiu_or_yuepao = e.text
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('判断MainRun里onload的参数', options)
    wx.getStorage({
      key: 'openid',
      success: function (res) {
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
    //实时的进行数据库数据监控
    const watcher = db.collection('BallDemandPosts').orderBy('run_time', 'asc')
      .watch({
        onChange: function (snapshot) {
          console.log('监听数组变化', snapshot)
          if (that.data.is_first_load) {
            that.setData({
              is_first_load: false
            })
          } else {
            that.setData({
              has_new_data: true
            })
          }
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    that.deletePosts()
  },
  //删除过期的帖子
  deletePosts: function () {
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间
    db.collection('BallDemandPosts').orderBy('finish_time', 'asc').get({
      success: function (res) {
        var demandposts = res.data
        console.log('删除时获取到的MainBall帖子', demandposts)
        for (let i = 0; i < demandposts.length; i++) {
          if (demandposts[i].finish_time < realtime) {
            db.collection('BallDemandPosts').doc(demandposts[i]._id).remove({
              success: mineres => {
                console.log('数据库balldemandposts删除成功', mineres)
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '删除失败',
                })
                console.error('[数据库]balldemandposts[删除记录] 失败：', err)
              }
            })
          } else {
            break;
          }
        }
      },
      fail: err => {
        console.log('[数据库]balldemandposts[查询记录]失败2：', err)
      }
    })
  },

  TodiscoverballDemand: function (options) {
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
      url: '../discoverballDemand/discoverballDemand',
    })
  },
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
  TocreateDemand: function (options) {

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
      url: '../createballDemand/createballDemand',
    })
  },
  ChangePosts: function (options) {
    console.log('根据搜索页面更改参数', options)
    this.setData({
      demandPosts: options,
      has_new_data: true,
    })
  },
  //更新页面函数
  myUpdate: function () {
    var that = this
    console.log('调用MainBall更新页面函数')
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间
    db.collection('BallDemandPosts').orderBy('run_time', 'asc').get({
      success: function (res) {
        var vardemandposts = res.data
        console.log('获取到的MainBall帖子', res)
        console.log('首次获取到的MainBall帖子', vardemandposts)
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
        console.log('小小筛选后的MainBall帖子', vardemandposts)
      },
      fail: err => {
        console.log('[数据库]balldemandposts[获取记录]失败：', err)
      }
    })
  },

  //获取总数
  getListCount: function () {
    return new Promise((resolve, reject) => {
      db.collection('BallDemandPosts').count().then(res => {
        resolve(res.total);
      }).catch(e => {
        console.log(e)
        reject("查询失败")
      })
    })
  },
  //单次查询函数
  getListIndexSkip: function (skip) {
    return new Promise((resolve, reject) => {
      let statusList = []
      let selectPromise;
      if (skip > 0) {
        selectPromise = db.collection('BallDemandPosts').orderBy('run_time', 'asc').skip(skip).get()
      } else {
        //skip值为0时，会报错
        selectPromise = db.collection('BallDemandPosts').orderBy('run_time', 'asc').get()
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
   * 加载初始数据,有时候为了提升页面打开速度，会将所有数据合并到一个接口中返回，然后列表中的第二页数据开始，使用其它接口返回，即分页获取数据时，仅获取下一页的数据。（这里仅做示例，因为每一页数据都取一样的。在实际开发中可以考虑这样分开。）
   */
  loadInitData: function () {
    var that = this
    var currentPage = 0;
    var tips = "加载第" + (currentPage + 1) + "页";
    console.log("load page " + (currentPage + 1));
    wx.showLoading({
      title: tips,
    })

  },
  /**
   * 加载下一页数据
   */
  loadMoreData: function () {
    var that = this
    var currentPage = that.data.currentPage; // 获取当前页码
    var tips = "加载第" + (currentPage + 1) + "页";
    console.log("load page " + (currentPage + 1));
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