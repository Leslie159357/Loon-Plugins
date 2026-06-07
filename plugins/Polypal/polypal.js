// ==UserScript==
// @name         Polypal VIP Unlock
// @version      1.1.0
// @description  解锁Polypal（Timekettle Live Translator）VIP会员 - 无限时长 + Pro功能 + 高级翻译模型
// @author       Minis
// @license      MIT
// ==/UserScript==

var url = $request.url;
var body = $response.body;

// ========== 1. 用户订阅计划（核心VIP） ==========
// GET /livetranslator/app/benefit/user_plan/current
// data: {} → 改为完整的年度会员数据（含所有Pro权益）
if (url.indexOf('/livetranslator/app/benefit/user_plan/current') !== -1) {
  if (body) {
    try {
      var obj = JSON.parse(body);
      if (obj && obj.code === 0 && obj.data) {
        // 返回完整的Pro会员数据
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
          // 以下是Pro功能相关字段
          "llm_access": true,           // LLM大模型访问权限
          "custom_model": true,         // 自定义模型权限
          "pro_features": true,         // Pro功能总开关
          "max_llm_requests": -1,       // 无限LLM请求
          "ai_summary": true,           // AI总结
          "ai_mindmap": true,           // AI思维导图
          "ai_tutor": true,             // AI外教
          "deepseek_model": true,       // DeepSeek模型
          "gpt_model": true,            // GPT模型
          "unlimited_translate": true   // 无限翻译
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

// ========== 2. 剩余时长 ==========
// GET /livetranslator/app/user/duration/remain
// 免费用户 remain 原始值为5（5分钟试用），改为999999
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
// 保 ok: true 并增加无限次数
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

// ========== 4. 存储空间（增强） ==========
// GET /livetranslator/app/document/si/recording/storage
// 免费用户 5GB → 改为无限
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

// ========== 5. 免费时长领取（拦截） ==========
// POST /livetranslator/app/goods/duration/free
// 每次返回5分钟，status=3。如果App在客户端判断次数，这个不需要修改
// 但保留扩展

$done({});
