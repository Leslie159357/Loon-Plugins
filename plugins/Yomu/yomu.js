// ==CloakNote==
// Yomu Premium 解锁 v1.4
// 双脚本策略:
//   请求脚本: 清除缓存hash → 强制 API 返回完整 profile
//   响应脚本: 注入 paid_access_levels premium
// ==/CloakNote==

// ========== 请求拦截：清除缓存 hash ==========
// 当请求 analytics profiles 时，清除 previous-response-hash
// 这样 API 会重新返回完整 profile 而非空对象
if ($request && $request.headers) {
  if ($request.headers['adapty-sdk-previous-response-hash']) {
    $request.headers['adapty-sdk-previous-response-hash'] = '0000000000000000';
    console.log('Yomu: cleared cache hash → force full profile');
  }
  if ($request.headers['if-none-match']) {
    delete $request.headers['if-none-match'];
  }
  if ($request.headers['if-modified-since']) {
    delete $request.headers['if-modified-since'];
  }
}

// ========== 响应拦截：注入 premium ==========
let body = $response.body;

if (body) {
  try {
    let obj = JSON.parse(body);

    if (url.indexOf('analytics/profiles/') !== -1 && url.indexOf('adaptytech.com') !== -1) {
      console.log('Yomu: intercepted analytics profile response');

      // 构造完整的 premium profile
      obj.data = {
        "type": "adapty_analytics_profile",
        "id": "542ea0f4-4358-476b-ae97-16816927d831",
        "attributes": {
          "app_id": "d4434d39-4786-4757-9b81-fbf9bdb4de3e",
          "profile_id": "542ea0f4-4358-476b-ae97-16816927d831",
          "customer_user_id": null,
          "is_test_user": false,
          "total_revenue_usd": 999.99,
          "segment_hash": "injected_premium",
          "applied_attribution_sources": [],
          "timestamp": 4099766399000,
          "paid_access_levels": {
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
          },
          "subscriptions": {
            "lifetime.yomu.app": {
              "is_active": true,
              "is_lifetime": true,
              "store": "app_store",
              "vendor_product_id": "lifetime.yomu.app",
              "vendor_transaction_id": "2000000000000000",
              "vendor_original_transaction_id": "2000000000000000",
              "purchased_at": "2024-01-01T00:00:00Z",
              "renewed_at": "2024-01-01T00:00:00Z",
              "expires_at": "2099-12-31T23:59:59Z",
              "starts_at": "2024-01-01T00:00:00Z",
              "is_sandbox": false,
              "is_refund": false
            }
          },
          "non_subscriptions": null,
          "custom_attributes": {},
          "promotional_offer_eligibility": false,
          "introductory_offer_eligibility": true,
          "autoconsume": true
        }
      };

      console.log('Yomu: ✓ premium injected');
      $done({body: JSON.stringify(obj)});
      return;
    }

    $done({});

  } catch (e) {
    console.log('Yomu error: ' + e.message);
    // 即使 JSON 解析失败也放行
    $done({});
  }
} else {
  $done({});
}
