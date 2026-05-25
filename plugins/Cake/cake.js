// Cake Premium Unlock - Loon Script
// 覆盖两个域名: api.mycake.me + api.cakeapp.me
// 支持所有付费限制解除

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
      console.log('Cake: /app/start membership→PREMIUM');
    }
  }
  
  // ============ 2. GET /heart → 无限红心 ============
  else if (/\/heart\b/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.count = 999;
      obj.data.maximumCount = 999;
      obj.data.regenerationTime = 0;
      obj.data.regenerationTimeRemaining = 0;
      console.log('Cake: /heart → unlimited');
    }
  }
  
  // ============ 3. GET /tutorbot/ticket/policy → 无限AI票 ============
  else if (/\/tutorbot\/ticket\/policy/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.membershipTickets = 99999;
      obj.data.familyMembershipTickets = 99999;
      obj.data.freeTrialTickets = 99999;
      obj.data.familyFreeTrialTickets = 99999;
      console.log('Cake: /tutorbot/ticket/policy → unlimited');
    }
  }
  
  // ============ 4. GET /v2/main/subscription/channel/updated ============
  else if (/\/v2\/main\/subscription\/channel\/updated/.test(url)) {
    if (obj.result === 'SUCCESS') {
      obj.data = true;
      console.log('Cake: subscription/channel/updated → true');
    }
  }
  
  // ============ 5. GET /subscription/timesale/auto ============
  else if (/\/subscription\/timesale\/auto/.test(url)) {
    // 保持原样，已经是SUCCESS
  }
  
  // ============ 6. GET /gw/v2/main/today → 解除membershipOnly/restrictedNow ============
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
  
  // ============ 7. GET /gw/v2/sentence/{id}/view/contents/extra ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/contents\/extra/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data) {
      obj.data.restrictedNow = false;
      obj.data.restrictedAfterFreeTrial = false;
      obj.data.membershipOnly = false;
      console.log('Cake: sentence/contents/extra → unlocked');
    }
  }
  
  // ============ 8. GET /gw/v2/sentence/{id}/view/relation ============
  else if (/\/gw\/v2\/sentence\/\d+\/view\/relation/.test(url)) {
    if (obj.data && obj.data.playlist) {
      const playlist = obj.data.playlist.playlist || obj.data.playlist;
      if (playlist.sentences) {
        for (const s of playlist.sentences) {
          s.restrictedNow = false;
          s.restrictedAfterFreeTrial = false;
          s.membershipOnly = false;
          s.membershipOnlyPlaylist = false;
          s.membershipOnlySentence = false;
        }
      }
      if (playlist.freeCoreQuiz !== undefined) {
        playlist.freeCoreQuiz = true;
      }
      console.log('Cake: sentence/view/relation → unlocked all sentences');
    }
    // 课程列表中的freeBadge → true
    if (obj.data && obj.data.curriculums) {
      for (const c of obj.data.curriculums) {
        c.freeBadge = true;
      }
    }
  }
  
  // ============ 9. GET /gw/snacks → 解除Snack限制 ============
  else if (/\/gw\/snacks/.test(url)) {
    if (obj.result === 'SUCCESS' && obj.data && obj.data.snacks) {
      for (const snack of obj.data.snacks) {
        snack.restrictedNow = false;
        if (snack.cards) {
          for (const card of snack.cards) {
            card.restrictedNow = false;
          }
        }
      }
      console.log('Cake: /gw/snacks → unlocked');
    }
  }

  // ============ 10. GET /gw/subscription/config ============
  else if (/\/gw\/subscription\/config/.test(url)) {
    // 保持原样，或者修改buttonText提示已解锁
  }

  // ============ 11. GET /gw/levelUpQuiz/main ============
  else if (/\/gw\/levelUpQuiz\/main/.test(url)) {
    // 保持原样
  }
  
  body = JSON.stringify(obj);
} catch (e) {
  console.log('Cake: parse error - ' + e.message);
}

$done({ body });
