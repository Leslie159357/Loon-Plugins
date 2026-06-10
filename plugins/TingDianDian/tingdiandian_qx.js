// ==UserScript==
// @name         TingDianDian Pro Unlock
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      1.0.0
// @description  听点点 - 解锁所有Pro/Permanent会员功能
// @author       Leslie159357
// @license      MIT
// ==/UserScript==

const url = $request.url;
const method = $request.method;

// 兼容 Quantumult X 和 Loon
const isQX = typeof $task !== 'undefined';
const isLoon = typeof $loon !== 'undefined';
const isSurge = typeof $httpClient !== 'undefined' && !isLoon;

function log(msg) {
  if (isQX) {
    console.log(msg);
  } else if (isLoon || isSurge) {
    console.log(msg);
  }
}

// 判断是否需要处理
function shouldHandle(url) {
  // 只处理 api.tingdiandian.com 的响应
  if (url.indexOf('api.tingdiandian.com') === -1) return false;
  if (method !== 'POST' && method !== 'GET') return false;
  return true;
}

/**
 * 递归修改所有VIP/会员相关字段
 */
function unlockVIP(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = unlockVIP(obj[i]);
    }
    return obj;
  }
  
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const val = obj[key];
    const lowerKey = key.toLowerCase();
    
    // ===== 布尔字段 → true =====
    // Pro会员
    if (key === 'isProPermanentMember' || 
        key === 'isBasicPermanentMember' || 
        key === 'isOneMonthMember' || 
        key === 'isOneYearMember' || 
        key === 'isBasicOneMonthMember') {
      obj[key] = true;
      log('✅ VIP: ' + key + ' → true');
      continue;
    }
    
    // 订阅状态
    if (key === 'isSubscribed') {
      obj[key] = true;
      log('✅ ' + key + ' → true');
      continue;
    }
    
    // 布尔状态字段
    if (lowerKey === 'needsubscribe' || 
        lowerKey === 'memberonly' || 
        lowerKey === 'showpermanentmember') {
      obj[key] = false;
      log('✅ ' + key + ' → false');
      continue;
    }
    
    // Pro 标识
    if (lowerKey === 'prolabel' || 
        lowerKey === 'pro' && typeof val === 'boolean') {
      obj[key] = true;
      log('✅ ' + key + ' → true');
      continue;
    }
    
    // ===== 数值字段 =====
    // 积分/额度
    if (key === 'permanentNumber' || 
        key === 'points' || 
        key === 'balance' || 
        key === 'score' || 
        key === 'credit') {
      if (typeof val === 'number' || typeof val === 'string') {
        obj[key] = 999999;
        log('✅ Balance: ' + key + ' → 999999');
      }
      continue;
    }
    
    // ===== 成员计划 =====
    if (key === 'memberPlan') {
      obj[key] = 'pro_permanent';
      log('✅ memberPlan → pro_permanent');
      continue;
    }
    
    // ===== 权限列表 =====
    if (key === 'entitlement' || key === 'entitlements') {
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        for (let ek in val) {
          if (typeof val[ek] === 'object' && val[ek] !== null) {
            val[ek].isActive = true;
            val[ek].expiresDate = '2099-12-31T23:59:59Z';
            val[ek].willRenew = true;
          }
        }
      }
      log('✅ entitlement → activated');
      continue;
    }
    
    // ===== 到期时间 =====
    if (lowerKey.indexOf('expire') !== -1 || 
        lowerKey === 'vipenddate' || 
        lowerKey === 'vipendtime') {
      // 时间戳或日期字符串
      if (typeof val === 'number') {
        obj[key] = 4102444800000; // 2099-12-31
      } else if (typeof val === 'string') {
        obj[key] = '2099-12-31T23:59:59Z';
      }
      log('✅ Expiry: ' + key + ' → 2099');
      continue;
    }
    
    // ===== entitlements 深层处理 =====
    if (key === 'entitlements' && Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (typeof val[i] === 'object' && val[i] !== null) {
          val[i].isActive = true;
          val[i].willRenew = true;
          if (val[i].expiresDate || val[i].expires_date || val[i].expirationDate) {
            val[i].expiresDate = '2099-12-31T23:59:59Z';
            val[i].expires_date = '2099-12-31T23:59:59Z';
            val[i].expirationDate = '2099-12-31T23:59:59Z';
          }
        }
      }
      log('✅ entitlements[] → all active');
      continue;
    }
    
    // ===== purchase-catalog 商品列表处理 =====
    if (key === 'isFree' || key === 'isPurchased' || key === 'hasPurchased') {
      obj[key] = true;
      log('✅ ' + key + ' → true');
      continue;
    }
    
    // ===== 功能限制 =====
    if (key === 'trialState' || key === 'trial_status') {
      obj[key] = 1; // trial已使用
      log('✅ ' + key + ' → 1');
      continue;
    }
    
    // ===== showPermanentMember/Mark =====
    if (lowerKey === 'showpermanentmember') {
      obj[key] = false;
      log('✅ ' + key + ' → false');
      continue;
    }
    
    // 递归处理子对象
    obj[key] = unlockVIP(val);
  }
  
  return obj;
}

// ===== 硬编码特定接口 =====

// /user - 用户信息
function handleUser(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // 尝试找 user/profile 对象
  obj = unlockVIP(obj);
  
  // 顶层字段
  obj.isProPermanentMember = true;
  obj.isBasicPermanentMember = true;
  obj.isOneMonthMember = true;
  obj.isOneYearMember = true;
  obj.isBasicOneMonthMember = true;
  obj.isSubscribed = true;
  obj.needSubscribe = false;
  obj.memberPlan = 'pro_permanent';
  obj.showPermanentMember = false;
  
  // 会员到期时间
  if (obj.permanentNumber !== undefined) obj.permanentNumber = 999999;
  
  // 如果有 RC entitlements
  if (obj.entitlement && typeof obj.entitlement === 'object') {
    obj.entitlement.isActive = true;
    obj.entitlement.expiresDate = '2099-12-31T23:59:59Z';
    obj.entitlement.willRenew = true;
  }
  if (obj.entitlements) {
    if (Array.isArray(obj.entitlements)) {
      for (let i = 0; i < obj.entitlements.length; i++) {
        if (typeof obj.entitlements[i] === 'object') {
          obj.entitlements[i].isActive = true;
          obj.entitlements[i].expiresDate = '2099-12-31T23:59:59Z';
          obj.entitlements[i].willRenew = true;
        }
      }
    }
  }
  
  // 时间戳到期
  if (obj.vipEndDate) obj.vipEndDate = '2099-12-31T23:59:59Z';
  if (obj.vipEndTime) obj.vipEndTime = 4102444800000;
  if (obj.expiresAt) obj.expiresAt = 4102444800000;
  
  return obj;
}

// /purchase-catalog - 商品目录
function handlePurchaseCatalog(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  obj = unlockVIP(obj);
  
  // 如果包含 memberships 列表
  if (obj.memberships && Array.isArray(obj.memberships)) {
    for (let i = 0; i < obj.memberships.length; i++) {
      obj.memberships[i].isPurchased = true;
      obj.memberships[i].isFree = true;
      obj.memberships[i].price = 0;
      if (obj.memberships[i].originalPrice) obj.memberships[i].originalPrice = 0;
    }
  }
  
  return obj;
}

// /purchase-updater
function handlePurchaseUpdater(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj = unlockVIP(obj);
  // 不需要更新
  obj.needUpdate = false;
  return obj;
}

// /subscriptions/list
function handleSubscriptionsList(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj = unlockVIP(obj);
  
  if (obj.subscriptions && Array.isArray(obj.subscriptions)) {
    for (let i = 0; i < obj.subscriptions.length; i++) {
      obj.subscriptions[i].isActive = true;
      obj.subscriptions[i].status = 'active';
      obj.subscriptions[i].expiresAt = '2099-12-31T23:59:59Z';
    }
  }
  
  // 如果没有订阅列表，伪造一个
  if (!obj.subscriptions || obj.subscriptions.length === 0) {
    obj.subscriptions = [{
      id: 'pro_permanent',
      plan: 'pro_permanent',
      isActive: true,
      status: 'active',
      expiresAt: '2099-12-31T23:59:59Z',
      willRenew: true
    }];
  }
  
  return obj;
}

// /check-batch-transcript-member
function handleCheckTranscriptMember(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj.isMember = true;
  obj.canUseTranscript = true;
  obj.remainingQuota = 999999;
  return unlockVIP(obj);
}

// /check-can-use-transcript
function handleCheckCanUseTranscript(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj.canUse = true;
  obj.remaining = 999999;
  obj.hasQuota = true;
  return unlockVIP(obj);
}

// /check-points-limit-enough
function handleCheckPointsLimit(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj.enough = true;
  obj.remaining = 999999;
  obj.limit = 999999;
  return unlockVIP(obj);
}

// /profile
function handleProfile(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj = handleUser(obj);
  return obj;
}

// /feature-comparison
function handleFeatureComparison(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj = unlockVIP(obj);
  
  // 所有功能都可用
  if (obj.features && Array.isArray(obj.features)) {
    for (let i = 0; i < obj.features.length; i++) {
      obj.features[i].available = true;
      obj.features[i].locked = false;
    }
  }
  
  return obj;
}

// /show-permanent-member
function handleShowPermanentMember(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  obj.show = false;
  obj.shown = true;
  return obj;
}

// 主处理函数
function handleResponse(resp) {
  try {
    // 解析响应
    let body;
    if (typeof resp.body === 'string') {
      body = JSON.parse(resp.body);
    } else {
      body = resp.body;
    }
    
    if (!body || typeof body !== 'object') return resp;
    
    const path = url;
    
    log('🔄 Processing: ' + path);
    
    // 根据路径选择处理函数
    if (path.indexOf('/user') !== -1 && path.indexOf('/app/user') !== -1) {
      body = handleUser(body);
    } else if (path.indexOf('/profile') !== -1) {
      body = handleProfile(body);
    } else if (path.indexOf('/purchase-catalog') !== -1) {
      body = handlePurchaseCatalog(body);
    } else if (path.indexOf('/purchase-updater') !== -1) {
      body = handlePurchaseUpdater(body);
    } else if (path.indexOf('/subscriptions/list') !== -1) {
      body = handleSubscriptionsList(body);
    } else if (path.indexOf('/check-batch-transcript-member') !== -1) {
      body = handleCheckTranscriptMember(body);
    } else if (path.indexOf('/check-can-use-transcript') !== -1) {
      body = handleCheckCanUseTranscript(body);
    } else if (path.indexOf('/check-points-limit-enough') !== -1) {
      body = handleCheckPointsLimit(body);
    } else if (path.indexOf('/feature-comparison') !== -1) {
      body = handleFeatureComparison(body);
    } else if (path.indexOf('/show-permanent-member') !== -1) {
      body = handleShowPermanentMember(body);
    } else {
      // 通用的泛匹配
      body = unlockVIP(body);
    }
    
    // 返回修改后的响应
    resp.body = JSON.stringify(body);
    
  } catch (e) {
    log('❌ Error: ' + e.toString());
  }
  
  return resp;
}

// 兼容 QX 和 Loon/Surge
if (isQX) {
  // Quantumult X
  let body = $response.body;
  let resp = { body: body };
  resp = handleResponse(resp);
  $done({ body: resp.body });
  
} else if (isLoon || isSurge) {
  // Loon / Surge
  let resp = { body: $response.body };
  resp = handleResponse(resp);
  
  if (isSurge) {
    $done({ body: resp.body });
  } else {
    $done(resp);
  }
}
