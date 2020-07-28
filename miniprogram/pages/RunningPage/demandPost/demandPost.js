// miniprogram/pages/RunningPage/demandPost/demandPost.js
const TmplId = 'oGerw1ypzuEfReNGt1ijykBhLls6q3YKdaRvwvpplAg';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    demandPost: {},
    userinfo: {},
    openid: '',
    usergender: 1,
    speed: ["较慢", '慢', "中", "快", '较快'],
    gender: ["不限", "男", "女"],
    members: [],
    num_of_people: 0,
    post_id: '',
    gender_require: 0,
    is_partof: false,
    is_collected: false,
    not_gender: true,
    isjoining: false,
    is_history: false,
    unread_news: 0,
    hasonshow: false,
    first_enter: true,
    message_id: '',
    myposts: [],
    ballposts: [],
    posts_num: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    const db = wx.cloud.database();
    var post_id = options.post_id;
    var is_history = false;
    if (options.is_history == 'true')
      is_history = true
    that.setData({
      post_id: post_id,
      is_history: is_history
    })
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
    db.collection('DemandPosts').doc(post_id).get({
      success: function (res) {
        console.log('帖子详情', res)
        that.setData({
          demandPost: res.data,
          num_of_people: res.data.num_of_people,
          gender_require: res.data.gender_require,
          members: res.data.members
        })
        var members = res.data.members
        console.log('所有成员数组', members)
        for (let i = 0; i < members.length; i++) {
          if (members[i]["openid"] == that.data.openid) {
            that.setData({
              is_partof: true
            })
          }
        }

        if (that.data.gender_require == 0) {
          that.setData({
            not_gender: false
          })
        } else if (that.data.usergender == that.data.gender_require) {
          that.setData({
            not_gender: false
          })
        } else {
          that.setData({
            not_gender: true
          })
        }

        //新添
        var read_news = 0;
        var unread_news = 0;
        for (var i = 0; i < that.data.demandPost.members.length; ++i) {
          if (that.data.demandPost.members[i].openid == that.data.openid) {
            read_news = that.data.demandPost.members[i].read_news
          }
        }
        if (that.data.demandPost.chat.length - read_news > 99) {
          unread_news = '99+'
        } else {
          unread_news = that.data.demandPost.chat.length - read_news
        }
        that.setData({
          unread_news: unread_news
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
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    that.MyRunBall()
  },

  Liaotianshi: function (e) {
    //先判断有没有登录
    if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }

    var that = this;
    wx.navigateTo({
      url: '/pages/chat/chat?_id=' + that.data.post_id + '&members=' + that.data.demandPost.members,
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
                console.log('订阅通知函数返回值', res)
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
                wx.showToast({
                  title: '订阅失败',
                  icon: 'success',
                  duration: 2000,
                });
              }
            })
            .catch(() => {
              wx.showToast({
                title: '订阅失败',
                icon: 'success',
                duration: 2000,
              });
            });
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
  //加入跑步
  Jion_running: function (e) {
    //先判断有没有登录
    if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }

    var that = this
    that.setData({
      isjoining: true
    })
    //获取加入时间
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);

    var is_history = that.data.is_history
    var user_id = wx.getStorageSync('_id');
    var _openid = wx.getStorageSync('openid');
    var userinfo = wx.getStorageSync('userinfo');
    var item = { //存进订阅消息
      //这里的变量名字一定要和从平台申请的模板所给的变量对应
      thing1: {
        value: '跑步'
      },
      thing4: {
        value: that.data.demandPost.poster
      },
      thing3: {
        value: that.data.demandPost.rendezvous
      },
      time2: {
        value: that.data.demandPost.run_time
      },
    }
    var myposts = that.data.myposts //存在mine里的demandposts，这个人发布的所有的帖子
    var ballposts = that.data.ballposts //存在mine里的balldemandposts，这个人发布的所有的约球帖子 
    console.log('我参加的跑步2', myposts)
    var vrun_time = that.data.demandPost.run_time
    var finish_time = that.data.demandPost.finish_time
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
    } else {
      console.log('存进订阅消息的时间', item.time2.value)
      that.Subscribe(item) //调用订阅帖子函数
      var post_id = that.data.post_id
      const db = wx.cloud.database();
      db.collection('DemandPosts').doc(post_id).get({
        success: function (dbres) {
          var max_num = dbres.data.max_num
          var num_of_people = dbres.data.num_of_people
          if (num_of_people < max_num) {
            var joinerinfo = {
              "avatarUrl": userinfo.avatarUrl,
              "gender": userinfo.gender,
              "jion_time": realtime,
              "nick_name": userinfo.nickName,
              "openid": _openid,
              "read_news": 0,
            }

            var temppost = that.data.demandPost //帖子详情
            var run_time = temppost.run_time //跑步时间
            var finish_time = temppost.finish_time //跑步结束时间
            var the_id = temppost._id //帖子id
            var now_num = that.data.num_of_people + 1
            temppost.members[temppost.num_of_people] = joinerinfo
            console.log('需求帖子用户数组', temppost.members)
            //调用云函数 db_jionRunning更新帖子里的用户数组和用户数量
            wx.cloud.callFunction({
              name: 'db_jionRunning',
              data: {
                post_id: that.data.post_id,
                members: temppost.members,
                num_of_people: now_num
              },
              success: res => {
                that.setData({
                  demandPost: temppost
                })
                console.log('检测调用上一页面', is_history)
                if (!is_history) {
                  console.log('进入调用上一页面', is_history)
                  var pages = getCurrentPages();
                  var currPage = pages[pages.length - 1]; //当前页面
                  var prevPage = pages[pages.length - 2]; //上一个页面
                  //直接调用上一个页面对象的myUpdate()方法，把上一页面更新
                  prevPage.myUpdate()
                  console.log('调用上一页面成功')
                }
                //成功加入，将信息保存到mine数据库里
                const db = wx.cloud.database();
                db.collection('mine').doc(user_id).get({
                  success: function (mires) {
                    var myposts = mires.data.demandposts; //参加的跑步帖子数组
                    var yuetime = mires.data.yuepao; //跑步次数
                    var tempmypost = { //要创建的这个帖子
                      creator: false,
                      finish_time: finish_time,
                      post_id: the_id,
                      run_time: run_time
                    }
                    myposts[yuetime] = tempmypost
                    yuetime++;
                    db.collection('mine').doc(user_id).update({ //更新我的里面用户创建的帖子
                      data: {
                        demandposts: myposts,
                        yuepao: yuetime,
                      },
                      success: ress => {
                        console.log('[数据库]mine[更新记录] 成功')
                      },
                      fail: err => {
                        wx.showToast({
                          title: 'mine更新失败',
                        })
                        console.log('[数据库]mine[更新记录] 失败')
                      }
                    })
                  },
                  fail: err => {
                    wx.showModal({
                      title: '提示',
                      content: '请先完成注册',
                      success: function (res) {
                        wx.redirectTo({
                          url: '',
                        })
                      }
                    })
                    console.log('[数据库]mine[查询记录]失败：', err)
                  }
                })
                wx.showToast({
                  title: '加入需求成功',
                  success: function (res) {
                    wx.navigateBack({
                      complete: (res) => {},
                    })
                  }
                })
              },
              fail: err => {
                console.error('[数据库]demandposts[更新记录] 失败：', err)
                wx.showToast({
                  title: '加入需求失败',
                })
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '不好意思，刚刚有人抢先一步加入了跑步',
              success: function (res) {
                if (!is_history) {
                  var pages = getCurrentPages();
                  var currPage = pages[pages.length - 1]; //当前页面
                  var prevPage = pages[pages.length - 2]; //上一个页面
                  //直接调用上一个页面对象的myUpdate()方法，把上一页面更新
                  prevPage.myUpdate()
                }
                wx.navigateBack({
                  complete: (res) => {},
                })
              }
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库]demandposts[查询记录] 失败：', err)
        }
      })
    }
  },

  Quit_team: function () {
    //先判断有没有登录
    if (app.globalData.is_denglu == false) {
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../mine_all/mine/mine',
            })
          }
        }
      })
      return
    }

    var that = this
    var is_history = that.data.is_history
    wx.showModal({
      title: '提示',
      content: '你真的要退出吗,退出会扣除你的信誉哦',
      success: function (res) {
        if (res.confirm) {
          console.log('弹框后点确定')
          if (!is_history) {
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1]; //当前页面
            var prevPage = pages[pages.length - 2]; //上一个页面
            //直接调用上一个页面对象的myUpdate()方法，把上一页面更新
            prevPage.myUpdate()
          }
          var members = that.data.members
          var num_of_people = that.data.demandPost.num_of_people
          var _id = wx.getStorageSync('_id');
          var post_id = that.data.post_id
          if (that.data.openid == that.data.demandPost._openid) {
            const db = wx.cloud.database();
            db.collection('DemandPosts').doc(post_id).remove({
              success: mineres => {
                console.log('数据库demandposts删除成功', mineres)
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '删除失败',
                })
                console.error('[数据库]demandposts[删除记录] 失败：', err)
              }
            })
          } else {
            for (let i = 0; i < members.length; i++) {
              if (members[i]["openid"] == that.data.openid) {
                members.splice(i, 1);
                break;
              }
            }
            num_of_people--;
            console.log('减少后的成员数组', members);
            const db = wx.cloud.database();
            db.collection('DemandPosts').doc(post_id).update({
              data: {
                members: members,
                num_of_people: num_of_people,
              },
              success: dpres => {
                console.log('demandposts删除一人成功', dpres)
              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '退出失败',
                })
                console.error('[数据库]demandpos[更新记录] 失败：', err)
              }
            })
          }
          if (!is_history) {
            var pages = getCurrentPages();
            var currPage = pages[pages.length - 1]; //当前页面
            var prevPage = pages[pages.length - 2]; //上一个页面
            //直接调用上一个页面对象的myUpdate()方法，把上一页面更新
            prevPage.myUpdate()
            console.log('更新上一页面数据')
          }
          const db = wx.cloud.database();
          db.collection('mine').doc(_id).get({ //先获取mine里的跑步帖子数组
            success: function (mires) {
              var myposts = mires.data.demandposts; //参加的跑步帖子数组
              var yuetime = mires.data.yuepao; //跑步次数
              for (let i = yuetime - 1; i >= 0; i--) {
                if (myposts[i].post_id == post_id) {
                  myposts.splice(i, 1);
                  break
                }
              }
              console.log('减少后的跑步数组', myposts);
              yuetime--;
              db.collection('mine').doc(_id).update({ //更新我的里面用户创建的帖子
                data: {
                  demandposts: myposts,
                  yuepao: yuetime,
                },
                success: ress => {
                  console.log('[数据库]退出mine[更新记录] 成功')
                },
                fail: err => {
                  wx.showToast({
                    title: 'mine更新失败',
                  })
                  console.log('[数据库]mine[更新记录] 失败')
                }
              })
            },
            fail: err => {
              console.log('[数据库]mine[查询记录]失败：', err)
            }
          })
          wx.showToast({
            title: '退出需求成功',
            success: function (res) {
              wx.navigateBack({
                complete: (res) => {},
              })
            }
          })

        } else {
          console.log('弹框后点取消，取消退出')
        }
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
    if (this.data.first_enter == true) {
      this.setData({
        first_enter: false
      })
      return
    }
    this.setData({
      unread_news: 0
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