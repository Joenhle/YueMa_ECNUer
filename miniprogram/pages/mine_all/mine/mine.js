const db = wx.cloud.database();
var app = getApp()
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),//是否能用button直接获取
    once_login:true,//是否第一次授权登入
    once: true,//是否第一次打开该页面，如果第一次打开则传数据到数据库
    time: '',//签到的时间，根据这个算当日是否签到成功
    is_sign: true,//设置是否今日登入的变量为this.data.is_sign
    sql_score: 0,//保存数据库的分数
    userInfo:{},//用户的userInfo信息
    month:'',//月份
    month_number:'',
    weekday: '',//星期几
    week: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    navigate_page:false,//点击是否显示该人信息
    backshuaxin:false,//返回刷新为false
    _openid:'',//该人的_openid
    avatarUrl:'',//该人的头像
    college:'',//该人的学院
    exercise: 0,//该人锻炼消耗的热量
    score: 0,//该人的积分
    realName:'',//该人的名字
    xuehao:'',//该人的学号
    grade:'',//该人的年级
    sushe:'',//该人的宿舍
    major:'',//该人的专业
    Is_onshow:true,//页面是否刷新
  },
  shouquan:function(e){
    wx.openSetting({
      success (res) {
        console.log(res.authSetting)
      }
    })
  },
  bindGetUserInfo:function(e){//点击button获取用户的userInfo信息
      this.setData({
       userInfo:e.detail.userInfo,
       once_login:false
      })
      wx.setStorageSync('userInfo', this.data.userInfo)
      wx.setStorageSync('userinfo', this.data.userInfo)
      app.globalData.userinfo = wx.setStorageSync('userinfo', this.data.userInfo)

      this.onLoad();
      wx.showToast({
       title: '正在加载中',
       icon: 'loading',
       duration: 2000
   })
  },
  onShow:function(){
    console.log('onshow')
    console.log(this.data.Is_onshow)
    if(this.data.Is_onshow==true){
      this.setData({
        once:true
      })
    this.openPageOnce()
    }
  },
  onLoad: function () {//Onload加载页面
    console.log('onload')
    this.setData({
      Is_onshow:false
    })
    //获取全局数据
    if(app.Is_registered==true){
      this.setData({
        navigate_page:true
      })
    }
    if(this.data.once_login==false){
    this.getOpenid();
    this.getPresent();//得到现在的时间，为签到做准备
    var that=this
    setTimeout(function () { //延迟时间 这里是1秒
      that.openPageOnce()
    },1000)
  }
   else if(this.backshuaxin==true)//上拉刷新页面
    this.openPageOnce()
  },
  getOpenid:function(){//调用云函数调取用户的_openid
    var that=this
    wx.cloud.callFunction({
      name:'login',
      success:function(res){
       that.setData({
         once_login:false,
         _openid:res.result.openid
       })
       wx.setStorageSync('_openid', that.data._openid)
       wx.setStorageSync('openid', that.data._openid)
       app.globalData.openid = wx.setStorageSync('openid', that.data._openid)
       console.log(that.data._openid)
      }
    })
  },
  getPresent: function () {//计算当前年月日
    var today=new Date().getDay(); 
    console.log("today:"+today);
    switch (today){
        case 0:this.setData({
          weekday: this.data.week[0]
        })
        break; 
        case 1: case 2: case 3: case 4: case 5:case 6:this.setData({
         weekday: this.data.week[today]
       })
      }
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y = date.getFullYear();  //获取年份  
    this.setData({
    month:(date.getMonth()+1)+'月份',
    month_number:date.getMonth()+1
    })
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);   //获取月份  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate(); //获取当日日期 
    console.log("当前时间为：" + Y + '年' + M + '月' + D + '日');
    this.setData({
      time: Y + '年' + M + '月' + D + '日',
    })
  },
  openPageOnce:function(){ //如果是第一次打开该页面，添加信息到数据库并取出相应id
    if (this.data.once) {
    db.collection('mine').where({//1.若个人信息在数据库则不再操作
      _openid:this.data._openid
    }).get({
      success: res => {
        if (res.data == ''&&this.data._openid!='') { //1.如果得到的结果为空，则不再数据库中，则添加到数据库
          console.log('该人物不在数据库中')
                        wx.hideLoading()
                        wx.showModal({ //请先完成注册
                        title: '提示',
                        content: '您未完成注册，是否注册？',
                        showCancel: true, //是否显示取消按钮-----》false去掉取消按钮
                        cancelText: "否", //默认是“取消”
                        cancelColor: 'black', //取消文字的颜色
                        confirmText: "是", //默认是“确定”
                        confirmColor: 'pink', //确定文字的颜色
                        success: function (res) {
                          if (res.cancel) {
                            console.log("您点击了取消")
                          } else if (res.confirm) {
                            console.log("您点击了确定")
                            wx.navigateTo({
                              url: '../../face_check/face_check' //页面跳转
                            })
                    }
                  }
                })
        }
        else{
          app.globalData.is_denglu=true
          wx.setStorageSync('_id',res.data[0]._id)
          this.setData({
            navigate_page:true
          })
          
        }
      this.setData({ //将once置为false
        realName:res.data[0].realName,
        xuehao:res.data[0].xuehao,
        grade:res.data[0].grade,
        college:res.data[0].college,
        sushe:res.data[0].sushe,
        major:res.data[0].major,
        avatarUrl:res.data[0].avatarUrl,
        score:res.data[0].score,
        once: false,
        backshuaxin:false
      })
    },
    fail:res=>{
      console.log('访问数据库失败')
    }
    })
  }
  },
  sign_in: function () {//签到

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

    console.log('签到功能触发');
    //总：开始查询数据，获取用户的登入时间与当前时间匹配，若相同则已签到，否则则没有签到，score+3,且更新数据库中的数据   
    if(this.data.once_login==false){
    db.collection('mine').where({
      _openid:this.data._openid
    }).get({ 
      success: res => {//1.若个人信息在数据库则不再操作
        console.log('取到的数据为' + res.data[0].sign_time)
        if (res.data[0].sign_time == this.data.time) { //分：如果时间相同则已签到过了，showToast今日已签到过
          this.setData({ //签到了score就是数据库中的
            score: res.data[0].score
          })
          wx.showToast({
            title: "今日已签到过",
            icon: 'none'
          }, 1000)
        }
        else {  //分：未签到则设置this.data.is_sign为false
          this.setData({
            is_sign: false,
            sql_score: res.data[0].score,
            score: res.data[0].score + 3  //没签到了score就是数据库中的+3
          })
        }
      }
    })
    var that = this
    setTimeout(function () {
      that.signUpdate();
    }, 1000)
  }
  },
  signUpdate: function () { //延迟执行更新数据库的sign_time和score函数
    var that = this;
    var _id = wx.getStorageSync('_id')
    if (!that.data.is_sign) {
      console.log("今日未登入，修改数据中----")
      db.collection('mine').doc(_id).update({
        data: {
          score: that.data.sql_score + 3,//score自增3分
          sign_time: that.data.time
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
          title: '签到失败',
          icon: 'none'
        })
      })
    }
    that.setData({  //将is_sign设为true,下次不在触发
      is_sign: true
    })
  },
  basic_information: function () {//基本资料
    this.setData({
      Is_onshow:true
    })
    wx.navigateTo({
      url: '../mine_basic_information/mine_basic_information'
    })
  },
  credit_score: function () {//信用积分
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

    if (this.data.is_sign) { 
      db.collection('mine').where({
        _openid:this.data._openid
      }).get({
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
  leaderboard: function () {//排行榜
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
      url: '../../rank/rank'
    })
  },
  history: function () {//发布历史
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
      url: '../mine_history/mine_history'
    })
  },
  exercise:function(){//运动历史
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
     url: '../mine_exercise/mine_exercise'
   })
  },
  about:function(){//关于
    wx.navigateTo({
      url: '../mine_about/mine_about'
    })
  },
  onPullDownRefresh: function () {//上拉刷新
  wx.showNavigationBarLoading() //在标题栏中显示加载
  this.setData({
    backshuaxin:true,
    once:true
  })
 this.onLoad();
  setTimeout(function () {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  }, 1500);
  },
})