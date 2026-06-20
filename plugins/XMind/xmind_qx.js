// ==UserScript==
// @name         XMind Pro Unlock
// @namespace    https://github.com/Leslie159357/Loon-Plugins
// @version      1.1.0
// @description  XMind 思维导图 - 解锁 Pro/Subscription 会员（基于实际抓包修正）
// @author       Leslie
// @icon         https://www.xmind.cn/favicon.ico
// @mitm         www.xmind.cn
// ==/UserScript==

// XMind subscription API endpoints（基于实际抓包 2026-06-09）:
//   GET  /_res/user_sub_details       → {"_code":200,"google":[],"appstore":[],"official_website":[]}
//   POST /_res/appstore/sub          → {"errorcode":"4003","_code":400} （需要正确receipt）
//   POST /_api/appstore/active       → {"status":"trial","subscriptionStatus":"UNKNOWN","expireTime":0,...}
//   GET  /_res/session               → 用户会话
//   POST /_res/devices               → {"raw_data":"...","license":{"status":"Trial","expireTime":0},"_code":200}

// 注意：API 域名为 www.xmind.cn 而非 app.xmind.cn

const urlPattern = /^https:\/\/www\.xmind\.cn\//;

// ==================== 全局响应修改 ====================

function modifyUserSubDetails(body) {
    // 原始: {"_code": 200, "google": [], "appstore": [], "official_website": []}
    // 修改: 注入 pro 订阅
    try {
        let obj = JSON.parse(body);
        if (obj._code === 200 && obj.appstore) {
            // 注入活跃的 App Store 订阅
            obj.appstore.push({
                "plan": "Pro",
                "isActive": true,
                "expireDate": 4092599349,
                "productId": "net.xmind.brownieapp.pro.yearly",
                "status": "active"
            });
            // 注入官网订阅
            obj.official_website.push({
                "plan": "Pro",
                "isActive": true,
                "expireDate": 4092599349,
                "type": "pro"
            });
            // 注入 Google Play
            obj.google.push({
                "plan": "Pro",
                "isActive": true,
                "expireDate": 4092599349,
                "status": "active"
            });
        }
        return JSON.stringify(obj);
    } catch (e) {
        return body;
    }
}

function modifyAppstoreActive(body) {
    // 原始: {"status":"trial","bindXmind":0,"receiptId":"...","subscriptionStatus":"UNKNOWN","expireTime":0,"_code":200,...}
    // 修改: pro 状态
    try {
        let obj = JSON.parse(body);
        if (obj._code === 200) {
            obj.status = "pro";
            obj.subscriptionStatus = "ACTIVE";
            obj.expireTime = 4092599349;
            obj.bindXmind = 1;
        }
        return JSON.stringify(obj);
    } catch (e) {
        return body;
    }
}

function modifyDevices(body) {
    // 原始: {"raw_data":"...","license":{"status":"Trial","expireTime":0},"_code":200}
    // 修改: Pro license
    try {
        let obj = JSON.parse(body);
        if (obj._code === 200 && obj.license) {
            obj.license.status = "Pro";
            obj.license.expireTime = 4092599349;
        }
        return JSON.stringify(obj);
    } catch (e) {
        return body;
    }
}

function modifyAppstoreSub(body) {
    // 原始返回 400 error
    // 直接返回成功的订阅状态
    return JSON.stringify({
        "_code": 200,
        "plan": "Pro",
        "isActive": true,
        "expireDate": 4092599349,
        "status": "active",
        "productId": "net.xmind.brownieapp.pro.yearly"
    });
}

function modifySession(body) {
    // 原始: {"_code":200,"expireDate":0,"uid":"...","limit":0,...}
    // 修改: 加限免
    try {
        let obj = JSON.parse(body);
        if (obj._code === 200) {
            obj.limit = 1;
        }
        return JSON.stringify(obj);
    } catch (e) {
        return body;
    }
}

// ==================== 主请求处理 ====================

$task.fetch({
    url: $request.url,
    method: $request.method,
    headers: $request.headers,
    body: $request.body
}).then(response => {
    let body = response.body;
    let url = $request.url;
    
    if (url.includes('/_res/user_sub_details')) {
        body = modifyUserSubDetails(body);
        console.log('XMind: Modified user_sub_details');
    } else if (url.includes('/_res/appstore/sub')) {
        body = modifyAppstoreSub(body);
        console.log('XMind: Modified appstore/sub');
    } else if (url.includes('/_api/appstore/active')) {
        body = modifyAppstoreActive(body);
        console.log('XMind: Modified appstore/active');
    } else if (url.includes('/_res/devices')) {
        body = modifyDevices(body);
        console.log('XMind: Modified devices license');
    } else if (url.includes('/_res/session')) {
        body = modifySession(body);
        console.log('XMind: Modified session');
    }
    
    $done({ status: response.statusCode, headers: response.headers, body: body });
}, reason => {
    $done({ status: 200, headers: {}, body: '{}' });
});
