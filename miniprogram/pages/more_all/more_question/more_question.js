// pages/more_question/more_question.js
var that=this
const app = getApp()
const db = wx.cloud.database();
Page({
  //页面的初始数据
  data: {
    //轮播图
    bnrUrl: [{
      url: 'cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15818473700000.jfif'
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15818473700001.jfif"
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15818473700002.jfif"
    }, {
        url: "cloud://xiaohuang-evwg7.7869-xiaohuang-evwg7-1301134245/嗯_15818473700003.jfif"
    }],
   //6个图片选项
  routers: [
    {
      name: '绩点升学',
      url: '../../../images/more/question_1.png',
    },
    {
      name: '求职就业',
      url: '../../../images/more/question_2.png',
    },
    {
      name: '考研大军',
      url: '../../../images/more/question_3.png',
    },
    {
      name: '出国升学',
      url: '../../../images/more/question_4.png',
    },
    {
      name: '修理物件',
      url: '../../../images/more/question_5.png',
    },
    {
      name: '其他',
      url: '../../../images/more/buytogether_6.png',
    }
  ],
  userInfo:'',//用户的基本信息
  pinglun:false,//判定用户是否评论
  dianzan:false,//判定用户是否点赞
  number_of_dianzan:0,//点赞的总人数，数字，在点赞人数的末尾添加共多少人点赞
  numberofvisit:0,//浏览的人数，依靠刷新次数
  dianzan_list:[],//点赞的列表，用户的头像，名称
  comments:[],//评论页面，用户的userInfo头像和名称和评论和open_id
  click_search: false,//点击触发搜索事件
  inputValue: '', //搜索的内容
  question: [], //数据库取到的信息
  search_what: '',//搜索哪个
  click_publish: true,//点击事件触发发布事件
  _openid:'',//使用者的_openid
  id: 'question', //根据id决定发布的选择器和placeholder
  _id:'',//当前图片的_id号，用来显示是否有。。。变为<
  index:-1,//当前的图片下标
  pinglunInput:'',//评论中写入的文字
  pinglunpublish:false,//评论发布时为true，其余均为false
  page:0,//数据分页
  reachBottom:false,//是否到达底部
  previewImage: false,//如果是预览图片返回则不用刷新页面
  detail:false,//是否打开详情页面
  look_avatar:false,//是否看头像信息
  Is_delete_index:0,//删除的下标
  once:true,//第一次进入不刷新
  },
  //选择显示的分类页面（奶茶，外卖等）
  choosewhat: function (e) {
    this.setData({
      search_what: e.currentTarget.dataset.index,
      page:0//点击6个按钮则将分页置为0
    })
    console.log(this.data.search_what)
    this.getData();
  },
  //点击事件跳转发布页面
  change: function () {
    var click_publish = this.data.click_publish;
    this.setData({
      click_publish: false
    }),
      wx.navigateTo({
        url: '../more_buytogether_add/more_buytogether_add?id=' + this.data.id
      })
  },
  //搜索框文本内容显示
  inputBind: function (event) {
    this.setData({
      inputValue: event.detail.value
    })
    console.log('输入为: ' + this.data.inputValue)
  },
  //搜索功能
  search: function () {
    this.setData({
      click_search: true,
      page:0
    })
    this.getData();
    console.log('查询结束')
  },
  //生命周期函数--监听页面加载
  onLoad: function () {
    that = this
    wx.cloud.init({
      env: app.globalData.evn
    })
    this.setData({
      userInfo :wx.getStorageSync('userInfo')//数据库更新,向点赞列表加入点赞人的_openid和用户头像，用户名称
    })
    this.getData()
  },
  //图片预览
  PreviewImage: function (e) {
    console.log(e.target.dataset.src)
    console.log(e.target.dataset.images)
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
    this.setData({
      previewImage: true
    })
  },
  //从云数据库中抓取数据
  getData: function () {
    //search跳转到getdata实现模糊搜索
    if (this.data.click_search) {
      db.collection('question').limit(10).skip(10 * that.data.page).orderBy('post_time', 'desc').where({//默认一页长度为10
        //使用正则查询，实现对搜索的模糊查询
        text: db.RegExp({
          regexp: this.data.inputValue,
          //从搜索栏中获取的value作为规则进行匹配。
          options: 'i',
          //大小写不区分
        })
      }).get({
        success: res => {
          if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
            that.setData({
              page: that.data.page + 1
            })
          }
            //如果触发下拉操作，则对数据进行拼接
            if (that.data.reachBottom == true) {
              //数组连接
              var arr1 = that.data.question; //从data获取当前datalist数组
              var arr2 = res.data; //从此次请求返回的数据中获取新数组
              arr1 = arr1.concat(arr2); //合并数组
              console.log('合并前的数组arr1为' + that.data.question + '合并后的数组为' + arr1)
              that.setData({
                question: arr1,
                reachBottom: false,
              })
              console.log('当前的page大小为' + that.data.page)
            }
            //如果是的，而不触发下拉刷新
            else {
              that.setData({
                question: res.data,
                click_search:false,
              })
              console.log('得到的新数据为' + that.data.question)
            }
            //如果res.data为空，则显示没有其他的数据
            if (res.data.length == 0 && that.data.page == 0) {
              wx.showToast({
                title: '您搜索的相关帖子不存在',
                icon: 'none'
              })
            }
            //如果res.data为空，则显示没有其他的数据
            else if (res.data.length == 0) {
              wx.showToast({
                title: '没有更多数据了',
                icon: 'none'
              })
            }
            //如果res.data大于0，则显示有其他的数据
            else {
              wx.showToast({
                title: '加载成功',
                icon: 'success'
              })
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
    else {
      console.log('搜寻' + this.data.search_what)
      //点击图片那六个图标触发的事件
      if (this.data.search_what != '') {
        db.collection("question").limit(10).skip(10*that.data.page).orderBy('post_time', 'desc').where({
          leibie: this.data.search_what
        })
          .get({
            success: function (res) {
              if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
                that.setData({
                  page: that.data.page + 1
                })
              }
              console.log('获取的数据长度为'+res.data.length)
              console.log("数据：" + res.data)
              //如果触发下拉操作，则对数据进行拼接
                if(that.data.reachBottom==true)
              {
              //数组连接
              var arr1 = that.data.question; //从data获取当前datalist数组
              var arr2 = res.data; //从此次请求返回的数据中获取新数组
              arr1 = arr1.concat(arr2); //合并数组
              console.log('合并前的数组arr1为'+that.data.question+'合并后的数组为'+arr1)
              that.setData({
                question: arr1,
                reachBottom:false,
              })
              console.log('当前的page大小为'+that.data.page)
              }
              //如果是点击其他的，而不触发下拉刷新
                 else{
              that.setData({
                question:res.data,
              })
              console.log('得到的新数据为'+that.data.question)
              }
              //如果res.data为空，则显示没有其他的数据
              if (res.data.length == 0&&that.data.page==0) {
                wx.showToast({
                  title: '空空如也',
                  icon: 'none'
                })
              }
              //如果res.data为空，则显示没有其他的数据
              else if (res.data.length == 0 ) {
                wx.showToast({
                  title: '没有更多数据了',
                  icon: 'none'
                })
              }
              //如果res.data大于0，则显示有其他的数据
              else {
                wx.showToast({
                  title: '加载成功',
                  icon: 'success'
                })
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
        db.collection("question").limit(10).skip(10 * that.data.page).orderBy('post_time', 'desc')
          .get({
            success: function (res) {
              if (res.data.length != 0) {//如果返回的数据长度为0,则page页+1；
                that.setData({
                  page: that.data.page + 1
                })
              }
              console.log('获取的数据长度为' + res.data.length)
              // res.data 是包含以上定义的两条记录的数组
              console.log("数据：" + res.data)
              //如果触发下拉操作，则对数据进行拼接
              if (that.data.reachBottom == true) {
                //数组连接
                var arr1 = that.data.question; //从data获取当前datalist数组
                var arr2 = res.data; //从此次请求返回的数据中获取新数组
                arr1 = arr1.concat(arr2); //合并数组
                console.log('合并前的数组arr1为' + that.data.question + '合并后的数组为' + arr1)
                that.setData({
                  question: arr1,
                  reachBottom: false,
                })
                console.log('当前的page大小为' + that.data.page)
              }
              //如果是默认，不是刷新的，而不触发下拉刷新
              else {
                that.setData({
                  question: res.data,
                })
                console.log('得到的新数据为' + that.data.question)
              }
              //如果res.data为空，则显示没有其他的数据
             if(res.data.length== 0&&that.data.page==0){
              wx.showToast({
              title: '空空如也',
              icon: 'none'
             })
              }
              else if(res.data.length==0){
                wx.showToast({
                  title: '没有更多数据了',
                  icon:'none'
                })
              }
              //如果res.data大于0，则显示有其他的数据
              else{
                  wx.showToast({
                    title: '加载成功',
                    icon:'success'
                  })
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
  //点击从数据库中判定点赞是否是true*/
  moreFunction:function(e){
   //从数据库中查看点赞的列表是否有这个人,根据_openid来匹配，如果有则点赞值为true,加载耗时延迟先执行
   var that=this
    db.collection('question').doc(e.currentTarget.dataset.topicid).get({
      success: res => {
      console.log(res.data);
      that.setData({
        dianzan_list:res.data.dianzan_list,//从数据库给dianzan_list赋值
        number_of_dianzan:res.data.number_of_dianzan,//知道点赞的数目  
        comments:res.data.comments//评论的      
      })
      console.log('点赞列表为'+that.data.dianzan_list+'点赞的数目为'+that.data.number_of_dianzan+'评论为'+that.data.comments)
      }
    })
  //判断点赞的列表中是否含这个访问者的_openid，如果有则点赞为红色（dianzan置为true，否则为无）
  this.setData({
    _openid:wx.getStorageSync('_openid'),
    pinglunpublish:false,
    pinglun:false
  })
  console.log('从缓存中取到的_openid为'+this.data._openid)
   //取到dianzan_list和number_of_dianzan有延迟，所以有个定时器
   var that=this
    setTimeout(function (){
      //如果点赞的数目为空，则点赞为false
      if (that.data.dianzan_list.length==0) {
        that.setData({
          dianzan:false
        })
      }
      //如果点赞的人数不为空，则循环分析
      else{
      for(var i = 0; i< that.data.dianzan_list.length; i++) {
      console.log(that.data.dianzan_list.length)
      //如果_openid与之相等，则说明他点赞过了
      if (that.data._openid == that.data.dianzan_list[i]._openid) {
        that.setData({
          dianzan: true
        })
        break;
      }
      //如果最后一个_openid不相等的话，则他没有点赞
      else if (i == that.data.dianzan_list.length - 1) {
        that.setData({
          dianzan: false
        })
      }
    }
    }
      console.log('点赞为' + that.data.dianzan)
      that.setData({
        _id: e.currentTarget.dataset.topicid,
      })
       console.log('传来的参数为' + e.currentTarget.dataset.topicid)
   //赋值给当前的说说id
  },500)
  },
  moreFunction_1: function () {
    this.setData({
      _id:''
    })
  },
  //灰色的时候触发点赞功能/
  dianzan:function(e){
  //对当前的dianzan_list进行追加数据
    var that = this
    this.data.dianzan_list.push({_openid:this.data._openid,src_of_avatar: this.data.userInfo.avatarUrl,poster:this.data.userInfo.nickName})
    //下面要用到云函数增加点赞的数目
    wx.cloud.callFunction({
      name:'dianzanUpdate',
      data:{
        dianzan_list:that.data.dianzan_list
      },
      success: res => {
        console.log('增加点赞记录成功')
      },
      fail:res=>{
        console.log("增加失败")
      }
    })

    db.collection('question').doc(this.data._id).update({
      data:{
        dianzan_list: that.data.dianzan_list
      },
      success: res => {
        console.log('增加点赞记录成功')
      }
    })
    this.moreFunction(e);
    setTimeout(function(){
      that.setData({
        dianzan: true
      })
    },500)
  },
  pinglun:function(){
    this.setData({
      pinglun:true,
      pinglunpublish:false
    })
  },
  pinglun_1:function(){
    this.setData({
      pinglun:false
    })
  },
  //发布的评论文本内容显示
  pinglunInput: function (event) {
    this.setData({
      pinglunInput: event.detail.value
    })
     console.log('输入为: ' + this.data.pinglunInput)
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {
    //显示正在加载
    console.log('下拉事件被触发')
    wx.showToast({
      title: '正在加载中',
      icon: 'loading',
      duration: 2000
    })
    //刷新数据
    this.setData({
      reachBottom:true,
    })
    this.getData();
  },
  onPullDownRefresh: function () { //页面相关事件处理函数--监听用户下拉动作
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      page:0
    })
    this.getData();
    setTimeout(function () {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },
  onShow: function () {//生命周期函数--监听页面显示
    console.log('onshow')
    if(app.globalData.Is_delete==true){
      app.globalData.Is_delete=false
      console.log(this.data.Is_delete_index)
        this.data.question.splice(this.data.Is_delete_index,1)
        this.setData({
          question:this.data.question
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
      question:[]
    })
    this.getData();
   }
  },
   publish:function(e){//发布评论
   console.log(e.currentTarget.dataset.topicid)
    //判断输入是否为空，如果为空。则不能发布
    if(this.data.pinglunInput==''){
      wx.showToast({
        title: '神评不能为空',
        icon:'none'
      })
    }
    else{
     //时间的格式化
     var timestamp = Date.parse(new Date());
     timestamp = timestamp / 1000 + 8 * 60 * 60;
     var date = new Date(parseInt(timestamp) * 1000);
     var temp = date.toISOString();
     var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
     //加入到comments数组中
     this.data.comments.push ({ src_of_avatar: this.data.userInfo.avatarUrl, passenger: this.data.userInfo.nickName, date: realtime, comment: this.data.pinglunInput })
     db.collection('question').doc(e.currentTarget.dataset.topicid).update({
       data: {
         comments: this.data.comments
       },
       success: res => {
         //刷新comments数组
         var that = this
         that.moreFunction(e);
         setTimeout(function () {
           wx.showToast({
             title: '评论成功',
             icon: 'success'
           })
             that.setData({
             pinglunpublish:true
           })
         }, 500)
       },
       fail:res=>{
          console.log('发布失败')
       }
     })
    }
  },
   more_deatiled:function(e){//跳转到详情页面
    this.setData({
      Is_delete_index:e.currentTarget.dataset.index
    })
    console.log(this.data.Is_delete_index)
    var _id=e.currentTarget.dataset.item._id
    var _openid=e.currentTarget.dataset.item._openid
    var  images=[]
    images =e.currentTarget.dataset.item.images
    var  leibie=e.currentTarget.dataset.item.leibie
    var  post_time=e.currentTarget.dataset.item.post_time
    var poster=e.currentTarget.dataset.item.poster
    var src_of_avatar=e.currentTarget.dataset.item.src_of_avatar
    var text=e.currentTarget.dataset.item.text
    var tiezi='疑惑解答' 
    this.setData({
      detail:true
    })
   wx.navigateTo({
     url: '../more_detailed/more_detailed?_id='+_id+'&_openid='+_openid+'&poster='+poster+'&post_time='+post_time+'&src_of_avatar='+src_of_avatar+'&leibie='+leibie+'&text='+encodeURIComponent(JSON.stringify(text))+'&images='+JSON.stringify(images)+'&tiezi='+tiezi+'&comments='+encodeURIComponent (JSON.stringify(e.currentTarget.dataset.item.comments))+'&dianzan_list='+encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item.dianzan_list))
   })
  },
   his_information:function(e){ //看个人信息
    this.setData({
     look_avatar:true
     })
    var link_openid=e.currentTarget.dataset.item._openid
    wx.navigateTo({
      url:'../../mine_all/mine_basic_information/mine_basic_information?link_openid='+link_openid
    })
  }
})