const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    _id:'',
    pinyin: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [] ],
    pinyin_temp: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
  },
  onLoad(e) {
    var that = this
    const db = wx.cloud.database()
    var py= require('../../utils/pinyin.js')
    that.setData({
      _id:e._id
    })

    db.collection('DemandPosts').doc(that.data._id).get({
      success: function (res) {
        var members = res.data.members
        var temp = that.data.pinyin
        for(var i=0;i<members.length;++i){
  
          var index = String(py.py.getWord(members[i].nick_name[0])['l']).charCodeAt(0) - String(py.py.getWord('a')['l']).charCodeAt(0)
          temp[index].push(members[i])
          
        }
        that.setData({
          pinyin: temp,
          pinyin_temp:temp
        })
      }
    })
      

    let list = [];
    for (let i = 0; i < 20; i++) {
      list[i] = String.fromCharCode(65 + i)
    }
    this.setData({
      list: list,
      listCur: list[0]
    })
  },
  Search:function(e){
    var that = this;
    var key = e.detail.value
    if(key == ''){
      that.setData({
        pinyin:that.data.pinyin_temp
      })
    }else{
      var temp = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
      for (var i = 0; i < that.data.pinyin.length;++i){
        for (var j = 0; j < that.data.pinyin[i].length;++j){
          if (String(that.data.pinyin[i][j]['nick_name']).indexOf(key)!=-1){
            temp[i].push(that.data.pinyin[i][j])
          }
        }
      }
      that.setData({
        pinyin:temp
      })
    }
  },



  onReady() {
    let that = this;
    wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function(res) {
      that.setData({
        boxTop: res.top
      })
    }).exec();
    wx.createSelectorQuery().select('.indexes').boundingClientRect(function(res) {
      that.setData({
        barTop: res.top
      })
    }).exec()
  },
  //获取文字信息
  getCur(e) {
    this.setData({
      hidden: false,
      listCur: this.data.list[e.target.id],
    })
  },

  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur
    })
  },
  //滑动选择Item
  tMove(e) {
    let y = e.touches[0].clientY,
      offsettop = this.data.boxTop,
      that = this;
    //判断选择区域,只有在选择区才会生效
    if (y > offsettop) {
      let num = parseInt((y - offsettop) / 20);
      this.setData({
        listCur: that.data.list[num]
      })
    };
  },

  //触发全部开始选择
  tStart() {
    this.setData({
      hidden: false
    })
  },

  //触发结束选择
  tEnd() {
    this.setData({
      hidden: true,
      listCurID: this.data.listCur
    })
  },
  indexSelect(e) {
    let that = this;
    let barHeight = this.data.barHeight;
    let list = this.data.list;
    let scrollY = Math.ceil(list.length * e.detail.y / barHeight);
    for (let i = 0; i < list.length; i++) {
      if (scrollY < i + 1) {
        that.setData({
          listCur: list[i],
          movableY: i * 20
        })
        return false
      }
    }
  }
});