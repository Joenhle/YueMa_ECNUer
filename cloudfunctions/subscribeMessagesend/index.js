const cloud = require('wx-server-sdk');
exports.main = async (event, context) => {
  cloud.init();
  const db = cloud.database();
  try {
    // 从云开数据库中查询等待发送的消息列表
    const messages = await db
      .collection('SubscribeMessage')
      // 查询条件这里做了简化，只查找了状态为未发送的消息
      // 在真正的生产环境，可以根据开课日期等条件筛选应该发送哪些消息
      .where({
        done: false,
      })
      .get();
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000 + 9 * 60 * 60;
    var date = new Date(parseInt(timestamp) * 1000);
    var temp = date.toISOString();
    var onehourlater = temp.substring(0, 10) + ' ' + temp.substring(11, 16); //创建当前时间晚一小时
    // 循环消息列表
    console.log('当前晚一个小时',onehourlater)
    const sendPromises = messages.data.map(async message => {
      if (message.data.time2.value <= onehourlater) {
        try {
          // 发送订阅消息
          await cloud.openapi.subscribeMessage.send({
            touser: message.touser,
            page: message.page,
            data: message.data,
            templateId: message.templateId,
          });
          // 发送成功后将消息的状态改为已发送
          return db
            .collection('SubscribeMessage')
            .doc(message._id)
            .update({
              data: {
                done: true,
              },
            });
        } catch (e) {
          return e;
        }
      }
    });

    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
};