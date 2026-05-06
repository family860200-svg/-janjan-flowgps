const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const ROOT = path.resolve(__dirname, '../..');
const PORT = 3737;
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1498468822246490122/R56qWlAsuBCj1J-nhl_u08uyAW5vU03PYO2mmwRkhr8fQ37fQojrZa7NlZHTLxqJoHF-';

function getFlowJournalFile() {
  return path.join(ROOT, 'F｜行動聚焦漏斗', `flow_journal_${getTodayPrefixNow()}.json`);
}

function getTodayPrefixNow() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

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
      const indent = line.startsWith('  ') ? 1 : 0;
      current.items.push({ done: false, text: line.replace(/\s*- \[ \]\s*/, '').trim(), indent });
    } else if (current && (line.startsWith('- [x]') || line.startsWith('  - [x]') || line.startsWith('- ~~') || line.startsWith('  - ~~'))) {
      const indent = line.startsWith('  ') ? 1 : 0;
      current.items.push({ done: true, text: line.replace(/\s*- \[x\]\s*|~~|~~/g, '').trim(), indent });
    }
  }
  if (current) sections.push(current);
  return sections;
}

function getTodaySummary() {
  const prefix = getTodayPrefix();
  const dir = path.join(ROOT, 'F｜行動聚焦漏斗', '對話摘要');
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix));
    if (!files.length) return null;
    // get latest file
    const file = files[files.length - 1];
    return fs.readFileSync(path.join(dir, file), 'utf8');
  } catch { return null; }
}

function getAllNotes() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function getManualNotes(dateKey) {
  const data = getAllNotes();
  const key = dateKey || getTodayPrefix();
  return data[key] || [];
}

function saveManualNote(note, tag) {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  const today = getTodayPrefix();
  const data = getAllNotes();
  if (!data[today]) data[today] = [];
  const entry = { text: note, time: new Date().toLocaleTimeString('zh-TW') };
  if (tag) entry.tag = tag;
  data[today].unshift(entry);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function deleteManualNote(dateKey, index) {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  const data = getAllNotes();
  if (data[dateKey]) {
    data[dateKey].splice(index, 1);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

function updateManualNote(dateKey, index, newText) {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  const data = getAllNotes();
  if (data[dateKey] && data[dateKey][index]) {
    data[dateKey][index].text = newText;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'dashboard.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  const url = new URL(req.url, `http://localhost`);

  if (url.pathname === '/api/data') {
    const dateKey = url.searchParams.get('date') || getTodayPrefix();
    const todoMd = fs.readFileSync(path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md'), 'utf8');
    const allNotes = getAllNotes();

    // ── 八大財富累積 ──
    const WEALTH_NAMES = ['成長','健康','家庭','技藝','金錢','人脈','體驗','服務'];
    const wealthTotal = {}; const wealthToday = {};
    WEALTH_NAMES.forEach(n => { wealthTotal[n] = 0; wealthToday[n] = 0; });
    const today = getTodayPrefix();
    const jDir = path.join(ROOT, 'F｜行動聚焦漏斗');
    try {
      // 掃根目錄 + flow_journal 子目錄
      const scanDirs = [jDir, path.join(jDir, 'flow_journal')];
      for (const dir of scanDirs) {
        if (!fs.existsSync(dir)) continue;
        for (const f of fs.readdirSync(dir).filter(f => f.startsWith('flow_journal_') && f.endsWith('.json'))) {
          try {
            const dk = f.replace('flow_journal_','').replace('.json','');
            const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
            if (j.wealth) {
              WEALTH_NAMES.forEach(n => {
                const v = Number(j.wealth[n]) || 0;
                wealthTotal[n] += v;
                if (dk === today) wealthToday[n] = v;
              });
            }
            // 自動：全天三次藥都打勾 → 健康 +1
            if (j.med_morning && j.med_noon && j.med_evening) wealthTotal['健康'] += 1;
            if (dk === today && j.med_morning && j.med_noon && j.med_evening) wealthToday['健康'] += 1;
          } catch {}
        }
      }
      // 加入歷史補分（從 W_Wealth 活動紀錄換算）
      const histFile = path.join(jDir, 'wealth_history.json');
      if (fs.existsSync(histFile)) {
        const hist = JSON.parse(fs.readFileSync(histFile, 'utf8'));
        if (hist.wealth) WEALTH_NAMES.forEach(n => { wealthTotal[n] += Number(hist.wealth[n]) || 0; });
      }
    } catch {}

    const payload = {
      todos: parseTodos(todoMd),
      summary: getTodaySummary(),
      notes: getManualNotes(dateKey),
      noteDates: Object.keys(allNotes).sort().reverse(),
      currentDate: dateKey,
      date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
      wealth_total: wealthTotal,
      wealth_today: wealthToday,
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
    return;
  }

  if (url.pathname === '/api/note' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { note, tag } = JSON.parse(body);
        if (note && note.trim()) saveManualNote(note.trim(), tag || '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(); }
    });
    return;
  }

  if (url.pathname === '/api/note/delete' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { date, index } = JSON.parse(body);
        deleteManualNote(date, index);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(); }
    });
    return;
  }

  if (url.pathname === '/api/note/update' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { date, index, text } = JSON.parse(body);
        if (text && text.trim()) updateManualNote(date, index, text.trim());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(); }
    });
    return;
  }

  if (url.pathname === '/api/flow-journal' && req.method === 'GET') {
    const dateKey = url.searchParams.get('date') || getTodayPrefixNow();
    const jDir = path.join(ROOT, 'F｜行動聚焦漏斗');
    const subDir = path.join(jDir, 'flow_journal');

    // 掃兩個目錄，合併去重後排序
    let allKeys = [];
    for (const d of [jDir, subDir]) {
      if (!fs.existsSync(d)) continue;
      fs.readdirSync(d)
        .filter(f => f.startsWith('flow_journal_') && f.endsWith('.json'))
        .forEach(f => allKeys.push(f.replace('flow_journal_','').replace('.json','')));
    }
    const dates = [...new Set(allKeys)].sort().reverse();

    // 從兩個位置找檔案
    let file = path.join(jDir, `flow_journal_${dateKey}.json`);
    if (!fs.existsSync(file)) file = path.join(subDir, `flow_journal_${dateKey}.json`);

    if (fs.existsSync(file)) {
      const journal = JSON.parse(fs.readFileSync(file, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ journal, dates, currentDate: dateKey }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ journal: null, dates, currentDate: dateKey }));
    }
    return;
  }


  if (url.pathname === '/api/flow-journal' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { journal } = JSON.parse(body);
        fs.writeFileSync(getFlowJournalFile(), JSON.stringify(journal, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(); }
    });
    return;
  }

  if (url.pathname === '/api/work-okr' && req.method === 'GET') {
    const file = path.join(ROOT, 'work-okr.json');
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ okr: '', healthMetrics: '', future: '' }));
    }
    return;
  }

  if (url.pathname === '/api/work-okr' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        data.updatedAt = new Date().toISOString().slice(0, 10);
        fs.writeFileSync(path.join(ROOT, 'work-okr.json'), JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch { res.writeHead(400); res.end(); }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`✅ FlowGPS 日報啟動：http://localhost:${PORT}`);
});

function getTodayFlowJournal() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', `flow_journal_${getTodayPrefix()}.json`);
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null; }
  catch { return null; }
}

function sendDiscordReport() {
  try {
    const todoMd = fs.readFileSync(path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md'), 'utf8');
    const sections = parseTodos(todoMd);
    const notes = getManualNotes();
    const journal = getTodayFlowJournal();
    const date = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    // 去除 URL（讓文字乾淨）
    const clean = t => t.replace(/（https?:\/\/[^）]*）/g, '').replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').trim();

    // 每個象限最多顯示 6 筆，超過顯示省略
    const fmtSection = items => {
      if (!items.length) return null;
      const lines = items.slice(0, 6).map(t => `• ${clean(t)}`);
      if (items.length > 6) lines.push(`_…還有 ${items.length - 6} 項_`);
      return lines.join('\n');
    };

    // 艾森豪矩陣分類（與 dashboard 相同）
    const eisenhowerMap = {
      '🔴 五月主線（工作）':       'q1',
      '📅 本週行程（5/6 ～ 5/11）': 'q1',
      '🔴 五月主線（個人與健康）': 'q2',
      '💰 家庭財務與行政':         'q2',
      '📅 週末與女兒行程':         'q3',
      '🛒 考慮購買與支線':         'q4',
    };
    const q = { q1: [], q2: [], q3: [], q4: [] };
    const scheduleItems = [];

    for (const s of sections) {
      const bucket = eisenhowerMap[s.title];
      if (bucket) s.items.filter(i => !i.done).forEach(i => q[bucket].push(i.text));
      else if (s.title.startsWith('📅 本週行程')) s.items.filter(i => !i.done).forEach(i => scheduleItems.push(i.text));
    }

    // FLOW 日誌
    const boss = journal?.boss?.trim() || '（未設定）';
    const med = `早 ${journal?.med_morning ? '✅' : '❌'}　午 ${journal?.med_noon ? '✅' : '❌'}　晚 ${journal?.med_evening ? '✅' : '❌'}`;

    // 各 embed 一個象限，用顏色區分（左側色條）
    const embeds = [
      {
        title: '📋 FlowGPS 日報',
        description: `${date}\n\n🎯 **今日Boss**　${boss}\n💊 **吃藥**　${med}`,
        color: 0x5865F2,
      }
    ];

    const sections_cfg = [
      { key: 'schedule', title: '📅 本週行程',          color: 0x00BFFF, items: scheduleItems },
      { key: 'q1',       title: '🔴 立刻做（重要＋緊急）', color: 0xFF4444, items: q.q1 },
      { key: 'q2',       title: '🟡 排時間（重要＋不緊急）',color: 0xFFCC00, items: q.q2 },
      { key: 'q3',       title: '🟠 快速處理',           color: 0xFF8C00, items: q.q3 },
      { key: 'q4',       title: '⚪ 擱置',               color: 0x888888, items: q.q4 },
    ];

    for (const { title, color, items } of sections_cfg) {
      const desc = fmtSection(items);
      if (desc) embeds.push({ title, description: desc, color });
    }

    if (notes.length > 0) {
      const notesText = notes.map(n => `• ${n.text}${n.tag ? ` [${n.tag}]` : ''}`).join('\n').slice(0, 1020);
      embeds.push({ title: '✏️ 隨手記', description: notesText, color: 0xFF61D2 });
    }

    // footer 放在最後一個 embed
    embeds[embeds.length - 1].footer = { text: 'FlowGPS · 每日 08:00 自動推送' };

    const payload = JSON.stringify({ embeds });
    const url = new URL(DISCORD_WEBHOOK);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, res => console.log(`Discord 推送：${res.statusCode}`));
    req.on('error', e => console.error('Discord 推送失敗：', e.message));
    req.write(payload);
    req.end();
  } catch (e) {
    console.error('Discord 日報產生失敗：', e.message);
  }
}

// 每天 00:00 自動建立空白日誌
schedule.scheduleJob('0 0 * * *', () => {
  const file = getFlowJournalFile();
  if (!fs.existsSync(file)) {
    const blank = { boss: '', idea: '', f: '', l: '', o: '', w: '', drip: [], review: '' };
    fs.writeFileSync(file, JSON.stringify(blank, null, 2));
    console.log(`✅ 新的一天，日誌已重置：${file}`);
  }
});
