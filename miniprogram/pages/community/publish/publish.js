Page({
  data: {
    img_url: [],
    content: '',
    leibie:'',
    placeholder:'',
    array: ['跑步', '篮球', '羽毛球', '足球','棒球','乒乓球'],
    index: 0,
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  onLoad: function (options) {
    var that=this;
    that.setData({
      leibie:options.id
    })
    if(options.id=='dongtai'){
      that.setData({
        placeholder:"分享动态"
      })
    }else{
      that.setData({
        placeholder:"分享经验"
      })
    }
  },
  input: function (e) {
    this.setData({
      content: e.detail.value
    })
  },
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
              if(img_url.length==9){
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
               hideAdd:1
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
  //发布按钮事件
  send: function () {
    var that = this;


    //检查输入框和图片都是否为空
    if(that.data.content.length==0 && that.data.img_url.length==0){
      wx.showModal({
        title: '提示',
        content: '文字和图片不能都为空噢',
        showCancel: false
      })
      return
    }
    let img_url_ok = 0;
    let fileID=[];
    var is_loaded=false;
    var user_id = wx.getStorageSync('userid');
    var userinfo=wx.getStorageSync('userinfo');
    var timestamp=Date.parse(new Date());
    timestamp=timestamp/1000+8*60*60;
    var date=new Date(parseInt(timestamp)*1000);
    var temp=date.toISOString();
    var realtime=temp.substring(0,10)+' '+temp.substring(11,16);
    wx.showLoading({
      title: '上传中',
    })
    let img_url = that.data.img_url;
    for(let i = 0;i < img_url.length;i++){
      var timestamp = Date.parse(new Date());
      var geshi_of_image=img_url[i].match(/\.[^.]+?$/)[0];
      var image_of_cloudPath=userinfo.nickName+'_'+timestamp+i+geshi_of_image;                 
      wx.cloud.uploadFile({
        cloudPath:image_of_cloudPath,
        filePath:img_url[i],
        success(res){
          img_url_ok=img_url_ok+1;
          fileID.push(res.fileID);
          console.log(res.fileID);
        }
      })
    }
    //如果全部传完，则可以将图片路径保存到数据库
    var interval=setInterval(function(){
      console.log('重复执行')
      if (img_url_ok == img_url.length && is_loaded == false) {
        is_loaded = true;
        console.log(that.data.content)
        const db = wx.cloud.database();
        var dbname;
        if(that.data.leibie=='dongtai'){
          dbname='Posts'
          db.collection(dbname).add({
            data: {
              comments: [],
              dianzan_list: [],
              number_of_visit: 0,
              number_of_dianzan: 0,
              poster: userinfo.nickName,
              post_time: realtime,
              text: that.data.content,
              src_of_avatar: userinfo.avatarUrl,
              images: fileID,
            },
            success: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/community/panel/panel',
                    })
                  }
                }
              })
            },
            fail: function (res) {
              wx.showModal({
                title: '提交失败_1',
                showCancel: false
              })
            }
          })
        }else{
          dbname='experience'
          db.collection(dbname).add({
            data: {
              leibie:that.data.array[that.data.index],
              comments: [],
              dianzan_list: [],
              number_of_visit: 0,
              number_of_dianzan: 0,
              poster: userinfo.nickName,
              post_time: realtime,
              text: that.data.content,
              src_of_avatar: userinfo.avatarUrl,
              images: fileID,
            },
            success: function (res) {
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/panel/panel',
                    })
                  }
                }
              })
            },
            fail: function (res) {
              wx.showModal({
                title: '提交失败_1',
                showCancel: false
              })
            }
          })
        }
        
        clearInterval(interval);
      }
    },3000)
  },
  PreviewImage: function (e) {
    wx.previewImage({
      current: e.target.dataset.src, // 当前显示图片的http链接  
      urls: e.target.dataset.images// 需要预览的图片http链接列表  
    })
  },
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
          img_url:images
        });
      }
    })
  }
})