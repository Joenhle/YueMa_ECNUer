Page({
  data:{
    url:'',
  },
   onLoad:function(e){
     var that = this
     that.setData({
       url:e.url
     })
     
   }
})