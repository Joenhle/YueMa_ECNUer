// pages/mine/basic_information/basic_information.js
Page({
  // 页面的初始数据
  data: {
    userInfo: {},//用户信息
    id: '',//用户的昵称
    gender: '',//用户的性别
    university: '',//用户的大学
    age: '',//用户的年龄
    constellation: '',//用户的星座
    love: '', //用户的爱好
  },
  //跳转个人信息
  add_inforamtion:function() {
    wx.navigateTo({
      url: '../mine_basic_information_rewrite/mine_basic_information_rewrite?id=' + this.data.id + '&gender=' + this.data.gender + '&university=' + this.data.university + '&age=' + this.data.age + '&constellation=' + this.data.constellation + '&love=' + this.data.love
    })
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
   console.log('onLoad')
   this.setData({
     userInfo:wx.getStorageSync('userInfo')
   })
   console.log(this.data.userInfo)
   this.getdata()//获取云端的个人信息
  },
  getdata:function(){
    const db = wx.cloud.database();
    console.log('获取数据库成功');
    var dbname;
    dbname = 'mine'
    console.log('进入mine集合');
    //如果是第一次打开该页面，添加信息到数据库
      //1.若基础信息在数据库则显示出来
      db.collection('mine').where({
        //使用正则查询，实现对搜索的模糊查询
        src_of_avatar: db.RegExp({
          regexp: this.data.userInfo.avatarUrl,
          //从搜索栏中获取的value作为规则进行匹配。
        })
      }).get({
        success: res => {
          console.log('获取的数据为'+res.data[0])
          console.log(res.data[0].id)
          //如果得到的结果为空，则这个人未编辑个人信息，保留个人信息的空值
          if (res.data[0].id == ''&&res.data[0].gender==''&&res.data[0].university=='') {
            console.log('该人物未编辑个人信息')
          }
          //否则则将个人信息的值设为数据库中某个人的值
          else {
          this.setData({
            id: res.data[0].id,//用户的昵称
            gender: res.data[0].gender,//用户的性别
            university: res.data[0].university,//用户的大学
            age: res.data[0].age,//用户的年龄
            constellation: res.data[0].constellation,//用户的星座
            love: res.data[0].love, //用户的爱好
          })
          console.log('基本资料已从云端获取到')
          }
          }
      })
  },
  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    this.onLoad();
  },
})
