# 🐟 鱼吃鱼 (大鱼/Dayu) 抓包分析 & 破解方案

> **游戏**: 鱼吃鱼 (Dayu/Bigfish) — 微信小游戏 AppId: `wxd705de6e4f88cc89`
> **开发商**: 昆仑游戏/Kunpo/蓝飞 (lanfeitech.com)
> **引擎**: Unity WebGL | **版本**: 1.0.298

---

## 📡 服务器架构

| 域名 | 用途 |
|------|------|
| `hw-cdn-dayu.lanfeitech.com` | CDN: UnityFS 资源包 |
| `prod-dayu.lanfeitech.com` | **主游戏API — 全部明文JSON** |
| `game-admin.lanfeitech.com` | 积分墙/游戏中心 |
| `cdn-gamecenter.lanfeitech.com` | 游戏中心CDN |
| `receiver-kta.lanfeitech.com` | 数据统计 (TA SDK) |

## 🔓 协议特点

| 特性 | 状态 |
|------|------|
| 请求加密 | **无 — 明文JSON** |
| 响应加密 | **无 — 明文JSON** |
| 签名 | `sign: MD5` (请求体哈希) |
| 认证 | `authorization: Bearer <JWT>` (2小时有效期) |
| 防篡改 | **无 — 没有ClientCode/HMAC** |

## 🎯 破解路径

### 1️⃣ 直接修改资源 — `update_user_resource`

```json
POST /api/user/update_user_resource
{
  "uid": "<uid>",
  "update_resource": [
    {"goods_key": "diamond_old", "type": 999, "id": 1001, "count": 999999}
  ],
  "iid": <timestamp>
}
```

### 2️⃣ 直接修改物品 — `update_user_goods`

```json
POST /api/user/update_user_goods
{
  "uid": "<uid>",
  "iid": <timestamp>,
  "update_goods": [{"id": 1001, "count": 999}],
  "ver": 1
}
```

### 3️⃣ 直接修改鱼碎片 — `update_fish_fragment`

```json
POST /api/user/update_fish_fragment
{
  "uid": "<uid>",
  "fish_tb": [
    {"id": 11004, "count": 1},
    {"id": 11012, "count": 1}
  ],
  "ts": <timestamp>
}
```

### 4️⃣ 积分墙任务

`POST game-admin.lanfeitech.com/api/minigame/integral/...`

- **AppSecret 硬编码**: `0e77ef0fc29ee99b04b6432e98684ae8`
- **Kunpo AppID**: `PlbrJWbC`
- 需要 JWT token (`kp-token`) + MD5 sign (`kp-sign`)

---

## 📱 Loon 配置

> 将 `dayu_loon.conf` 导入 Loon → 配置 → 插件

### 核心功能
- `update_user_resource` — 钻石/金币随便改
- `update_user_goods` — 物品数量随便改
- `update_fish_fragment` — 鱼碎片随便解锁
- `archive/upload` — 可拦截日志

### 使用方法
1. 在微信里打开鱼吃鱼小程序
2. 触发一次游戏操作（如关卡结算）
3. Loon 会捕获并修改资源请求
4. 可在脚本中自定义修改数值

---

## 📱 Quantumult X 配置

> 将 `dayu_qx.conf` 导入 Quantumult X

### 核心功能
同 Loon 版本，支持：
- `update_user_resource` 资源修改
- `update_user_goods` 物品修改
- `update_fish_fragment` 鱼碎片修改

---

## ⚠️ 注意事项

1. **Token有效期2小时** — 过期后需要重新抓取新token
2. **服务端权威校验** — 部分数值可能被服务端校正
3. **sign签名** — 修改请求体后需重新计算MD5 sign
4. **适度修改** — 过于夸张的数值可能触发异常检测

---

## 📁 文件清单

| 文件 | 说明 |
|------|------|
| `dayu_loon.conf` | Loon rewrite 插件配置 |
| `dayu_qx.conf` | Quantumult X rewrite 配置 |
| `dayu_loon.js` | Loon 脚本 (sign重新计算) |
| `dayu_qx.js` | Quantumult X 脚本 |
