// YouMind Premium Unlock - Loon Script v1.0
// By Leslie159357
// Hook: POST /api/v1/getCurrentUser
//       POST /api/v1/subscription/findSubscription
//       POST /api/v1/credit/getCreditAccount

const url = $request.url;
const method = $request.method;

if (method !== 'POST') {
  $done({});
  return;
}

if (url.includes('/api/v1/getCurrentUser')) {
  // Modify user space status from trialing to active
  try {
    let bodyObj = JSON.parse($response.body);
    if (bodyObj && bodyObj.space) {
      bodyObj.space.status = 'active';
      bodyObj.space.trial_expires_at = '2099-12-31T23:59:59.000Z';
    }
    $done({ body: JSON.stringify(bodyObj) });
  } catch (e) {
    $done({});
  }

} else if (url.includes('/api/v1/subscription/findSubscription')) {
  // Response is empty (204/content-length:0) → return a pro subscription
  const now = new Date().toISOString();
  const fakeSubscription = {
    "id": "sub_" + Date.now(),
    "space_id": "",
    "product_tier": "pro",
    "sub_tier": 2,
    "billing_interval": "yearly",
    "status": "active",
    "current_period_start": now,
    "current_period_end": "2099-12-31T23:59:59.000Z",
    "cancel_at_period_end": false,
    "provider": "apple",
    "is_cny": false,
    "credits": 999999,
    "monthly_credits": 200000,
    "renew_change": null,
    "created_at": now,
    "updated_at": now
  };
  $done({ body: JSON.stringify(fakeSubscription) });

} else if (url.includes('/api/v1/credit/getCreditAccount')) {
  // Upgrade to pro tier with max credits
  try {
    let bodyObj = JSON.parse($response.body);
    if (bodyObj) {
      bodyObj.product_tier = 'pro';
      bodyObj.sub_tier = 3;
      bodyObj.monthly_balance = 999999;
      bodyObj.monthly_quota = 999999;
      bodyObj.permanent_balance = 999999;
      bodyObj.daily_balance = 99999;
      bodyObj.daily_limit = 99999;
      bodyObj.bonus_balance = 99999;
      bodyObj.spendable_balance = 999999;
      bodyObj.daily_used = 0;
      bodyObj.has_ever_had_subscription = true;
      bodyObj.free_monthly_daily_grant_count = 30;
      bodyObj.free_monthly_daily_grant_max = 30;
      bodyObj.current_period_end = '2099-12-31T23:59:59.000Z';
    }
    $done({ body: JSON.stringify(bodyObj) });
  } catch (e) {
    $done({});
  }

} else {
  $done({});
}
