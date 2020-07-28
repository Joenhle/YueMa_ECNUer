// miniprogram/pages/RunningPage/basicInfo/basicInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     info_id: '',
     poster_info: '',
     poster_openid: '',
     gender: ["不限", "男", "女"],
     members: [],
     dianzan:0,
  },
  Dianzan:function(){
    var that = this;
    var db = wx.cloud.database();
    db.collection('mine').where({
      _openid:that.data.poster_info._openid,
    }).get({
      success: function (res) {
        console.log(res)
         var is_dianzan = false;
         for(let i =0 ;i< res.data[0].dianzan_ren.length;++i){
           if(that.data.poster_info._openid==res.data[0].dianzan_ren[i]){
             is_dianzan=true;
             break;
           }
         }
         if(is_dianzan==true){
          wx.showToast({
            title: '只能点赞一次喔',
            icon: 'error',
            duration: 2000
          });
         }else{
           var temp = res.data[0].dianzan_ren;
           temp[temp.length]=that.data.poster_info._openid;
           db.collection("mine").doc(res.data[0]._id).update({
            data: {
              dianzan_ren: temp
            },
            success:function(res){
              that.setData({
                dianzan:that.data.dianzan+1
              })
              wx.showToast({
                title: '点赞成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
         }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var poster_openid = options.poster_openid
    var post_id = options.post_id
    var the_db = options.the_db
    console.log('发布者的openid',poster_openid)
    console.log('帖子id',post_id)
    var info_id = ''
    var poster_info = {}
    const db = wx.cloud.database()
    db.collection('mine').get({
      success: function (res) {
        console.log('所有人信息', res.data);
        var haveuser = 0;
        for (let i = 0; i < res.data.length; i++) {
          if (poster_openid == res.data[i]._openid) {
            that.setData({
              info_id: res.data[i]._id,
              poster_info: res.data[i],
              dianzan:res.data[i].dianzan_ren.length
            })
            info_id = res.data[i]._id
            poster_info = res.data[i]
            console.log('发布需求的人的信息', res.data[i]);
            haveuser = 1
            break;
          }
        }
        if (haveuser == 0) {
          wx.showToast({
            icon: 'none',
            title: '未找到用户信息'
          })
        }
      
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '访问数据库失败'
        })
        console.error('[数据库]mine[查询记录] 失败：', err)
      }
    })
    db.collection(the_db).doc(post_id).get({
      success: function (res) {
         console.log('返回值',res.data.members)
         that.setData({
           members: res.data.members
         })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '访问数据库失败'
        })
        console.error('[数据库]demandposts[查询记录] 失败：', err)
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