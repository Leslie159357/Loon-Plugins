// InkerSpeak Premium Unlock v2.2
const url=$request.url,b=$response.body;
if(!url.includes('yinke.jinguizi07.cn')){$done({body:b});return;}
let o;try{o=JSON.parse(b)}catch(e){$done({body:b});return;}
let m=false;
function u(a){if(!Array.isArray(a))return false;let c=0;for(const i of a){if(i&&typeof i==='object'&&i.isVip===true){i.isVip=false;c++;}}if(c>0)console.log('解锁 '+c+' 个VIP');return c>0;}
function p(d){if(!d||typeof d!=='object')return false;d.memberType='premium';d.isMember=true;d.membershipEndDate=4092599349000;d.membershipStartDate=Date.now();d.remainingTimeQuota=999999;return true;}
if(url.includes('/api/auth/apple-login')&&o.data&&p(o.data)){m=true;}
if(url.includes('/api/user/user-info')&&o.data&&p(o.data)){m=true;}
if(url.includes('/api/story-series/')){if(Array.isArray(o.data)&&u(o.data))m=true;if(o.data&&typeof o.data==='object'){for(const k of['page','content','stories','items','list','records']){if(Array.isArray(o.data[k])&&u(o.data[k]))m=true;}}}
if(url.includes('/api/distribution/summary')&&o.data){o.data.flowCoins=99999;m=true;}
if(url.includes('/api/distribution/exchange/membership')){o.code=200;o.success=true;o.data={flowCoins:99999};o.message='操作成功';m=true;}
// 转录记录: 把PENDING改成COMPLETED, 模拟已处理
if(url.includes('/api/podcasts/transcribe/records')&&Array.isArray(o.data)){for(const r of o.data){if(r.status==='PENDING'){r.status='COMPLETED';r.processedCount=10;r.totalCount=10;m=true;}}if(m)console.log('转录: PENDING→COMPLETED');}
$done({body:JSON.stringify(o)});
