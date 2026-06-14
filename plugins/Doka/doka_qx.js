// ==Quantumult X==
// @name         Doka Pro Unlock
// @description  解锁 Doka Pro VIP + AI 构图无限使用
// @version      3.0
// @author       Minis
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

if (!body || url.indexOf('www.yindoka.com') < 0) {
  $done({});
  return;
}

try {
  var obj = JSON.parse(body);
} catch(e) {
  $done({});
  return;
}

// ===== 如果 data 为 null 的特殊处理 =====
// ai_camera/v2 失败时 data:null，只改 code 不改 data
if (obj.data === null && obj.code !== undefined && obj.code !== 0) {
  obj.code = 0;
  obj.message = 'succ';
  // 完全保留 data:null，不改成 {}！App 自己处理 null
  $done({body: JSON.stringify(obj)});
  return;
}

// ===== 递归修改 VIP 字段 =====
function setVipTrue(o) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) {
    for (var i = 0; i < o.length; i++) { 
      if (o[i] && typeof o[i] === 'object') setVipTrue(o[i]); 
    }
    return;
  }
  var keys = Object.keys(o);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var val = o[key];
    var kl = key.toLowerCase();
    
    if (typeof val === 'boolean' && 
        ['is_vip','isvip','vip','ispro','ispremium','issubscribed',
         'subscribed','active','isenabled','hassubscription',
         'auto_renew_status','istrialperiod','is_trial_period'].indexOf(kl) >= 0) {
      o[key] = true;
    }
    
    if (typeof val === 'string') {
      if (kl === 'vip_type' || kl === 'membertype' || kl === 'producttier') o[key] = 'pro';
      if (kl === 'status' || kl === 'state') {
        var freeVals = ['free','none','trial','expired','inactive','free_user','cancelled','canceled'];
        for (var f = 0; f < freeVals.length; f++) {
          if (val.toLowerCase() === freeVals[f]) { o[key] = 'active'; break; }
        }
      }
      if ((kl === 'product_id' || kl === 'transactionid' || kl === 'originaltransactionid') && (val === '' || val === null)) {
        o[key] = 'com.ydgn.dokacamera.year.beimei';
      }
      if (['expire_time','expiretime','expiry_date','expirydate','expires_date','expiresat'].indexOf(kl) >= 0 &&
          (val === '' || val === '0001-01-01T00:00:00Z' || val === null)) {
        o[key] = '2099-12-31T23:59:59Z';
      }
    }
    
    if (typeof val === 'number') {
      if (['remaining_count','remainingcomposecount','remainingfiltercount',
           'freeusecount','freeuse','remaining','remaininguses',
           'remaining_use','remaining_uses'].indexOf(kl) >= 0) {
        o[key] = 999999;
      }
    }
    
    if (val && typeof val === 'object') setVipTrue(val);
  }
}

// ===== 执行 =====
setVipTrue(obj);

// ===== 精准覆盖 (只在 data 存在时) =====
if (obj.data && typeof obj.data === 'object') {
  obj.data.is_vip = true;
  if (obj.data.vip_type) obj.data.vip_type = 'pro';
  if (obj.data.expire_time !== undefined) obj.data.expire_time = '2099-12-31T23:59:59Z';
  if (obj.data.expires_date !== undefined) obj.data.expires_date = '2099-12-31T23:59:59Z';
  if (obj.data.remaining_count !== undefined) obj.data.remaining_count = 999999;
  if (obj.data.remaining_compose_count !== undefined) obj.data.remaining_compose_count = 999999;
  if (obj.data.remaining_filter_count !== undefined) obj.data.remaining_filter_count = 999999;
  if (obj.data.status !== undefined) obj.data.status = 'active';
  if (obj.data.product_id !== undefined) obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
  if (obj.data.auto_renew_status !== undefined) obj.data.auto_renew_status = true;
  if (obj.data.is_trial_period !== undefined) obj.data.is_trial_period = false;
  if (obj.data.environment !== undefined) obj.data.environment = 'Production';
}

$done({body: JSON.stringify(obj)});
