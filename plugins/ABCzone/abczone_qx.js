// 英语天天练 - ABCzone VIP Unlock
// Quantumult X / Loon 通用脚本
// 学而思/好未来 Flutter+Unity+ObjC 混合架构
// VIP状态由自有HTTP API控制 ✅ 可通过MITM解锁
//
// 覆盖域名:
//   app.chuangjing.com    - Flutter主业务API (abc-api/v3/*)
//   api.xueersi.com       - 学而思基础服务 (basicsapi/v1/vip/detail)
//   bookapp.xueersibook.com - 图书API (bookapi/v1/*, basicapi/v1/*)
//   api.xesvip.cn         - 辅助服务
//   passport.100tal.com   - 统一认证
//
// 注意：Objetive-C端用requestVipConfig通过basicsapi/v1/vip/detail获取VIP状态
//       Flutter Dart端用abc-api/v3/*获取用户计划和会员数据
//       部分URL路径可能是运行时拼接的，脚本使用正则泛匹配

const url = $request.url;
const isResponse = typeof $response !== 'undefined';

// 未来过期时间戳: 2099-12-31 23:59:59 UTC
const FUTURE_TIMESTAMP = 4102444799000;
const FUTURE_TIMESTAMP_MS = 4102444799000000;
const VIP_EXPIRE_DATE = "2099-12-31T23:59:59Z";
const VIP_EXPIRE_DATE_CN = "2099-12-31 23:59:59";

if (isResponse) {
  let body = $response.body;

  if (typeof body === 'string' && body.length > 0) {
    try {
      let obj = JSON.parse(body);
      let modified = false;

      // ===== 递归修改所有VIP字段 =====
      function deepModify(obj, path) {
        if (!obj || typeof obj !== 'object') return false;
        let changed = false;

        for (let key in obj) {
          const val = obj[key];
          const lowerKey = key.toLowerCase();
          const currentPath = path ? path + '.' + key : key;

          // === Bool类型VIP标记 ===
          if (lowerKey === 'isvip' || lowerKey === 'is_vip' ||
              lowerKey === 'vip' || lowerKey === 'isv' ||
              lowerKey === 'issvip' || lowerKey === 'is_svip' ||
              lowerKey === 'issvvip' || lowerKey === 'is_svvip' ||
              lowerKey === 'ispremium' || lowerKey === 'premium' ||
              lowerKey === 'issubscribe' || lowerKey === 'is_subscribe' ||
              lowerKey === 'ismember' || lowerKey === 'is_member' ||
              lowerKey === 'issvipmember' || lowerKey === 'is_svip_member' ||
              lowerKey === 'ismembership' || lowerKey === 'is_membership' ||
              lowerKey === 'ispaid' || lowerKey === 'is_paid' ||
              lowerKey === 'ispayed' || lowerKey === 'is_payed' ||
              lowerKey === 'haspurchased' || lowerKey === 'has_purchased' ||
              lowerKey === 'haspayed' || lowerKey === 'has_payed' ||
              lowerKey === 'canread' || lowerKey === 'can_read' ||
              lowerKey === 'isfree' || lowerKey === 'is_free' ||
              lowerKey === 'isvipfree' || lowerKey === 'is_vip_free' ||
              lowerKey === 'isentitled' || lowerKey === 'is_entitled' ||
              lowerKey === 'isunlocked' || lowerKey === 'is_unlocked') {
            if (val === false || val === 0 || val === 'false' || val === '0') {
              obj[key] = true;
              changed = true;
            }
          }

          // === Int状态类VIP标记（0=普通, 1=VIP, 2=SVIP） ===
          if (lowerKey === 'vipstatus' || lowerKey === 'vip_status' ||
              lowerKey === 'svipstatus' || lowerKey === 'svip_status' ||
              lowerKey === 'userstatus' || lowerKey === 'user_status' ||
              lowerKey === 'membertype' || lowerKey === 'member_type' ||
              lowerKey === 'membershiptype' || lowerKey === 'membership_type' ||
              lowerKey === 'usertype' || lowerKey === 'user_type' ||
              lowerKey === 'viptype' || lowerKey === 'vip_type' ||
              lowerKey === 'viplevel' || lowerKey === 'vip_level' ||
              lowerKey === 'vipexpirystatus' || lowerKey === 'vip_expiry_status' ||
              lowerKey === 'status' || lowerKey === 'tier' ||
              lowerKey === 'subscriberlevel' || lowerKey === 'subscriber_level') {
            if (val === 0 || val === '0' || val === 'none' || val === 'normal' || val === 'free') {
              obj[key] = 1;
              changed = true;
            }
          }

          // === SVIP/特级状态 ===
          if (lowerKey === 'svipstatus' || lowerKey === 'svip_status' ||
              lowerKey === 'issvip' || lowerKey === 'is_svip') {
            if (val === 0 || val === '0' || val === false || val === 'false' || val === null) {
              obj[key] = 1;
              changed = true;
            }
          }

          // === VIP天数 ===
          if (lowerKey === 'vipdays' || lowerKey === 'vip_days' ||
              lowerKey === 'svipdays' || lowerKey === 'svip_days' ||
              lowerKey === 'remainingdays' || lowerKey === 'remaining_days' ||
              lowerKey === 'remaindays' || lowerKey === 'remain_days') {
            if (typeof val === 'number' && val >= 0 && val < 36500) {
              obj[key] = 36500;
              changed = true;
            }
          }

          // === 过期时间（毫秒时间戳） ===
          if (lowerKey === 'vipexpire' || lowerKey === 'vip_expire' ||
              lowerKey === 'vipexpiration' || lowerKey === 'vip_expiration' ||
              lowerKey === 'expiretime' || lowerKey === 'expire_time' ||
              lowerKey === 'expirationtime' || lowerKey === 'expiration_time' ||
              lowerKey === 'vipexpiretime' || lowerKey === 'vip_expire_time' ||
              lowerKey === 'vipexpireat' || lowerKey === 'vip_expire_at' ||
              lowerKey === 'vipexpireatms' || lowerKey === 'vip_expire_at_ms' ||
              lowerKey === 'vipendtime' || lowerKey === 'vip_end_time' ||
              lowerKey === 'svipendtime' || lowerKey === 'svip_end_time' ||
              lowerKey === 'expirydate' || lowerKey === 'expiry_date' ||
              lowerKey === 'expiredate' || lowerKey === 'expire_date' ||
              lowerKey === 'expirationdate' || lowerKey === 'expiration_date' ||
              lowerKey === 'endtime' || lowerKey === 'end_time' ||
              lowerKey === 'vipexpiredtime' || lowerKey === 'vip_expired_time') {
            if (val === null || val === 0 || val === '0' || val === '' ||
                (typeof val === 'number' && val > 0 && val < 100000000000)) {
              obj[key] = FUTURE_TIMESTAMP;
              changed = true;
            }
          }

          // === 过期时间（字符串日期） ===
          if (lowerKey === 'vipexpiredate' || lowerKey === 'vip_expire_date' ||
              lowerKey === 'membershipenddate' || lowerKey === 'membership_end_date' ||
              lowerKey === 'vipexpirydate' || lowerKey === 'vip_expiry_date' ||
              lowerKey === 'expirydate' || lowerKey === 'expiry_date' ||
              lowerKey === 'expiredate' || lowerKey === 'expire_date' ||
              lowerKey === 'expirationdate' || lowerKey === 'expiration_date' ||
              lowerKey === 'enddate' || lowerKey === 'end_date') {
            if (typeof val === 'string' && (val === '' || val === null || val.indexOf('1970') >= 0 || val.indexOf('2000') >= 0 || val.indexOf('202') === 0)) {
              obj[key] = VIP_EXPIRE_DATE;
              changed = true;
            }
          }

          // === 会员类型字符串 ===
          if (lowerKey === 'membershiptype' || lowerKey === 'membership_type' ||
              lowerKey === 'membertype' || lowerKey === 'member_type' ||
              lowerKey === 'viptype' || lowerKey === 'vip_type' ||
              lowerKey === 'subscriberlevel' || lowerKey === 'subscriber_level') {
            if (val === 'none' || val === 'normal' || val === 'free' || val === '' || val === null || val === 'trial') {
              obj[key] = 'premium';
              changed = true;
            }
          }

          // === 配额/限制 ===
          if (lowerKey === 'cheese' || lowerKey === 'coins' || lowerKey === 'coin' ||
              lowerKey === 'gold' || lowerKey === 'gems' || lowerKey === 'diamond' ||
              lowerKey === 'diamonds' || lowerKey === 'score' || lowerKey === 'points' ||
              lowerKey === 'energy' || lowerKey === 'power' || lowerKey === 'stamina' ||
              lowerKey === 'balance' || lowerKey === 'credit' || lowerKey === 'tokens') {
            if (typeof val === 'number' && val >= 0 && val < 999999) {
              obj[key] = 999999;
              changed = true;
            }
          }

          // === 每日/免费限制数 ===
          if (lowerKey === 'daynewlimit' || lowerKey === 'day_new_limit' ||
              lowerKey === 'dailynewlimit' || lowerKey === 'daily_new_limit' ||
              lowerKey === 'dayreviewlimit' || lowerKey === 'day_review_limit' ||
              lowerKey === 'dailyreviewlimit' || lowerKey === 'daily_review_limit' ||
              lowerKey === 'freelimit' || lowerKey === 'free_limit' ||
              lowerKey === 'maxfreelesson' || lowerKey === 'max_free_lesson' ||
              lowerKey === 'dailylimit' || lowerKey === 'daily_limit' ||
              lowerKey === 'dailylesson' || lowerKey === 'daily_lesson' ||
              lowerKey === 'lessonlimit' || lowerKey === 'lesson_limit' ||
              lowerKey === 'remainingquota' || lowerKey === 'remaining_quota' ||
              lowerKey === 'storequota' || lowerKey === 'store_quota') {
            if (typeof val === 'number' && val < 99999) {
              obj[key] = 99999;
              changed = true;
            }
          }

          // === 高级功能标识 ===
          if (lowerKey === 'subscribeenabled' || lowerKey === 'subscribe_enabled' ||
              lowerKey === 'featuresenabled' || lowerKey === 'features_enabled' ||
              lowerKey === 'allfeatures' || lowerKey === 'all_features' ||
              lowerKey === 'subscriptionfeatures' || lowerKey === 'subscription_features' ||
              lowerKey === 'availablefeatures' || lowerKey === 'available_features') {
            if (val === null || val === false || val === 0) {
              obj[key] = true;
              changed = true;
            }
          }

          // === is_lock / locked ===
          if (lowerKey === 'islock' || lowerKey === 'is_lock' ||
              lowerKey === 'locked' || lowerKey === 'islocked' || lowerKey === 'is_locked' ||
              lowerKey === 'needvip' || lowerKey === 'need_vip' ||
              lowerKey === 'requiresvip' || lowerKey === 'requires_vip' ||
              lowerKey === 'islockedbyvip' || lowerKey === 'is_locked_by_vip') {
            if (val === true || val === 1 || val === 'true' || val === '1') {
              obj[key] = false;
              changed = true;
            }
          }

          // === data字段 ==========
          if (lowerKey === 'data') {
            if (val === null || val === '' || val === '{}' || val === '[]') {
              obj[key] = {"is_vip": true, "is_svip": true, "vip_status": 1, "svip_status": 1, "is_subscribe": true, "is_member": true, "is_svip_member": true, "vip_expire": FUTURE_TIMESTAMP};
              changed = true;
            }
          }

          // === 递归处理对象 ===
          if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            if (deepModify(val, currentPath)) {
              changed = true;
            }
          }

          // === 递归处理数组 ===
          if (Array.isArray(val)) {
            for (var i = 0; i < val.length; i++) {
              if (typeof val[i] === 'object' && val[i] !== null) {
                if (deepModify(val[i], currentPath + '[' + i + ']')) {
                  changed = true;
                }
              }
            }
          }
        }
        return changed;
      }

      modified = deepModify(obj, '');

      if (modified) {
        $done({ body: JSON.stringify(obj) });
        return;
      }
    } catch (e) {
      // JSON parse 失败，非JSON响应
    }
  }
}

$done({});
