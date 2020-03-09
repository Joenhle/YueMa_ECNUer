const db = wx.cloud.database();
var app = getApp()
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),//是否能用button直接获取
    once_login:true,//是否第一次授权登入
    once: true,//是否第一次打开该页面，如果第一次打开则传数据到数据库
    exist: true,//该人物信息是否存在数据库中，默认true,置位false
    score: 0,//用户的签到积分
    time: '',//签到的时间，根据这个算当日是否签到成功
    is_sign: true,//设置是否今日登入的变量为this.data.is_sign
    sql_score: 0,//保存数据库的分数
    exercise: 0,//锻炼消耗的热量
    userInfo:{},//用户的userInfo信息
    _openid:'',//用户的_openid
    _id:''//保存当前的_id号
  },
  onLoad: function (options) {
    var that = this


    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })

              wx.setStorage({
                key: 'userinfo',
                data: that.data.userInfo,
              })
            }
          })
        }
      },
      fail: function (res) {
        console.log('失败了')
        console.log(res)
      }
    }),
      wx.cloud.callFunction({
        name: 'Getopenid',
        complete: res => {
          var openid = res.result.openid;
          wx.setStorage({
            key: 'openid',
            data: openid,
          })
        }
      })



    if (this.data.once_login == false) {
      this.getOpenid();
      this.getPresent();//得到现在的时间，为签到做准备
      var that = this
      setTimeout(function () { //延迟时间 这里是1秒
        that.updata()
      }, 1000)
    }
  },


  //调用云函数调取用户的_openid
  getOpenid:function(){
    var that=this
    wx.cloud.callFunction({
      name:'login',
      success:function(res){
       that.setData({
         _openid:res.result.openid
       })
       wx.setStorageSync('_openid', that.data._openid)
       console.log(that.data._openid)
      }
    })
  },
  //点击button获取用户的userInfo信息
  bindGetUserInfo:function(e){
   console.log(e.detail.userInfo)
   this.setData({
    once_login:false,
    userInfo:e.detail.userInfo
   })
   wx.setStorageSync('userinfo', this.data.userInfo)
  },
  //计算当前年月日
  getPresent: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y = date.getFullYear();  //获取年份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);   //获取月份  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); //获取当日日期 
    console.log("当前时间为：" + Y + '年' + M + '月' + D + '日');
    this.setData({
      time: Y + '年' + M + '月' + D + '日'
    })
  },
  //如果是第一次打开该页面，添加信息到数据库并取出相应id
  openPgaeOnce:function(realtime){
    var that = this
    db.collection('mine').where({//1.若个人信息在数据库则不再操作
      _openid:this.data._openid
    }).get({
      success: res => {
        if (res.data == '') { //如果得到的结果为空，则不再数据库中，所以exist为false
          console.log('该人物不在数据库中')
          that.setData({
            exist: false
          })
          console.log(that.data.exist)
          if (!that.data.exist) { //2.若个人信息不再数据库，则添加到数据库
            db.collection('mine').add({
              data: {
                poster: that.data.userInfo.nickName,
                post_time: realtime,
                src_of_avatar: that.data.userInfo.avatarUrl,
                id: '未知',//用户的昵称
                gender: '',//用户的性别
                university: '华东师范大学',//用户的大学
                age: '',//用户的年龄
                constellation: '',//用户的星座
                love: '', //用户的爱好
                score: 3, //签到和发布页面所得积分
                sign_time: that.data.time,//最近登入的时间，需要不停更新
                exercise: 0//消耗的能量排行
              },
            })
            console.log('个人信息已保存到云端')
            this.setData({ //将once置为false
              once: false
            })
          }
        }
      }
    })
    db.collection('mine').where({//3.保留用户的_id
      _openid:this.data._openid
    }).get({
      success:function(res){
       console.log('当前用户的_id为'+res.data[0]._id)
      that.setData({
        _id:res.data[0]._id
      })
      wx.setStorageSync('_id', that.data._id)//保存用户的_id
      }
    })
  },
  //上传用户数据
  updata: function () {
    var timestamp = Date.parse(new Date()); //时间的格式化
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    console.log('当地时间为' + realtime)
    //如果是第一次打开该页面，添加信息到数据库
    if (this.data.once) {//如果是第一次打开该页面，添加信息到数据库
    this.openPgaeOnce(realtime);
     }
  },
  //签到_ is
  sign_in: function () {
    console.log('签到功能获取数据库成功');
    console.log(this.data._id);
    //总：开始查询数据，获取用户的登入时间与当前时间匹配，若相同则已签到，否则则没有签到，score+3,且更新数据库中的数据   
    db.collection('mine').doc(this.data._id).get({ 
      success: res => {//1.若个人信息在数据库则不再操作
        console.log('取到的数据为' + res.data.sign_time)
        if (res.data.sign_time == this.data.time) { //分：如果时间相同则已签到过了，showToast今日已签到过
          this.setData({ //签到了score就是数据库中的
            score: res.data.score
          })
          wx.showToast({
            title: "今日已签到过",
            icon: 'none'
          }, 1000)
        }
        else {  //分：未签到则设置this.data.is_sign为false
          this.setData({
            is_sign: false,
            sql_score: res.data.score,
            score: res.data.score + 3  //没签到了score就是数据库中的+3
          })
        }
      }
    })
    var that = this
    setTimeout(function () {
      that.signUpdate();
    }, 1000)
  },
  //延迟执行更新数据库的sign_time和score函数
  signUpdate: function () {
    //分：this.data.is_sign为false,今日未登入，未签到则showToast签到积分+3，更新数据库的sign_time和score
    if (!this.data.is_sign) {
      console.log("今日未登入，修改数据中----")
      db.collection('mine').doc(this.data._id).update({
        data: {
          score: this.data.sql_score + 3,//score自增3分
          sign_time: this.data.time
        }
      }).then(res => {
        console.log('数据库更新成功')
        wx.showToast({
          title: '签到积分+3',
          icon: 'success'
        })
      }).catch(err => {
        console.error('数据库更新失败' + err)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      })
    }
    this.setData({  //将is_sign设为true,下次不在触发
      is_sign: true
    })
  },
  //基本资料
  basic_information: function () {
    wx.navigateTo({
      url: '../mine_basic_information/mine_basic_information'
    })
  },
  //信用积分
  credit_score: function () {
    if (this.data.is_sign) { //如果没有签到的话。这变比较搞，因为我把sign默认成了true就是没有获得score的分数,从数据库中获取
      db.collection('mine').doc(this.data._id).get({
        success: res => {
          this.setData({
            score: res.data[0].score
          })
          console.log("从数据库中取到的score为" + this.data[0].score)
        }
      })
    }
    var that = this
    setTimeout(function () {
      wx.showToast({
        title: '您的积分余额为' + that.data.score,
        icon: 'none'
      })
    }, 500)
  },
  //排行榜
  leaderboard: function () {
    wx.navigateTo({
      url: '../mine_leaderboard/mine_leaderboard'
    })
  },
  //发布历史
  history: function () {
    console.log('准备跳转')
    wx.navigateTo({
      url: '../mine_history/mine_history'
    })
  },
 //运动历史
 exercise:function(){
   wx.navigateTo({
     url: '../mine_exercise/mine_exercise'
   })
 },
})