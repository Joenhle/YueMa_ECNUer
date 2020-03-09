
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
  }
    , 10
  )
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
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;


  return hr + ":" + min + ":" + sec + " ";
}


function getDistance(lat1, lng1, lat2, lng2) {
  var dis = 0;
  var radLat1 = toRadians(lat1);
  var radLat2 = toRadians(lat2);
  var deltaLat = radLat1 - radLat2;
  var deltaLng = toRadians(lng1) - toRadians(lng2);
  var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
  return dis * 6378137;

  function toRadians(d) { return d * Math.PI / 180; }
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
    meters: 0.00,
    time: "0:00:00",
    start_iconbool: true,
    pause_iconbool: false,
    startfinish_iconbool: false,
    
    start_first: true,
    openid:'',
    start_time: '',
    pace: '',
    record_id: ''
  },

  //****************************
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getLocation()
    var that=this
    console.log("onLoad")
    count_down(this);
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
  starRun: function () {
    if(this.data.start_first){
      var timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000 + 8 * 60 * 60;
      var date = new Date(parseInt(timestamp) * 1000);
      var temp = date.toISOString();
      var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
      this.setData({
        start_first: false,
        start_time: realtime
      })
    }
    if (starRun == 1) {
      return;
    }
    this.setData({
      start_iconbool: false,
      pause_iconbool: true,
      startfinish_iconbool: false,
    })
    starRun = 1;
    count_down(this);
    this.getLocation();
  },


  //****************************
  stopRun: function () {
    starRun = 0;
    count_down(this);
    this.setData({
      pause_iconbool: false,
      startfinish_iconbool: true,
    })
  },

  finishRun: function () {
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var end_time = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    
    var arun_record = {
      "duration": this.data.time,
      "end_time": end_time,
      "mileage": this.data.meters,
      "pace": this.data.pace,
      "start_time": this.data.start_time
    }
    starRun = 0;
    count_down(this);
    var run_num = 0;
    var temrecords = [];
    var record_id = '';
    var user_run = {};
    const db = wx.cloud.database()
    db.collection('runningRecords').get({
      success:function(res) {
        console.log('所有人跑步记录', res.data);
        var haveuser = 0;
        for(let i=0; i < res.data.length; i++ ){
          if(that.data.openid==res.data[i]._openid){
            that.setData({
              record_id: res.data[i]._id
            })
            record_id = res.data[i]._id
            user_run = res.data[i]
            console.log('我的跑步记录', user_run);
            haveuser = 1
            break;
          }
        }
        if(haveuser==0){
          wx.showToast({
            icon: 'none',
            title: '未找到用户信息'
          })
        }
        else{
          run_num = user_run.run_num
          temrecords = user_run.run_records
          temrecords[run_num] = arun_record;
          run_num++;
          console.log('跑步记录数组', temrecords);
          db.collection('runningRecords').doc(record_id).update({
            data: {
              run_records: temrecords,
              run_num: run_num
            },
            success: ress => {
              wx.showToast({
                title: '跑步记录成功',
                success: function (ress) {
                  wx.redirectTo({
                    url: '../MainRun/MainRun',
                  })

                }
              })
              console.log('[数据库] [更新记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '新增记录失败'
              })
              console.error('[数据库] [新增记录] 失败：', err)
            }
          })


        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '访问数据库失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
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



