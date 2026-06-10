// ==ClawHub/YouMind Max Unlock v3.1==
// @version 3.1
// @description 修复 getSkill/{uuid} 匹配问题，拦截所有 hello-lucy API
// @mitm hello-lucy.com
// ==/ClawHub/YouMind Max Unlock v3.1==

const url = $request.url;
const method = $request.method;

// 只拦截 hello-lucy.com 的 API 响应
if (!url.includes("hello-lucy.com") || (method !== "GET" && method !== "POST")) {
  $done({});
  return;
}

let body = $response.body;
if (!body || body.length < 10) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);
  
  function modifyVIP(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      
      // ========== Tier: "free"/"pro" -> "max" ==========
      if ((key === "product_tier" || key === "productTier") && typeof val === "string") {
        if (["free", "trial", "none", "pro"].includes(val.toLowerCase())) {
          obj[key] = "max";
        }
      }
      
      // sub_tier / subTier
      if ((key === "sub_tier" || key === "subTier") && typeof val === "number") {
        obj[key] = 9999;
      }
      
      // ========== Status: "trialing" -> "active" ==========
      if (key === "status" && typeof val === "string" && 
          ["trialing", "trial", "expired", "none", "inactive", "canceled", "cancelled", "free"].includes(val.toLowerCase())) {
        obj[key] = "active";
      }
      
      // ========== Subscription flags ==========
      if (["has_ever_had_subscription", "hasEverHadSubscription", 
           "hasPurchased", "has_purchased", 
           "isInstalled", "is_installed"].includes(key) && val === false) {
        obj[key] = true;
      }
      
      // ========== Skill purchase ==========
      if (key === "canViewerPurchase") {
        obj[key] = true;
      }
      if (key === "viewerPurchaseBlockedReason" && typeof val === "string") {
        delete obj[key];
      }
      if (key === "price" && typeof val === "number" && val > 0) {
        obj[key] = 0;  // Free!
      }
      
      // ========== Balance (all max) ==========
      if (["monthly_balance", "monthlyBalance", "permanent_balance", "permanentBalance", 
           "bonus_balance", "bonusBalance", "spendable_balance", "spendableBalance",
           "daily_balance", "dailyBalance", "monthly_quota", "monthlyQuota",
           "daily_limit", "dailyLimit", "credit", "credits", "balance"].includes(key)) {
        if (typeof val === "number") {
          obj[key] = 9999999;
        }
      }
      
      // ========== Dates -> 2099 ==========
      if (["trialExpiresAt", "trial_expires_at", "expiresAt", "expires_at",
           "expirationDate", "expiration_date",
           "current_period_end", "currentPeriodEnd",
           "current_period_start", "currentPeriodStart"].includes(key) && typeof val === "string") {
        obj[key] = val.replace(/20[2-9][4-9]/g, "2099");
      }
      
      // Recursion
      if (typeof val === 'object') {
        modifyVIP(val);
      }
    }
  }
  
  modifyVIP(obj);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  $done({});
}
