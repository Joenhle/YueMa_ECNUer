// pages/mine_basic_information_rewrite/mine_basic_information_rewrite.js
const db = wx.cloud.database();
Page({
  data: {
    grade:'',//年级
    sushe:'',//宿舍
    major:'',//专业
    college:'',//学院
    love: '', //爱好
    gender_show:'',//显示的性别
    gender:1,//性别
    index_gender:null,
    index_grade:null,
    index_sushe:null,
    index_college:null,
    picker_gender:['男','女'],
    picker_grade:['本科一年级','本科二年级','本科三年级','本科四年级','硕士一年级','硕士二年级','硕士三年级','博士一年级','博士二年级','博士三年级','教师'],
    picker_sushe:['中北四舍','中北五舍','中北七舍','中北16舍','中北17舍','中北18舍','闵行六号楼','闵行15号楼'],
    picker_college: ['计算机与软件工程学院', '数据科学与工程学院', '社会发展学院','心理与认知科学学院','音乐学院','教育学部',
 '地球科学学部','经济与管理学部', ],
  },
  onLoad: function (options) {
    this.setData({
      grade: options.grade,
      sushe: options.sushe,
      major: options.major,
      college: options.college,
      love: options.love,
      gender_show:options.gender_show
    })
    console.log('123'+this.data.gender_show)
  },
  //改变性别的值
   PickerChange_gender(e) {
      this.setData({
        index_gender: e.detail.value,
      })
    },
  //改变年级的值
  PickerChange_grade(e) {
    this.setData({
      index_grade: e.detail.value,
    })
  },
  //改变宿舍的值
  PickerChange_sushe(e) {
    this.setData({
      index_sushe: e.detail.value,
    })
  },
  //改变学院的值
  PickerChange_college(e) {
    this.setData({
      index_college: e.detail.value,
    })
  },
  //改变专业的值
  bindmajorInput:function(e){
    console.log(e);
    this.setData({
      major: e.detail.value,
    })
    console.log(this.data.major)
  },
  //改变爱好
    bindloveInput:function(e){
      console.log(e);
      this.setData({
        love: e.detail.value,
      })
    },
  //保存页面后跳转
  restore_inforamtion: function () {
      //将页面传到云端
      this.update();
      // 顺序执行，当已经执行完上面的代码就会开启定时器
      setTimeout(function () {
        wx.navigateBack({//返回
          delta: 1
        })
      }, 1000);
    },
   //将页面传到云端
   update:function(){
    if (typeof (this.data.gender_show) == 'undefined' ||typeof (this.data.grade) == 'undefined' || typeof (this.data.sushe) == 'undefined' || typeof (this.data.college) =='undefined'){
    wx.showToast({
      title: '请将个人信息填充完整',
      icon:'none',
    })
    }
   else {
    this.setData({
      grade:this.data.picker_grade[this.data.index_grade],
      sushe:this.data.picker_sushe[this.data.index_sushe],
      college:this.data.picker_college[this.data.index_college],
      gender_show:this.data.picker_gender[this.data.index_gender]
  })
  if(this.data.gender_show=='男') {
    this.setData({
      gender:1
    })
  }
  else if(this.data.gender_show=='女'){
    this.setData({
      gender:2
    })
  }
    console.log('获取mine数据库成功');
    //根据用户的_id取更新要更新的值
    db.collection('mine').doc(wx.getStorageSync('_id')).
    update({
      data: {
        grade:this.data.grade,
        sushe:this.data.sushe,
        college:this.data.college,
        major:this.data.major,
        college:this.data.college,
        love:this.data.love,
        gender:this.data.gender
      }
    }).then(res => {
      console.log('数据库更新成功')
      }).catch(err => {
        console.error('数据库更新失败'+err)
        wx.showToast({
          title: '保存失败',
          icon:'none'
        })
      })
   }
  },
})