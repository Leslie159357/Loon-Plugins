// ==CloakNote==
// Yomu Premium 解锁 v1.0
// 兼容: Loon / Surge / Quantumult X
// 拦截: api.adaptytech.com（Adapty SDK API）
// 基于抓包数据: analytics profile 的 paid_access_levels 注入
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
  // 1. Adapty Analytics Profile — 注入 Premium Access Level
  //    GET /api/v1/sdk/analytics/profiles/{profile_id}/
  //    paid_access_levels: null → 注入 premium
  // ==========================================================
  if (url.indexOf('/analytics/profiles/') !== -1 && url.indexOf('adaptytech.com') !== -1) {
    if (obj.data && obj.data.attributes) {
      let attr = obj.data.attributes;

      // 注入 premium access level
      attr.paid_access_levels = {
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
          "cancellation_reason": null,
          "active_introductory_offer_type": null,
          "active_promotional_offer_type": null,
          "active_promotional_offer_id": null,
          "offer_id": null
        }
      };

      attr.total_revenue_usd = 999.99;

      $done({body: JSON.stringify(obj)});
      return;
    }
  }

  // ==========================================================
  // 2. Products 列表 (不需要修改，只用于参考)
  // ==========================================================
  if (url.indexOf('/products/app_store/') !== -1 && url.indexOf('adaptytech.com') !== -1) {
    // 产品列表是只读的，不需要修改
    $done({});
    return;
  }

  // ==========================================================
  // 3. 兜底 - 不做修改
  // ==========================================================
  $done({});

} catch (e) {
  $done({});
}
