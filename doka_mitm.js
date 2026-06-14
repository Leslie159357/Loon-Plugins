// Doka相机 - MITM 破解脚本 v2
// 拦截 www.yindoka.com 的 VIP 相关 API
// 适用于 Loon/Surge/QX
//
// 抓包确认的 API 路径:
//   POST /apple/vip-detail          → VIP 详情（核心）
//   POST /apple/check-subscription-status  → 订阅状态
//   POST /apple/validate-receipt    → 收据验证

// ====== 拦截 /apple/vip-detail ======
// 原始响应:
// {"code":0,"message":"succ","data":{"is_vip":false,"vip_type":"free_user",
//   "expire_time":"","remaining_count":5,"remaining_compose_count":5,
//   "remaining_filter_count":5,...}}

function modifyVIPDetail(body) {
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) { return body; }
    }
    
    // 递归修改所有 VIP 相关字段
    function deepModify(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        if (Array.isArray(obj)) {
            obj.forEach((v, i) => { obj[i] = deepModify(v); });
            return obj;
        }
        
        for (let key of Object.keys(obj)) {
            const val = obj[key];
            const kl = key.toLowerCase();
            
            // Boolean/VIP 状态字段
            if (typeof val === 'boolean') {
                if (['is_vip', 'isvip', 'vip', 'ispro', 'ispremium', 'issubscribed',
                     'subscribed', 'active', 'isenabled', 'hassubscription'].includes(kl)) {
                    obj[key] = true;
                }
            }
            
            // 字符串状态字段
            if (typeof val === 'string') {
                if (kl === 'vip_type' || kl === 'membertype' || kl === 'producttier') {
                    obj[key] = 'pro';
                }
                if (kl === 'status' || kl === 'state') {
                    if (['free', 'none', 'trial', 'expired', 'inactive'].includes(val.toLowerCase())) {
                        obj[key] = 'active';
                    }
                }
                if ((kl === 'expire_time' || kl === 'expiretime' || kl === 'expiry_date' || kl === 'expirydate') && (val === '' || val === null)) {
                    // 设置为 2099-12-31
                    obj[key] = '2099-12-31T23:59:59Z';
                }
            }
            
            // 数字字段
            if (typeof val === 'number') {
                if (['remaining_count', 'remainingcomposecount', 'remainingfiltercount',
                     'freeusecount', 'freeuse', 'remaining', 'remaininguses',
                     'remaining_use', 'remaining_uses'].includes(kl)) {
                    obj[key] = 999999;
                }
                // expire_time 如果是时间戳
                if (kl === 'expire_time' || kl === 'expirytime' || kl === 'expirydate') {
                    obj[key] = 4102444799; // 2099-12-31
                }
            }
            
            // 递归嵌套
            if (typeof val === 'object') {
                obj[key] = deepModify(val);
            }
        }
        return obj;
    }
    
    body = deepModify(body);
    
    // 确保 VIP 状态存在
    if (body.data) {
        body.data.is_vip = true;
        body.data.vip_type = 'pro';
        if (!body.data.expire_time || body.data.expire_time === '') {
            body.data.expire_time = '2099-12-31T23:59:59Z';
        }
        body.data.remaining_count = 999999;
        body.data.remaining_compose_count = 999999;
        body.data.remaining_filter_count = 999999;
    }
    
    return JSON.stringify(body);
}

// ====== 拦截 /apple/check-subscription-status ======
// 修改 Apple 订阅状态检查
function modifySubscriptionStatus(body) {
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) { return body; }
    }
    
    function deepModify(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            obj.forEach((v, i) => { obj[i] = deepModify(v); });
            return obj;
        }
        for (let key of Object.keys(obj)) {
            const val = obj[key];
            const kl = key.toLowerCase();
            
            if (typeof val === 'boolean') {
                if (['is_vip', 'isvip', 'vip', 'subscribed', 'issubscribed', 
                     'active', 'isactive', 'hassubscription'].includes(kl)) {
                    obj[key] = true;
                }
            }
            if (typeof val === 'string') {
                if (['status', 'state'].includes(kl) && 
                    ['none', 'inactive', 'expired', 'cancelled', 'canceled'].includes(val.toLowerCase())) {
                    obj[key] = 'active';
                }
                if (['vip_type', 'type'].includes(kl) && 
                    ['free', 'free_user'].includes(val.toLowerCase())) {
                    obj[key] = 'pro';
                }
                if (['expire_time', 'expirytime', 'expiry_date'].includes(kl) && 
                    (val === '' || val === null)) {
                    obj[key] = '2099-12-31T23:59:59Z';
                }
            }
            if (typeof val === 'object') {
                obj[key] = deepModify(val);
            }
        }
        return obj;
    }
    
    body = deepModify(body);
    return JSON.stringify(body);
}

// ====== 拦截 /apple/validate-receipt ======
// 直接伪造成功的收据验证响应
function modifyValidateReceipt(body) {
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) { return body; }
    }
    
    function deepVip(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            obj.forEach((v, i) => { obj[i] = deepVip(v); });
            return obj;
        }
        for (let key of Object.keys(obj)) {
            const val = obj[key];
            const kl = key.toLowerCase();
            
            if (typeof val === 'boolean') {
                if (['is_vip', 'isvip', 'vip', 'subscribed', 'issubscribed', 'active', 'hassubscription'].includes(kl)) {
                    obj[key] = true;
                }
            }
            if (typeof val === 'string') {
                if (['status', 'state'].includes(kl) && ['none', 'inactive', 'expired'].includes(val.toLowerCase())) {
                    obj[key] = 'active';
                }
                if (['vip_type', 'type'].includes(kl)) {
                    obj[key] = 'pro';
                }
                if (['expire_time', 'expirytime', 'expiry_date', 'expirydate'].includes(kl) && (val === '' || val === null)) {
                    obj[key] = '2099-12-31T23:59:59Z';
                }
            }
            if (typeof val === 'number') {
                if (['remaining_count', 'remainingcomposecount', 'remainingfiltercount', 'freeusecount'].includes(kl)) {
                    obj[key] = 999999;
                }
            }
            if (typeof val === 'object') {
                obj[key] = deepVip(val);
            }
        }
        return obj;
    }
    
    body = deepVip(body);
    return JSON.stringify(body);
}

// 主路由
const url = $request.url;
const method = $request.method;

if (url.includes('/apple/vip-detail')) {
    let body = $response.body;
    if (body) {
        $done({body: modifyVIPDetail(body)});
    } else {
        $done({});
    }
} else if (url.includes('/apple/check-subscription-status')) {
    let body = $response.body;
    if (body) {
        $done({body: modifySubscriptionStatus(body)});
    } else {
        $done({});
    }
} else if (url.includes('/apple/validate-receipt')) {
    let body = $response.body;
    if (body) {
        $done({body: modifyValidateReceipt(body)});
    } else {
        $done({});
    }
} else {
    $done({});
}
