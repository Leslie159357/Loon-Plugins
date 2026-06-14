// ==Quantumult X==
// @name         Doka Pro Unlock
// @description  解锁 Doka Pro VIP（基于抓包精准数据）
// @version      1.0
// @author       Minis
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

if (!body) {
  $done({});
  return;
}

// vip-detail 处理
if (url.indexOf('/apple/vip-detail') >= 0) {
  var obj = JSON.parse(body);
  if (obj && obj.data) {
    obj.data.is_vip = true;
    obj.data.vip_type = 'pro';
    obj.data.expire_time = '2099-12-31T23:59:59Z';
    obj.data.remaining_count = 999999;
    obj.data.remaining_compose_count = 999999;
    obj.data.remaining_filter_count = 999999;
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// check-subscription-status 处理
if (url.indexOf('/apple/check-subscription-status') >= 0) {
  var obj = JSON.parse(body);
  if (obj && obj.data) {
    obj.data.is_vip = true;
    obj.data.status = 'active';
    obj.data.expires_date = '2099-12-31T23:59:59Z';
    obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
    obj.data.auto_renew_status = true;
    obj.data.is_trial_period = false;
    obj.data.environment = 'Production';
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// validate-receipt 处理
if (url.indexOf('/apple/validate-receipt') >= 0) {
  var fake = {
    code: 0,
    message: 'succ',
    data: {
      is_vip: true,
      vip_type: 'pro',
      expire_time: '2099-12-31T23:59:59Z',
      status: 'active',
      product_id: 'com.ydgn.dokacamera.year.beimei',
      auto_renew_status: true,
      is_trial_period: false,
      environment: 'Production'
    }
  };
  $done({body: JSON.stringify(fake)});
  return;
}

$done({});
