// Cake Premium Unlock v1.1 - Loon Script
// 覆盖两个域名: api.mycake.me + api.cakeapp.me
// v1.1 新增: /gw/heart, /gw/user/dashboard, /gw/v2/main/subscription, /gw/ (tutor bot), /v2/user/sentence/progress, /gw/v2/user/review/main, /gw/channel/playlist, /gw/v2/channel/*/sentences

const url = $request.url;
const method = $request.method;
let body = $response.body;

if (!$response.body) {
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);
  
  // ============ 1. POST /app/start → membership NONE→PREMIUM ============
  if (method === 'POST' && /\/app\/start/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.extra) {
      obj.extra.membership = 'PREMIUM';
      obj.extra.membershipBenefitBridgeId = 99999;
      obj.extra.couponCanceled = false;
      // 伪造账号创建时间（看起来像长期会员）
      obj.extra.createdAt = '2024-01-01 00:00:00';
      console.log('Cake: /app/start membership→PREMIUM');
    }
  }
  
  // ============ 2. GET /heart (api.mycake.me) ============
  else if (/\/heart\b/.test(url) && /api\.mycake\.me/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      if (obj.extra && obj.extra.restriction) {
        obj.extra.restriction.adHeartCount = 999;
        obj.extra.restriction.maxAdViewsPerDay = 999;
      }
      console.log('Cake: /heart → unlimited');
    }
  }
  
  // ============ 3. GET /gw/heart (api.cakeapp.me) - 新增！ ============
  else if (/\/gw\/heart/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      if (obj.extra && obj.extra.restriction) {
        obj.extra.restriction.adHeartCount = 999;
        obj.extra.restriction.maxAdViewsPerDay = 999;
      }
      console.log('Cake: /gw/heart → unlimited');
    }
  }
  
  // ============ 4. GET /tutorbot/ticket/policy → 无限AI票 ============
  else if (/\/tutorbot\/ticket\/policy/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.membershipTickets = 99999;
      obj.data.familyMembershipTickets = 99999;
      obj.data.freeTrialTickets = 99999;
      obj.data.familyFreeTrialTickets = 99999;
      console.log('Cake: /tutorbot/ticket/policy → unlimited');
    }
  }
  
  // ============ 5. GET /v2/main/subscription/channel/updated (api.mycake.me) ============
  else if (/\/v2\/main\/subscription\/channel\/updated/.test(url) && /api\.mycake\.me/.test(url)) {
    if (obj.result === 'SUCCESS') {
      obj.data = true;
      console.log('Cake: subscription/channel/updated → true');
    }
  }

  // ============ 6. GET /subscription/timesale/auto ============
  else if (/\/subscription\/timesale\/auto/.test(url)) {
    // 保持原样
  }
  
  // ============ 7. GET /gw/v2/main/today → 解除membershipOnly/restrictedNow ============
  else if (/\/gw\/v2\/main\/today/.test(url)) {
    if (obj.result === 'SUCCESS' && Array.isArray(obj.data)) {
      for (const section of obj.data) {
        if (section.type === 'updatedPlaylist' && section.data && section.data.items) {
          for (const item of section.data.items) {
            if (item.sentences) {
              for (const s of item.sentences) {
                s.membershipOnly = false;
                s.restrictedNow = false;
                s.restrictedAfterFreeTrial = false;
              }
            }
          }
        } else if (section.type === 'snack' && section.data && section.data.items) {
          for (const snack of section.data.items) {
            snack.restrictedNow = false;
          }
        }
      }
      console.log('Cake: /gw/v2/main/today → unlocked all');
    }
  }
  
  // ============ 8. GET /gw/v2/sentence/{id}/view/contents/extra ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/contents\/extra/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.restrictedNow = false;
      obj.data.restrictedAfterFreeTrial = false;
      obj.data.membershipOnly = false;
      // 如果有puzzle里的heart也解锁
      if (obj.data.puzzle && obj.data.puzzle.heart) {
        obj.data.puzzle.heart.count = 999;
        obj.data.puzzle.heart.maximumCount = 999;
        obj.data.puzzle.heart.regenerationTime = 0;
        obj.data.puzzle.heart.regenerationTimeRemaining = 0;
      }
      console.log('Cake: sentence/contents/extra → unlocked');
    }
  }
  
  // ============ 9. GET /gw/v2/sentence/{id}/view/relation ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/relation/.test(url)) {
    let hasChanges = false;
    if (obj.data && obj.data.playlist) {
      const playlist = obj.data.playlist.playlist || obj.data.playlist;
      if (playlist.sentences) {
        for (const s of playlist.sentences) {
          if (s.restrictedNow || s.membershipOnly || s.membershipOnlyPlaylist || s.membershipOnlySentence) {
            s.restrictedNow = false;
            s.restrictedAfterFreeTrial = false;
            s.membershipOnly = false;
            s.membershipOnlyPlaylist = false;
            s.membershipOnlySentence = false;
            hasChanges = true;
          }
        }
      }
      if (playlist.freeCoreQuiz !== undefined) {
        playlist.freeCoreQuiz = true;
        hasChanges = true;
      }
    }
    // 课程列表中的freeBadge → true
    if (obj.data && obj.data.curriculums) {
      for (const c of obj.data.curriculums) {
        c.freeBadge = true;
        hasChanges = true;
      }
    }
    if (hasChanges) console.log('Cake: sentence/view/relation → unlocked');
  }
  
  // ============ 10. GET /gw/snacks → 解除Snack限制 ============
  else if (/\/gw\/snacks/.test(url)) {
    let hasChanges = false;
    if (obj.result === 'SUCCESS' && obj.data && obj.data.snacks) {
      for (const snack of obj.data.snacks) {
        if (snack.restrictedNow) {
          snack.restrictedNow = false;
          hasChanges = true;
        }
      }
      if (hasChanges) console.log('Cake: /gw/snacks → unlocked');
    }
  }

  // ============ 11. GET /gw/v2/main/subscription/channel/updated (api.cakeapp.me) - 新增！============
  else if (/\/gw\/v2\/main\/subscription\/channel\/updated/.test(url)) {
    if (obj.result === 'SUCCESS') {
      obj.data = {'channels': [], 'contents': []};
      console.log('Cake: /gw/v2/main/subscription/channel/updated → ok');
    }
  }

  // ============ 12. GET /gw/user/dashboard → 解锁keys/stars等 - 新增！============
  else if (/\/gw\/user\/dashboard/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.keys = 99999;
      obj.data.stars = 99999;
      obj.data.rank = 1;
      // 签到补满
      if (obj.data.attendance) {
        obj.data.attendance.totalDays = 100;
        obj.data.attendance.continuousDays = 100;
      }
      console.log('Cake: /gw/user/dashboard → keys/stars unlocked');
    }
  }

  // ============ 13. GET /gw/ (tutor bot) → membershipSuspended解除 - 新增！============
  else if (/^https?:\/\/api\.cakeapp\.me\/gw(\?|$)/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data && obj.data.membershipSuspended !== undefined) {
      obj.data.membershipSuspended = false;
      console.log('Cake: /gw/ tutor bot → membershipSuspended=false');
    }
  }

  // ============ 14. GET /gw/v2/user/review/main - 新增！============
  else if (/\/gw\/v2\/user\/review\/main/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      // 解锁所有复习限制容量
      if (obj.data.dictionary) obj.data.dictionary.capacity = 99999;
      if (obj.data.keep) obj.data.keep.capacity = 99999;
      if (obj.data.speak) obj.data.speak.capacity = 99999;
      if (obj.data.snack) obj.data.snack.capacity = 99999;
      if (obj.data.video) obj.data.video.capacity = 99999;
      if (obj.data.blankQuiz) obj.data.blankQuiz.capacity = 99999;
      if (obj.data.collectionQuiz) obj.data.collectionQuiz.capacity = 99999;
      console.log('Cake: /gw/v2/user/review/main → capacity unlocked');
    }
  }

  // ============ 15. POST /gw/user/learning/log - 新增！============
  else if (/\/gw\/user\/learning\/log/.test(url)) {
    // POST学习记录，保持原样
  }

  // ============ 16. GET /v2/user/sentence/progress - 新增！============
  else if (/\/v2\/user\/sentence\/progress/.test(url)) {
    if (obj.result === 'SUCCESS') {
      // 保持原样
    }
  }

  // ============ 17. GET /gw/channel/playlist - 新增！============
  else if (/\/gw\/channel\/playlist/.test(url)) {
    if (obj.data && obj.data.playlists) {
      for (const pl of obj.data.playlists) {
        if (pl.sentences) {
          for (const s of pl.sentences) {
            s.restrictedNow = false;
            s.restrictedAfterFreeTrial = false;
            s.membershipOnly = false;
            s.membershipOnlyPlaylist = false;
            s.membershipOnlySentence = false;
          }
        }
        if (pl.freeCoreQuiz !== undefined) pl.freeCoreQuiz = true;
      }
      console.log('Cake: /gw/channel/playlist → unlocked');
    }
  }

  // ============ 18. GET /gw/v2/channel/{id}/sentences - 新增！============
  else if (/\/gw\/v2\/channel\/\d+\/sentences/.test(url)) {
    if (Array.isArray(obj.data)) {
      for (const s of obj.data) {
        s.restrictedNow = false;
        s.restrictedAfterFreeTrial = false;
        s.membershipOnly = false;
        s.membershipOnlySentence = false;
      }
      console.log('Cake: /gw/v2/channel/*/sentences → unlocked');
    }
  }

  // ============ 19. GET /gw/subscription/config ============
  else if (/\/gw\/subscription\/config/.test(url)) {
    // 保持原样或修改为已解锁提示
  }

  // ============ 20. GET /gw/levelUpQuiz/main ============
  else if (/\/gw\/levelUpQuiz\/main/.test(url)) {
    // 保持原样
  }
  
  body = JSON.stringify(obj);
} catch (e) {
  console.log('Cake: parse error - ' + e.message);
}

$done({ body });
