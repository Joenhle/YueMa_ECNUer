var that =this
Page({
  data: {
    img_url: [],//获取用户的上传图片的数组
    content: '',//Input函数获取用户的输入信息
    leibie: '',//根据leibie来修改placeholder的值
    placeholder: '',//placeholder的值
    array_1: ['奶茶', '外卖', '旅行', '淘宝', '快递代送', '其他'],//拼单外卖的选择器
    array_2: ['图书', '零食', '化妆品', '衣服', '数码', '其他'],//二手商店的选择器
    array_3: ['绩点升学','求职就业','考研大军','出国留学','修理物件','其他'],//疑惑解答的选择器
    array: [],//根据leibie来确定是发布二手还是商品，简化代码的复杂度
    index: 0,//获取当前长按图片下标，还有选择器的值
  },
  //监听函数，监听more_buytogether传来的参数leibie,根据leibie的值对placeholder进行修改
  onLoad: function (options) {
    that=this,
    this.setData({
      leibie:options.id
    })
    if (options.id == 'pingdan') {
      this.setData({
        placeholder: "拼单需求发布中",
        array: ['奶茶', '外卖', '旅行', '淘宝', '快递代送', '其他'],
      })
    } else if(options.id=='usedobject') {
      this.setData({
        placeholder: "出售二手赚钱中",
        array: ['图书', '零食', '化妆品', '衣服', '数码', '其他']
      })
    }
    else{
      this.setData({
        placeholder: "人生疑惑发布中",
        array: ['绩点升学', '求职就业', '考研大军', '出国留学', '修理物件', '其他']
      })
    }
  },
  //input函数，用content获取用户的输入信息
  input: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
  //图片预览，调用wx.previewImage~
  PreviewImage: function (e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
  },
  //长按图片删除，wx.showModal用来选择是与否
  deleteImage: function (e) {
    var that = this;
    var images = that.data.img_url;
    var index = e.currentTarget.dataset.index;//获取当前长按图片下标
    console.log(index)
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {
          images.splice(index, 1);
        } else if (res.cancel) {
          return false;
        }
        that.setData({
          img_url: images
        });
      }
    })
  },
  //选择图片，调用wx.chooseImage对内寸进行访问。到9的时候加号不显示，res.tempFilePaths为图片的本地路径
  chooseimage: function () {
    var that = this;
    wx.chooseImage({
      count: 9, // 默认9 
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有 
      success: function (res) {
        if (res.tempFilePaths.length > 0) {
          //把每次选择的图push进数组
          let img_url = that.data.img_url;
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            if (img_url.length < 9) {
              img_url.push(res.tempFilePaths[i])
              //最多只能上传9张
              that.setData({
                hideAdd: 0
              })
              if (img_url.length == 9) {
                that.setData({
                  hideAdd: 1
                })
                wx.showModal({
                  title: '提示',
                  content: '最多只能上传9张哦',
                  showCancel: false
                })
              }
            }
            else {
              that.setData({
                hideAdd: 1
              })
              wx.showModal({
                title: '提示',
                content: '最多只能上传9张哦',
                showCancel: false
              })
              break
            }
          }
          that.setData({
            img_url: img_url
          })
        }
      }
    })
  },
  //选择器，用index来选择值
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //发布按钮事件
  send: function () {
    //判定图片和文字是否为空,为空则showToast不发布
    if (this.data.img_url.length == 0&&this.data.content=='') {
      wx.showToast({
        icon: 'none',
        title: '写点东西吧',
        duration: 1000
      })
      console.log("文字图片都未写")
    }
    //如果有图片和文字则进行发布
    else{
    /*************把时间和图片路径得到，上传到云端*********/
    var that=this
    let img_url_ok = 0;
    let fileID = [];
    var is_loaded = false;
    var user_id = wx.getStorageSync('userid');
    var userInfo = wx.getStorageSync('userInfo');
    //时间的格式化
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    wx.showLoading({
      title: '上传中',
    })
    let img_url = that.data.img_url;
    for (let i = 0; i < img_url.length; i++) {
      //图片路径
      var timestamp = Date.parse(new Date());
      var geshi_of_image = img_url[i].match(/\.[^.]+?$/)[0];
      var image_of_cloudPath = userInfo.nickName + '_' + timestamp + i + geshi_of_image;
      //传图片到云端
      wx.cloud.uploadFile({
        cloudPath: image_of_cloudPath,
        filePath: img_url[i],
        success(res) {
          img_url_ok = img_url_ok + 1;
          fileID.push(res.fileID);
          console.log(res.fileID);
        }
      })
    }
    /***************如果全部传完，则可以将图片路径保存到数据库和个人历史**********/
    var interval = setInterval(function () {
      console.log('重复执行')
      console.log(img_url_ok, img_url.length,is_loaded, that.data.leibie)
      if (img_url_ok == img_url.length && is_loaded == false) {
        is_loaded = true;
        var dbname;//上传图片到哪个数据库
        const db = wx.cloud.database();
        console.log('获取数据库成功');
        /*****************根据leibie的值来判定是商品还是二手商品，并给array赋值*/
        if(that.data.leibie=='pingdan'){
          dbname="buytogether"
        } else if (that.data.leibie == 'usedobject'){
          dbname = "usedobject"
        }
          else{
          dbname ="question"
        }
        console.log('设置的置为'+dbname)
        /******************传本地数据中到对应的集合中*************** */
          console.log('进入'+dbname+'集合');
          db.collection(dbname).add({
            data: {
              leibie: that.data.array[that.data.index],
              comments: [],
              dianzan_list: [],
              number_of_visit: 0,
              number_of_dianzan: 0,
              poster: userInfo.nickName,
              post_time: realtime,
              text: that.data.content,
              src_of_avatar: userInfo.avatarUrl,
              images: fileID,
            },
            success: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
            },
            fail: err=>{
              wx.showModal({
                title: '提交失败_1',
                showCancel: false
              })
              console.error('[数据库] [新增记录] 失败：', err)
            }
          })
        } 
        clearInterval(interval);
    }, 2000)
    }
  },
})