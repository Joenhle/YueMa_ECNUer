// miniprogram/pages/RunningPage/createDemand/createDemand.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: '13:00',
    date: '',
    nowtime: '',
    nowdate: '',
    datetoday: true,
    run_time: '',
    duration: 30,

    rendezvous: "操场",
    speed: ["慢", "中", "快"],
    speedIndex: 1,

    gender: ["不限", "男", "女"],
    genderIndex: 0,

    maxmember: [2, 3, 4, 5],
    maxmemberIndex: 0,

    remark: "",
    demandId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    that.setData({
      date: temp.substring(0, 10),
      nowdate: temp.substring(0, 10),
      nowtime: temp.substring(11, 16),
      time: temp.substring(11, 16),
    })

  },

  changeDuration: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value,
    })
    if(this.data.date==this.data.nowdate ){
      this.setData({
        datetoday: true,
      })
    }
    else{
      this.setData({
        datetoday: false,
      })
    }
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindSpeedChange: function (e) {
    console.log('picker speedIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      speedIndex: e.detail.value
    })
  },
  bindGenderChange: function (e) {
    console.log('picker genderIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      genderIndex: e.detail.value
    })
  },
  bindMaxmemberChange: function (e) {
    console.log('picker maxmemberIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      maxmemberIndex: e.detail.value
    })
  },
  textareaBInput: function (e) {

    this.setData({
      remark: e.detail.value
    })
  },

  submitDemand: function (e) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //创建时间

    var vrun_time = this.data.date + ' ' + this.data.time
    this.setData({
      run_time: vrun_time
    })
    var user_id = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userinfo');
    var joinerinfo = {
      "avatarUrl": userinfo.avatarUrl,
      "gender": userinfo.gender,
      "jion_time": realtime,
      "nick_name": userinfo.nickName,
      "openid": user_id,
      "read_news":0 //新添
    }
    var memberArr = [joinerinfo]
    const db = wx.cloud.database()
    db.collection('DemandPosts').add({
      data: {
        chat:[],
        duration: this.data.duration,
        gender_require: this.data.genderIndex,
        max_num: this.data.maxmember[this.data.maxmemberIndex],
        members: memberArr,
        num_of_people: 1,
        post_time: realtime,
        poster: userinfo.nickName,
        poster_gender: 1,
        remark: this.data.remark,
        rendezvous: this.data.rendezvous,
        run_time: this.data.run_time,
        speed_require: this.data.speedIndex,
        src_of_avatar: userinfo.avatarUrl
      },
      success: res => {
        this.setData({
          demandId: res._id
        })
        wx.showToast({
          title: '创建需求成功',
          success: function (res) {
            wx.switchTab({
              url: '../MainRun/MainRun',
            })
            
          }
        })
        console.log('[数据库][新增记录]成功，记录 _id', res._id)
      },
      fail: err => {
        wx.showToast({
          title: '创建需求失败',
        })
        console.log('[数据库][新增记录]失败：', err)
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