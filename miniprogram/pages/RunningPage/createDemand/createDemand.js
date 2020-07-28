// miniprogram/pages/RunningPage/createDemand/createDemand.js
const TmplId = 'oGerw1ypzuEfReNGt1ijykBhLls6q3YKdaRvwvpplAg';
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
    duration: null,

    rendezvous: "操场",
    speed: ["较慢", '慢', "中", "快", '较快'],
    speedIndex: 2,

    gender: ["不限", "男", "女"],
    genderIndex: 0,

    maxmember: [2, 3, 4, 5],
    maxmemberIndex: 0,

    remark: "",
    demandId: "",
    iscreating: false,
    message_id: '',
    myposts: [],
    ballposts: [],
    posts_num: 0,
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
    that.MyRunBall()
  },

  validateNumber(val) { //数字限制
    return val.replace(/\D/g, '')
  },
  changeDuration: function (e) { //打球时长
    let value = this.validateNumber(e.detail.value)
    this.setData({
      duration: value
    })
  },
  bindDateChange: function (e) { //跑步日期
    this.setData({
      date: e.detail.value,
    })
    if (this.data.date == this.data.nowdate) {
      this.setData({
        datetoday: true,
      })
    } else {
      this.setData({
        datetoday: false,
      })
    }
  },
  bindTimeChange: function (e) { //跑步时间
    this.setData({
      time: e.detail.value
    })
  },
  bindSpeedChange: function (e) { //速度
    console.log('picker speedIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      speedIndex: e.detail.value
    })
  },
  bindGenderChange: function (e) { //性别
    console.log('picker genderIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      genderIndex: e.detail.value
    })
  },
  bindMaxmemberChange: function (e) { //人数上限
    console.log('picker maxmemberIndex 发生选择改变，携带值为', e.detail.value);
    this.setData({
      maxmemberIndex: e.detail.value
    })
  },
  textareaBInput: function (e) { //备注
    this.setData({
      remark: e.detail.value
    })
  },
  //拉取订阅消息权限
  Subscribe: function (item) {
    console.log('订阅消息详情', item)
    var that = this
    wx.requestSubscribeMessage({
      tmplIds: [TmplId],
      success(res) {
        console.log('调用订阅消息成功', res)
        if (res.oGerw1ypzuEfReNGt1ijykBhLls6q3YKdaRvwvpplAg === 'accept') {
          wx.cloud
            .callFunction({
              //通过调用云函数，实现用户点击允许我们发送订阅消息，
              //将该数据订阅保存到数据库，以便在满足条件的时候发送给用户
              name: 'subscribeMessage',
              data: {
                data: item,
                templateId: TmplId,
                //这个是给用户发送订阅消息后，用户点击订阅消息进入小程序的相关页面，一定要是在线的才可以
                page: 'pages/RuningPage/MainRun/MainRun',
              },
              success: res => {
                console.log('存进消息数据库的id', res.result._id)
                that.setData({
                  message_id: res.result._id
                })
                wx.showToast({
                  title: '订阅成功',
                  icon: 'success',
                  duration: 2000,
                });
              },
              fail: err => {
                console.log('订阅失败')
              }
            })
        } else {
          wx.showToast({
            title: '取消订阅',
            icon: 'success',
            duration: 2000,
          });
        }
      },
      fail(re) {
        console.log(re)
      },
    });
  },
  //我参加的所有运动存到data里
  MyRunBall: function (e) {
    var that = this
    const db_user = wx.cloud.database()
    var _id = wx.getStorageSync('_id')
    db_user.collection('mine').doc(_id).get({
      success: function (res) {
        var myposts = res.data.demandposts //存在mine里的demandposts，这个人发布的所有的帖子
        var ballposts = res.data.balldemandposts //存在mine里的balldemandposts，这个人发布的所有的约球帖子 
        var posts_num = res.data.yuepao ////存在mine里的demandposts_num，这个人发布的所有的跑步帖子数量
        console.log('我参加的球类运动', ballposts)
        that.setData({
          myposts: myposts,
          ballposts: ballposts,
          posts_num: posts_num
        })
      },
      fail: err => {
        wx.showToast({
          title: '未在数据库mine找到你的信息',
        })
        console.log('[数据库]mine[查询记录]失败：', err)
        that.setData({
          iscreating: false
        })
      }
    })
  },
  //创建帖子，提交
  submitDemand: function (e) {
    var that = this
    var userinfo = wx.getStorageSync('userinfo');
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //创建当前时间
    var vrun_time = this.data.date + ' ' + this.data.time //跑步时间
    var item = { //存进订阅消息
      //这里的变量名字一定要和从平台申请的模板所给的变量对应
      thing1: {
        value: '跑步'
      },
      thing4: {
        value: userinfo.nickName
      },
      thing3: {
        value: that.data.rendezvous
      },
      time2: {
        value: vrun_time
      },
    }
    console.log('存进订阅消息的时间', item.time2.value)
    that.setData({
      iscreating: true,
      run_time: vrun_time
    })
    if (vrun_time <= realtime) {
      wx.showModal({
        title: '提示',
        content: '只能创建现在之后的帖子哦',
        success: function (res) {
          if (res.confirm) {
            console.log('弹框后点确定')
          } else {
            console.log('弹框后点取消')
          }
        }
      })
      that.setData({
        iscreating: false
      })
    } else if (this.data.duration < 10) { //跑步时长要大于10分钟
      wx.showModal({
        title: '提示',
        content: '时长不能为空或小于10分钟',
        success: function (res) {
          if (res.confirm) {
            console.log('弹框后点取消')
          } else {
            console.log('弹框后点取消')
          }
        }
      })
      that.setData({
        iscreating: false
      })
    } else if (this.data.time > '22:00' || this.data.time < '06:00') { //跑步时间只能在6点后，22点前
      wx.showModal({
        title: '提示',
        content: '太晚了就不要出去溜达了',
        success: function (res) {
          if (res.confirm) {
            console.log('弹框后点取消')
          } else {
            console.log('弹框后点取消')
          }
        }
      })
      that.setData({
        iscreating: false
      })
    } else {
      var duration = this.data.duration
      var fi_time = new Date(Date.parse(vrun_time) + (60000 * duration) + 8 * 60 * 60 * 1000);
      var temp_finish = fi_time.toISOString();
      var finish_time = temp_finish.substring(0, 10) + ' ' + temp_finish.substring(11, 16); //跑步结束时间
      console.log('测试跑步结束时间', finish_time)

      //只允许创建三天内的帖子，三天后的时间
      var after_time = new Date(Date.parse(realtime) + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000);
      var temp_after = after_time.toISOString();
      var after_day = temp_after.substring(0, 10) + ' ' + temp_after.substring(11, 16); //三天后的时间
      console.log('测试三天后时间', after_day)

      const db_user = wx.cloud.database()
      var _id = wx.getStorageSync('_id')
      var _openid = wx.getStorageSync('openid');
      var myposts = that.data.myposts //存在mine里的demandposts，这个人发布的所有的帖子
      var ballposts = that.data.ballposts //存在mine里的balldemandposts，这个人发布的所有的约球帖子 
      var posts_num = that.data.posts_num ////存在mine里的demandposts_num，这个人发布的所有的跑步帖子数量
      console.log('我参加的跑步2', myposts)
      var time_conflict = 0 //是否有时间冲突
      for (let i = 0; i < myposts.length; i++) {
        if (vrun_time >= myposts[i].run_time && vrun_time <= myposts[i].finish_time) {
          time_conflict++
          break
        }
        if (finish_time >= myposts[i].run_time && finish_time <= myposts[i].finish_time) {
          time_conflict++
          break
        }
        if (finish_time >= myposts[i].finish_time && vrun_time <= myposts[i].run_time) {
          time_conflict++
          break
        }

      }
      for (let i = 0; i < ballposts.length; i++) {
        if (vrun_time >= ballposts[i].run_time && vrun_time <= ballposts[i].finish_time) {
          time_conflict++
          break
        }
        if (finish_time >= ballposts[i].run_time && finish_time <= ballposts[i].finish_time) {
          time_conflict++
          break
        }
        if (vrun_time <= ballposts[i].run_time && finish_time >= ballposts[i].finish_time) {
          time_conflict++
          break
        }
      }
      if (time_conflict != 0) {
        wx.showModal({
          title: '时间冲突',
          content: '这个点儿你应该在进行另一场运动呢',
          success: function (res) {
            if (res.confirm) {
              console.log('弹框后点确定')
            } else {
              console.log('弹框后点取消')
            }
          }
        })
        that.setData({
          iscreating: false
        })
      } else if (vrun_time > after_day) {
        wx.showModal({
          title: '提示',
          content: '只允许创建3天内的帖子哦',
          success: function (res) {
            if (res.confirm) {
              console.log('弹框后点取消')
            } else {
              console.log('弹框后点取消')
            }
          }
        })
        that.setData({
          iscreating: false
        })
      } else {
        console.log('订阅帖子准备', item)
        that.Subscribe(item) //调用订阅帖子函数
        var joinerinfo = {
          "avatarUrl": userinfo.avatarUrl,
          "gender": userinfo.gender,
          "jion_time": realtime,
          "nick_name": userinfo.nickName,
          "openid": _openid,
          "read_news": 0
        }
        var memberArr = [joinerinfo] //将创建者的信息放入成员数组中
        wx.cloud.callFunction({ //调用云函数创建帖子
          name: 'db_creatdpost',
          data: {
            _openid: _openid,
            duration: duration,
            finish_time: finish_time,
            gender_require: that.data.genderIndex,
            max_num: that.data.maxmember[that.data.maxmemberIndex],
            members: memberArr,
            num_of_people: 1,
            post_time: realtime,
            poster: userinfo.nickName,
            poster_gender: userinfo.gender,
            remark: that.data.remark,
            rendezvous: that.data.rendezvous,
            run_time: that.data.run_time,
            speed_require: that.data.speedIndex,
            src_of_avatar: userinfo.avatarUrl,
          },
          success: rescp => {
            that.setData({
              demandId: rescp.result._id
            })
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1]; //当前页面
            var prevPage = pages[pages.length - 2]; //上一个页面
            //直接调用上一个页面对象的myUpdate()方法，把上一页面更新
            prevPage.myUpdate()

            var tempmypost = { //要创建的这个帖子
              creator: true,
              finish_time: finish_time,
              post_id: rescp.result._id,
              run_time: vrun_time
            }
            myposts[posts_num] = tempmypost
            posts_num++;
            db_user.collection('mine').doc(_id).update({ //更新我的里面用户创建的帖子
              data: {
                demandposts: myposts,
                yuepao: posts_num,
              },
              success: ress => {
                console.log('[数据库]mine[更新记录] 成功')
              },
              fail: err => {
                wx.showToast({
                  title: 'mine更新失败',
                })
                console.log('[数据库]mine[更新记录] 失败')
                that.setData({
                  iscreating: false
                })
              }
            })
            that.setData({
              iscreating: true
            })
            wx.showToast({
              title: '创建需求成功',
              duration: 2000,
              success: function (resss) {
                wx.navigateBack({
                  complete: (res) => {},
                })
              }
            })
            console.log('[数据库]demandposts[新增记录]成功，记录 _id', rescp.result._id)

          },
          fail: err => {
            wx.showToast({
              title: '创建需求失败',
              duration: 2000,
            })
            console.log('[数据库]demandposts[新增记录]失败：', err)
            that.setData({
              iscreating: false
            })
          }
        })
      }

    }

  },
  //重置
  ResetPost: function () {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    this.setData({
      rendezvous: "操场",
      date: temp.substring(0, 10),
      time: temp.substring(11, 16),
      maxmemberIndex: 0,
      genderIndex: 0,
      speedIndex: 2,
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