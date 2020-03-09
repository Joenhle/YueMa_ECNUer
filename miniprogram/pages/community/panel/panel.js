
const app = getApp();

Page({
  data: {
    userinfo:'',
    bind_comments_text:'',
    showview:[],
    show_image_of_shanchu:[],
    openid: '',
    first_time: true,
    bianliang: 'hhh',
    is_dianzan_list: [],
    dianzan_src_list: [],
    number_of_dianzan_list:[],
    number_of_visit_list:[],
    input_empty:'',
    ne: [],
    max: 2,
    background_dongtai: ['cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/谭茜.jpg', 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/动态背景1.jpg','cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/动态背景2.jpg','cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/动态背景3.jpg'
    ],
    background_jingyan: ['cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/经验背景1.jpg', 
  'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/经验背景2.jpg',
  'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/经验背景3.jpg',
  'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/经验背景4.jpg'],
    navbar: ['动态分享', '经验交流'],
    currentTab: 0,
    leibie: ['Posts','experience'],
    leibie_paixu: ['post_time','number_of_visit'],
    is_onshow_back:false,
  },
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    //全局变量
    app.globalData.currentTab = e.currentTarget.dataset.idx;
  },
  onUnload: function () {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  onShow:function(){
    this.setData({
      currentTab: app.globalData.currentTab,
      is_onshow_back:true
    })
    if(app.globalData.leibie_of_onshow!='全部'){
      app.globalData.leibie_from_onshow=true; 
      this.Click_of_yundong();
    }else{
      this.onLoad();
    }
  },
  swiperChange: function (e) {
    this.setData({
      currentTab: e.detail.current,
      showview: [],
      show_image_of_shanchu: [],
      first_time: true,
      is_dianzan_list: [],
      dianzan_src_list: [],
      number_of_dianzan_list: [],
      number_of_visit_list: [],
      ne:[],
    })
    //全局变量
    app.globalData.currentTab = e.detail.current;
    console.log(app.globalData.currentTab)
    if(app.globalData.currentTab==1){
      app.globalData.leibie_of_onshow='全部';
    }
    this.onLoad();
  },
  onLoad: function () {
    var that = this;

    wx.getStorage({
      key: 'openid',
      success(res) {
        that.setData({
          openid:res.data
        })
      }
    })

    wx.getStorage({
      key: 'userinfo',
      success: function (res) {
        that.setData({
          userinfo: res.data
        })
      },
    })

    const db = wx.cloud.database()
    db.collection(that.data.leibie[app.globalData.currentTab]).orderBy(that.data.leibie_paixu[app.globalData.currentTab], 'desc').get({
      success: function (res) {
        that.setData({
          ne: res.data
        })
        if(that.data.is_onshow_back==false){
          if (that.data.ne.length > 2) {
            that.setData({
              max: 2
            })
          } else {
            that.setData({
              max: that.data.ne.length
            })
          }
        }else{
          that.setData({
            is_onshow_back:false,
          })
        }
        for (var i = 0; i < that.data.ne.length; ++i) {
          var number_of_dian_list_temp = that.data.number_of_dianzan_list;
          number_of_dian_list_temp[i] = that.data.ne[i].number_of_dianzan;
          var number_of_visit_list_temp = that.data.number_of_visit_list;
          number_of_visit_list_temp[i]=that.data.ne[i].number_of_visit;
          var showview_temp=that.data.showview;
          showview_temp[i]=false;
          that.setData({
            showview:showview_temp,
            number_of_dianzan_list: number_of_dian_list_temp,
            number_of_visit_list:number_of_visit_list_temp,
          })
          if (that.data.ne[i].dianzan_list.length == 0) {
            var is_dianzan_list_temp=that.data.is_dianzan_list;
            is_dianzan_list_temp[i]=false;
            var dianzan_src_list_temp=that.data.dianzan_src_list;
            dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
            that.setData({
              is_dianzan_list:is_dianzan_list_temp,
              dianzan_src_list:dianzan_src_list_temp
            })
            continue;
          }
          for (var j = 0; j < that.data.ne[i].dianzan_list.length; ++j) {
            if (that.data.openid == that.data.ne[i].dianzan_list[j]) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = true;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞(2).png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
            if (j == that.data.ne[i].dianzan_list.length - 1) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = false;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
          }
        }
      }
    })
  },
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  LoadMorePosts: function () {
    var that = this;
    if (that.data.max >= that.data.ne.length) {
      wx.showModal({
        title: '提示',
        content: '没有更多了哦，请发帖叭',
        showCancel: false
      })
    } else {
      var newmax = that.data.max + 2
      that.setData({
        max: newmax
      })
    }
  },
  BindCommentsInput:function(e){
     var that=this;
     that.setData({
       bind_comments_text:e.detail.value
     })
  },
  BindSearchInput: function (e) {
    var key_words = e.detail.value;
    var that = this;
    that.setData({
      showview: [],
      show_image_of_shanchu: [],
      first_time: true,
      is_dianzan_list: [],
      dianzan_src_list: [],
      number_of_dianzan_list: [],
      number_of_visit_list: [],
      ne:[],
    })
    const db = wx.cloud.database()
    db.collection(that.data.leibie[app.globalData.currentTab]).where(db.command.or([
    {
      text: db.RegExp({
        regexp: '.*' + key_words + '.*',
        options: 'i',
      })
    },
    {
      poster: db.RegExp({
        regexp: '.*' + key_words + '.*',
        options: 'i',
      })
    }
    ])).orderBy(that.data.leibie_paixu[app.globalData.currentTab], 'desc').get({
      success: function (res) {
        that.setData({
          ne: res.data
        })
        if (that.data.ne.length > 2) {
          that.setData({
            max: 2
          })
        } else {
          that.setData({
            max: that.data.ne.length
          })
        }

        for (var i = 0; i < that.data.ne.length; ++i) {
          var number_of_dian_list_temp = that.data.number_of_dianzan_list;
          number_of_dian_list_temp[i] = that.data.ne[i].number_of_dianzan;
          var number_of_visit_list_temp = that.data.number_of_visit_list;
          number_of_visit_list_temp[i] = that.data.ne[i].number_of_visit;
          var showview_temp = that.data.showview;
          showview_temp[i] = false;
          that.setData({
            showview: showview_temp,
            number_of_dianzan_list: number_of_dian_list_temp,
            number_of_visit_list: number_of_visit_list_temp,
          })
          if (that.data.ne[i].dianzan_list.length == 0) {
            var is_dianzan_list_temp = that.data.is_dianzan_list;
            is_dianzan_list_temp[i] = false;
            var dianzan_src_list_temp = that.data.dianzan_src_list;
            dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
            that.setData({
              is_dianzan_list: is_dianzan_list_temp,
              dianzan_src_list: dianzan_src_list_temp
            })
            continue;
          }
          for (var j = 0; j < that.data.ne[i].dianzan_list.length; ++j) {
            if (that.data.openid == that.data.ne[i].dianzan_list[j]) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = true;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞(2).png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
            if (j == that.data.ne[i].dianzan_list.length - 1) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = false;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
          }
        }
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
    const db = wx.cloud.database()
    var i = e.target.dataset.index;
    if (that.data.dianzan_src_list[i] == 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png') {
      var temp = that.data.ne;
      temp[i].dianzan_list[temp[i].dianzan_list.length] = that.data.openid;
      var temp2=that.data.dianzan_src_list;
      temp2[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞(2).png';
      that.setData({
        ne: temp,
        dianzan_src_list:temp2,
      })





      //调用云函数 db_panel_comments
      wx.cloud.callFunction({
        name: 'db_dianzan',
        data: {
          leibie: that.data.leibie[app.globalData.currentTab],
          _id: that.data.ne[i]._id,
          dianzan_list: temp[i].dianzan_list
        },
      })


    } else {
      for (var j = 0; j < that.data.ne[i].dianzan_list.length; ++j) {
        if (that.data.ne[i].dianzan_list[j] == that.data.openid) {
          var temp = that.data.ne;
          temp[i].dianzan_list.splice(j, 1);
          var temp2 = that.data.dianzan_src_list;
          temp2[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
          that.setData({
            ne: temp,
            dianzan_src_list: temp2,
          })


          //调用云函数 db_panel_comments
          wx.cloud.callFunction({
            name: 'db_dianzan',
            data: {
              leibie: that.data.leibie[app.globalData.currentTab],
              _id: that.data.ne[i]._id,
              dianzan_list: temp[i].dianzan_list
            },
          })


          /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne[i]._id).update({
            data: {
              dianzan_list: temp[i].dianzan_list
            },
          })*/


          break;
        }
      }
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('已经刷新')
    wx.showToast({
      title: '正在刷新数据...',
      icon: 'loading',
      duration: 2000
    });
    
    wx: wx.stopPullDownRefresh();//停止刷新操作
  },
  Showpinglun:function(e){
    var that = this;
    var i = e.target.dataset.index;
    var showview_temp=that.data.showview;
    showview_temp[i]=!showview_temp[i];
    that.setData({
      showview:showview_temp
    })
  },
  Comments_fabu:function(e){
    var that = this;
    that.setData({
      input_empty:''
    })


    var i = e.target.dataset.index; 
    console.log(i);
    var comments_of_text =that.data.bind_comments_text;
    if(comments_of_text.length==0){
      wx.showModal({
        title: '提示',
        content: '评论不能为空噢',
        showCancel: false
      })
    }else{
      //获取评论时间
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + 8 * 60 * 60;
      var date = new Date(parseInt(timestamp) * 1000);
      var temp = date.toISOString();
      var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
      console.log(that.data.userinfo);
      var arr = { "0": that.data.userinfo.nickName, "1": that.data.userinfo.avatarUrl, "2": comments_of_text, "3": realtime,"4":that.data.openid };
      var comments_list = that.data.ne[i].comments;
      comments_list[comments_list.length]=arr;
      console.log(comments_list);



      //调用云函数 db_panel_comments
      const db = wx.cloud.database()
      wx.cloud.callFunction({
        name: 'db_panel_comments',
        data: {
          leibie: that.data.leibie[app.globalData.currentTab],
          _id: that.data.ne[i]._id,
          comments_list: comments_list
        },
        success:function(res){
          //更新前端的ne[]
          db.collection(that.data.leibie[app.globalData.currentTab]).orderBy(that.data.leibie_paixu[app.globalData.currentTab], 'desc').get({
            success: function (res) {
              that.setData({
                ne: res.data
              })
              wx.showToast({
                title: '评论成功',
                icon: 'success',
                duration: 2000
              });
            }
          })
        }
      })


      /*const db = wx.cloud.database()
      db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne[i]._id).update({
        data: {
          comments: comments_list
        },
        success:function(res){
          console.log(res)
          //更新前端的ne[]
          db.collection(that.data.leibie[app.globalData.currentTab]).orderBy(that.data.leibie_paixu[app.globalData.currentTab], 'desc').get({
            success: function (res) {
              that.setData({
                ne: res.data
              })
              wx.showToast({
                title: '评论成功',
                icon: 'success',
                duration: 2000
              });
            }
          })
        }
      })*/








    }
  },
  Comments_shanchu:function(e){
    var that = this;
    var i = e.target.dataset.i;
    var j = e.target.dataset.j;
    var new_ne=that.data.ne;
    new_ne[i].comments.splice(j,1);
    const db = wx.cloud.database()


    //调用云函数 db_panel_comments
    wx.cloud.callFunction({
      name: 'db_panel_comments',
      data: {
        leibie: that.data.leibie[app.globalData.currentTab],
        _id: that.data.ne[i]._id,
        comments_list: new_ne[i].comments
      },
      success: function (res) {
        that.setData({
          ne: new_ne
        })
        wx.showToast({
          title: '删除评论成功',
          icon: 'success',
          duration: 2000
        });
      }
    })




    /*db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne[i]._id).update({
      data: {
        comments:new_ne[i].comments
      },
      success:function(res){
        that.setData({
          ne:new_ne
        })
        wx.showToast({
          title: '删除评论成功',
          icon: 'success',
          duration: 2000
        });
      }
    })*/











  },
  Post_of_shanchu:function(e){
    var that = this;
    const db = wx.cloud.database();
    var i = e.target.dataset.i;
    wx.showModal({
      title: '提示',
      content: '确定要删除这条动态嘛',
      success(res) {
        if (res.confirm) {
          db.collection(that.data.leibie[app.globalData.currentTab]).doc(that.data.ne[i]._id).remove({
            success: function (res) {
              db.collection(that.data.leibie[app.globalData.currentTab]).orderBy(that.data.leibie_paixu[app.globalData.currentTab], 'desc').get({
                success: function (res) {
                  that.setData({
                    ne: res.data
                  })
                  wx.showToast({
                    title: '删除帖子成功',
                    icon: 'success',
                    duration: 2000
                  });
                }
              })
            }
          })
        } else if (res.cancel) {
        }
      }
    })
  },
  Click_of_yundong:function(e){
    var that = this;
    that.setData({
      showview: [],
      show_image_of_shanchu: [],
      first_time: true,
      is_dianzan_list: [],
      dianzan_src_list: [],
      number_of_dianzan_list: [],
      number_of_visit_list: [],
      ne:[],
    })
    const db = wx.cloud.database();
    var leibie;
    if (app.globalData.leibie_from_onshow==true){
      leibie = app.globalData.leibie_of_onshow;
    }else{
      leibie = e.target.dataset.leibie;
      app.globalData.leibie_of_onshow = leibie;
    }
    
    console.log(leibie);
    db.collection('experience').where({
      leibie:leibie,
    }).orderBy('number_of_visit', 'desc').get({
      success: function (res) {
        that.setData({
          ne: res.data
        })

        if (that.data.is_onshow_back == false) {
          if (that.data.ne.length > 2) {
            that.setData({
              max: 2
            })
          } else {
            that.setData({
              max: that.data.ne.length
            })
          }
        } else {
          that.setData({
            is_onshow_back: false,
          })
        }
        for (var i = 0; i < that.data.ne.length; ++i) {
          var number_of_dian_list_temp = that.data.number_of_dianzan_list;
          number_of_dian_list_temp[i] = that.data.ne[i].number_of_dianzan;
          var number_of_visit_list_temp = that.data.number_of_visit_list;
          number_of_visit_list_temp[i] = that.data.ne[i].number_of_visit;
          var showview_temp = that.data.showview;
          showview_temp[i] = false;
          that.setData({
            showview: showview_temp,
            number_of_dianzan_list: number_of_dian_list_temp,
            number_of_visit_list: number_of_visit_list_temp,
          })
          if (that.data.ne[i].dianzan_list.length == 0) {
            var is_dianzan_list_temp = that.data.is_dianzan_list;
            is_dianzan_list_temp[i] = false;
            var dianzan_src_list_temp = that.data.dianzan_src_list;
            dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
            that.setData({
              is_dianzan_list: is_dianzan_list_temp,
              dianzan_src_list: dianzan_src_list_temp
            })
            continue;
          }
          for (var j = 0; j < that.data.ne[i].dianzan_list.length; ++j) {
            if (that.data.openid == that.data.ne[i].dianzan_list[j]) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = true;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞(2).png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
            if (j == that.data.ne[i].dianzan_list.length - 1) {
              var is_dianzan_list_temp = that.data.is_dianzan_list;
              is_dianzan_list_temp[i] = false;
              var dianzan_src_list_temp = that.data.dianzan_src_list;
              dianzan_src_list_temp[i] = 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/点赞.png';
              that.setData({
                is_dianzan_list: is_dianzan_list_temp,
                dianzan_src_list: dianzan_src_list_temp
              })
              break;
            }
          }
        }
        if (app.globalData.leibie_from_onshow == false){
          var temp = '查询' + leibie + '成功';
          wx.showToast({
            title: temp,
            icon: 'success',
            duration: 2000
          });
        }else{
          app.globalData.leibie_from_onshow=false;
        }
      }
    })
  },
  Chakan_quanbu:function(){
    var that=this;
    that.setData({
      showview: [],
      show_image_of_shanchu: [],
      first_time: true,
      is_dianzan_list: [],
      dianzan_src_list: [],
      number_of_dianzan_list: [],
      number_of_visit_list: [],
      ne: [],
    })
    app.globalData.leibie_of_onshow ='全部';
    that.onLoad();
    wx.showToast({
      title: '查看全部成功',
      icon: 'success',
      duration: 2000
    });
  },
  Shouqi:function(){
    var that=this;
    that.setData({
      max:2
    })
  }

});