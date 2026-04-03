const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 3737;

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
    } else if (current && (line.startsWith('- [x]') || line.startsWith('- ~~'))) {
      current.items.push({ done: true, text: line.replace(/- \[x\]\s*|~~|~~/g, '').trim(), indent: 0 });
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

function getManualNotes() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const today = getTodayPrefix();
    return data[today] || [];
  } catch { return []; }
}

function saveManualNote(note) {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  const today = getTodayPrefix();
  let data = {};
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (!data[today]) data[today] = [];
  data[today].unshift({ text: note, time: new Date().toLocaleTimeString('zh-TW') });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
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

  if (req.url === '/api/data') {
    const todoMd = fs.readFileSync(path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md'), 'utf8');
    const payload = {
      todos: parseTodos(todoMd),
      summary: getTodaySummary(),
      notes: getManualNotes(),
      date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
    };
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
    return;
  }

  if (req.url === '/api/note' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { note } = JSON.parse(body);
        if (note && note.trim()) saveManualNote(note.trim());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400); res.end();
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(PORT, () => {
  console.log(`✅ FlowGPS 日報啟動：http://localhost:${PORT}`);
});
