// pages/mine_exercise/mine_exercise.js
const db = wx.cloud.database();
Page({
  data:{
    time:'',//当前的时间
    run_records:[],//跑步的数据
    monthExerciseTime:0,//这个月运动的次数
    monthExerciseEngry:0,//这个月运动的能量
    monthData:[],//用于显示月份的日期
    startEndTime:[]//跑步的耗时
  },
  onLoad:function(){//页面加载
    this.getPresent();//得到今天的时间
    this.getrun_records();//拿到跑步的数据
  },
  getPresent:function(){//得到今天的时间
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y = date.getFullYear();  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);   //获取月份  
    console.log("当前时间为：" + Y + '年' + M + '月');
    this.setData({
      time: Y + '年' + M + '月' 
    })
    console.log(this.data.time)
  },
  getrun_records:function(){//取到历史跑步数据
    var that=this
    var _openid=wx.getStorageSync('_openid')
    db.collection("mine").where({
      _openid: _openid
    }).get({
      success: function (res) {
        console.log(res.data[0].run_records)
        that.setData({
         run_records:res.data[0].run_records.reverse()
         })
         that.analysis();
        } 
    })
  },
   analysis:function(){//分析所取得的数据
    var monthDataBridge=[];
    var startEndTimeBridge=[];
    for(var i=0;i<this.data.run_records.length;i++){
    var now_time=this.data.run_records[i].start_time.substring(0,10)
    console.log(now_time)
    monthDataBridge[i]=now_time.substring(5,7)+'月'+now_time.substring(8,10)+'日'
    console.log(monthDataBridge[i])
    var Is_hours=''
    if(this.data.run_records[i].duration.substring(0,1)!=0){
      Is_hours=this.data.run_records[i].duration.substring(0,1)+'时'
    }
    startEndTimeBridge[i]=Is_hours+this.data.run_records[i].duration.substring(2,4)+'分'+this.data.run_records[i].duration.substring(5,7)+'秒'
    console.log(startEndTimeBridge[i])
    if(now_time.substring(0,4)==this.data.time.substring(0,4)&&now_time.substring(5,7)==this.data.time.substring(5,7)){
      this.setData({//统计本月的运动次数和运动能量
        monthExerciseTime:this.data.monthExerciseTime+1,
        monthExerciseEngry:this.data.monthExerciseEngry+this.data.run_records[i].energy,
      })
    }
    }
    this.setData({
      monthData:monthDataBridge,
      startEndTime:startEndTimeBridge
    })
  },
  onReachBottom:function(){
    if(this.data.run_records.length==20){//如果为20条则只能加载20条
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