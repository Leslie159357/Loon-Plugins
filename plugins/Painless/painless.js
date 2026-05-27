// ==ClosureCompiler==
// @output_var_name _0xdead
// ==/ClosureCompiler==

/*
 * 不背单词 (Painless) Premium Unlock v1.0
 * MITM hostname: app.xiangzi.tech
 * 接口全部明文JSON，无加密签名
 *
 * 拦截:
 *   1. GET /app/users/{userId} — membership/pro 改为会员
 *   2. GET /app/painless/users/{userId}/wordsbook/list — 可返回默认词书
 *   3. GET /app/painless/users/{userId}/rank/v2/list — 改排名
 *   4. GET /app/painless/users/{userId}/continuous/days — 改连续签到
 *   5. GET /app/users/{userId}/personalArticles — 解锁文章
 */

try {
    var url = $request.url;
    var method = $request.method;

    // 拦截 GET /app/users/{userId} — 用户信息/会员状态
    if (method === 'GET' && /^https:\/\/app\.xiangzi\.tech\/app\/users\/\d+$/.test(url)) {
        var body = $response.body;
        if (body) {
            var obj = JSON.parse(body);
            if (obj && obj.data) {
                obj.data.membershipType = 1;        // 会员类型：1=会员
                obj.data.pro = 1;                    // pro 会员
                obj.data.mediaSlots = 999;           // 媒体槽位
                obj.data.proExpire = "2099-12-31T23:59:59Z"; // 永不过期
                obj.data.expirationDate = "2099-12-31T23:59:59Z";
                $done({body: JSON.stringify(obj)});
            }
        }
        $done({});
    }

    // 拦截 GET /app/painless/users/{userId}/rank/v2/list — 排行榜改自己排名为第1
    if (method === 'GET' && /^https:\/\/app\.xiangzi\.tech\/app\/painless\/users\/\d+\/rank\/v2\/list/.test(url)) {
        var body = $response.body;
        if (body) {
            var obj = JSON.parse(body);
            if (obj && obj.data && obj.data.userRanking && obj.data.userRanking.all) {
                obj.data.userRanking.all.rank = 1;
                obj.data.userRanking.all.nationalExceedPercent = 100;
                $done({body: JSON.stringify(obj)});
            }
        }
        $done({});
    }

    // 拦截 GET /app/painless/users/{userId}/continuous/days — 改连续签到
    if (method === 'GET' && /^https:\/\/app\.xiangzi\.tech\/app\/painless\/users\/\d+\/continuous\/days/.test(url)) {
        var body = $response.body;
        if (body) {
            var obj = JSON.parse(body);
            if (obj && obj.data) {
                obj.data.activeDays = 365;
                obj.data.continuousDays = 365;
                obj.data.maxContinuousDays = 365;
                obj.data.shieldDays = 0;
                for (var i = 0; i < obj.data.history.length; i++) {
                    obj.data.history[i].status = '1';
                }
                $done({body: JSON.stringify(obj)});
            }
        }
        $done({});
    }

    $done({});

} catch (e) {
    $done({});
}
