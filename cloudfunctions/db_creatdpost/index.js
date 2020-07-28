// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('DemandPosts').add({
    data: {
      _openid: event._openid,
      duration: event.duration,
      finish_time: event.finish_time,
      gender_require: event.gender_require,
      max_num: event.max_num,
      members: event.members,
      num_of_people: 1,
      post_time: event.post_time,
      poster: event.poster,
      poster_gender: event.poster_gender,
      remark: event.remark,
      rendezvous: event.rendezvous,
      run_time: event.run_time,
      speed_require: event.speed_require,
      src_of_avatar: event.src_of_avatar,
      chat:[]
    },

  })
}