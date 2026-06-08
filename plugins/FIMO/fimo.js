// ==UserScript==
// @name         FIMO VIP Unlock
// @version      1.0.0
// @description  解锁FIMO相机全部VIP功能 - 会员状态 + 免费胶卷 + 订阅配置修改
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 1. /fimo-user/user - 用户信息（VIP状态） ==========
if (url.indexOf('/fimo-user/user') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        var target = obj.data || obj;
        target.isVip = true;
        target.vip = true;
        target.isPro = true;
        target.isPremium = true;
        target.isMember = true;
        target.member = true;
        target.pro = true;
        target.premium = true;
        target.vipType = 1;
        target.isYearVip = true;
        target.canUseAllFilms = true;
        target.vipExpire = 4092599349000;
        target.vipExpireDate = "2099-12-31 23:59:59";
        target.vip_expire = 4092599349000;
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

// ========== 2. /fimo-common/film - 胶卷列表（解锁全部胶卷） ==========
if (url.indexOf('/fimo-common/film') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        var filmData = obj.data || obj;
        var filmList = filmData.filmList || filmData.films || [];
        if (filmList.length === undefined) {
          // 不是数组，可能是对象形式
          filmList = [];
        }
        for (var i = 0; i < filmList.length; i++) {
          var film = filmList[i];
          film.isFree = true;
          film.isLocked = false;
          film.locked = false;
          film.needVip = false;
          film.canUse = true;
          film.price = 0;
          if (film.vip) film.vip = false;
          if (film.isVipFilm) film.isVipFilm = false;
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

// ========== 4. /fimo-common/apple/certificate - 收据验证 ==========
if (url.indexOf('/apple/certificate') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        obj.status = 0;
        if (obj.data) {
          obj.data.isVip = true;
          obj.data.vip = true;
          obj.data.vipExpire = 4092599349000;
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

// ========== 5. /fimo-common/apple/purchase - 购买处理 ==========
if (url.indexOf('/apple/purchase') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        obj.status = 0;
        if (obj.data) {
          obj.data.isVip = true;
          obj.data.vip = true;
          obj.data.vipExpire = 4092599349000;
        }
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({body: JSON.stringify({"status":0,"data":{"isVip":true,"vip":true,"vipExpire":4092599349000}})});
    }
  } else {
    $done({body: JSON.stringify({"status":0,"data":{"isVip":true,"vip":true,"vipExpire":4092599349000}})});
  }
  return;
}

// ========== 6. /fimo-user/user/sync - 用户数据同步 ==========
if (url.indexOf('/fimo-user/user/sync') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        var target = obj.data || obj;
        target.isVip = true;
        target.vip = true;
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

// ========== 7. /fimo-common/config - 配置 ==========
if (url.indexOf('/fimo-common/config') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && typeof obj === 'object') {
        var target = obj.data || obj;
        target.isVip = true;
        target.vip = true;
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

// ========== 兜底：如果是JSON但没命中特定接口，尝试替换所有VIP字段 ==========
if (body) {
  try {
    var obj = JSON.parse(body);
    if (obj && typeof obj === 'object' && !obj.productList) {
      var vipKeys = ['vip', 'isVip', 'isPro', 'isPremium', 'isMember', 'member', 'pro', 'premium', 'canUseAllFilms', 'isYearVip', 'vipType'];
      for (var k = 0; k < vipKeys.length; k++) {
        var key = vipKeys[k];
        if (obj[key] !== undefined) {
          if (typeof obj[key] === 'boolean') obj[key] = true;
          if (key === 'vipType') obj[key] = 1;
        }
        if (obj.data && obj.data[key] !== undefined) {
          if (typeof obj.data[key] === 'boolean') obj.data[key] = true;
          if (key === 'vipType' && obj.data) obj.data[key] = 1;
        }
      }
      $done({body: JSON.stringify(obj)});
      return;
    }
  } catch (e) {}
}

$done({});
