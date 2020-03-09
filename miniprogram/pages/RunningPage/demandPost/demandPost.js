// miniprogram/pages/RunningPage/demandPost/demandPost.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     demandPost: {},
     userinfo: {},
     openid:'',
     usergender: 1,
     speed: ["慢", "中", "快"],
     gender: ["不限", "男", "女"],
     num_of_people: 0,
     post_id: '',
     gender_require: 0,
     is_partof: false,
     is_collected: false,
     not_gender: true,
     unread_news:0,
     hasonshow:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const db = wx.cloud.database();

    if(that.data.openid==''){
      var post_id = options.post_id;
      that.setData({
        post_id: post_id
      })
    }
 
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
          userinfo: res.data,
          usergender: res.data.gender
        })
      },
    })
    db.collection('DemandPosts').doc(that.data.post_id).get({
      success: function (res) {
        console.log('帖子详情',res)
        that.setData({
          demandPost: res.data,
          num_of_people: res.data.num_of_people,
          gender_require: res.data.gender_require
        })
        var members = that.data.demandPost.members
        for (let i = 0; i < members.length; i++) {
          if (members[i]["openid"] == that.data.openid) {
            that.setData({
              is_partof: true
            })
          }
        }
        if(that.data.gender_require==0){
          that.setData({
            not_gender: false
          })
        }
        else if(that.data.usergender==that.data.gender_require){
          that.setData({
            not_gender: false
          })
        }
        else{
          that.setData({
            not_gender: true
          })
        }
        
        //新添
        var read_news = 0;
        var unread_news = 0;
        for(var i =0 ;i<that.data.demandPost.members.length;++i){
          if (that.data.demandPost.members[i].openid==that.data.openid){
            read_news = that.data.demandPost.members[i].read_news
          }
        }
        if (that.data.demandPost.chat.length - read_news > 99){
          unread_news = '99+'
        }else{
          unread_news = that.data.demandPost.chat.length - read_news
        }
        that.setData({
          unread_news:unread_news
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

    //4. 再实时的进行数据库数据监控
    const watcher = db.collection('DemandPosts').doc(that.data.post_id)
      .watch({
        onChange: function (snapshot) {
          //新添
          var read_news = 0;
          var unread_news = 0;
          for (var i = 0; i < that.data.demandPost.members.length; ++i) {
            if (that.data.demandPost.members[i].openid == that.data.openid) {
              read_news = snapshot.docs[0].members[i].read_news
            }
          }

          if (snapshot.docs[0].chat.length - read_news > 99) {
            unread_news = '99+'
          } else {
            unread_news = snapshot.docs[0].chat.length - read_news
          }
          that.setData({
            unread_news: unread_news
          })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    // 等到需要关闭监听的时候调用 close() 方法
    //watcher.close()

  },
                                                                          //新增
  Liaotianshi:function(e){
    var that = this;
     wx.navigateTo({
       url: '/pages/chat/chat?_id='+that.data.post_id+'&members='+that.data.demandPost.members,
     })
  },
  

  Jion_running: function(e){
    var that=this
    //获取加入时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    
    var user_id = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userinfo');
    var joinerinfo = {
      "avatarUrl": userinfo.avatarUrl,
      "gender": userinfo.gender,
      "jion_time": realtime,
      "nick_name": userinfo.nickName,
      "openid": user_id,
      "read_news":0
    }
    var joiner = that.data.openid;
    
    var temppost = that.data.demandPost
    var now_num = that.data.num_of_people + 1
    temppost.members[temppost.num_of_people] = joinerinfo 
    console.log('用户数组', temppost.members)
    /*const db = wx.cloud.database()
    db.collection('DemandPosts').doc(that.data.post_id).update({
      data: {
        members: temppost.members,
        num_of_people: now_num
      },
      success: res => {
        this.setData({
          demandPost: temppost
        })
        wx.showToast({
          title: '加入需求成功',
          success: function (res) {
            wx.redirectTo({
              url: '../MainRun/MainRun',
            })

          }
        })
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })*/
    //调用云函数 db_jionRunning
    wx.cloud.callFunction({
      name: 'db_jionRunning',
      data: {
        post_id: that.data.post_id,
        members: temppost.members,
        num_of_people: now_num
      }
    })
    that.setData({
        demandPost: temppost
    })
    wx.showToast({
      title: '加入需求成功',
      success: function (res) {
        wx.switchTab({
          url: '../MainRun/MainRun',
        })

      }
    })
  },
  
  Collect_post: function(){
    this.setData({
      is_collected: true
    })
  },

  Cancel_collect: function(){
    this.setData({
      is_collected: false
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
    var that = this
    if(that.data.hasonshow==false){
      that.setData({
        hasonshow:true
      })
      return
    }
    that.setData({
      unread_news:0
    })
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