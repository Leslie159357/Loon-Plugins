var body = $response.body;
var url = $request.url;
var method = $request.method;

if (!body) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);

  // 1. POST www.xmind.cn/_res/devices — 设备许可状态
  if (url.indexOf('/_res/devices') !== -1 && method === 'POST') {
    if (obj.license) {
      obj.license.status = 'Subscribed';
      obj.license.expireTime = 4099680000; // 2099年
    }
    if (obj.raw_data) {
      // 保留raw_data不变
    }
    console.log('[Xmind] _res/devices -> license status: ' + obj.license.status);
  }

  // 2. GET www.xmind.cn/_res/user_sub_details — 订阅详情
  if (url.indexOf('/_res/user_sub_details') !== -1 && method === 'GET') {
    obj._code = 200;
    // 伪造appstore订阅
    obj.appstore = [{
      'product_id': 'net.xmind.brownieapp.yearly',
      'expires_date': '2099-12-31T23:59:59Z',
      'purchase_date': '2026-05-31T15:00:00Z',
      'is_trial_period': false,
      'cancellation_date': null
    }];
    console.log('[Xmind] _res/user_sub_details -> injected appstore subscription');
  }

  // 3. POST www.xmind.cn/_api/appstore/active — App Store订阅验证
  if (url.indexOf('/_api/appstore/active') !== -1 && method === 'POST') {
    obj.status = 'subscribed';
    obj.subscriptionStatus = 'ACTIVE';
    obj.expireTime = 4099680000;
    obj.bindXmind = 1;
    console.log('[Xmind] _api/appstore/active -> status: ' + obj.status);
  }

  // 4. app.xmind.cn team/profile-by-id — 团队Pro计划
  if (url.indexOf('/api/drive/team/profile-by-id') !== -1 && method === 'POST') {
    if (obj.profile) {
      obj.profile.plan = 'pro';
      obj.profile.status = 'active';
      obj.profile.expiredAt = '2099-12-31T23:59:59Z';
      obj.profile.credits = [{
        'type': 'pro',
        'total': 9999,
        'remainder': 9999
      }];
      obj.profile.isAiDisabled = false;
    }
    if (obj.credit) {
      obj.credit.sheetLimit = 999;
    }
    console.log('[Xmind] team profile -> plan: pro, sheetLimit: 999');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('[Xmind] Error: ' + e.message);
  $done({});
}
