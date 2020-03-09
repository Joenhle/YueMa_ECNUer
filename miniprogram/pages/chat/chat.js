Page({

  data: {
    //1 用户基本信息 openid userinfo
    openid: '',
    userinfo: '',
    //2 聊天室id 从约跑的详细页面获取,这里先做实例
    _id:'',
    //3 聊天室信息
    chat: [],
    //4 检测键盘是否展开
    is_keyboard:false,

    //5 上传的图片的urls
    urls:[],

    //6 判断是否点击了发送按钮
    is_send_click:false,

    input_empty: '',
    input_value: '',
    InputBottom: 0
  },
  Friends:function(){
    var that = this
    wx.navigateTo({
      url: '../chat_friends/chat_friends?_id='+that.data._id,
    })
  },
  PreviewImage: function (e) {
    var that = this
    var urls = [];
    for(var i =0 ;i<that.data.chat.length;++i){
      var temp = that.data.chat[i]
       
      if (temp[5]=='image'){
         urls[urls.length]=temp[2]
       }
    }
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: urls// 需要预览的图片http链接列表  
    })
  },
  InputFocus(e) {
    this.setData({
      is_keyboard: true
    })
    //3 将页面拉到最下面
    wx.pageScrollTo({
      scrollTop: 2000000,
      duration: 0
    })
    this.setData({
      InputBottom: e.detail.height,
    })
    
  },
  InputBlur(e) {
    this.setData({
      InputBottom: 0,
      is_keyboard:false
    })
  },
  bindinput: function(e) {
    var that = this
    that.setData({
      input_value: e.detail.value
    })
  },
  /*
     Send()
     说明：完成页面发送按钮的功能
   */
  Send: function(e) {

    var that = this
    //1.先更新输入框的数据
    that.setData({
      input_empty: '',
      is_send:true,
      is_send_click:true,
    })

    //2.再发送消息
    var input = that.data.input_value;
    //保存在input后立马将input_value刷新为'',防止再次发送成功
    that.setData({
      input_value: ''
    })
    if (input.length == 0) {
      wx.showModal({
        title: '提示',
        content: '消息不能为空噢',
        showCancel: false
      })
    } else {
      //获取评论时间
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + 8 * 60 * 60;
      var date = new Date(parseInt(timestamp) * 1000);
      var temp = date.toISOString();
      var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);

      var arr = {
        "0": that.data.userinfo.nickName,
        "1": that.data.userinfo.avatarUrl,
        "2": input,
        "3": realtime,
        "4": that.data.openid,
        "5":'text'
      };
      var chat = that.data.chat;
      chat[chat.length] = arr;
      const db = wx.cloud.database()
      wx.cloud.callFunction({
        name: 'db_chat_update',
        data: {
          dbname: 'DemandPosts',
          _id: that.data._id,
          chat: chat
        },
        success: function(res) {
          //成功上传至数据库后再立马获取chat
          db.collection('DemandPosts').doc(that.data._id).get({
            success: function(res) {
              that.setData({
                chat:res.data.chat
              })
              wx.pageScrollTo({
                scrollTop: 200000,
                duration: 300
              })
            },
            fail:function(res){
              wx.showToast({
                title: '获取信息失败',
                icon: 'fail',
                duration: 2000
              });
            }
          })
        },
        fail: function(res) {
          console.log(res)
          wx.showToast({
            title: '发送失败',
            icon: 'fail',
            duration: 2000
          });
        }
      })
    }
  },
  Send_images:function(e){
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9 
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
      success: function (res) {
        if (res.tempFilePaths.length > 0) {  
          var img_url = res.tempFilePaths
          for (let i = 0; i < img_url.length; i++) {
            var timestamp = Date.parse(new Date());
            var geshu_of_image = img_url[i].match(/\.[^.]+?$/)[0];
            var image_of_cloudPath = that.data.userinfo.nickName + '_' + timestamp + i + geshu_of_image;
            wx.cloud.uploadFile({
              cloudPath: image_of_cloudPath,
              filePath: img_url[i],
              success(res) {
                console.log(res.fileID);

                //获取评论时间
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000 + 8 * 60 * 60;
                var date = new Date(parseInt(timestamp) * 1000);
                var temp = date.toISOString();
                var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);

                var arr = {
                  "0": that.data.userinfo.nickName,
                  "1": that.data.userinfo.avatarUrl,
                  "2": res.fileID,
                  "3": realtime,
                  "4": that.data.openid,
                  "5":'image'
                };
                var chat = that.data.chat;
                chat[chat.length] = arr;
                const db = wx.cloud.database()
                wx.cloud.callFunction({
                  name: 'db_chat_update',
                  data: {
                    dbname: 'DemandPosts',
                    _id: that.data._id,
                    chat: chat
                  },
                  success: function (res) {
                    //成功上传至数据库后再立马获取chat
                    db.collection('DemandPosts').doc(that.data._id).get({
                      success: function (res) {
                        that.setData({
                          chat: res.data.chat
                        })
                        wx.pageScrollTo({
                          scrollTop: 200000,
                          duration: 300
                        })
                      },
                      fail: function (res) {
                        wx.showToast({
                          title: '获取信息失败',
                          icon: 'fail',
                          duration: 2000
                        });
                      }
                    })
                  },
                  fail: function (res) {
                    console.log(res)
                    wx.showToast({
                      title: '发送失败',
                      icon: 'fail',
                      duration: 2000
                    });
                  }
                })
              }
            })
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that =this;
    const db = wx.cloud.database()
    var members = [];
    db.collection('DemandPosts').doc(that.data._id).get({
      success: function (res) {
        members = res.data.members
        for(var i=0;i<members.length;++i){
          if(that.data.openid==members[i].openid){
            members[i].read_news = that.data.chat.length
          }
        }
        console.log(members)

        //调用云函数 db_panel_comments
        wx.cloud.callFunction({
          name: 'db_chat_readnews',
          data: {
            dbname:'DemandPosts',
            _id: that.data._id,
            members:members
          }
        })
      }
    })

  },

  onLoad: function(options) {
    var that = this;
    that.setData({
      _id:options._id
    })
    console.log(options)
    //1. 先获取存在缓存区里的openid 和 userinfo
    wx.getStorage({
      key: 'openid',
      success(res) {
        that.setData({
          openid: res.data
        })
      }
    })
    wx.getStorage({
      key: 'userinfo',
      success: function(res) {
        that.setData({
          userinfo: res.data
        })
      },
    })

    //2. 再获取数据库里该聊天室的信息
    const db = wx.cloud.database()
    db.collection('DemandPosts').where({
      _id: that.data._id
    }).get({
      success: function(res) {
        that.setData({
          chat: res.data[0].chat
        })
        //3 将页面拉到最下面
        wx.pageScrollTo({
          scrollTop: 2000000,
          duration: 300
        })
      }
    })

    //4. 再实时的进行数据库数据监控
    const watcher = db.collection('DemandPosts').doc(that.data._id)
      .watch({
        onChange: function (snapshot) {
          that.setData({
            chat: snapshot.docs[0].chat
          })
          var temp = that.data.input_value
          wx.pageScrollTo({
            scrollTop: 2000000,
            duration: 0
          })
          if (that.data.is_keyboard==true) {
            that.setData({
              input_empty: temp
            })
          }
        
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })
    // ...
    // 等到需要关闭监听的时候调用 close() 方法
    //watcher.close()
  },
})