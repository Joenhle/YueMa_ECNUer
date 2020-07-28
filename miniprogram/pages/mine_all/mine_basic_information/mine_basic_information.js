// pages/mine/basic_information/basic_information.js
const db = wx.cloud.database();
const app = getApp()
Page({
  // 页面的初始数据
  data: {
    once:true,//第一次页面加载,区分Onload和Onshow
    link_openid:'',//链接过来的_openid
    link_flag:0,//用来判断是否是别人的
    _openid:'',//该人的_openid
    realName:'',//名字
    gender:1,//性别1,2
    gender_show:'',//显示的性别 男，女
    xuehao:'',//学号
    grade:'',//年级
    sushe:'',//宿舍
    major:'',//专业
    college:'',//学院
    love: '', //爱好
    yuepao:'',//陪跑
    yueqiu:'',//约球
    dianzan:'',//点赞
    _id:'',//用户的唯一_id号
    his_dianzan:false,//别人的点赞
    dianzan_ren:[],//点赞的人数
  },
  //跳转个人信息
  add_inforamtion:function() {
    wx.navigateTo({
      url: '../mine_basic_information_rewrite/mine_basic_information_rewrite?grade=' + this.data.grade + '&gender_show=' + this.data.gender_show +'&sushe=' + this.data.sushe + '&major=' + this.data.major + '&college=' + this.data.college + '&love=' + this.data.love
    })
  },
  //生命周期函数--监听页面加载
  onLoad: function (options){

   console.log('onload')
   this.setData({
    link_openid:options.link_openid,
   _openid:wx.getStorageSync('_openid'),
    once:false,
   })
   if(!(this.data.link_openid==this.data._openid||typeof(this.data.link_openid)=='undefined')){
     this.setData({
       link_flag:1
     })
   }
   console.log('传来的——openid为'+this.data.link_openid)
   console.log("原来的_openid为"+this.data._openid)
   console.log(this.data._id)
   this.getdata()//获取云端的个人信息
  },
  getdata:function(){
    var that=this
    console.log('获取数据库成功');
      //1.若基础信息在数据库则显示出来
      if(typeof(this.data.link_openid)!='undefined'){
        this.setData({
          _openid:this.data.link_openid
        })
      }
      console.log(this.data._openid)
      db.collection('mine').where({
        _openid:this.data._openid
      }).get({
        success: res => {
          console.log('获取的数据为'+res.data)
          //将个人信息的值设为数据库中某个人的值
          that.setData({
            realName: res.data[0].realName,//用户的昵称
            xuehao: res.data[0].xuehao,//用户的性别
            grade: res.data[0].grade,//用户的大学
            sushe: res.data[0].sushe,//用户的年龄
            major: res.data[0].major,//用户的星座
            college: res.data[0].college, //用户的爱好
            love:res.data[0].love,
            yuepao:res.data[0].yuepao,
            yueqiu:res.data[0].yueqiu,
            dianzan:res.data[0].dianzan,
            dianzan_ren:res.data[0].dianzan_ren,
            gender:res.data[0].gender
          })
          if(this.data.gender==1){
            this.setData({
              gender_show:'男'
            })
          }
          else{
            this.setData({
              gender_show:'女'
            })
          }
          if(that.data.link_flag==1){//查询该人是否在这里
            console.log('查询启动')
            var my_openid=wx.getStorageSync('_openid')
            console.log(my_openid)
            for(var i = 0; i< that.data.dianzan_ren.length; i++){
              console.log(that.data.dianzan_ren[i]._openid)
              if(my_openid==that.data.dianzan_ren[i]._openid){
                that.setData({
                  his_dianzan:true
                })
                conosole.log("true")
                break;
              }
            if(i==that.data.dianzan_ren.length-1){
              that.setData({
                his_dianzan:false
              })
            }
          }
          }
          console.log('基本资料已从云端获取到')
          }
      })
  },
  Dianzan:function(){
    //先判断有没有登录
    if(app.globalData.is_denglu==false){
      wx.showModal({
        title: '提示',
        content: '请先完成登录',
        success (res) {
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
    var my_openid = wx.getStorageSync('_openid')
    console.log(my_openid)
    var db = wx.cloud.database();
    db.collection('mine').where({
      _openid:that.data._openid,
    }).get({
      success: function (res) {
        console.log(res)
         var is_dianzan = false;
         for(let i =0 ;i< res.data[0].dianzan_ren.length;++i){
           if(my_openid==res.data[0].dianzan_ren[i]){
             is_dianzan=true;
             break;
           }
         }
         if(is_dianzan==true){
          wx.showToast({
            title: '只能点赞一次喔',
            icon: 'error',
            duration: 2000
          });
         }else{
           var temp = res.data[0].dianzan_ren;
           temp[temp.length]=my_openid;
           db.collection("mine").doc(res.data[0]._id).update({
            data: {
              dianzan_ren: temp
            },
            success:function(res){
              that.setData({
                dianzan_ren:temp
              })
              wx.showToast({
                title: '点赞成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
         }
      }
    })
  },

  //生命周期函数--监听页面初次渲染完成
  onReady: function () {
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    console.log('Onshow页面被加载')
    if(this.data.once==true){
      this.getdata();
    }
    this.setData({
      once:true
    })
  },
})
