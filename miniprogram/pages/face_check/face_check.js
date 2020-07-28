//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    name: "",
    major: "",
    xuehao: "",

    userinfo: [],
    openid: "",

    //步骤条
    basicsList: [{
      icon: 'usefullfill',
      name: '开始'
    }, {
      icon: 'radioboxfill',
      name: '校园卡注册'
    }, {
      icon: 'radioboxfill',
      name: '人脸验证'
    }, {
      icon: 'roundcheckfill',
      name: '完成'
    }, ],
    basics: 0,
    numList: [{
      name: '开始'
    }, {
      name: '校园卡注册'
    }, {
      name: '人脸验证'
    }, {
      name: '完成'
    }, ],
    num: 0,
    scroll: 0,


    elements: [{
        title: '校园卡注册',
        name: 'Step1',
        leibie: 'camera',
        color: 'purple',
        icon: 'vipcard'
      },
      {
        title: '人脸验证 ',
        name: 'Step2',
        leibie: 'camera',
        color: 'mauve',
        icon: 'formfill'
      },
      {
        title: '确定拍照',
        name: 'Yes',
        leibie: 'cansole_or_accurate',
        color: 'cyan',
        icon: 'roundcheckfill'
      },
      {
        title: '取消拍照',
        name: 'No',
        leibie: 'cansole_or_accurate',
        color: 'orange',
        icon: 'close'
      },
    ],
    src: '',
    show_camera: false,
    show_cansole_and_accurate: false,
    show_register_and_login: true,
    is_register_or_login: '',
    device_position: '',
    grade: ['', '大一', '大二', '大三', '大四', '研一', '研二', '博士生'],
    sign_time:'',
    loadModal:false,
  },
  Get_sign_time: function () {
    //获取注册时间
    var that = this
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 8 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var realtime = temp.substring(0, 10) + ' ' + temp.substring(11, 16);
    that.setData({
      sign_time:realtime
    })

  },
  numSteps() {
    this.setData({
      num: this.data.num == this.data.numList.length - 1 ? 0 : this.data.num + 1
    })
  },
  onLoad: function () {

    wx.openSetting({
      success (res) {
        console.log(res.authSetting)
      }
    })

    var that = this
    that.Get_sign_time()
    wx.getStorage({
      key: 'openid',
      success: function (res) {
        that.setData({
          openid: res.data
        })
      },
    })
    wx.getStorage({
      key: 'userinfo',
      success: function (res) {
        that.setData({
          userinfo: res.data
        })
      },
    })

  }, //人脸注册按钮触发此函数
  click_of_camera: function (e) {
    var that = this
    var device_position = '';
    console.log(e.currentTarget.dataset.leibie)
    if (e.currentTarget.dataset.leibie == '校园卡注册') {
      console.log('我进入了校园卡注册')
      device_position = 'back'
    } else {
      device_position = 'front'
    }
    that.setData({
      show_camera: true,
      show_cansole_and_accurate: true,
      show_register_and_login: false,
      device_position: device_position,
      is_register_or_login: e.currentTarget.dataset.leibie
    })
  },
  click_of_cansole_or_accurate: function (e) {
    var that = this;
    if (e.currentTarget.dataset.leibie == '取消拍照') {
      console.log('我进入了取消拍照')
      that.setData({
        show_camera: false,
        show_cansole_and_accurate: false,
        show_register_and_login: true,
      })
    } else {
      console.log('我进来了2')
      if (that.data.is_register_or_login == '校园卡注册') {
        that.register();
      } else {
        that.login();
      }
    }
  },

  register: function () {
    var that = this
    if (that.data.num >= 1) {
      wx.showModal({
        title: '提示',
        content: '您已完成校园卡注册',
        showCancel: false
      })
      return;
    }

    wx.showToast({
      icon: "loading",
      title: "正在上传中。。。",
      duration: 15000
    });
    const ctx = wx.createCameraContext() //创建相机上下文
    ctx.takePhoto({
      quality: 'high', //获取原图
      success: (res) => {
        this.setData({
          src: res.tempImagePath //得到拍照后的图片地址
        });
        wx.getImageInfo({
          src: res.tempImagePath,
          success (res) {
            console.log(res)
          }
        })

        //先判断学生证的有效性
        wx.uploadFile({
          url: 'https://api-cn.faceplusplus.com/cardpp/v1/templateocr', //接口
          method: 'post',
          filePath: that.data.src, //刚才拍照的图片地址
          name: 'image_file', //图片的字段名和接口的字段要对应上
          header: {
            "Content-Type": "multipart/form-data" //必须用此header
          },
          formData: {
            'api_key': 'Q4fGQPraHIvDiqPqxbrR6s2Yrdoclb7h', //请填写你创建的 apikey
            'api_secret': 'tNFF8FxEudsRlQBhUPIxYyMpeGjX-qcf', //请填写你的api_secret
            'template_id': '1583830566',
          },
          success(res) {
            if (res.statusCode != 200) {
              console.log(res)
              wx.hideToast(); //隐藏提示
              wx.showModal({
                title: '提示',
                content: '请上传规范的校园卡照片',
                showCancel: false
              })
              return
            } else {
              var obj = JSON.parse(res.data); //转换成json格式不然解析不了
              console.log(obj);
              var ckeck = obj['result'][0]['value']['text'][0]
          
              that.setData({
                name: obj['result'][1]['value']['text'][0],
                xuehao: obj['result'][2]['value']['text'][0],
                major: obj['result'][3]['value']['text'][0]
              })
              wx.showModal({
                title: '右下角的英文',
                content: ckeck,
                showCancel: true
              })
              if (ckeck.indexOf('ecnu')!=-1) {
                wx.uploadFile({ //上传图片到接口，获取人脸唯一标识，face_token

                  url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
                  filePath: that.data.src, //刚才拍照的图片地址
                  name: 'image_file', //图片的字段名和接口的字段要对应上
                  header: {
                    "Content-Type": "multipart/form-data" //必须用此header
                  },
                  formData: {
                    'api_key': 'Q4fGQPraHIvDiqPqxbrR6s2Yrdoclb7h', //请填写你创建的 apikey
                    'api_secret': 'tNFF8FxEudsRlQBhUPIxYyMpeGjX-qcf', //请填写你的api_secret
                  },
                  success: function (res) {


                    var obj = JSON.parse(res.data); //转换成json格式不然解析不了
                    console.log(res.data)

                    if (obj['faces'][0] == null || obj['faces'][0] == '') { //根据反回的数据判断是是否检测到人脸
                      wx.hideToast(); //隐藏提示
                      wx.showModal({
                        title: '提示',
                        content: '检测不到人脸',
                        showCancel: true
                      })

                      return;
                    } else {

                      that.setData({
                        face_token: obj['faces'][0]['face_token'], //获取得到的人脸标识
                      });

                      //把新注册的人脸与脸集进行对比获得confidence值 这个值大于80我们就认为人脸集中有这个人
                      wx.request({
                        url: 'https://api-cn.faceplusplus.com/facepp/v3/search', //接口
                        method: 'post',
                        data: {
                          'api_key': 'Q4fGQPraHIvDiqPqxbrR6s2Yrdoclb7h', //请填写你创建的 apikey
                          'api_secret': 'tNFF8FxEudsRlQBhUPIxYyMpeGjX-qcf', //请填写你的api_secret
                          'face_token': that.data.face_token, //传入face_token和脸集中的数据比对
                          'outer_id': '13996689582', //脸集唯一标识，就是上面我们创建的脸集
                          'return_result_count': '1' //返回一条匹配数据，范围1-5
                        },
                        header: {
                          'content-type': 'application/x-www-form-urlencoded',
                        },
                        success(res) {
                          //var obj = JSON.parse(res.data);
                          that.setData({
                            confidence: res.data['results'][0]['confidence'] //对比得到的可信值
                          });
                          console.log(that.data.confidence)
                          if (that.data.confidence < 80) { //可信值小于80我们就把他加到脸集中

                            //把face_token添加到脸集中
                            wx.request({
                              url: 'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface', //添加到脸集的接口
                              method: 'post',
                              data: {
                                'api_key': 'Q4fGQPraHIvDiqPqxbrR6s2Yrdoclb7h', //请填写你创建的 apikey
                                'api_secret': 'tNFF8FxEudsRlQBhUPIxYyMpeGjX-qcf', //请填写你的api_secret
                                'face_tokens': that.data.face_token, //把上请求得到的人脸标识添加到脸集中
                                'outer_id': '13996689582',

                              },
                              header: {
                                'content-type': 'application/x-www-form-urlencoded',
                              },
                              success(res) {
                                wx.hideToast(); //隐藏提示
                                that.numSteps()
                                wx.showModal({
                                  title: '提示',
                                  content: '注册成功',
                                  showCancel: false
                                })
                                that.setData({
                                  show_camera: false,
                                  show_cansole_and_accurate: false,
                                  show_register_and_login: true,
                                })

                              },
                              fail: function (e) {
                                wx.hideToast(); //隐藏提示
                                wx.showModal({
                                  title: '提示',
                                  content: '注册失败',
                                  showCancel: false
                                })
                              },
                              complete: function () {
                                wx.hideToast(); //隐藏提示
                              }
                            })
                          } else {
                            wx.hideToast(); //隐藏提示
                            that.numSteps()
                            wx.showModal({
                              title: '提示',
                              content: '你已经注册过了',
                              showCancel: false
                            })
                            that.setData({
                              show_camera: false,
                              show_cansole_and_accurate: false,
                              show_register_and_login: true,
                            })

                            return;
                          }
                        },
                        fail: function (e) {
                          wx.hideToast(); //隐藏提示
                          wx.showModal({
                            title: '提示',
                            content: '注册失败',
                            showCancel: false
                          })
                        },
                        complete: function () {
                          wx.hideToast();
                        }
                      })
                    }

                    if (res.statusCode != 200) {
                      wx.hideToast(); //隐藏提示
                      wx.showModal({
                        title: '提示',
                        content: '上传失败',
                        showCancel: false
                      })
                      return;
                    }
                  },
                  fail: function (e) {
                    wx.hideToast(); //隐藏提示
                    wx.showModal({
                      title: '提示',
                      content: '上传失败',
                      showCancel: false
                    })
                  },
                  complete: function () {
                    wx.hideToast(); //隐藏Toast
                  }
                })
              } else {
                wx.hideToast(); //隐藏提示
                wx.showModal({
                  title: '提示',
                  content: '请上传规范的校园卡照片',
                  showCancel: false
                })
              }
            }
          }
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)

  }, //登录验证
  login: function () {
    var that = this

    if (that.data.num != 1) {
      wx.showModal({
        title: '提示',
        content: '请先完成校园卡注册',
        showCancel: false
      })
      return
    }
    const ctx = wx.createCameraContext(); //创建相机上下文
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath //相机拍照得到照片的地址
        })
        wx.showToast({
          icon: "loading",
          title: "正在上传中。。。"
        });

        wx.uploadFile({ //上传照片和脸集中的照片对比并得出结果

          url: 'https://api-cn.faceplusplus.com/facepp/v3/search', //对比人脸接口
          filePath: that.data.src, //上传相机拍照得到照片的地址
          name: 'image_file',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          formData: {
            'api_key': 'Q4fGQPraHIvDiqPqxbrR6s2Yrdoclb7h', //请填写你创建的 apikey
            'api_secret': 'tNFF8FxEudsRlQBhUPIxYyMpeGjX-qcf', //请填写你的api_secret
            'outer_id': '13996689582', //脸集唯一标识
            'return_result_count': '1', //只反回一条匹配数据
          },
          success: function (res) {
            console.log(res)
            if (res.statusCode != 200) {
              wx.showModal({
                title: '提示',
                content: '上传失败1',
                showCancel: false
              })
              return;
            }
            console.log(res)
            var obj = JSON.parse(res.data); //转成json对象
            if (obj['faces'][0] == null || obj['faces'][0] == '') { //判断是否检测到人脸
              wx.showModal({
                title: '提示',
                content: '未检测到人脸',
                showCancel: false
              })
              return;
            } else {
              that.setData({
                confidence: obj['results'][0]['confidence'] //可信值
              });
              console.log(obj['results'][0]['confidence']);
              if (that.data.confidence >= 80) { //可信值大于80就认为是同一个人
                that.numSteps()
                that.numSteps()
                that.setData({
                  show_camera: false,
                  show_cansole_and_accurate: false,
                  show_register_and_login: true,
                })

                //注册用户信息
                let grade = parseInt(that.data.sign_time.slice(0,4))-parseInt(that.data.xuehao.slice(0,4))-1000
                if(grade > 7){
                  grade = '毕业生'
                }else{
                  grade = that.data.grade[grade]
                }
                const db = wx.cloud.database()
                db.collection("mine").add({
                  data: {
                    realName: that.data.name,
                    college: that.data.major,
                    major:'' ,
                    xuehao: that.data.xuehao,
                    nickName: that.data.userinfo.nickName,
                    gender: that.data.userinfo.gender,
                    avatarUrl: that.data.userinfo.avatarUrl,
                    balldemandposts: [],
                    demandposts: [],
                    dianzan_ren: [],
                    dianzan: 0,
                    grade: grade,
                    yuepao: 0,
                    yueqiu: 0,
                    age: 0,
                    exercise: 0,
                    love: '',
                    score: 0,
                    sushe: '空',
                    weight: 60,
                    sign_time: that.data.sign_time,
                  },
                  success: function (res) {
                    console.log('注册成功')
                    that.setData({
                      loadModal: true
                    })
                    setTimeout(()=> {
                      that.setData({
                        loadModal: false
                      })
                    }, 2000)
                    console.log('马上跳转')
                    wx.switchTab({
                      url: '../mine_all/mine/mine',
                    })
                    return
                  },
                  fail: function (res) {
                    wx.showModal({
                      title: '注册失败',
                      showCancel: false
                    })
                  }
                })

                return;
              } else {
                wx.showModal({
                  title: '匹配度低于80',
                  content: that.data.confidence.toString(),
                  showCancel: false
                })
                return;
              }
            }
          },
          fail: function (e) {
            console.log(e);
            wx.showModal({
              title: '提示',
              content: '上传失败2',
              showCancel: false
            })
          },
          complete: function () {
            wx.hideToast(); //隐藏Toast
          }
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  }
})