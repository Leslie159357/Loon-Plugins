// ==CloakNote==
// 得到大脑 GetNotes VIP 解锁 v2.3
// Quantumult X 脚本
// 拦截: dmind.luojilab.com + notes-api.biji.com + get-notes.luojilab.com + ddbrain.*.com
// 基于5轮抓包全面覆盖
// ==/CloakNote==

const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);

  // ==========================================================
  // 1. VIP用户信息 - is_vip + 权益配额
  //    dmind/voicenotes/mind/app/v1/user/info
  //    get-notes/voicenotes/web/user/info
  // ==========================================================
  if (url.indexOf('/user/info') !== -1) {
    if (obj.c && obj.c.data && obj.c.data.vip_info) {
      let vip = obj.c.data.vip_info;
      vip.is_vip = true;
      vip.is_expire = false;
      vip.begin_time = 1780906248;
      vip.end_time = 4092599349;
      vip.expire_time = 4092599349;
      vip.surplus_days = 36500;
      vip.subscribed_days = 36500;
      vip.is_ever_subscribed = true;
      vip.current_tier = 'max';  // 专家版
      vip.equity_intro = '专家版会员';
    }
    if (obj.c && obj.c.data && obj.c.data.rights_info) {
      let r = obj.c.data.rights_info;
      r.meeting_audio_duration_ms = 999999999;
      r.audio_duration_ms = 999999999;
      r.class_duration_ms = 999999999;
      r.ai_trial_count = 99999;
      r.local_audio_max_duration_ms = 999999999;
      r.local_audio_max_file_size_byte = 999999999;
    }
    if (obj.c && obj.c.data && obj.c.data.quota_info) {
      let q = obj.c.data.quota_info;
      if (q.local_audio_quota) {
        q.local_audio_quota.guide_user_get_more = true;
        q.local_audio_quota.granted_duration = 999999999;
        q.local_audio_quota.remained_duration = 999999999;
      }
      if (q.asr_hot_words_quota) {
        q.asr_hot_words_quota.granted_count = 999;
      }
    }
    console.log('GetNotes: /user/info -> VIP max unlocked');
  }

  // ==========================================================
  // 2. ddbrain域名 VIP核心
  //    GET /ddbrain/vip/info
  // ==========================================================
  if (url.indexOf('/ddbrain/vip/info') !== -1) {
    if (obj.c && obj.c.memberships && Array.isArray(obj.c.memberships)) {
      obj.c.memberships.forEach(function(m) {
        m.is_active = true;
        m.expired = false;
        m.expire_time = 4092599349;
        m.remain_days = 36500;
      });
    }
    console.log('GetNotes: /ddbrain/vip/info -> all memberships active');
  }

  // ==========================================================
  // 3. ddbrain 记忆/人格/学习
  //    /ddbrain/yoda/app/v1/xiaobu/memory-stats
  //    /ddbrain/yoda/app/v1/xiaobu/persona-triggered
  //    /ddbrain/study/list
  // ==========================================================
  if (url.indexOf('/ddbrain/yoda/app/v1/xiaobu/memory-stats') !== -1) {
    if (obj.c) {
      obj.c.total = 99999;
      obj.c.note = 99999;
    }
    console.log('GetNotes: /memory-stats -> maxed');
  }

  if (url.indexOf('/ddbrain/yoda/app/v1/xiaobu/persona-triggered') !== -1) {
    if (obj.c) {
      obj.c.triggered = true;
    }
    console.log('GetNotes: /persona-triggered -> triggered');
  }

  // ==========================================================
  // 4. VIP卡信息 - 两个域名
  //    dmind/shop/mind/app/v1/vipcards/user
  //    notes-api/shop/app/v1/vipcards/user
  // ==========================================================
  if (url.indexOf('/vipcards/user') !== -1) {
    if (obj.c && obj.c.vip_info) {
      let vip = obj.c.vip_info;
      vip.is_vip = true;
      vip.is_expire = false;
      vip.begin_time = 1780906248;
      vip.end_time = 4092599349;
      vip.expire_time = 4092599349;
      vip.surplus_days = 36500;
      vip.subscribed_days = 36500;
      vip.is_ever_subscribed = true;
      vip.current_tier = 'max';  // 专家版
    }
    if (obj.c && obj.c.user) {
      obj.c.user.vip_status = 'paid';
      obj.c.user.is_paid_user = true;
      obj.c.user.user_group = 'vip';
    }
    console.log('GetNotes: /vipcards/user -> VIP max unlocked');
  }

  // ==========================================================
  // 5. 商品列表 - 已购标记
  //    notes-api/shop/app/v1/vipcards
  //    notes-api/shop/app/v1/maxcards
  // ==========================================================
  if ((url.indexOf('/shop/app/v1/vipcards') !== -1 && url.indexOf('/user') === -1) || 
      url.indexOf('/shop/app/v1/maxcards') !== -1) {
    if (obj.c && obj.c.cards && Array.isArray(obj.c.cards)) {
      obj.c.cards.forEach(function(card) {
        card.is_purchased = true;
        card.is_bought = true;
        card.available_buy = false;
        card.price = "0.00";
        card.display_price = "0";
        card.origin_price = "0.00";
      });
    }
    console.log('GetNotes: /vipcards|maxcards -> all purchased');
  }

  // ==========================================================
  // 6. 权益使用情况
  //    dmind/voicenotes/mind/app/v1/user/rights/usage
  // ==========================================================
  if (url.indexOf('/user/rights/usage') !== -1) {
    if (obj.c) {
      if (obj.c.local_audio) {
        obj.c.local_audio.granted = '999999分钟';
        obj.c.local_audio.remaining = '999999分钟';
        obj.c.local_audio.used = '已用0';
      }
      if (obj.c.knowledge_topic) {
        obj.c.knowledge_topic.granted = '1TB';
        obj.c.knowledge_topic.remaining = '1TB';
        obj.c.knowledge_topic.used = '已用0B';
        obj.c.knowledge_topic.should_hide = false;
      }
      if (obj.c.voice_card) {
        obj.c.voice_card.should_hide = false;
      }
    }
    console.log('GetNotes: /rights/usage -> quotas maxed');
  }

  // ==========================================================
  // 7. 发芽 - 配额无限
  //    dmind/voicenotes/mind/app/v1/user/sprout/user_situation
  //    get-notes/voicenotes/web/user/sprouts/month_summary
  // ==========================================================
  if (url.indexOf('/user/sprout/user_situation') !== -1) {
    if (obj.c) {
      obj.c.remained_seeds_count = 9999;
      obj.c.month_max_trigger_count = 9999;
      obj.c.is_month_quota_exhausted = false;
      obj.c.is_unlimited_seed_quota = true;
    }
    console.log('GetNotes: /sprout/user_situation -> unlimited');
  }

  if (url.indexOf('/sprouts/month_summary') !== -1) {
    if (obj.c) {
      obj.c.month_max_trigger_count = 9999;
      obj.c.already_triggered_count = 0;
      obj.c.remained_triggers_count = 9999;
      obj.c.is_unlimited_quota = true;
      obj.c.can_trigger_new_task = true;
    }
    console.log('GetNotes: /sprouts/month_summary -> unlimited');
  }

  // ==========================================================
  // 8. 购买/轮询 - 伪造成功
  // ==========================================================
  if (url.indexOf('/vipcards/purchase') !== -1) {
    if (obj.c) {
      obj.c.order_status = 'PAY_SUCCESS';
      obj.c.status = 1;
    }
    console.log('GetNotes: /purchase -> success');
  }

  if (url.indexOf('/vipcards/polling') !== -1) {
    if (obj.c) {
      obj.c.status = 1;
      obj.c.order_status = 'PAY_SUCCESS';
    }
    console.log('GetNotes: /polling -> success');
  }

  // ==========================================================
  // 9. 活动检查
  // ==========================================================
  if (url.indexOf('/activity/education_2025/prize/check') !== -1) {
    if (obj.c) {
      obj.c.has_been_edu_certified = true;
      obj.c.has_been_real_name_certified = true;
      obj.c.has_tried_claim = false;
      obj.c.claim_info = { claimed: false, can_claim: true };
    }
    console.log('GetNotes: /prize/check -> can claim');
  }

  $done({body: JSON.stringify(obj)});

} catch(e) {
  console.log('GetNotes script error: ' + e.message);
  $done({});
}
