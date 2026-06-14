// Doka相机 - MITM 破解脚本 v2
// 基于抓包数据精确调整
// 适用: Loon / Surge / QX
// 域名: www.yindoka.com
// 核心拦截: 3 个 API

// 1. apple/vip-detail — VIP 详情（核心）
// 2. apple/check-subscription-status — 订阅状态
// 3. app/config_doka — 远程配置

function modifyVIPDetail(body) {
    try {
        let obj = JSON.parse(body);
        
        if (obj.data) {
            // VIP 状态
            obj.data.is_vip = true;
            obj.data.vip_type = "pro_user";  // 修改为 pro
            obj.data.expire_time = "2099-12-31T23:59:59Z";
            
            // 无限使用次数
            obj.data.remaining_count = 999999;
            obj.data.remaining_compose_count = 999999;
            obj.data.remaining_filter_count = 999999;
            
            // 会员套餐和权益保持不变（可以展示给用户看）
        }
        
        return JSON.stringify(obj);
    } catch(e) {
        return body;
    }
}

function modifySubscriptionStatus(body) {
    try {
        let obj = JSON.parse(body);
        
        if (obj.data) {
            obj.data.is_vip = true;
            obj.data.status = "pro_user";
            obj.data.expires_date = "2099-12-31T23:59:59Z";
            obj.data.product_id = "com.ydgn.dokacamera.year.beimei";
            obj.data.auto_renew_status = true;
            obj.data.is_trial_period = false;
            obj.data.environment = "Production";
        }
        
        return JSON.stringify(obj);
    } catch(e) {
        return body;
    }
}

function modifyConfig(body) {
    try {
        let obj = JSON.parse(body);
        
        if (obj.data) {
            // 解锁兑换码入口
            obj.data.show_redeem_code_entry = true;
            // 额外隐藏配置可以加在这里
        }
        
        return JSON.stringify(obj);
    } catch(e) {
        return body;
    }
}

// 路由
let path = $request.url;
let body = $response.body;

if (!body) {
    $done({});
    return;
}

if (path.includes('/apple/vip-detail')) {
    $done({body: modifyVIPDetail(body)});
} else if (path.includes('/apple/check-subscription-status')) {
    $done({body: modifySubscriptionStatus(body)});
} else if (path.includes('/app/config_doka')) {
    $done({body: modifyConfig(body)});
} else {
    $done({});
}
