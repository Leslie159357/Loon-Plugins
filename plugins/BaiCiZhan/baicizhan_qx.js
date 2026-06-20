// 百词斩 - Baicizhan VIP Unlock v2.1
// 基于 IPA 静态分析 + 两次实际抓包数据 (433_*, 434_*)
// 
// ⚠️ 核心限制: 百词斩多数业务API使用 Thrift 二进制协议 (application/x-thrift)
//    MITM 无法直接修改 Thrift 响应体。以下 JSON 接口可修改。
//
// ✅ v2.1 新增拦截接口:
//   1. strategy.baicizhan.com/api/strategy/get_member_info_page
//      → payed: false→true, userVipInfo: null→VIP对象, creditNum: 0→99999
//   2. learn.baicizhan.com/api/study/pay-book/get_book_desc?bookId=X
//      → status: 0→1 (付费书籍标记为已购)
//   3. strategy.baicizhan.com/api/strategy/get_paid_book_sale_info?paidBookId=X
//      → memberSaleInfo 价格改为0
//   4. learn.baicizhan.com/api/mall/proxy/virtual-currency/apple/get_user_ios_promotion_id_list
//      → 已购标记
//   5. learn.baicizhan.com/api/mall/proxy/virtual-currency/apple/get_order_info
//      → 订单状态
//   6. strategy.baicizhan.com/api/system/report_event
//      → 不影响

const url = $request.url;
const isResponse = typeof $response !== 'undefined';

// 2099-12-31 23:59:59 UTC 时间戳 (毫秒)
const FUTURE_MS = 4102444799000;

if (isResponse) {
  let body = $response.body;
  
  if (typeof body === 'string' && body.length > 0) {
    try {
      let obj = JSON.parse(body);
      let modified = false;
      
      // ============================================================
      // 1. get_member_info_page - 会员信息页面 (strategy域名)
      // ============================================================
      if (url.indexOf('/api/strategy/get_member_info_page') !== -1) {
        if (obj.data) {
          // 付费状态
          if (obj.data.payed === false || obj.data.payed === 0) {
            obj.data.payed = true;
            modified = true;
          }
          
          // 铜板设置为99999
          if (obj.data.creditNum < 99999) {
            obj.data.creditNum = 99999;
            modified = true;
          }
          if (obj.data.getMonthCreditReward === false) {
            obj.data.getMonthCreditReward = true;
            modified = true;
          }
          if (obj.data.getTodayReward === false) {
            obj.data.getTodayReward = true;
            modified = true;
          }
          obj.data.todayRewardList = [{"type": 1, "value": 100, "desc": "Pro会员每日积分奖励"}];
          
          // userVipInfo - null→VIP信息
          if (obj.data.userVipInfo === null) {
            obj.data.userVipInfo = {
              "entitlementKey": "bcz.app.vip.v1",
              "memberLevel": 2,
              "expireTime": FUTURE_MS,
              "maxValue": 99999,
              "currentValue": 99999,
              "nextRecoveryTime": null,
              "nextRecoveryAmount": null,
              "recoveryInterval": null
            };
            modified = true;
          } else {
            if (obj.data.userVipInfo.expireTime !== FUTURE_MS) {
              obj.data.userVipInfo.expireTime = FUTURE_MS;
              modified = true;
            }
            obj.data.userVipInfo.memberLevel = 2;
            obj.data.userVipInfo.maxValue = 99999;
            obj.data.userVipInfo.currentValue = 99999;
          }
          
          // 会员套餐价格改0
          if (obj.data.memberSaleInfoList && Array.isArray(obj.data.memberSaleInfoList)) {
            for (var i = 0; i < obj.data.memberSaleInfoList.length; i++) {
              var item = obj.data.memberSaleInfoList[i];
              if (item.price !== undefined) {
                item.price = 0;
                item.originPrice = 0;
                item.autoRenewal = 0;
                if (item.tag) {
                  var tags = item.tag.split(',,');
                  if (tags.length >= 2) {
                    tags[1] = "已解锁";
                  }
                  item.tag = tags.join(',,');
                }
                modified = true;
              }
            }
          }
        }
      }
      
      // ============================================================
      // 2. get_book_desc - 付费书籍详情 (learn域名)
      // ============================================================
      else if (url.indexOf('/api/study/pay-book/get_book_desc') !== -1) {
        if (obj.data) {
          // status: 0 = 未购买, 改为 1 = 已购买
          if (obj.data.status === 0 || obj.data.status === undefined) {
            obj.data.status = 1;
            modified = true;
          }
          // btntype: 改为已购状态
          if (obj.data.btntype !== 0) {
            obj.data.btntype = 0;
            modified = true;
          }
          // 价格改为0
          if (obj.data.priceOrigin > 0) {
            obj.data.priceOrigin = 0;
            obj.data.priceCopper = 0;
            modified = true;
          }
          if (obj.data.canCopper === false) {
            obj.data.canCopper = true;
            modified = true;
          }
        }
      }
      
      // ============================================================
      // 3. get_paid_book_sale_info - 付费书籍套餐推荐 (strategy域名)
      // ============================================================
      else if (url.indexOf('/api/strategy/get_paid_book_sale_info') !== -1) {
        if (obj.data) {
          if (obj.data.memberSaleInfo && obj.data.memberSaleInfo.price > 0) {
            obj.data.memberSaleInfo.price = 0;
            obj.data.memberSaleInfo.originPrice = 0;
            obj.data.memberSaleInfo.autoRenewal = 0;
            modified = true;
          }
          if (obj.data.memberSaleInfoList && Array.isArray(obj.data.memberSaleInfoList)) {
            for (var i = 0; i < obj.data.memberSaleInfoList.length; i++) {
              var item = obj.data.memberSaleInfoList[i];
              if (item.price > 0) {
                item.price = 0;
                item.originPrice = 0;
                item.autoRenewal = 0;
                modified = true;
              }
            }
          }
        }
      }
      
      // ============================================================
      // 4. 其他JSON接口 - 兜底递归修改
      // ============================================================
      else {
        modified = deepModifyVIP(obj);
      }
      
      if (modified) {
        $done({body: JSON.stringify(obj)});
        return;
      }
    } catch (e) {
      // 非JSON响应
    }
  }
}

$done({});

// ===== 递归修改VIP字段（兜底策略） =====
function deepModifyVIP(obj, depth) {
  if (!obj || typeof obj !== 'object') return false;
  if (depth === undefined) depth = 0;
  if (depth > 10) return false;
  
  let changed = false;
  
  for (var key in obj) {
    var val = obj[key];
    var lk = key.toLowerCase();
    
    // Bool类型VIP标记
    if ((lk === 'payed' || lk === 'is_payed' || lk === 'ispayed' || 
         lk === 'isvip' || lk === 'is_vip' ||
         lk === 'ispremium' || lk === 'premium' ||
         lk === 'ismember' || lk === 'is_member' ||
         lk === 'haspayed' || lk === 'has_payed' ||
         lk === 'haspurchased' || lk === 'has_purchased') &&
        (val === false || val === 0 || val === 'false' || val === '0')) {
      obj[key] = true;
      changed = true;
    }
    
    // Int类型VIP/状态
    else if ((lk === 'membertype' || lk === 'member_type' ||
              lk === 'status' || lk === 'btntype' ||  // 注意: 通用 status/btntype!
              lk === 'viplevel' || lk === 'vip_level' ||
              lk === 'viptype' || lk === 'vip_type' ||
              lk === 'vipstatus' || lk === 'vip_status') &&
             (val === 0 || val === '0' || val === 'none' || val === 'normal')) {
      // 对于 status 字段，只在值为0时改为1（未购买→已购买）
      if (lk === 'status') {
        // status 有很多种含义，谨慎处理
        // 在付费书籍上下文中，0=未购买，1=已购买
      }
      obj[key] = 1;
      changed = true;
    }
    
    // 过期时间
    else if ((lk === 'vipexpire' || lk === 'vip_expire' ||
              lk === 'expiretime' || lk === 'expire_time' ||
              lk === 'expirydate' || lk === 'expiry_date' ||
              lk === 'expirationtime' || lk === 'expiration_time' ||
              lk === 'endtime' || lk === 'end_time') &&
             (val === null || val === 0 || val === '0' || val === '')) {
      obj[key] = FUTURE_MS;
      changed = true;
    }
    
    // 配额/能量
    else if ((lk === 'creditnum' || lk === 'credit_num' ||
              lk === 'coin' || lk === 'coins' || lk === 'gold' ||
              lk === 'energy' || lk === 'diamond') &&
             typeof val === 'number' && val >= 0 && val < 99999) {
      obj[key] = 99999;
      changed = true;
    }
    
    // 递归处理子对象
    else if (typeof val === 'object' && val !== null) {
      if (deepModifyVIP(val, depth + 1)) {
        changed = true;
      }
    }
  }
  return changed;
}
