// pages/more_detailed/more_detailed.js
var app=getApp();
const db = wx.cloud.database();
Page({
  data: {
  link_openid:'',
  _id:'',//点击人的id
  dbname:'',//数据库名称
  _openid:'',
  poster:'',
  post_time:'',
  src_of_avatar:'',
  images:[],
  text:'',
  tiezi:'',
  leibie:'',
  comments:[],
  dianzan_list:[],
  },
  onLoad: function (options) {
  if(typeof(options._openid)=='undefined'){//从发布页面传来的数据
  this.setData({
    _id:options._id,
    dbname:options.dbname
  })
  var that=this
  db.collection(this.data.dbname).doc(this.data._id).get({
    success: function (res){
      console.log(res.data.poster)
      that.setData({
        poster:res.data.poster,
        post_time:res.data.post_time,
        src_of_avatar:res.data.src_of_avatar,
        images:res.data.images,
        text:res.data.text,
        leibie:res.data.leibie,
      })
    }
  })
 }
  else{//从其他页面传来的数据
  this.setData({
  _id:options._id,
  link_openid:options._openid,
  poster:options.poster,
  post_time:options.post_time,
  src_of_avatar:options.src_of_avatar,
  images:JSON.parse(options.images),
  text:JSON.parse(decodeURIComponent(options.text)),
  tiezi:options.tiezi,
  leibie:options.leibie,
  _openid:wx.getStorageSync('_openid')
  })
  }
  },
  //图片预览
  PreviewImage: function (e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
  },
  //个人信息的删除
  delete:function(){
     var dbname  //根据dbname和search_what来搜寻对应的数据库，默认dbname='二手物品'
     console.log(this.data._openid)
    if(this.data._openid != ''){//从更多页面传来
     if (this.data.tiezi == '二手物品') dbname = 'usedobject'
     else if (this.data.tiezi == '拼单奶茶') dbname = 'buytogether'
     else dbname = 'question'
    }
    else{//从我的页面传来
      dbname=this.data.dbname
    }
     console.log(dbname+this.data.dbname)
      var that=this
      wx.showModal({
        title: '提示',
        content: '您确定要删除该发布吗？',
        showCancel: true, //是否显示取消按钮-----》false去掉取消按钮
        cancelText: "否", //默认是“取消”
        cancelColor: 'black', //取消文字的颜色
        confirmText: "是", //默认是“确定”
        confirmColor: 'pink', //确定文字的颜色
        success: function (res) {
          if (res.cancel) {
            console.log("您点击了取消")
          } else if (res.confirm) {
            console.log("您点击了确定")
            db.collection(dbname).doc(that.data._id).remove({ //1.删除相应数据库中的这条信息
              success: function (res) {
              console.log('删除数据成功')
              }
            })
            app.globalData.Is_delete=true
            console.log(that.data._id);
            setTimeout(function () { //防止网络延迟，删除后刷新页面
             wx.navigateBack({
              delta:1
             }) ,1000})
              wx.showToast({
                title: '删除成功',
                icon: 'success'
          })
    }
  }
})
},
})