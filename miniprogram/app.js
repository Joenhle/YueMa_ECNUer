//app.js
App({
  onLaunch: function () {

    try {
      wx.clearStorageSync()
    } catch(e) {
      // Do something when catch error
    }

    this.globalData = { 
      currentTab: 0,
      leibie_of_onshow: '全部',
      leibie_from_onshow: false,
      userInfo: null,
      evn: "xiaohuang-evwg7",
      is_article_change:'',
      is_panel_from_publish:false,
      yueqiu_or_yuepao:'约球',
      is_denglu:false,
      openid:'',
      userinfo:'',
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'xiaohuang-evwg7',
        traceUser: true,
      })
    }

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })  
  },

  
})