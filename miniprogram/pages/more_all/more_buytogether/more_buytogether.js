// pages/more_buytogether/more_buytogether.js
const app = getApp()
Page({
  data: {
    bnrUrl: [{  //轮播图
      url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15816023090000.png'
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15816023090001.jfif"
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15816023090002.jfif"
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15816023090003.jfif"
    }],
    routers: [  //6个图片选项
      {
        name: '奶茶',
        url: '../../../images/more/buytogether_1.png',
      },
      {
        name: '外卖',
        url: '../../../images/more/buytogether_2.png',
      },
      {
        name: '旅行',
        url: '../../../images/more/buytogether_3.png',
      },
      {
        name: '淘宝',
        url: '../../../images/more/buytogether_4.png',
      },
      {
        name: '快递代送',
        url: '../../../images/more/buytogether_5.png',
      },
      {
        name: '其他',
        url: '../../../images/more/buytogether_6.png',
      }
    ],
    buytogether: [],    //数据库名称
    inputValue: '', //搜索的内容
    id: 'pingdan', //根据id决定发布的选择器和placeholder
    click_publish:true ,//点击事件触发发布事件
    click_search:false,//点击触发搜索事件
    search_what:'',//搜索哪个
    page: 0,//数据分页
    reachBottom: false,//是否到达底部
    previewImage: false,//如果是预览图片返回则不用刷新页面
    detail:false,//是否看详细页面
    look_avatar:false,//看头像不刷新
    once:true,//第一次进入刷新页面
    Is_delete_index:0,//要删除的的下标
  },
  choosewhat: function (e) {//选择显示的分类页面（奶茶，外卖等）
    this.setData({
      search_what: e.currentTarget.dataset.index,
      page: 0,
      buytogether: [],
      click_search: false
    })
    console.log(this.data.search_what)
    this.getData();
  },
  change: function () { //点击事件跳转发布页面
    var click_publish = this.data.click_publish;
    this.setData({
      click_publish: false
    }),
      wx.navigateTo({
        url: '../more_buytogether_add/more_buytogether_add?id=' + this.data.id
      })
  },
  inputBind: function (event) { //搜索框文本内容显示
    this.setData({
      inputValue: event.detail.value
    })
    console.log('输入为: ' + this.data.inputValue)
  },
  search: function () { //搜索功能
    this.setData({
      click_search: true,
      page: 0,
      buytogether: []
    })
    this.getData();
    console.log('查询结束')
  },
  PreviewImage: function (e) { //图片预览
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
    this.setData({
      previewImage: true
    })
  },
  pandingPage: function (length) {//判定取得的数据是否为空，或是是否加载没有更多数据了
    if (this.data.page == 0 && length == 0) {//如果页面为0且数据为0,此时没有上拉
      wx.showToast({
        title: '等待您添加呢~',
        icon: 'none'
      })
    }
    else if (length == 0) {
      wx.showToast({
        title: '没有更多数据了',
        icon: 'none'
      })
    }
    else {
      wx.showToast({
        title: '加载成功',
        icon: 'success'
      })
    }
  },
  onReachBottomgetData: function (cloudData) {//触底则触发数据拼接
    console.log(cloudData)
    var arr1 = this.data.buytogether; //从data获取当前datalist数组
    var arr2 = cloudData; //从此次请求返回的数据中获取新数组
    arr1 = arr1.concat(arr2); //合并数组
    this.setData({
      buytogether: arr1,
      reachBottom: false,
    })
    console.log('当前的页大小为' + this.data.page)
    this.pandingPage(arr2.length)
  },
  onReachBottom: function () {  //到达底部触发刷新事件
    console.log("下拉加载中")
    this.setData({
      reachBottom: true
    })
    this.getData();
    wx.showToast({
      title: '正在加载中',
      icon: 'loading',
      duration: 1500
    })
  },
  onShow: function () {//监听返回页面
    console.log('onshow')
    if(app.globalData.Is_delete==true){
      app.globalData.Is_delete=false
      console.log(this.data.Is_delete_index)
        this.data.buytogether.splice(this.data.Is_delete_index,1)
        this.setData({
          buytogether:this.data.buytogether
        })
    }
    if(this.data.previewImage==true){//图片预览则不刷新
      this.setData({
        previewImage:false
      })
    }
    else if(this.data.detail==true){//看详细页面不刷新
      this.setData({
        detail:false
      })
    }
    else if(this.data.look_avatar==true){//看头像不刷新
      this.setData({
        look_avatar:false
      })
    }
    else if(this.data.once==true){//第一次进入不刷新
      this.setData({
        once:false
      })
    }
    else{//否则刷 新
      console.log('shuaxin')
      this.setData({
      click_publish: true,
      click_search: false,
      search_what: '',
      page:0,
      buytogether:[]
    })
    this.getData();
  }
  },
  onPullDownRefresh: function () {// 页面相关事件处理函数--监听用户下拉动作
    console.log("下拉中")
    this.setData({
      page:0
    })
    wx.showNavigationBarLoading() //在标题栏中显示加载
    setTimeout(function () {  //模拟加载
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1000);
    this.getData();
  },
  onLoad: function (options) { // 生命周期函数--监听页面加载
    wx.cloud.init({
      env: app.globalData.evn
    })
    this.getData()
  },
  getData: function () { //从云数据库中抓取数据
    var that = this
    const db = wx.cloud.database();
    console.log('模糊搜索' + this.data.click_search)
    if (this.data.click_search) {  //search跳转到getdata实现模糊搜索
      db.collection('buytogether').limit(10).skip(10 * this.data.page).orderBy('post_time', 'desc').where({
        text: db.RegExp({ //使用正则查询，实现对搜索的模糊查询
          regexp: that.data.inputValue,
          options: 'i', //大小写不区分
        })
      }).get({
        success: res => {
          if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
            that.setData({
              page: that.data.page + 1
            })
          }
          console.log('当前的页大小为' + this.data.page)
          if (that.data.reachBottom == true) {//如果触底事件发生，连接数据
            that.onReachBottomgetData(res.data)
          }
          else {//否则正常赋值
            that.setData({
              buytogether: res.data
            })
            that.pandingPage(res.data.length)
          }
          this.setData({
            click_search:false
          })
        }
      })
    }
    else {//正常显示数据
      console.log('搜寻' + this.data.search_what)
      if (this.data.search_what != '') { //点击图片那六个图标触发的事件
        db.collection("buytogether").limit(10).skip(10 * this.data.page).orderBy('post_time', 'desc').where({
          leibie: this.data.search_what
        })
          .get({
            success: function (res) {
              if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
                that.setData({
                  page: that.data.page + 1
                })
              }
              console.log('当前的页大小为' + that.data.page)
              if (that.data.reachBottom == true) {//如果触底事件发生，连接数据
                that.onReachBottomgetData(res.data)
              }
              else {//否则正常赋值
                that.setData({
                  buytogether: res.data
                })
                console.log(res.data.length)
                that.pandingPage(res.data.length)
              }
              wx.hideNavigationBarLoading(); //隐藏加载
              wx.stopPullDownRefresh();
            },
            fail: function (event) {
              wx.hideNavigationBarLoading(); //隐藏加载
              wx.stopPullDownRefresh();
            }
          })
      }
      //不点击默认的图标
      else {
        console.log('显示全局数据')
        db.collection("buytogether").limit(10).skip(10 * this.data.page).orderBy('post_time', 'desc')
          .get({
            success: function (res) {
              if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
                that.setData({
                  page: that.data.page + 1
                })
              }
              console.log('当前的页大小为' + that.data.page)
              if (that.data.reachBottom == true) {//如果触底事件发生，连接数据
                that.onReachBottomgetData(res.data)
              }
              else {
                that.setData({
                  buytogether: res.data
                })
                console.log(res.data.length)
                that.pandingPage(res.data.length)
              }
              wx.hideNavigationBarLoading(); //隐藏加载
              wx.stopPullDownRefresh();
            },
            fail: function (event) {
              wx.hideNavigationBarLoading(); //隐藏加载
              wx.stopPullDownRefresh();
            }
          })
      }
    }
  },
  more_deatiled:function(e){ //进入详细页面
   this.setData({
      Is_delete_index:e.currentTarget.dataset.index
  }) 
   var _id=e.currentTarget.dataset.item._id
   var _openid=e.currentTarget.dataset.item._openid
   var  images=[]
   images =e.currentTarget.dataset.item.images
   var  leibie=e.currentTarget.dataset.item.leibie
   var  post_time=e.currentTarget.dataset.item.post_time
   var poster=e.currentTarget.dataset.item.poster
   var src_of_avatar=e.currentTarget.dataset.item.src_of_avatar
   var text=e.currentTarget.dataset.item.text
   var tiezi='拼单奶茶'
   this.setData({
     detail:true
   })
  wx.navigateTo({
    url: '../more_detailed/more_detailed?_id='+_id+'&_openid='+_openid+'&poster='+poster+'&post_time='+post_time+'&src_of_avatar='+src_of_avatar+'&leibie='+leibie+'&text='+encodeURIComponent(JSON.stringify(text))+'&images='+JSON.stringify(images)+'&tiezi='+tiezi
  })
  },
  his_information:function(e){  //看个人信息
  this.setData({
   look_avatar:true
   })
  var link_openid=e.currentTarget.dataset.item._openid
  wx.navigateTo({
    url:'../../mine_all/mine_basic_information/mine_basic_information?link_openid='+link_openid
  })
  }
})