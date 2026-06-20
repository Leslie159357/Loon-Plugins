# 🐟 鱼吃鱼(Dayu) — 资源修改

> **游戏**: 鱼吃鱼 (大鱼/Dayu) | 微信 AppId: `wxd705de6e4f88cc89`
> **引擎**: Unity WebGL | **开发商**: 昆仑游戏/Kunpo

## 协议特点

全部 **明文JSON**，无加密，可直接修改 `update_user_resource` / `update_user_goods` / `update_fish_fragment` 三个接口。

## 使用方法

### Loon
1. 插件 → 订阅 → 添加 `https://raw.githubusercontent.com/Leslie159357/self-use/main/plugins/Dayu/dayu.plugin`
2. 开启 HTTPS 解密 (MITM)
3. 打开鱼吃鱼小程序即可

### Quantumult X
1. 重写 → 引用 → 添加 `https://raw.githubusercontent.com/Leslie159357/self-use/main/plugins/Dayu/Dayu.conf`
2. 开启 MITM
3. 打开鱼吃鱼小程序即可

## 文件清单

| 文件 | 用途 |
|------|------|
| `dayu.plugin` | Loon 插件 |
| `Dayu.conf` | Quantumult X 配置 |
| `dayu_loon.js` | Loon 脚本 |
| `dayu_qx.js` | Quantumult X 脚本 |
