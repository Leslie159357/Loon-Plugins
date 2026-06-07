// ==UserScript==
// @name         Polypal VIP Unlock
// @version      1.3.0
// @description  解锁Polypal VIP + 价格改0元 + 拦截内部API 30013端口 + 全局配置解锁
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 1. 用户订阅计划（核心VIP） ==========
// GET /livetranslator/app/benefit/user_plan/current
if (url.indexOf('/livetranslator/app/benefit/user_plan/current') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data = {
          "benefit_type": 3,
          "benefit_name": "连续包年",
          "expire_time": "2099-12-31 23:59:59",
          "expire_time_ms": 4099766399000,
          "is_continuous": true,
          "is_online": true,
          "plan_name": "连续包年",
          "purchase_channel": {
            "apple_id": "co.livetranslator.yearly.subscription"
          },
          "used_total_duration_minute": 999999,
          "used_effective_duration": 99,
          "used_effective_duration_unit": "year",
          "llm_access": true,
          "custom_model": true,
          "pro_features": true,
          "max_llm_requests": -1,
          "ai_summary": true,
          "ai_mindmap": true,
          "ai_tutor": true,
          "deepseek_model": true,
          "gpt_model": true,
          "unlimited_translate": true,
          "vip_type": 3,
          "vip_expire": "2099-12-31 23:59:59",
          "is_vip": true
        };
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

// ========== 2. 剩余时长（api-jp） ==========
// GET /livetranslator/app/user/duration/remain
if (url.indexOf('/livetranslator/app/user/duration/remain') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data.remain = 999999;
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

// ========== 3. 图片翻译权益 ==========
// GET /polypal-ai/app/image/benefit
if (url.indexOf('/polypal-ai/app/image/benefit') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data.ok = true;
        obj.data.remain_count = 99999;
        obj.data.total_count = 99999;
        obj.data.unlimited = true;
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

// ========== 4. 存储空间 ==========
// GET /livetranslator/app/document/si/recording/storage
if (url.indexOf('/livetranslator/app/document/si/recording/storage') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        obj.data.used_storage = "0.0";
        obj.data.total_storage = "99999.0";
        obj.data.available = true;
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

// ========== 5. 商品列表 - 价格改0元 ==========
// GET /livetranslator/app/shop_activity/page?entry_key=*
if (url.indexOf('/livetranslator/app/shop_activity/page') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data && obj.data.plans) {
        for (var i = 0; i < obj.data.plans.length; i++) {
          obj.data.plans[i].price = 0;
          obj.data.plans[i].currency = "USD";
          obj.data.plans[i].used_total_duration_minute = 999999;
          obj.data.plans[i].used_effective_duration = 99;
          obj.data.plans[i].used_effective_duration_unit = "year";
          obj.data.plans[i].is_online = true;
          obj.data.plans[i].trial_period_days = 999;
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

// ========== 6. 商品目录 - 价格改0元 ==========
// GET /livetranslator/app/shop_activity/product_catalog
if (url.indexOf('/livetranslator/app/shop_activity/product_catalog') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data && obj.data.infos) {
        for (var i = 0; i < obj.data.infos.length; i++) {
          obj.data.infos[i].price = 0;
          obj.data.infos[i].is_online = true;
          obj.data.infos[i].is_continuous = false;
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

// ========== 7. Apple内购下单 ==========
// POST /livetranslator/app/settle/vip/apple/order
if (url.indexOf('/livetranslator/app/settle/vip/apple/order') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        // 保持order_no正常
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({body: JSON.stringify({"code":0,"message":"Success","data":{"order_no":"free_order","price":0}})});
    }
  } else {
    $done({body: JSON.stringify({"code":0,"message":"Success","data":{"order_no":"free_order","price":0}})});
  }
  return;
}

// ========== 8. 用户配置 - 关闭升级提示 ==========
// GET /lvtrans/user/config/getConfigs (internal-apis:30013)
if (url.indexOf('/lvtrans/user/config/getConfigs') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.success && obj.data) {
        obj.data.upgradeFlag = false;
        obj.data.upgradeMessage = null;
        obj.data.displaySwitch = true;
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

// ========== 9. 时长消耗（30013端口） - 改为不扣时长 ==========
// POST /lvtrans/duration/durationRecord/newCost
if (url.indexOf('/lvtrans/duration/durationRecord/newCost') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.success && obj.data) {
        obj.data.timeCost = 0;
        obj.data.modType = 11;
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

// ========== 10. 时长更新（30013端口） - 剩余时长改为无限 ==========
// POST /lvtrans/duration/durationRecord/updateCost
if (url.indexOf('/lvtrans/duration/durationRecord/updateCost') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.success && obj.data) {
        obj.data.remain_duration = 999999.00;
      }
      $done({body: JSON.stringify(obj)});
    } catch (e) {
      $done({});
    }
  } else {
    $done({body: JSON.stringify({"success":true,"code":200,"desc":"Success.","data":{"remain_duration":999999.00}})});
  }
  return;
}

// ========== 11. 幂等ID（30013端口） ==========
// GET /lvtrans/user/auth/idempotent
// 不需要修改，放行

$done({});
