// Forest Premium Unlock v1.0 - Loon Script
// Forest 专注 v5.16.5
// 域名: forest-api.upwardsware.com + forest-china.upwardsware.com
// 架构: 自建订阅系统（无第三方SDK），全部明文JSON ✅

// ============ 伪造的Premium订阅数据 ============
const PREMIUM_STATUS = {
  "service_level": "pro",
  "is_premium": true,
  "subscription": {
    "id": 999999,
    "product_id": 61,
    "iap_sku": "forest_annual_early_bird",
    "purchase_type": "iap",
    "status": "active",
    "expires_at": "2099-12-31T23:59:59.000Z",
    "created_at": "2026-05-26T06:15:00.000Z",
    "updated_at": "2026-05-26T06:15:00.000Z",
    "auto_renew": true
  }
};

// ============ 自动识别请求 ============
let url = $request.url;
let method = $request.method;

// ===== 1. 订阅状态接口（核心） =====
// /user/users/{id}/service-levels/status
if (url.includes("/service-levels/status")) {
  if (method === "OPTIONS") { $done({}); return; }
  $done({ body: JSON.stringify(PREMIUM_STATUS) });
  return;
}

// ===== 2. 用户资料 =====
// /user/users/current
// /api/v1/users/{id}
if (url.includes("/users/current") || url.match(/\/api\/v1\/users\/\d+(\?|$)/)) {
  if (method === "OPTIONS") { $done({}); return; }
  try {
    let body = JSON.parse($response.body || "{}");
    body.coin = 999999;
    body.gem = 99999;
    body.service_level = "pro";
    $done({ body: JSON.stringify(body) });
  } catch (e) {
    $done({});
  }
  return;
}

// ===== 3. 金币 =====
if (url.includes("/coin")) {
  $done({ body: '{"coin":999999}' });
  return;
}

// ===== 4. 宝石（排除gem_packs商品列表） =====
if (url.includes("/gem") && !url.includes("gem_pack")) {
  $done({ body: '{"gem":99999}' });
  return;
}

// ===== 5. Profile =====
if (url.includes("/profile")) {
  try {
    let body = JSON.parse($response.body || "{}");
    body.is_premium = true;
    body.service_level = "pro";
    $done({ body: JSON.stringify(body) });
  } catch (e) {
    $done({});
  }
  return;
}

// ===== 6. 购买权限校验 =====
if (url.includes("/purchase-right")) {
  $done({
    body: JSON.stringify({
      "results": [{
        "item_contents": null,
        "draw_results": null,
        "purchase": {
          "id": 9999999,
          "user_id": 4750989,
          "product_id": 61,
          "quantity": 1,
          "purchase_type": "iap",
          "price": 0,
          "iap_sku": "forest_annual_early_bird",
          "origin_type": null,
          "origin_id": null,
          "status": "completed",
          "created_at": "2026-05-26T06:15:00.000Z",
          "updated_at": "2026-05-26T06:15:00.000Z",
          "product": null
        }
      }]
    })
  });
  return;
}

// ===== 7. 土地皮肤解锁 =====
// /user/land-skins/unlocked-timestamps
if (url.includes("/land-skins/unlocked-timestamps")) {
  // 返回所有land skin的gid已解锁（0-50范围内的gid）
  let allSkins = [];
  for (let gid = 0; gid <= 50; gid++) {
    allSkins.push({"gid": gid, "unlocked_at": "2026-05-12T17:26:59.000Z"});
  }
  $done({ body: JSON.stringify(allSkins) });
  return;
}

// ===== 8. 树木类型解锁 =====
// /api/v1/tree_types/unlocked_timestamps
if (url.includes("/tree_types/unlocked_timestamps")) {
  let allTrees = [];
  for (let gid = 0; gid <= 200; gid++) {
    allTrees.push({"gid": gid, "unlocked_at": "2026-05-12T17:26:59.000Z"});
  }
  $done({ body: JSON.stringify(allTrees) });
  return;
}

// ===== 9. 环境音效解锁 =====
// /api/v1/ambient_sounds/unlocked_timestamps
if (url.includes("/ambient_sounds/unlocked_timestamps")) {
  let allSounds = [];
  for (let gid = 0; gid <= 50; gid++) {
    allSounds.push({"gid": gid, "unlocked_at": "2026-05-12T17:26:59.000Z"});
  }
  $done({ body: JSON.stringify(allSounds) });
  return;
}

// ===== 10. boost状态 =====
if (url.includes("/boost")) {
  $done({
    body: JSON.stringify({
      "boost_start_time": "2026-05-26T06:00:00.000Z",
      "boost_end_time": "2099-12-31T23:59:59.000Z",
      "boost_rate": 2.0
    })
  });
  return;
}

// ===== 11. 购买失败标记 =====
if (url.includes("/mark-failed") || url.includes("mark-failed")) {
  $done({ body: '{}' });
  return;
}

// ===== 12. 默认透传 =====
$done({});
