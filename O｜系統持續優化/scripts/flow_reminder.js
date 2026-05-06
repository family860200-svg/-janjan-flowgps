const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const TODO_PATH = path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md');

// ── Mac 強制彈窗（不點不消失） ───────────────────────
function notify(headline, body, urgent = false) {
  const icon = urgent ? 'stop' : 'caution';
  const btn  = urgent ? '🔥 馬上去！' : '知道了！';
  const msg  = `${headline}\\n\\n${body}`;
  // display dialog 會強制跳出、擋在最前面，不點不消失
  const script = `display dialog "${msg.replace(/"/g, '\\"')}" with title "FlowGPS 提醒系統" buttons {"${btn}"} default button 1 with icon ${icon}`;
  require('child_process').exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
  console.log(`\n🔔 [${new Date().toLocaleTimeString('zh-TW')}] ${headline} — ${body}`);
}

// ── 解析待辦 Markdown ──────────────────────────────────
// 觸發條件：重要＋緊急（Q1）的 section，且有明確 HH:MM 時間
// Q1 對應 section：
//   - ## 📅 本週行程（含今日待辦子段落）
//   - ## 🔴 五月主線（工作）
const Q1_SECTIONS = [
  '📅 本週行程',       // 部分比對（前綴）
  '🔴 五月主線（工作）', // 完整比對
];

function getTodayEvents() {
  const events = [];
  if (!fs.existsSync(TODO_PATH)) return events;

  const now = new Date();
  const md = fs.readFileSync(TODO_PATH, 'utf8');
  const lines = md.split('\n');

  let inQ1 = false;

  for (const line of lines) {
    // 遇到 ## 段落，判斷是否為 Q1
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      inQ1 = Q1_SECTIONS.some(q => title.startsWith(q) || title === q);
      continue;
    }
    // ### 子段落：本週行程裡的子段落（今日待辦、明日行程…）仍在 Q1 範圍內
    // 非 Q1 section 直接跳過
    if (!inQ1) continue;

    // 只看未完成的 [ ]
    if (!line.match(/- \[ \]/)) continue;

    // 必須有明確時間 HH:MM 才提醒
    const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) continue;

    const h = parseInt(timeMatch[1], 10);
    const mn = parseInt(timeMatch[2], 10);
    const title = line
      .replace(/- \[ \]\s*/, '')
      .replace(/\d{1,2}:\d{2}\s*/, '')
      .replace(/[⚠️🎉🎯📌✅❌💡⭐]/gu, '')
      .trim();

    const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mn, 0);
    events.push({ title, time: eventTime });
  }

  return events;
}

// ── 已提醒紀錄（避免重複） ────────────────────────────
const alerted = new Set();

function checkAndAlert() {
  const events = getTodayEvents();
  const now = new Date();

  for (const ev of events) {
    const diffMs = ev.time.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const key = `${ev.title}_${ev.time.getTime()}`;
    const timeStr = ev.time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    if (diffMins === 30 && !alerted.has(`${key}_30`)) {
      notify('⏰ 預備提醒', `30 分鐘後要出發／開始：\n${ev.title}（${timeStr}）`);
      alerted.add(`${key}_30`);
    } else if (diffMins === 10 && !alerted.has(`${key}_10`)) {
      notify('🔔 快到了！10 分鐘！', `請放下手邊工作準備：\n${ev.title}（${timeStr}）`, true);
      alerted.add(`${key}_10`);
    } else if (diffMins === 0 && !alerted.has(`${key}_0`)) {
      notify('🚨 時間到！現在馬上！', `${ev.title}`, true);
      alerted.add(`${key}_0`);
    }
  }
}

// ── 啟動 ─────────────────────────────────────────────
const events = getTodayEvents();
console.log(`🕒 FlowGPS 提醒防呆系統已啟動（Mac）`);
console.log(`📋 今日共 ${events.length} 個時間提醒：`);
events.forEach(ev => {
  const t = ev.time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  console.log(`   ${t}  ${ev.title}`);
});
console.log('');

checkAndAlert();
setInterval(checkAndAlert, 60000); // 每分鐘輪詢
