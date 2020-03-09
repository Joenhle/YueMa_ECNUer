const app = getApp();

Page({
  data: {
    ne: [],
    image_dianzan_src: '',
    userinfo:[],
    openid: '',
    show_image_sanjiao:false,
    bind_comments_text:'',
    leibie: ['Posts', 'experience'],
    leibie_paixu: ['post_time', 'number_of_visit'],
    input_empty:''
  },
  onLoad: function (options) {
    var that = this;
    const db = wx.cloud.database()
    var post_id = options.post_id;
    var image_dianzan_src = options.image_dianzan_src;
    var number_of_visit;
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
    db.collection(that.data.leibie[app.globalData.currentTab]).doc(post_id).get({
      success: function (res) {
        that.setData({
          image_dianzan_src: image_dianzan_src,
          ne: res.data
        })
        number_of_visit = parseInt(that.data.ne.number_of_visit) + 1;


        //调用云函数 db_panel_comments
        wx.cloud.callFunction({
          name: 'db_panel_number_of_visit',
          data: {
            leibie: that.data.leibie[app.globalData.currentTab],
            _id: post_id,
            number_of_visit : number_of_visit
          },
          success: function (res) {
            db.collection(that.data.leibie[app.globalData.currentTab]).doc(post_id).get({
              success: function (res) {
                that.setData({
                  ne: res.data
                })
              }
            })
          }
        })






        /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(post_id).update({
          data: {
            number_of_visit: number_of_visit
          },
          success: function (res) {
            db.collection(that.data.leibie[app.globalData.currentTab]).doc(post_id).get({
              success: function (res) {
                that.setData({
                  ne: res.data
                })
              }
            })
          }
        })*/












      }
    })
  },
  PreviewImage: function (e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
  },
  Dianzan: function (e) {
    var that = this;
    const db = wx.cloud.database();
    if (that.data.image_dianzan_src == 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png') {
      var temp = that.data.ne;
      temp.dianzan_list[temp.dianzan_list.length] = that.data.openid;
      that.setData({
        ne: temp,
        image_dianzan_src: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞(2).png'
      })


      //调用云函数 db_panel_comments
      wx.cloud.callFunction({
        name: 'db_dianzan',
        data: {
          leibie: that.data.leibie[app.globalData.currentTab],
          _id: that.data.ne._id,
          dianzan_list: temp.dianzan_list
        },
      })

    } else {
      for (var i = 0; i < that.data.ne.dianzan_list.length; ++i) {
        if (that.data.ne.dianzan_list[i] == that.data.openid) {
          var temp = that.data.ne;
          temp.dianzan_list.splice(i, 1);
          that.setData({
            ne: temp,
            image_dianzan_src: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png',
          })


          //调用云函数 db_panel_comments
          wx.cloud.callFunction({
            name: 'db_dianzan',
            data: {
              leibie: that.data.leibie[app.globalData.currentTab],
              _id: that.data.ne._id,
              dianzan_list: temp.dianzan_list
            },
          })

          /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne._id).update({
            data: {
              dianzan_list: temp.dianzan_list
            },
          })*/
          break;
        }
      }
    }
  },
  Post_of_shanchu: function (e) {
    var that = this;
    const db = wx.cloud.database();
    wx.showModal({
      title: '提示',
      content: '确定要删除这条动态嘛',
      success(res) {
        if (res.confirm) {
          db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne._id).remove({
            success: function (res) {
              wx.showToast({
                title: '删除帖子成功',
                icon: 'success',
                duration: 2000
              });
              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else if (res.cancel) {
        }
      }
    })
  },
  Showpinglun:function(e){
    var that = this;
    const db = wx.cloud.database();
    that.setData({
      show_image_sanjiao: !that.data.show_image_sanjiao
    })
  },
  Comments_shanchu:function(e){
    var that = this;
    const db = wx.cloud.database();
    var i = e.target.dataset.i;
    console.log(i);
    var temp=that.data.ne;
    temp.comments.splice(i,1);
    that.setData({
      ne:temp
    })

    //调用云函数 db_panel_comments
    wx.cloud.callFunction({
      name: 'db_panel_comments',
      data: {
        leibie: that.data.leibie[app.globalData.currentTab],
        _id: that.data.ne._id,
        comments_list: temp.comments
      },
      success: function (res) {
        wx.showToast({
          title: '删除评论成功',
          icon: 'success',
          duration: 2000
        });
      }
    })

    /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne._id).update({
      data: {
        comments: temp.comments
      },
      success:function(res){
        wx.showToast({
          title: '删除评论成功',
          icon: 'success',
          duration: 2000
        })
      }
    })*/
  },
  BindCommentsInput:function(e){
    var that = this;
    that.setData({
      bind_comments_text: e.detail.value
    })
  },
  Comments_fabu:function(e){
    var that = this;
    that.setData({
      input_empty:''
    })
    var comments_of_text = that.data.bind_comments_text;
    if (comments_of_text.length == 0) {
      wx.showModal({
        title: '提示',
        content: '评论不能为空噢',
        showCancel: false
      })
    } else {
      //获取评论时间
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + 8 * 60 * 60;
      var date = new Date(parseInt(timestamp) * 1000);
      var temp = date.toISOString();
      var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
      
      var arr = { "0": that.data.userinfo.nickName, "1": that.data.userinfo.avatarUrl, "2": comments_of_text, "3": realtime, "4": that.data.openid };
      var temp = that.data.ne
      temp.comments[temp.comments.length] = arr;
      const db = wx.cloud.database()


      //调用云函数 db_panel_comments
      wx.cloud.callFunction({
        name: 'db_panel_comments',
        data: {
          leibie: that.data.leibie[app.globalData.currentTab],
          _id: that.data.ne._id,
          comments_list: temp.comments
        },
        success: function (res) {
          //更新前端的ne[]
          that.setData({
            ne: temp,
          })
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            duration: 2000
          })
        }
      })

      /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne._id).update({
        data: {
          comments:temp.comments
        },
        success: function (res) {
          //更新前端的ne[]
          that.setData({
            ne:temp,
          })
          wx.showToast({
            title: '评论成功',
            icon: 'success',
            duration: 2000
          })
        }
      })*/
    }
  }
});