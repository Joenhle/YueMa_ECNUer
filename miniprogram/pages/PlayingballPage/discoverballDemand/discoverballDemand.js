// miniprogram/pages/PlayingballPage/discoverballDemand/discoverballDemand.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    genderarr: ["不限", "男", "女", "男女搭配"],
    genderi: 0,
    ballarr: ['篮球', '足球', '网球', '乒乓球', '羽毛球', '不限'],
    balli: 0,
    durationarr: ["半小时内", "1小时内", '2小时内', '3小时内', '4小时内', '5小时内', '不限'],
    durationi: 0,
    numpeoplearr: ["2人", '3人', '4人', '5人', '6人', "很多人", '不限'],
    numpeoplei: 0,
    CustomBar: app.globalData.CustomBar,
    speedbox: [{
      value: 0,
      name: '小白',
      checked: false,
    }, {
      value: 1,
      name: '菜鸟',
      checked: false,
    }, {
      value: 2,
      name: '普通',
      checked: true,
    }, {
      value: 3,
      name: '大牛',
      checked: false,
    }, {
      value: 4,
      name: '大神',
      checked: false,
    }, {
      value: 5,
      name: '不限',
      checked: false,
    }],
    speedi: [2],
    multiArray: [
      ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
      ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    ],
    multiIndex: [0, 16],
    demandPosts: []
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
  //配速选择
  ChooseSpeedbox(e) {
    let items = this.data.speedbox;
    let values = e.currentTarget.dataset.value;
    var speed = [];
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].value == values) {
        if (i == lenI - 1) { //如果点击‘不限’，则其他按钮不被选中(checked为false)
          for (let i = 0, lenI = items.length; i < lenI - 1; ++i) {
            items[i].checked = false
          }
        } else { //如果未点击不限，则不限按钮不被选中(checked为false)
          items[lenI - 1].checked = false
        }
        items[i].checked = !items[i].checked;
        break
      }
    }

    //统计选中的按钮
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].checked) {
        speed = speed.concat(i)
      }
    }
    var temp = [5]
    //如果前5个按钮都被选中，则自动换成‘不限’
    if (speed.length == 5) {
      speed = temp
      items[5].checked = true
      for (let i = 0; i < items.length - 1; i++) {
        items[i].checked = false
      }
    }
    //如果没有按钮被选中，则自动换成‘不限’
    if (speed.length == 0) speed = speed.concat(5)
    this.setData({
      speedbox: items,
      speedi: speed
    })
  },
  MultiChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  //时间段选择
  MultiColumnChange(e) {
    let data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    //console.log('时间段',e)
    if (data.multiIndex[1] <= data.multiIndex[0])
      data.multiIndex[1] = data.multiIndex[0] + 1;
    this.setData(data);
  },

  //选择性别
  genderChange: function (e) {
    //console.log('性别', e)
    this.setData({
      genderi: e.detail.value
    })
  },
  //选择球类
  ballChange: function (e) {
    //console.log('球类', e)
    this.setData({
      balli: e.detail.value
    })
  },
  //选择人数
  numpeopleChange: function (e) {
    //console.log('人数',e)
    this.setData({
      modalName: null,
      numpeoplei: e.currentTarget.dataset.numpeople
    })
  },
  //选择时长
  durationChange: function (e) {
    //console.log('时长', e)
    this.setData({
      modalName: null,
      durationi: e.currentTarget.dataset.duration
    })
  },
  //搜索
  searchPost: function (e) {
    var that = this
    var gender = that.data.genderi
    var speed = that.data.speedi //从约跑界面复制的代码，speed应改为skill
    var num_of_people = that.data.numpeoplei + 2
    var balli = that.data.balli
    var duration = 30
    if (that.data.durationi == 6) {
      duration = 0
    } else if (that.data.durationi > 0) {
      duration = that.data.durationi * 60
    }
    var multiArray = that.data.multiArray
    var multiIndex = that.data.multiIndex
    var starttime = multiArray[0][multiIndex[0]]
    var endtime = multiArray[1][multiIndex[1]]

    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //当前时间

    var vardemandposts = that.data.demandPosts
    console.log('搜索帖子1', vardemandposts)
    for (let i = vardemandposts.length - 1; i >= 0; i--) {
      if (realtime > vardemandposts[i].run_time) { //此时之前的贴子不展示
        vardemandposts.splice(i, 1);
        continue;
      } else if (vardemandposts[i].max_num == vardemandposts[i].num_of_people) {
        vardemandposts.splice(i, 1); //人数已满的帖子不展示
        continue;
      }
      if (gender != 0) { //删除性别不符合查找要求的
        var haveboy = 0
        var havegirl = 0
        for (let j = 0; j < vardemandposts[i].members.length; j++) {
          if (vardemandposts[i].members[j].gender == 1)
            haveboy++;
          else havegirl++;
        }

        if (haveboy == 0) {
          if (gender == 1 || gender == 3) {
            vardemandposts.splice(i, 1);
            continue;
          }
        }
        if (havegirl == 0) {
          if (gender == 2 || gender == 3) {
            vardemandposts.splice(i, 1);
            continue;
          }
        }
      }
      //下列很多数字实际上为对应数组最后一位（表示不限），以后更改数组长度时注意改数字
      if (speed[speed.length - 1] != 5) { //删除速度不符合查找要求的
        var havespeed = 0
        for (let k = 0; k < speed.length; k++) {
          if (speed[k] == vardemandposts[i].skill_require) {
            havespeed = 1;
            break;
          }

        }
        if (havespeed == 0) {
          vardemandposts.splice(i, 1);
          continue;
        }
      }
      if (num_of_people != 8) { //删除人数不符合要求的
        if (num_of_people != vardemandposts[i].max_num) {
          vardemandposts.splice(i, 1);
          continue;
        }
      }
      if (balli != 5) { //删除球类不符合要求的
        if (balli != vardemandposts[i].ball) {
          vardemandposts.splice(i, 1);
          continue;
        }
      }
      if (duration != 0) { //删除时长不符合要求的
        if (duration == 30) {
          if (vardemandposts[i].duration > 30) {
            vardemandposts.splice(i, 1);
            continue;
          }
        } else if (duration == 60) {
          if (vardemandposts[i].duration <= 30 || vardemandposts[i].duration >= 60) {
            vardemandposts.splice(i, 1);
            continue;
          }
        } else {
          if (vardemandposts[i].duration <= (duration - 60) || vardemandposts[i].duration >= duration) {
            vardemandposts.splice(i, 1);
            continue;
          }
        }
      }
      //跑步时间筛选
      var run_time = vardemandposts[i].run_time.substring(11, 16)
      if (run_time < starttime || run_time > endtime) {
        vardemandposts.splice(i, 1);
      }
    }
    console.log('根据需求搜索帖子(筛选过后的)', vardemandposts)
    wx.showToast({
      title: '搜索需求成功',
      success: function (res) {
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        //直接调用上一个页面对象的ChangePosts()方法，把数据demandPosts更新
        prevPage.ChangePosts(vardemandposts)
        wx.navigateBack({
          delta: 1
        })
      }
    })


  },
  //重置 
  resetSearch: function (e) {
    this.setData({
      modalName: null,
      genderi: 0,
      durationi: 0,
      numpeoplei: 0,
      speedi: [2],
      balli: 0,
      multiIndex: [0, 16]
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
        selectPromise = db.collection('BallDemandPosts').skip(skip).get()
      } else {
        //skip值为0时，会报错
        selectPromise = db.collection('BallDemandPosts').get()
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    new Promise((resolve, reject) => {
      that.getListCount().then(res => {
        console.log('帖子总数', res)
        let count = res
        let list = []
        for (let i = 0; i < count; i += 20) {
          that.getListIndexSkip(i).then(res => {
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
        }

        setTimeout(function () { //延迟时间 这里是1秒
          console.log('所有数据', list)
          that.setData({
            demandPosts: list
          })
        }, 1000)
      })
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