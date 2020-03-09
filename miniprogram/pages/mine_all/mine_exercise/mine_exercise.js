// pages/mine_exercise/mine_exercise.js
const db = wx.cloud.database();
Page({
  data: {
     time:'',//当前时间
     historyExercise:[],//运动历史数据
     monthExerciseTime:0,//该月运动次数
     monthExerciseEngry:0,//该月运动消耗的热量
     monthData:[],//用于显示月份的日期
     startEndTime:[]//跑步的耗时
  },
  onLoad: function (options) {
     this.getPresent();
     this.getexerciseData();
  },
   //计算当前年月
   getPresent: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y = date.getFullYear();  //获取年份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);   //获取月份  
    console.log("当前时间为：" + Y + '年' + M + '月');
    this.setData({
      time: Y + '年' + M + '月' 
    })
   },
    //取出运动数据
    getexerciseData:function(){
     var that=this;
     var _openid=wx.getStorageSync('_openid')
     console.log(_openid);
     db.collection("run_records").orderBy('start_time', 'desc').where({
      _openid: _openid
    }).get({
      success: function (res) {
        if (res.data.length == 0) {//如果数组长度为0，则显示加紧锻炼吧
          wx.showToast({
            title: '抓紧运动吧',
            icon: 'none',
            duration: 1200
            })
        } 
        else{   
        console.log("该个人运动历史数据：" + res.data)
        that.setData({
          historyExercise: res.data
        })
         that.analysis();//分析数据
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();
        }
      }
    })
  },
  //分析数据。得出本月的运动的次数和能量
  analysis:function(){
    var monthDataBridge=[];
    var startEndTimeBridge=[];
    for(var i=0;i<this.data.historyExercise.length;i++){
    var now_time=this.data.historyExercise[i].start_time.substring(0,10)
    monthDataBridge[i]=now_time.substring(5,7)+'月'+now_time.substring(8,10)+'日'
    startEndTimeBridge[i]=this.shijiancha(this.data.historyExercise[i].start_time,this.data.historyExercise[i].end_time)
    if(now_time.substring(0,4)==this.data.time.substring(0,4)&&now_time.substring(5,7)==this.data.time.substring(5,7)){
      this.setData({//统计本月的运动次数和运动能量
        monthExerciseTime:this.data.monthExerciseTime+1,
        monthExerciseEngry:this.data.monthExerciseEngry+this.data.historyExercise[i].exerciseEngry,
      })
    }
    this.setData({
      monthData:monthDataBridge,
      startEndTime:startEndTimeBridge
    })
  }
  },
  //计算时间差
  shijiancha: function (faultDate, completeTime) {
    var stime = Date.parse(new Date(faultDate));
    var etime = Date.parse(new Date(completeTime));
    var usedTime = etime - stime; //两个时间戳相差的毫秒数
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));//计算出小时数,Math.floor向下取整
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
    var hoursStr = hours == 0 ? "" : hours + "时";
    var leave3 = leave2%(60*1000);//计算相差秒数
    var seconds=Math.floor(leave3/1000)
    var time = hoursStr + minutes + "分"+ seconds + "秒";
    return time;
  },
    onReachBottom:function(){
    if(this.data.historyExercise.length==20){//如果为20条则只能加载20条
      wx.showToast({
        title: '只加载20条跑步记录',
        icon:'none'
      })
    }
    else{
      wx.showToast({
        title: '只有这么多数据了',
        icon:'none'
      })
    }
  }
})