const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    list: [{
        name: 'fade',
        color: 'red',
        text:'闵行校区校车最新运行时刻表(最新版本)',
        url:'http://houqin.ecnu.edu.cn/ba/b7/c10868a178871/page.htm'
      },
      {
        name: 'scale-up',
        color: 'orange',
        text:'华师大校历',
        url:'https://www.ecnu.edu.cn/xiaoli/main.htm'
      }
    ],
    toggleDelay: false,



    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/华师大1 (4).jpg'
    }, {
      id: 1,
        type: 'image',
        url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/华师大1 (3).jpeg',
    }, {
      id: 2,
      type: 'image',
      url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/华师大1 (2).jpeg'
    }, {
      id: 3,
      type: 'image',
      url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/华师大1 (1).jpeg'
    }, {
      id: 4,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
    }],
  },
  onLoad() {
    this.towerSwiper('swiperList');
    // 初始化towerSwiper 传已有的数组名即可
  },
  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },
  toggle(e) {
    console.log(e);
    var anmiaton = e.currentTarget.dataset.class;
    var that = this;
    that.setData({
      animation: anmiaton
    })
    setTimeout(function() {
      that.setData({
        animation: ''
      })
    }, 1000)
  },
  toggleDelay() {
    var that = this;
    that.setData({
      toggleDelay: true
    })
    setTimeout(function() {
      that.setData({
        toggleDelay: false
      })
    }, 1000)
  },
  Goto_Tuisong:function(e){
    var that = this;
    console.log(e.currentTarget.dataset.url)

    wx.navigateTo({
      url: '../../zixun/zixun?url='+e.currentTarget.dataset.url,
    })
  }
})