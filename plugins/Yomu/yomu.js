// ==CloakNote==
// Yomu Premium 解锁 v1.1
// 兼容: Loon / Surge / Quantumult X
// 拦截: api.adaptytech.com — 注入 paid_access_levels premium
// 注: 需清除 Yomu 后台重新打开，或重装/清除数据后首次启动
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ==========================================================
  // 1. Analytics Profile — 注入 Premium Access Level
  //    GET/PATCH /api/v1/sdk/analytics/profiles/{profile_id}/
  //    paid_access_levels 是关键字段
  // ==========================================================
  if (url.indexOf('adaptytech.com') !== -1 && url.indexOf('/analytics/profiles/') !== -1) {
    console.log('Yomu: intercepted analytics profile');

    // 确保有 data.attributes
    if (!obj.data) {
      obj.data = {};
    }
    if (!obj.data.attributes) {
      obj.data.attributes = {};
    }

    // 注入 premium 访问等级
    obj.data.attributes.paid_access_levels = {
      "premium": {
        "id": "premium",
        "is_active": true,
        "is_lifetime": true,
        "will_renew": true,
        "is_in_grace_period": false,
        "is_refund": false,
        "store": "app_store",
        "vendor_product_id": "lifetime.yomu.app",
        "activated_at": "2024-01-01T00:00:00Z",
        "renewed_at": "2024-01-01T00:00:00Z",
        "expires_at": "2099-12-31T23:59:59Z",
        "starts_at": "2024-01-01T00:00:00Z",
        "unsubscribed_at": null,
        "billing_issue_detected_at": null,
        "cancellation_reason": null
      }
    };

    // 也注入 subscriptions 和 non_subscriptions
    if (!obj.data.attributes.subscriptions) {
      obj.data.attributes.subscriptions = {
        "lifetime.yomu.app": {
          "is_active": true,
          "is_lifetime": true,
          "store": "app_store",
          "vendor_product_id": "lifetime.yomu.app",
          "vendor_transaction_id": "2000000000000000",
          "purchased_at": "2024-01-01T00:00:00Z",
          "renewed_at": "2024-01-01T00:00:00Z",
          "expires_at": "2099-12-31T23:59:59Z",
          "starts_at": "2024-01-01T00:00:00Z",
          "is_sandbox": false,
          "is_refund": false
        }
      };
    }

    obj.data.attributes.total_revenue_usd = 999.99;

    console.log('Yomu: injected premium access level');
    $done({body: JSON.stringify(obj)});
    return;
  }

  // ==========================================================
  // 2. 兜底
  // ==========================================================
  $done({});

} catch (e) {
  console.log('Yomu error: ' + e.message);
  $done({});
}
