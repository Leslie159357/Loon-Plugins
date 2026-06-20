// ==UserScript==
// @name         FIMO VIP Unlock
// @version      1.3.0
// @description  解锁FIMO相机全部VIP功能
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

if (!body) {
  $done({});
}

try {
  var obj = JSON.parse(body);
} catch (e) {
  $done({});
  return;
}

// ===== 核心：/fimo-user/user（VIP状态）=====
// subscribe.valid: false→true, forever: 0→1, endTime: 0→2099年
// 精确匹配 /fimo-user/user 但不匹配 /user/online 和 /user/sync
if (url.indexOf('/fimo-user/user') !== -1) {
  // 排除子路径
  if (url.indexOf('/fimo-user/user/online') !== -1 || url.indexOf('/fimo-user/user/sync') !== -1) {
    $done({body: JSON.stringify(obj)});
    return;
  }

  // 设置VIP - 精确路径 /fimo-user/user
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;

  // 已有的胶卷改为已同步购买
  if (obj.films && obj.films.length > 0) {
    for (var i = 0; i < obj.films.length; i++) {
      obj.films[i].pay = 'sync';
      obj.films[i].photo = 999;
    }
  }

  $done({body: JSON.stringify(obj)});
  return;
}

// ===== /fimo-common/filmAll（全部胶卷列表 - 解锁VIP胶卷）=====
if (url.indexOf('/fimo-common/filmAll') !== -1) {
  if (obj && obj.length > 0) {
    for (var i = 0; i < obj.length; i++) {
      obj[i].special = 'free';
      obj[i].isPurchase = 0;
      obj[i].price = '0';
      obj[i].status = 1;
    }
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== /fimo-common/subscribeConfig（把价格改为免费）=====
if (url.indexOf('/fimo-common/subscribeConfig') !== -1) {
  if (obj && obj.productList) {
    for (var i = 0; i < obj.productList.length; i++) {
      obj.productList[i].price = '0.01';
      obj.productList[i].confirmText = '免费';
    }
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== /fimo-common/apple/certificate（收据验证）=====
if (url.indexOf('/apple/certificate') !== -1) {
  obj.status = 0;
  obj.isVip = true;
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;
  if (obj.data) {
    obj.data.isVip = true;
    obj.data.valid = true;
    obj.data.forever = 1;
    obj.data.endTime = 4092599349000;
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== /fimo-common/apple/purchase（购买处理）=====
if (url.indexOf('/apple/purchase') !== -1) {
  obj.status = 0;
  obj.isVip = true;
  obj.subscribe = obj.subscribe || {};
  obj.subscribe.valid = true;
  obj.subscribe.forever = 1;
  obj.subscribe.endTime = 4092599349000;
  if (obj.data) {
    obj.data.isVip = true;
    obj.data.valid = true;
    obj.data.forever = 1;
    obj.data.endTime = 4092599349000;
  }
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== 其他接口：透传 =====
$done({body: JSON.stringify(obj)});
