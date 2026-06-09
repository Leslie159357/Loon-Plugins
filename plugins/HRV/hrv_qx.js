// ==UserScript==
// @name         解压小橙子 (HRV) 会员解锁
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      1.0
// @description  解压小橙子 VIP 会员解锁 — 覆盖 API 响应 + 递归泛匹配
// @author       Leslie159357
// @mitm         termapi.belikehub.com, icogquu-zlr.belikehub.com, ejcvirv.belikehub.com
// ==/UserScript==

const url = $request.url;
let body = $response.body;

if (!body) {
    $done({body});
}

try {
    body = JSON.parse(body);
} catch (e) {
    $done({body: JSON.stringify(body)});
}

const log = [];

/**
 * 递归遍历 JSON，将所有 VIP/会员相关字段设为解锁状态
 */
function unlockVIP(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'object' && obj[i] !== null) {
                unlockVIP(obj[i], `${path}[${i}]`);
            }
        }
        return;
    }
    
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        const lowerKey = key.toLowerCase();
        const fullPath = path ? `${path}.${key}` : key;
        
        // Bool 类型 VIP 字段
        const boolVIP = [
            'is_vip', 'isvip', 'is_vip_member', 'is_vip_user',
            'is_svip', 'is_svip_member', 'is_member', 'ismember',
            'is_subscribe', 'issubscribe', 'is_premium', 'ispremium',
            'is_pro', 'ispro', 'is_proplus',
            'is_active', 'isactive', 'is_trial', 'istrial',
            'has_bought', 'hasbought', 'is_paid', 'ispaid', 'is_paid_user',
            'vip', 'svip', 'pro', 'premium', 'member', 'subscribe',
            'isenable', 'is_enable', 'isenabled', 'is_enabled',
            'isbuy', 'is_buy', 'ispurchase', 'is_purchase',
            'vip_hidden', 'order_hidden', 'have_permission', 'has_permission',
            'isVip', 'isVIP', 'vipStatus', 'isVipStatus',
            'is_svip', 'is_buy',
            // 解压小橙子特有的
            'isvip', 'vip',
        ];
        
        // Int 类型 VIP 字段
        const intVIP = [
            'vip_status', 'svip_status', 'membership_type', 'membershiptype',
            'viptype', 'vip_type', 'usertype', 'user_type',
            'level', 'vip_level', 'svip_level', 'member_level',
            'vipStatus', 'vipstatus',
        ];
        
        if (boolVIP.includes(lowerKey)) {
            if (val === false || val === 'false' || val === 0 || val === '0' || val === null || val === undefined) {
                obj[key] = true;
                log.push(`Bool: ${fullPath} = ${val} → true`);
            }
        } else if (intVIP.includes(lowerKey)) {
            if (val === 0 || val === '0' || val === null) {
                obj[key] = 1;
                log.push(`Int: ${fullPath} = ${val} → 1`);
            }
        } else if (lowerKey.includes('viptype') || lowerKey.includes('membership_type') || lowerKey.includes('type')) {
            if (val === 0 || val === '0' || val === false || val === 'none' || val === 'free') {
                if (lowerKey.includes('vip') || lowerKey.includes('member') || lowerKey.includes('pro') || lowerKey.includes('premium')) {
                    obj[key] = 2;
                }
            }
        } else if (lowerKey.includes('expire') || lowerKey.includes('endtime') || lowerKey.includes('end_time')) {
            if (!val || val === 0 || val === '0' || val === null || val === '') {
                obj[key] = 4092599349000;
                log.push(`Time: ${fullPath} = ${val} → 2099`);
            }
        } else if (lowerKey.includes('surplus_days') || lowerKey.includes('days') || lowerKey.includes('remain')) {
            if (lowerKey.includes('vip') || lowerKey.includes('member') || lowerKey.includes('trial')) {
                obj[key] = 36500;
            }
        } else if (lowerKey === 'status' || lowerKey.includes('subscriptionstatus') || lowerKey.includes('sub_status')) {
            if (val === 'trial' || val === 'unpaid' || val === 'expired' || val === 'none' || val === false || val === 0 || val === 'inactive') {
                obj[key] = 'active';
                log.push(`Status: ${fullPath} = ${val} → active`);
            }
        } else if (lowerKey.includes('subscribe') || lowerKey.includes('subscription') || lowerKey.includes('autorenew')) {
            if (val === false || val === 'false' || val === 0 || val === '0') {
                obj[key] = true;
                log.push(`Sub: ${fullPath} = ${val} → true`);
            }
        } else if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('money')) {
            if (val === 0 || val === '0' || val === null || val === '0.00') {
                obj[key] = 0.01;
            }
        } else if (lowerKey.includes('sku') || lowerKey.includes('goods') || lowerKey.includes('product')) {
            // 商品列表清空
            if (Array.isArray(val) && val.length > 0 && fullPath.includes('list')) {
                obj[key] = [];
                log.push(`List: ${fullPath} 已清空`);
            }
        }
        
        // 递归遍历
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            unlockVIP(obj[key], fullPath);
        }
    }
}

// ===== 特定接口硬编码覆盖 =====

// queryEntitlements — VIP 核心接口
if (url.includes('/PayServer/api/v3/order/queryEntitlements')) {
    if (body.data) {
        body.data.isVip = true;
        body.data.vipStatus = 1;
        body.data.isVipStatus = true;
        body.data.expireTime = 4092599349000;
        body.data.vipType = 2;
        log.push('🎯 queryEntitlements → isVip=true, expire=2099');
    }
}

// preOrder — 订单预创建
if (url.includes('/PayServer/api/v3/order/preOrder')) {
    if (body.data) {
        body.data.hasBought = true;
        log.push('🎯 preOrder → hasBought=true');
    }
}

// verifyOrder — 收据验证
if (url.includes('/PayServer/api/v3/order/verifyOrder')) {
    if (body.data) {
        body.data.success = true;
        body.data.isVip = true;
        body.data.expireTime = 4092599349000;
        log.push('🎯 verifyOrder → success=true');
    }
}

// payResult — 支付结果
if (url.includes('/PayServer/api/v3/order/payResult')) {
    if (body.data) {
        body.data.paySuccess = true;
        body.data.isVip = true;
        log.push('🎯 payResult → paySuccess=true');
    }
}

// user/info 或用户信息接口
if (url.includes('/PayServer/api/v3/user/') || url.includes('/PayServer/api/v1/user/')) {
    if (body.data) {
        body.data.isVip = true;
        body.data.vip = true;
        body.data.vipStatus = 1;
    }
    log.push('🎯 用户信息接口命中');
}

// 执行递归泛匹配
unlockVIP(body);

console.log('解压小橙子 v1.0: ' + log.join(' | '));

$done({body: JSON.stringify(body)});
