const app = getApp();
var countTooGetLocation = 0;
var total_micro_second = 0;
var starRun = 0;
var totalSecond = 0;
var oriMeters = 0.0;
/* 毫秒级倒计时 */
function count_down(that) {
  if (starRun == 0) {
    return;
  }

  if (countTooGetLocation >= 100) {
    var time = date_format(total_micro_second);
    that.updateTime(time);
  }

  if (countTooGetLocation >= 5000) { //1000为1s
    that.getLocation();
    countTooGetLocation = 0;
  }

  setTimeout
  setTimeout(function () {
    countTooGetLocation += 10;
    total_micro_second += 10;
    count_down(that);
  }, 10)
}
//每隔一秒更新配速
function speed_update(that) {
  if (starRun == 0) {
    return;
  }
  if (countTooGetLocation >= 100) {
    var speed = speed_calculate(total_micro_second, oriMeters);
    that.updateSpeed(speed);
  }
  setTimeout
  setTimeout(function () {
    speed_update(that);
  }, 1000)
}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60)); // equal to => var sec = second % 60;

  return hr + ":" + min + ":" + sec + " ";
}

function speed_calculate(micro_second, meters) {
  if (meters == 0.0) {
    console.log('里程为零');
    return "00'00''";
  }
  var temp = micro_second / meters;
  // 秒数
  var second = Math.floor(temp / 1000);
  // 小时位
  //var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor(second / 60));
  // 秒位
  var sec = fill_zero_prefix((second - min * 60)); // equal to => var sec = second % 60;
  return min + "'" + sec + "''";
}

function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;

  function toRadians(d) {
    return d * Math.PI / 180;
  }
}

function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

//****************************************************************************************
//****************************************************************************************
Page({
  data: {
    userinfo: {},
    clock: '',
    isLocation: false,
    latitude: 0,
    longitude: 0,
    markers: [],
    covers: [],
    speed: "00'00''",
    meters: 0.00,
    time: "0:00:00",
    start_iconbool: true,
    pause_iconbool: false,
    startfinish_iconbool: false,

    start_first: true,
    openid: '',
    start_time: '',
    record_id: '',
    height: 0
  },

  //****************************
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log("页面初始化参数",options)
    starRun = parseInt(options.starRun);
    total_micro_second = parseInt(options.total_micro_second);
    oriMeters = parseFloat(options.oriMeters);
    //配速，时间，公里更新
    var time = date_format(total_micro_second);
    var speed = speed_calculate(total_micro_second,oriMeters)
    //var meters = new Number(oriMeters);   
    
    this.getLocation()
    var that = this
    that.setData({
      height: wx.getSystemInfoSync().windowHeight,        //屏幕高度，为了wxml使用
      time:time,
      speed: speed,
      meters: oriMeters,
    })
    console.log('屏幕高度',wx.getSystemInfoSync().windowHeight)
    count_down(this);
    speed_update(this);

    //app.watch(that.starRunChange,"starRun")
    wx.getStorage({
      key: 'userinfo',
      success: function (res) {
        that.setData({
          userinfo: res.data,
          usergender: res.data.gender
        })
      },
    })
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          openid: res.data
        })
      },
    })
  },
  starRunChange: function (adata){
     console.log('全局变量改变传来值',adata)
     starRun = adata
  },
  //****************************
  openLocation: function () {
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        wx.openLocation({
          latitude: res.latitude, // 纬度，范围为-90~90，负数表示南纬
          longitude: res.longitude, // 经度，范围为-180~180，负数表示西经
          scale: 28, // 缩放比例
        })
      },
    })
  },

  //****************************
  updateTime: function (time) {
    var data = this.data;
    data.time = time;
    this.data = data;
    this.setData({
      time: time,
    })
  },
  updateSpeed: function (speed) {
    var data = this.data;
    data.speed = speed;
    this.data = data;
    this.setData({
      speed: speed
    })
  },


  //****************************
  getLocation: function () {
    var that = this
    wx.getLocation({

      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        console.log("res----------")
        console.log(res)

        //make datas 
        var newCover = {
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: '/images/RunningPage/redPoint.png',
        };
        var oriCovers = that.data.covers;

        console.log("oriMeters----------")
        console.log(oriMeters);
        var len = oriCovers.length;
        var lastCover;
        if (len == 0) {
          oriCovers.push(newCover);
        }
        len = oriCovers.length;
        var lastCover = oriCovers[len - 1];

        console.log("oriCovers----------")
        console.log(oriCovers, len);

        var newMeters = getDistance(lastCover.latitude, lastCover.longitude, res.latitude, res.longitude) / 1000;

        if (newMeters < 0.0015) {
          newMeters = 0.0;
        }

        oriMeters = oriMeters + newMeters;
        console.log("newMeters----------")
        console.log(newMeters);


        var meters = new Number(oriMeters);
        var showMeters = meters.toFixed(2);

        oriCovers.push(newCover);

        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [],
          covers: oriCovers,
          meters: showMeters,
        });
      },
    })
  }

})
