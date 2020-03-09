const app = getApp()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    list_history: [
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ],
    database_name: ["Posts", "experience", "DemandPosts", "DemandPosts", "buytogether", "usedobject","question"],
    openid: "oGuXN4k9UOlvkvRHjfCs6VpYWtTs",
    load: true
  },
  onLoad() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

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
    },{
      "name":"拼单外卖",
      "id":"4"
    },{
      "name":"二手发布",
      "id":"5"
    },{
      "name":"疑惑解答",
      "id":"6"
    }
    ];

    var temp = that.data.list_history
    for (let i = 0; i < 7; ++i) {
      const db = wx.cloud.database()
      db.collection(that.data.database_name[i]).where({
        _openid: that.data.openid
      }).get({
        success: function (res) {
          //动态，经验
          if (i == 0 || i == 1) {
            for (let j = 0; j < res.data.length; ++j) {
              var name
              if(i == 0){
                name = res.data[j].poster
              }else{
                name = res.data[j].leibie
              }
              var dic = {
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
          } else if (i == 2 || i== 3 ) {
            //约跑,约球
            for (let j = 0; j < res.data.length; ++j) {
              let unread_news = 0;
              for (let t = 0; t < res.data[j].members.length; ++t) {
                if (res.data[j].members[t].openid == that.data.openid) {
                  unread_news = res.data[j].chat.length - res.data[j].members[t].read_news
                  break;
                }
              }
              var name;
              if(i==2){
                name="跑步"
              }else{
                name="篮球"//未改
              }
              var dic = {
                "name": name,
                "text": res.data[j].rendezvous,//未改
                "time": res.data[j].post_time,
                "people": res.data[j].num_of_people,
                "news": unread_news,
              }
              temp[i].push(dic)
              that.setData({
                list_history: temp
              })
            }
          } else if (i == 4 || i == 5 || i == 6) {
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
                "name": res.data[m].leibie,
                "text": String(res.data[m].text).substring(0,8) + "...",
                "time": res.data[m].post_time,
                "people": '',
                "news": '',
              }
              temp[i].push(dic)         
              that.setData({
                list_history: temp
              })
            }
          }

        }
      })
    }


    that.setData({
      list: list,
      listCur: list[0]
    })
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