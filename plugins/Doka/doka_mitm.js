// Doka相机 - MITM 破解脚本 v3
// 兼容 Loon / Surge / QX，适配 HTTP/2
// 拦截 www.yindoka.com 的 VIP 相关 API

// ====== 通用递归 VIP 修改 ======
function deepModifyVIP(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        obj.forEach((v, i) => { obj[i] = deepModifyVIP(v); });
        return obj;
    }
    for (let key of Object.keys(obj)) {
        const val = obj[key];
        const kl = key.toLowerCase();
        
        if (typeof val === 'boolean') {
            if (['is_vip', 'isvip', 'vip', 'ispro', 'ispremium', 'issubscribed',
                 'subscribed', 'active', 'isenabled', 'hassubscription',
                 'auto_renew_status'].includes(kl)) {
                obj[key] = true;
            }
        }
        
        if (typeof val === 'string') {
            if (kl === 'vip_type' || kl === 'membertype' || kl === 'producttier') {
                obj[key] = 'pro';
            }
            if (kl === 'status' || kl === 'state') {
                if (['free', 'none', 'trial', 'expired', 'inactive', 'free_user'].includes(val.toLowerCase())) {
                    obj[key] = 'active';
                }
            }
            if (kl === 'vip_type' && val === 'free_user') {
                obj[key] = 'pro';
            }
            if (['expire_time', 'expiretime', 'expiry_date', 'expirydate',
                 'expires_date', 'expiresat'].includes(kl) &&
                (val === '' || val === '0001-01-01T00:00:00Z' || val === null)) {
                obj[key] = '2099-12-31T23:59:59Z';
            }
            if (kl === 'product_id' && (val === '' || val === null)) {
                obj[key] = 'com.ydgn.dokacamera.year.beimei';
            }
        }
        
        if (typeof val === 'number') {
            if (['remaining_count', 'remainingcomposecount', 'remainingfiltercount',
                 'freeusecount', 'freeuse', 'remaining', 'remaininguses',
                 'remaining_use', 'remaining_uses'].includes(kl)) {
                obj[key] = 999999;
            }
        }
        
        if (typeof val === 'object') {
            obj[key] = deepModifyVIP(val);
        }
    }
    return obj;
}

// ====== 主入口 ======
// 兼容不同代理工具: $request.url 可能包含完整 URL 或仅为路径
const url = ($request && $request.url) || '';
const path = ($request && $request.path) || '';

// 判断是否匹配目标 API
function matchPath(keyword) {
    return url.includes(keyword) || path.includes(keyword);
}

let body = $response.body;
if (!body) {
    $done({});
    return;
}

// 尝试解析 JSON
let obj;
try { obj = JSON.parse(body); } catch(e) {
    $done({});
    return;
}

// 递归修改 VIP
obj = deepModifyVIP(obj);

// ====== 针对不同 API 做精确覆盖 ======
if (matchPath('/apple/vip-detail')) {
    if (obj.data) {
        obj.data.is_vip = true;
        obj.data.vip_type = 'pro';
        obj.data.expire_time = '2099-12-31T23:59:59Z';
        obj.data.remaining_count = 999999;
        obj.data.remaining_compose_count = 999999;
        obj.data.remaining_filter_count = 999999;
    }
} else if (matchPath('/apple/check-subscription-status')) {
    if (obj.data) {
        obj.data.is_vip = true;
        obj.data.status = 'active';
        obj.data.expires_date = '2099-12-31T23:59:59Z';
        obj.data.product_id = 'com.ydgn.dokacamera.year.beimei';
        obj.data.auto_renew_status = true;
        obj.data.is_trial_period = false;
        obj.data.environment = 'Production';
    }
} else if (matchPath('/apple/validate-receipt')) {
    // 验证收据 — 直接替换整个响应
    obj = {
        "code": 0,
        "message": "succ",
        "data": {
            "is_vip": true,
            "vip_type": "pro",
            "expire_time": "2099-12-31T23:59:59Z",
            "status": "active",
            "product_id": "com.ydgn.dokacamera.year.beimei",
            "auto_renew_status": true,
            "is_trial_period": false,
            "environment": "Production"
        }
    };
}

$done({body: JSON.stringify(obj)});
