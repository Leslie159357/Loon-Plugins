# 听点点 TingDianDian Pro Unlock

## 应用信息

| 项目 | 内容 |
|------|------|
| App 名称 | 听点点 (TingDianDian) |
| Bundle ID | com.zh.learning |
| 版本 | 1.1.38 (build 8) |
| 架构 | Flutter (Dart AOT) + ObjC |
| 付费系统 | RevenueCat + 自建后端 |
| ATS | ✅ NSAllowsArbitraryLoads = true，无 SSL Pinning |

## 插件功能

- ✅ **Pro 永久会员** — isProPermanentMember → true
- ✅ **基础永久会员** — isBasicPermanentMember → true
- ✅ **标准月付/年付** — isOneMonthMember, isOneYearMember → true
- ✅ **订阅状态** — isSubscribed → true, needSubscribe → false
- ✅ **积分/额度** — permanentNumber, points, balance → 999999
- ✅ **字幕权限** — check-can-use-transcript, check-batch-transcript-member → true
- ✅ **积分检查** — check-points-limit-enough → true
- ✅ **功能对比** — feature-comparison 所有功能解锁
- ✅ **商品目录** — purchase-catalog 所有商品已购
- ✅ **会员计划** — memberPlan → pro_permanent
- ✅ **隐藏永久会员弹窗** — showPermanentMember → false

## 拦截域名

`api.tingdiandian.com`

## 安装方式

### Quantumult X

1. 复制模块链接：`https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/TingDianDian/tingdiandian_qx.sgmodule`
2. Quantumult X → 右下角三图标 → 模块 → 右上角➕ → 粘贴链接 → 确定
3. 确保 MitM 已开启
4. 在 MitM → 主机名 中确认已包含 `api.tingdiandian.com`

### Loon

1. 复制插件链接：`https://raw.githubusercontent.com/Leslie159357/Loon-Plugins/main/plugins/TingDianDian/tingdiandian.plugin`
2. Loon → 插件 → 右上角➕ → 粘贴链接 → 确定
3. 确保 MitM 已开启

## 使用方法

1. 安装模块/插件
2. 确保 MitM 已开启，域名已添加
3. **杀掉 App 重新打开**（RevenueCat 有本地缓存）

## 已知限制

- RevenueCat 有本地缓存，需杀掉 App 重新打开才能生效
- 部分会员状态从 RevenueCat PurchaserInfo 读取，如果 App 使用 RC SDK 的本地缓存的 entitlements，可能需要额外的拦截
- 基于 IPA 静态分析（v1.1.38），未经实际抓包验证，可能需要根据实际请求/响应 JSON 结构调整

## 仓库

https://github.com/Leslie159357/Loon-Plugins/tree/main/plugins/TingDianDian
