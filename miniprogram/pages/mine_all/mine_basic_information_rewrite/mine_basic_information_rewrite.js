// pages/mine_basic_information_rewrite/mine_basic_information_rewrite.js
const db = wx.cloud.database();
Page({
  // 页面的初始数据
  data: {
    userInfo: {},//用户信息,不需要once来监听是否第一次打开页面，因为保存就跳转，一旦进入又要更新
    _id:'',//用户的唯一_id
    id: '',//用户的昵称
    gender: '',//用户的性别
    university: '',//用户的大学
    age: '',//用户的年龄
    constellation: '',//用户的星座
    love: '', //用户的爱好
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.setData({
      id: options.id,
      gender: options.gender,
      university: options.university,
      age: options.age,
      constellation: options.constellation,
      love: options.love,
      userInfo: wx.getStorageSync('userInfo'),
      _id:wx.getStorageSync('_id')
    })
    console.log('用户的userInfo为'+this.data.userInfo)
    console.log('用户的_id为'+this.data._id)
  },
  //用户的昵称的设置
  id_set: function (res) {
    console.log(res.detail.value)
    this.setData({
      id: res.detail.value
    })
    console.log("============id==", this.data.id)
  },
  //用户的性别的设置
  gender_set: function (res) {
    this.setData({
      gender: res.detail.value
    })
    console.log("============gender==", this.data.gender)
  },
  //用户的大学的设置
  university_set: function (res) {
    this.setData({
      university: res.detail.value
    })
    console.log("============university==", this.data.university)
  },
  //用户的年龄设置
  age_set: function (res) {
    this.setData({
      age: res.detail.value
    })
    console.log("============age==", this.data.age)
  },
  //用户的星座设置
  constellation_set: function (res) {
    this.setData({
      constellation: res.detail.value
    })
    console.log("============constellation==", this.data.constellation)
  },
   //用户的爱好设置
  love_set: function (res) {
    this.setData({
      love: res.detail.value
    })
    console.log("============love==", this.data.love)
  },
   //保存页面后跳转
  restore_inforamtion: function () {
    //将页面传到云端
    this.update();
    // 顺序执行，当已经执行完上面的代码就会开启定时器
    setTimeout(function () {
      wx.navigateBack({//返回
        delta: 1
      })
    }, 1000);
  },
  //将页面传到云端
  update:function(){
    //this.data.id为空，无法显示，用typeof可显示出类型
    console.log(typeof(this.data.id))
    if (typeof (this.data.id) == 'undefined' || typeof (this.data.gender) == 'undefined' || typeof (this.data.university) == 'undefined' || typeof (this.data.age) == 'undefined' || typeof (this.data.constellation) == 'undefined' || typeof (this.data.love) =='undefined'){
    wx.showToast({
      title: '请将个人信息填充完整',
      icon:'none',
    })
    }
    console.log('获取数据库成功');
    var dbname;
    dbname = 'mine'
    console.log('进入mine集合');
    //根据用户的_id取更新要更新的值
    db.collection(dbname).doc(this.data._id).update({
      data: {
         id: this.data.id,//用户的昵称
         gender: this.data.gender,//用户的性别
         university: this.data.university,//用户的大学
         age: this.data.age,//用户的年龄
         constellation: this.data.constellation,//用户的星座
         love: this.data.love, //用户的爱好*/
      }
    }).then(res => {
      console.log('从云端获取的数据为'+this.data.id)
      console.log('数据库更新成功')
      }).catch(err => {
        console.error('数据库更新失败'+err)
        wx.showToast({
          title: '保存失败',
          icon:'none'
        })
      })
  },
})