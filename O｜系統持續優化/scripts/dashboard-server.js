const http = require('http');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const ROOT = path.resolve(__dirname, '..');
const PORT = 3737;

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
    const payload = {
      todos: parseTodos(todoMd),
      summary: getTodaySummary(),
      notes: getManualNotes(dateKey),
      noteDates: Object.keys(allNotes).sort().reverse(),
      currentDate: dateKey,
      date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
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
    const file = path.join(ROOT, 'F｜行動聚焦漏斗', `flow_journal_${dateKey}.json`);
    // 列出所有 flow_journal 日期
    const dir = path.join(ROOT, 'F｜行動聚焦漏斗');
    const dates = fs.readdirSync(dir)
      .filter(f => f.startsWith('flow_journal_') && f.endsWith('.json'))
      .map(f => f.replace('flow_journal_', '').replace('.json', ''))
      .sort().reverse();
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

// 每天 00:00 自動建立空白日誌
schedule.scheduleJob('0 0 * * *', () => {
  const file = getFlowJournalFile();
  if (!fs.existsSync(file)) {
    const blank = { boss: '', idea: '', f: '', l: '', o: '', w: '', drip: [], review: '' };
    fs.writeFileSync(file, JSON.stringify(blank, null, 2));
    console.log(`✅ 新的一天，日誌已重置：${file}`);
  }
});
