const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext();

    const result = await db.collection('SubscribeMessage').add({
      data: {
        //具体的字段可以根据自己的需求使用，但是data的值要注意
        //一定要这样传，和模板消息给的对应起来
        touser: OPENID,
        page: event.page,
        data: event.data,
        templateId: event.templateId,
        done: false,
      },
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};