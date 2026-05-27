// 捏词 (nieci) Premium Unlock - Loon Script
// 拦截API: www.kwhat.fun
// 功能: 解锁会员 + 罐头积分

const url = $request.url;
const method = $request.method;
const isResponse = typeof $response !== 'undefined';

if (isResponse) {
  let body = $response.body;
  
  try {
    // POST /nieci/user/getUserInfo - 会员信息
    if (url.includes('/nieci/user/getUserInfo') && method === 'POST') {
      let obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        obj.data.expireTime = "2099-12-31T23:59:59.000+00:00";
        obj.data.userType = 1;
        obj.data.listenTimes = 9999;
        obj.data.contextLength = 9999;
        console.log('nieci: 会员解锁成功');
      }
      body = JSON.stringify(obj);
    }
    
    // GET /nieci/score/balance - 罐头积分
    else if (url.includes('/nieci/score/balance') && method === 'GET') {
      let obj = JSON.parse(body);
      if (obj.code === 200) {
        obj.data = 999999;
        console.log('nieci: 积分修改成功');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/user/getBindIdol - 绑定数量
    else if (url.includes('/nieci/user/getBindIdol') && method === 'POST') {
      let obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        obj.data.limitNum = 9999;
        console.log('nieci: 绑定数量解锁');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/order/getProductDetail-apple - 商品价格改为0
    else if (url.includes('/nieci/order/getProductDetail-apple') && method === 'POST') {
      let obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        if (obj.data.subscriptionList) {
          obj.data.subscriptionList.forEach(item => {
            item.payNum = 0;
            item.originalPrice = 0;
          });
        }
        if (obj.data.consumeList) {
          obj.data.consumeList.forEach(item => {
            item.payNum = 0;
          });
        }
        console.log('nieci: 商品价格改为0');
      }
      body = JSON.stringify(obj);
    }
    
    // POST /nieci/user/getNotice - 标记所有公告已读
    else if (url.includes('/nieci/user/getNotice') && method === 'POST') {
      let obj = JSON.parse(body);
      if (obj.code === 200 && obj.data) {
        if (obj.data.systemNoticeDTOs) {
          obj.data.systemNoticeDTOs.forEach(item => {
            item.ifChecked = true;
          });
        }
        obj.data.uncheckedNum = 0;
      }
      body = JSON.stringify(obj);
    }
    
  } catch (e) {
    console.log('nieci: 解析错误 - ' + e.message);
  }
  
  $done({body: body});
} else {
  $done({});
}
