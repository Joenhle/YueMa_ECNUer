const config = require("../../config.js");

Page({
  data: {
    // 小程序信息
    appInfo: config.config.appInfo,
    // UUIA信息
    uuia: config.config.uuia,
    // TODO: 更新日志
    updateLog: [
      {
        version: "1.0",
        time: "2020/03/13",
        subject: "初次见面，请多关照",
        items: [
          "全校最好用的小程序，正式上线！", "点击反馈，帮助我们变得更好"
        ]
      }
    ],
    // TODO: 致谢列表
    thankList: [
      "约嘛ECNUer开发组",
      "COLORUI和UUIA开源组件库",
      "logo设计师厌世魔王张一行",
      "所有帮助我们测试推广的老师同学们"
    ],
    
    // 切换日志
    showLog: false,
    // 是否有更新
    hasUpdated: false
  },

  onLoad: function () {
    // 判断是否有新版本
    var lastVersion = wx.getStorageSync('version')
    if (this.data.appInfo.version !== lastVersion || lastVersion == null) {
      this.setData({
        hasUpdated: true
      })
    }
  },

  /* 复制文本 */
  copyText: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },

  /* 切换更新日志/简介显示 */
  toggleLog: function () {
    this.setData({
      showLog: !this.data.showLog,
      hasUpdated: false
    });
    wx.setStorageSync('version', this.data.appInfo.version);
  },
  
  /* 分享 */
  onShareAppMessage: function () {
    var that = this;
    var shareObj = {
      title: config.config.appInfo.name + " | " + config.config.appInfo.slogan,
      path: '../index/index',
      imageUrl: config.config.appInfo.logo,
    };
    return shareObj;
  },
});