const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    first_time: 0,
    list_history: [
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    database_name: ["Posts", "experience", "DemandPosts", "DemandPosts", "buytogether", "usedobject", "question"],
    openid: '',
    userinfo:'',
    load: true,
    ball: ['篮球', '足球', '网球', '乒乓球', '羽毛球'],
    loadModal:true,
  },
  
  onLoad() {
    var that = this;
     //客官请稍等
    that.setData({
      loadModal: true
    })
    that.setData({
      openid:wx.getStorageSync('_openid'),
      userinfo:wx.getStorageSync('userinfo')
    })




    let list = [{
      "name": "动态",
      "id": "0"
    }, {
      "name": "经验",
      "id": "1"
    }, {
      "name": "约跑",
      "id": "2"
    }, {
      "name": "约球",
      "id": "3"
    }, {
      "name": "拼单外卖",
      "id": "4"
    }, {
      "name": "二手发布",
      "id": "5"
    }, {
      "name": "疑惑解答",
      "id": "6"
    }];

    
    db.collection('mine').where({
      _openid: that.data.openid
    }).get({
      success: function (res) {

         //1.更新约跑list_history
         var temp2 = res.data[0].demandposts
         console.log(temp2)
         for (let j = 0; j < temp2.length; ++j) {
           db.collection('DemandPosts').doc(temp2[j].post_id).get({
             success: function (res) {
               console.log(res)
                //获取未读消息数
                let unread_news = 0;
                for (let k = 0; k < res.data.members.length; ++k) {
                  if (res.data.members[k].openid == that.data.openid) {
                    unread_news = res.data.chat.length - res.data.members[k].read_news
                    break;
                  }
                }
 
               var dic = {
                 "_id": res.data._id,
                 "name": "约跑",
                 "text": res.data.rendezvous, //未改
                 "time": res.data.run_time,
                 "people": res.data.num_of_people,
                 "news": unread_news,
               }
               list_history[2].push(dic)
               console.log(dic)
               that.setData({
                 list_history: list_history
               })
             }
           })
         }


        //2.更新约球list_history
        var temp1 = res.data[0].balldemandposts
        var list_history = that.data.list_history
        for (let i = 0; i < temp1.length; ++i) {
          db.collection('BallDemandPosts').doc(temp1[i].post_id).get({
            success: function (res) {
              //获取未读消息数
              let unread_news = 0;
              for (let t = 0; t < res.data.members.length; ++t) {
                if (res.data.members[t].openid == that.data.openid) {
                  unread_news = res.data.chat.length - res.data.members[t].read_news
                  break;
                }
              }
              //存放在list_history中
              var name = that.data.ball[parseInt(res.data.ball)]
              var dic = {
                "_id": res.data._id,
                "name": name,
                "text": res.data.rendezvous, //未改
                "time": res.data.run_time,
                "people": res.data.num_of_people,
                "news": unread_news,
              }
              list_history[3].push(dic)
              that.setData({
                list_history: list_history
              })
            }
          })
        }
      }
    })









    var temp = that.data.list_history
    for (let i = 0; i < 7; ++i) {
      
      if(i == 2 || i == 3){
        continue;
      }
      const db = wx.cloud.database()
      wx.cloud.callFunction({
        name: 'db_mine_history',
        data: {
          dbname: that.data.database_name[i],
          _openid: that.data.openid
        }
      }).then(res => {
        res = res.result
        console.log(res)
        //动态，经验
        if (i == 0 || i == 1) {
          for (let j = 0; j < res.data.length; ++j) {
            var name
            if (i == 0) {
              name = res.data[j].poster
            } else {
              name = res.data[j].leibie
            }
            var dic = {
              "_id": res.data[j]._id,
              "name": name,
              "text": String(res.data[j].text).substring(0, 8) + "...",
              "time": res.data[j].post_time,
              "people": "",
              "news": ""
            }
            temp[i].push(dic)
          }
          that.setData({
            list_history: temp
          })
        }  else if (i == 4 || i == 5 || i == 6) {
          //拼单外卖，二手发布,疑惑解答
          for (let m = 0; m < res.data.length; ++m) {
            /*let unread_news = 0;
            for (let n = 0; n < res.data[j].members.length; ++n) {
              if (res.data[m].members[n].openid == that.data.openid) {
                unread_news = res.data[m].chat.length - res.data[m].members[n].read_news
                break;
              }
            }*/
            var dic = {
              "_id": res.data[m]._id,
              "name": res.data[m].leibie,
              "text": String(res.data[m].text).substring(0, 8) + "...",
              "time": res.data[m].post_time,
              "people": '',
              "news": '',
            }
            temp[i].push(dic)
            that.setData({
              list_history: temp
            })
          }
          //所有加载完毕
          if(i == 6){
            that.setData({
              loadModal:false
            })
          }
        }
      })
      
    }

    that.setData({
      list: list,
      listCur: list[0],
    })
   
  },
  onShow: function () {
    if (this.data.first_time == 1) {
      this.setData({
        list_history: [
          [],
          [],
          [],
          [],
          [],
          [],
          []
        ],
      })
      this.onLoad()
    } else {
      this.setData({
        first_time: 1
      })
    }

  },
  Tiaozhuan: function (e) {
    var i = e.currentTarget.dataset.i
    var id = e.currentTarget.dataset.id
    if (i == 0 || i == 1) {
      wx.navigateTo({
        url: '../../community/article/article?post_id=' + id + '&leibie=' + i,
      })
    }else if(i == 2){
      wx.navigateTo({
        url: '../../RunningPage/demandPost/demandPost?post_id='+id +'&is_history=true'
      })
    }else if( i == 3){
      wx.navigateTo({
        url: '../../PlayingballPage/ballDemandPost/ballDemandPost?post_id='+id +'&is_history=true'
      })
    }else if( i == 4){
      wx.navigateTo({
        url: '../../more_all/more_detailed/more_detailed?_id='+id+'&dbname=buytogether'
      })
    }else if( i == 5){
      wx.navigateTo({
        url: '../../more_all/more_detailed/more_detailed?_id='+id+'&dbname=usedobject'
      })
    }else{
      wx.navigateTo({
        url: '../../more_all/more_detailed/more_detailed?_id='+id+'&dbname=question'
      })
    }

  },



  onReady() {
    wx.hideLoading()
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  }
})