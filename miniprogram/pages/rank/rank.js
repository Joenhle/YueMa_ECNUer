// miniprogram/pages/rank/rank.js

const db = wx.cloud.database();
Page({
  data: {
    openid: '',
    list: [],
    list_qiansan: [],
    me: [],
    bangwai: false,
    curentTap:0,
    exercise:0,
    title:'一诺千金榜'
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      openid:wx.getStorageSync('_openid')
    })
    that.Get_score_rank()
    that.exercise_get()
  },
  bind_qianjin:function(){
    this.setData({
      curentTap:0,
      bangwai:false,
      title:'一诺千金榜'
    })
    this.Get_score_rank();
  },
  bind_daren:function(){
    this.setData({
      bangwai:false,
      curentTap:1,
      title:'运动达人榜'
    })
    this.Get_yundong_rank();
  },
  Get_score_rank: function () {
    var that = this;
    const db = wx.cloud.database()
    //客官请稍等
    that.setData({
      loadModal: true
    })
    db.collection('mine').orderBy('score', 'desc').get({
      success: function (res) {
        that.setData({
          list_qiansan: res.data.slice(0, 3),
          list: res.data.slice(3)
        })
        var list_qiansan = that.data.list_qiansan
        var list = that.data.list
        for (let i = 0; i < list_qiansan.length; ++i) {
          if (list_qiansan[i].nickName.length > 3) {
            list_qiansan[i].nickName = list_qiansan[i].nickName.slice(0, 3) + '..'
            that.setData({
              list_qiansan: list_qiansan,
            })
          }
        }
        for (let j = 0; j < list.length; ++j) {
          if (list[j].nickName.length > 9) {
            list[j].nickName = list[j].nickName.slice(0, 9) + '...'
            that.setData({
              list: list
            })
          }
        }

        for (let k = 0; k < res.data.length; ++k) {

          if (res.data[k]._openid == that.data.openid) {
            break;
          }
          if (k == res.data.length - 1) {
            that.setData({
              bangwai: true
            })
          }
        }
        that.setData({
          loadModal: false
        })
      }
    })
    db.collection('mine').where({
      _openid: that.data.openid
    }).get({
      success: function (res) {
        that.setData({
          me: res.data
        })
      }
    })
  },
  exercise_get:function() {//拿到锻炼的数据
    var that=this
   
    db.collection("mine").where({
      _openid:that.data.openid
    }).get({
      success: function (res) {
        console.log(res)
        that.setData({
         run_records:res.data[0].run_records.reverse()
         })
         console.log(that.data.run_records)
         that.getExerciseNum();
        } 
    })
  },
  getExerciseNum:function () {//得到最近20次锻炼的记录求和，更新数据库
    for(let i=0;i< this.data.run_records.length;i++){
      this.setData({
        exercise:this.data.exercise+this.data.run_records[i].energy
      })
    }
    console.log(this.data.exercise)
    db.collection("mine").doc(wx.getStorageSync('_id')).update({
      data:{
        exercise:this.data.exercise
      }
    })
  },
  Get_yundong_rank: function () {
    var that = this;
    const db = wx.cloud.database()
    //客官请稍等
    that.setData({
      loadModal: true
    })
    db.collection('mine').orderBy('exercise', 'desc').get({
      success: function (res) {
        that.setData({
          list_qiansan: res.data.slice(0, 3),
          list: res.data.slice(3)
        })
        var list_qiansan = that.data.list_qiansan
        var list = that.data.list
        for (let i = 0; i < list_qiansan.length; ++i) {
          if (list_qiansan[i].nickName.length > 3) {
            list_qiansan[i].nickName = list_qiansan[i].nickName.slice(0, 3) + '..'
            that.setData({
              list_qiansan: list_qiansan,
            })
          }
        }
        for (let j = 0; j < list.length; ++j) {
          if (list[j].nickName.length > 9) {
            list[j].nickName = list[j].nickName.slice(0, 9) + '...'
            that.setData({
              list: list
            })
          }
        }

        for (let k = 0; k < res.data.length; ++k) {
          console.log
          if (res.data[k]._openid == that.data.openid) {
            break;
          }
          if (k == res.data.length - 1) {
            that.setData({
              bangwai: true
            })
          }
        }
        that.setData({
          loadModal: false
        })
      }
    })
    db.collection('mine').where({
      _openid: that.data.openid
    }).get({
      success: function (res) {
        that.setData({
          me: res.data
        })
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