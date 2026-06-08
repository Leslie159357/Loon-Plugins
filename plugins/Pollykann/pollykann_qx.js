// Pollykann 会员解锁 v1.0
// Quantumult X 版本
// 拦截 api.pollykann.com 接口
// 注意: account/stream 和 appConfig/stream 为AES加密
// 本地UserDefaults: pollykannVipState, pollykannVipExpireDate, isVip

var url = $request.url;
var method = $request.method;

// ====== 响应拦截 ======
if ($response && $response.body) {
    var body = $response.body;
    var obj = null;
    try { obj = JSON.parse(body); } catch(e) {}
    
    // 1. /home - 首页
    if (url.indexOf('/home') !== -1 && obj && obj.data) {
        console.log('Pollykann: home intercepted');
        obj.data.isVip = 1;
        obj.data.vipExpireDate = '2099-12-31 23:59:59';
        $done({body: JSON.stringify(obj)});
    }
    // 2. /vip/productList - 商品列表
    else if (url.indexOf('/vip/productList') !== -1 && obj && obj.data) {
        console.log('Pollykann: product list intercepted');
        for (var i = 0; i < obj.data.length; i++) {
            if (obj.data[i].id === 19) {
                obj.data[i].isOpenBuy = false;
            }
        }
        $done({body: JSON.stringify(obj)});
    }
    // 3. /account/stream - AES加密，透传
    else if (url.indexOf('/account/stream') !== -1) {
        $done({});
    }
    // 4. /appConfig/stream - AES加密，透传
    else if (url.indexOf('/appConfig/stream') !== -1) {
        $done({});
    }
    // 5. /device/veryDevice - 设备验证
    else if (url.indexOf('/device/veryDevice') !== -1 && obj) {
        console.log('Pollykann: device verify intercepted');
        obj.data = 999;
        $done({body: JSON.stringify(obj)});
    }
    // 6. /media - 媒体详情
    else if (url.indexOf('/media') !== -1 && obj && obj.data) {
        $done({});
    }
    else {
        $done({});
    }
}
else {
    $done({});
}
