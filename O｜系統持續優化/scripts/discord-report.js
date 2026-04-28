const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1498468822246490122/R56qWlAsuBCj1J-nhl_u08uyAW5vU03PYO2mmwRkhr8fQ37fQojrZa7NlZHTLxqJoHF-';

function getTodayPrefix() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseTodos(md) {
  const sections = [];
  let current = null;
  for (const line of md.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.replace('## ', '').trim(), items: [] };
    } else if (current && (line.startsWith('- [ ]') || line.startsWith('  - [ ]'))) {
      current.items.push({ done: false, text: line.replace(/\s*- \[ \]\s*/, '').trim() });
    } else if (current && (line.startsWith('- [x]') || line.startsWith('  - [x]') || line.startsWith('- ~~') || line.startsWith('  - ~~'))) {
      current.items.push({ done: true, text: line.replace(/\s*- \[x\]\s*|~~|~~/g, '').trim() });
    }
  }
  if (current) sections.push(current);
  return sections;
}

function getManualNotes() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return data[getTodayPrefix()] || [];
  } catch { return []; }
}

function getTodayFlowJournal() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', `flow_journal_${getTodayPrefix()}.json`);
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }
  catch { return null; }
}

function run() {
  const todoMd = fs.readFileSync(path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md'), 'utf8');
  const sections = parseTodos(todoMd);
  const notes = getManualNotes();
  const journal = getTodayFlowJournal();
  const date = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const clean = t => t.replace(/（https?:\/\/[^）]*）/g, '').replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').trim();
  const fmtSection = items => {
    if (!items.length) return null;
    const lines = items.slice(0, 6).map(t => `• ${clean(t)}`);
    if (items.length > 6) lines.push(`_…還有 ${items.length - 6} 項_`);
    return lines.join('\n');
  };

  const eisenhowerMap = {
    '🔴 四月主線': 'q1', '💰 家庭財務': 'q2',
    '🟡 健康日常': 'q2', '🟠 系統維護': 'q3',
    '🔵 支線任務（空檔推進）': 'q4',
  };
  const q = { q1: [], q2: [], q3: [], q4: [] };
  const scheduleItems = [];

  for (const s of sections) {
    const bucket = eisenhowerMap[s.title];
    if (bucket) s.items.filter(i => !i.done).forEach(i => q[bucket].push(i.text));
    else if (s.title.startsWith('📅 本週行程')) s.items.filter(i => !i.done).forEach(i => scheduleItems.push(i.text));
  }

  const boss = journal?.boss?.trim() || '（未設定）';
  const med = `早 ${journal?.med_morning ? '✅' : '❌'}　午 ${journal?.med_noon ? '✅' : '❌'}　晚 ${journal?.med_evening ? '✅' : '❌'}`;

  const embeds = [{
    title: '📋 FlowGPS 日報',
    description: `${date}\n\n🎯 **今日Boss**　${boss}\n💊 **吃藥**　${med}`,
    color: 0x5865F2,
  }];

  const cfg = [
    { title: '📅 本週行程',            color: 0x00BFFF, items: scheduleItems },
    { title: '🔴 立刻做（重要＋緊急）', color: 0xFF4444, items: q.q1 },
    { title: '🟡 排時間（重要＋不緊急）',color: 0xFFCC00, items: q.q2 },
    { title: '🟠 快速處理',             color: 0xFF8C00, items: q.q3 },
    { title: '⚪ 擱置',                 color: 0x888888, items: q.q4 },
  ];

  for (const { title, color, items } of cfg) {
    const desc = fmtSection(items);
    if (desc) embeds.push({ title, description: desc, color });
  }

  if (notes.length > 0) {
    const notesText = notes.map(n => `• ${n.text}${n.tag ? ` [${n.tag}]` : ''}`).join('\n').slice(0, 1020);
    embeds.push({ title: '✏️ 隨手記', description: notesText, color: 0xFF61D2 });
  }

  embeds[embeds.length - 1].footer = { text: 'FlowGPS · 每日 08:00 自動推送' };

  const payload = JSON.stringify({ embeds });
  const url = new URL(DISCORD_WEBHOOK);
  const req = https.request({
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    console.log(`[${new Date().toLocaleTimeString('zh-TW')}] Discord 推送：${res.statusCode}`);
    process.exit(res.statusCode === 204 ? 0 : 1);
  });
  req.on('error', e => { console.error('Discord 推送失敗：', e.message); process.exit(1); });
  req.write(payload);
  req.end();
}

run();
