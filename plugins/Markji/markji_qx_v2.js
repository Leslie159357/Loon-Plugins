// ==Quantumult X==
// @name         墨墨记忆卡 专业版解锁 v2.0
// @description  解锁专业版 + 无限记忆币
// @version      2.0
// @author       Minis
// ==/Quantumult X==

var url = $request.url;
var body = $response.body;

if (typeof $response === 'undefined') {
    $done({});
}

if (!body) {
    $done({});
}

try {
    // ====== /api/v2/system/check - VIP核心 ======
    if (url.indexOf('/api/v2/system/check') !== -1) {
        var obj = JSON.parse(body);
        if (!obj || !obj.data) { $done({}); }
        
        obj.data.plus_info = {"is_plus":true,"plus_expires_time":"2099-12-31T23:59:59.000Z","is_lifetime":true};
        obj.data.has_paid = true;
        obj.data.study_limit_info = {"day_new_limit":9999,"day_review_limit":99999,"new_affected_by_review_limit":false};
        obj.data.study_info.private_deck_quota = 99999;
        obj.data.study_info.public_deck_quota = 99999;
        obj.data.study_info.replenish_card_count = 999;
        obj.data.study_info.available_mark = 999999;
        obj.data.study_info.free_mark = 999999;
        obj.data.study_info.paid_mark = 999999;
        obj.data.card_price_enabled = true;
        obj.data.card_price_min_limit = 0;
        obj.data.card_price_max_limit = 999;
        obj.data.card_price_study_users_limit = 99999;
        obj.data.is_deck_max_limit_reached = false;
        
        $done({body: JSON.stringify(obj)});
    }
    
    // ====== /api/v1/study_data/records/precheck - 学习预检(积分扣减) ======
    if (url.indexOf('/api/v1/study_data/records/precheck') !== -1) {
        var obj = JSON.parse(body);
        if (!obj || !obj.data) { $done({}); }
        
        // 把需要的记忆币改为0，这样就不会扣积分
        obj.data.needed_mark = 0;
        obj.data.original_consumed_mark = 0;
        obj.data.available_mark = 999999;
        
        $done({body: JSON.stringify(obj)});
    }
    
    // ====== /api/v1/study_data/records - 学习提交 ======
    if (url.indexOf('/api/v1/study_data/records') !== -1 && url.indexOf('precheck') === -1) {
        var obj = JSON.parse(body);
        if (!obj || !obj.data) { $done({}); }
        
        obj.data.available_mark = 999999;
        
        $done({body: JSON.stringify(obj)});
    }
    
    $done({});
    
} catch(e) {
    $done({});
}
