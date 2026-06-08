// ==UserScript==
// @name         FIMO VIP Unlock
// @version      1.1.0
// @description  解锁FIMO相机全部VIP功能 - subscribe.valid + forever + film special改为free
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 1. /fimo-user/user - 用户信息（VIP核心接口） ==========
// 实际JSON:
// {
//   "user": { "id":6220507, "name":"FIMO_BD44EE", ... },
//   "films": [{ "goodId":"fimoBusiness400", "pay":"free"|"sync", ... }],
//   "filmsCommonOrder": [],
//   "subscribe": { "valid": false, "forever": 0, "endTime": 0 }
// }
if (url.indexOf('/fimo-user/user') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.subscribe) {
        // 核心: 设置subscribe字段
        obj.subscribe.valid = true;
        obj.subscribe.forever = 1;
        obj.subscribe.endTime = 4092599349000;

        // 同步films中所有项为已购买
        if (obj.films && obj.films.length > 0) {
          for (var i = 0; i < obj.films.length; i++) {
            var f = obj.films[i];
            // pay: "free" = 免费, "sync" = 同步已购买
            // 改为已购买状态
            f.pay = "sync";
            f.photo = 999;
          }
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 2. /fimo-common/filmAll - 全部胶卷列表 ==========
// 实际JSON: 胶卷数组 [{ "id":60200, "special":"vip", "isPurchase":1, "price":"3", ... }]
if (url.indexOf('/fimo-common/filmAll') !== -1 || url.indexOf('/fimo-common/film') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.length > 0) {
        // 是数组格式
        for (var i = 0; i < obj.length; i++) {
          var film = obj[i];
          film.special = "free";
          film.isPurchase = 0;
          film.price = "0";
          film.status = 1;
          if (film.vip === true) film.vip = false;
        }
      } else if (obj && obj.data) {
        // 可能是对象套data格式
        var list = obj.data.filmList || obj.data.films || [];
        for (var i = 0; i < list.length; i++) {
          var film = list[i];
          film.special = "free";
          film.isPurchase = 0;
          film.price = "0";
          film.status = 1;
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 3. /fimo-common/subscribeConfig - 订阅配置（价格改0） ==========
if (url.indexOf('/fimo-common/subscribeConfig') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.productList) {
        for (var i = 0; i < obj.productList.length; i++) {
          obj.productList[i].price = "0.01";
          obj.productList[i].confirmText = "免费";
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 4. /fimo-common/subscribeSimpleConfig - 简单订阅配置 ==========
if (url.indexOf('/fimo-common/subscribeSimpleConfig') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj) {
        // subscribeSimpleConfig: [{ "sku":"fimo.camera.1year", "forever":0 }, ...]
        // 不需要修改，放行
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 5. /fimo-common/apple/certificate - 收据验证 ==========
if (url.indexOf('/apple/certificate') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        obj.status = 0;
        obj.isVip = true;
        if (obj.data) {
          obj.data.isVip = true;
          obj.data.vip = true;
          obj.data.vipExpire = 4092599349000;
          obj.data.valid = true;
          obj.data.forever = 1;
          obj.data.endTime = 4092599349000;
          obj.data.expiration_date = "2099-12-31";
          obj.data.is_trial_period = false;
          obj.data.is_in_intro_offer_period = false;
          obj.data.cancellation_date = null;
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 6. /fimo-common/apple/purchase - 购买处理 ==========
if (url.indexOf('/apple/purchase') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        obj.status = 0;
        obj.isVip = true;
        if (obj.data) {
          obj.data.isVip = true;
          obj.data.vip = true;
          obj.data.vipExpire = 4092599349000;
          obj.data.valid = true;
          obj.data.forever = 1;
          obj.data.endTime = 4092599349000;
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({body: JSON.stringify({"status":0,"isVip":true,"data":{"isVip":true,"valid":true,"forever":1,"endTime":4092599349000}})});
    }
  } else {
    $done({body: JSON.stringify({"status":0,"isVip":true,"data":{"isVip":true,"valid":true,"forever":1,"endTime":4092599349000}})});
  }
  return;
}

// ========== 7. /fimo-user/user/sync - 用户数据同步 ==========
if (url.indexOf('/fimo-user/user/sync') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.subscribe) {
        obj.subscribe.valid = true;
        obj.subscribe.forever = 1;
        obj.subscribe.endTime = 4092599349000;
      } else if (obj && obj.data && obj.data.subscribe) {
        obj.data.subscribe.valid = true;
        obj.data.subscribe.forever = 1;
        obj.data.subscribe.endTime = 4092599349000;
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 8. /fimo-user/user/online - 在线状态 ==========
if (url.indexOf('/fimo-user/user/online') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        // 透传，不需要修改
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 9. /fimo-common/startPopConfig - 启动弹窗配置 ==========
if (url.indexOf('/fimo-common/startPopConfig') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.id !== undefined) {
        // 透传
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 10. /fimo-common/sysconfig - 系统配置 ==========
if (url.indexOf('/fimo-common/sysconfig') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.data !== undefined) {
        // 透传
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
  return;
}

// ========== 兜底：路过所有JSON，尝试修改VIP相关字段 ==========
if (body) {
  try {
    var obj = JSON.parse(body);
    if (obj && typeof obj === 'object') {
      // 检查是否有subscribe字段
      if (obj.subscribe) {
        obj.subscribe.valid = true;
        obj.subscribe.forever = 1;
        obj.subscribe.endTime = 4092599349000;
      }
      if (obj.user && obj.user.subscribe) {
        obj.user.subscribe.valid = true;
        obj.user.subscribe.forever = 1;
      }
      // 检查是否包含special=vip的胶卷
      if (obj.length > 0 && obj[0].special !== undefined) {
        for (var i = 0; i < obj.length; i++) {
          if (obj[i].special === "vip") {
            obj[i].special = "free";
            obj[i].isPurchase = 0;
            obj[i].price = "0";
          }
        }
      }
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch (e) {}
}

$done({});
