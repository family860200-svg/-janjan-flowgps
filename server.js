require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const app = express();
const PORT = 3001;
const ROOT = __dirname;

app.use(cors());
app.use(express.json());

// ── 工具函式 ──────────────────────────────────────────

function getTodayStr() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getFullDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── 解析玩家待辦任務.md ──────────────────────────────────

function parseTodos() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md');
  try {
    const md = fs.readFileSync(file, 'utf8');
    const sections = [];
    let current = null;
    for (const line of md.split('\n')) {
      if (line.startsWith('## ')) {
        if (current) sections.push(current);
        current = { title: line.replace('## ', '').trim(), items: [] };
      } else if (current && (line.startsWith('- [ ]') || line.startsWith('  - [ ]'))) {
        const indent = line.startsWith('  ') ? 1 : 0;
        current.items.push({
          done: false,
          text: line.replace(/\s*- \[ \]\s*/, '').trim(),
          indent
        });
      } else if (current && (line.startsWith('- [x]') || line.startsWith('- ~~'))) {
        current.items.push({
          done: true,
          text: line.replace(/- \[x\]\s*|~~|~~/g, '').trim(),
          indent: 0
        });
      }
    }
    if (current) sections.push(current);
    return sections;
  } catch {
    return [];
  }
}

// ── 今日對話摘要 ──────────────────────────────────────

function getTodaySummary() {
  const prefix = getTodayStr();
  const dir = path.join(ROOT, 'F｜行動聚焦漏斗', '對話摘要');
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith(prefix));
    if (!files.length) return null;
    const file = files[files.length - 1];
    return fs.readFileSync(path.join(dir, file), 'utf8');
  } catch {
    return null;
  }
}

// ── 每日小記（notes-log.json）──────────────────────────

function getNotesLogPath() {
  return path.join(ROOT, 'notes-log.json');
}

function readNotesLog() {
  try {
    return JSON.parse(fs.readFileSync(getNotesLogPath(), 'utf8'));
  } catch {
    return {};
  }
}

function getTodayNotes() {
  const data = readNotesLog();
  const today = getTodayStr();
  return data[today] || { inspiration: '', todos: '', savedAt: null };
}

function saveTodayNotes(notes) {
  const data = readNotesLog();
  const today = getTodayStr();
  data[today] = {
    inspiration: notes.inspiration || '',
    todos: notes.todos || '',
    savedAt: new Date().toISOString()
  };
  fs.writeFileSync(getNotesLogPath(), JSON.stringify(data, null, 2));
}

// ── 今日行程（schedule-log.json）──────────────────────

function getScheduleLogPath() {
  return path.join(ROOT, 'schedule-log.json');
}

function readScheduleLog() {
  try {
    return JSON.parse(fs.readFileSync(getScheduleLogPath(), 'utf8'));
  } catch {
    return {};
  }
}

function getTodaySchedule() {
  const data = readScheduleLog();
  const today = getTodayStr();
  return data[today] || [];
}

function saveTodaySchedule(items) {
  const data = readScheduleLog();
  const today = getTodayStr();
  data[today] = items;
  fs.writeFileSync(getScheduleLogPath(), JSON.stringify(data, null, 2));
}

// ── daily-data.json（workflow 匯入用）────────────────

function getDailyData() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, 'daily-data.json'), 'utf8'));
  } catch {
    return null;
  }
}

// ── 手動記錄（沿用舊系統）────────────────────────────

function getManualNotes() {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const today = getTodayStr();
    return data[today] || [];
  } catch {
    return [];
  }
}

function saveManualNote(note) {
  const file = path.join(ROOT, 'F｜行動聚焦漏斗', 'manual_notes.json');
  const today = getTodayStr();
  let data = {};
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (!data[today]) data[today] = [];
  data[today].unshift({
    text: note,
    time: new Date().toLocaleTimeString('zh-TW')
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── API 路由 ─────────────────────────────────────────

// 首頁
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

// 取得所有資料
app.get('/api/data', (req, res) => {
  res.json({
    todos: parseTodos(),
    summary: getTodaySummary(),
    manualNotes: getManualNotes(),
    notes: getTodayNotes(),
    schedule: getTodaySchedule(),
    dailyData: getDailyData(),
    date: new Date().toLocaleDateString('zh-TW', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    })
  });
});

// 手動快速記錄
app.post('/api/note', (req, res) => {
  const { note } = req.body;
  if (note && note.trim()) {
    saveManualNote(note.trim());
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: '空白記錄' });
  }
});

// 每日小記（靈感 + 待辦）自動儲存
app.post('/api/daily-notes', (req, res) => {
  const { inspiration, todos } = req.body;
  saveTodayNotes({ inspiration, todos });
  res.json({ ok: true });
});

// 行程管理
app.get('/api/schedule', (req, res) => {
  res.json(getTodaySchedule());
});

app.post('/api/schedule', (req, res) => {
  const { time, title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: '缺少標題' });
  const items = getTodaySchedule();
  items.push({
    id: Date.now(),
    time: time || '',
    title: title.trim(),
    prepared: false
  });
  items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  saveTodaySchedule(items);
  res.json({ ok: true });
});

app.post('/api/schedule/toggle', (req, res) => {
  const { id } = req.body;
  const items = getTodaySchedule();
  const item = items.find(i => i.id === id);
  if (item) {
    item.prepared = !item.prepared;
    saveTodaySchedule(items);
  }
  res.json({ ok: true });
});

app.post('/api/schedule/delete', (req, res) => {
  const { id } = req.body;
  const items = getTodaySchedule().filter(i => i.id !== id);
  saveTodaySchedule(items);
  res.json({ ok: true });
});

// 匯入 daily-data.json
app.post('/api/import', (req, res) => {
  const { tasks, schedule: scheduleItems } = req.body;

  // 匯入行程
  if (scheduleItems && scheduleItems.length) {
    const existing = getTodaySchedule();
    const existingTitles = new Set(existing.map(i => i.title));
    for (const item of scheduleItems) {
      if (!existingTitles.has(item.title)) {
        existing.push({
          id: Date.now() + Math.random(),
          time: item.time || '',
          title: item.title,
          prepared: false
        });
      }
    }
    existing.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    saveTodaySchedule(existing);
  }

  res.json({ ok: true, message: '匯入完成' });
});

// ── 每天 23:59 定時處理 ─────────────────────────────

schedule.scheduleJob('59 23 * * *', () => {
  console.log('⏰ 執行每日 23:59 定時處理…');

  const notes = getTodayNotes();
  const dateStr = getFullDateStr();
  const prefix = getTodayStr();

  // 靈感 → 存入對話摘要資料夾
  if (notes.inspiration && notes.inspiration.trim()) {
    const dir = path.join(ROOT, 'F｜行動聚焦漏斗', '對話摘要');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filename = `${prefix}_每日靈感.md`;
    const content = `# ${dateStr} 每日靈感\n\n${notes.inspiration.trim()}\n`;
    fs.writeFileSync(path.join(dir, filename), content);
    console.log(`✅ 靈感已存入：${filename}`);
  }

  // 待辦 → 寫回玩家待辦任務.md（加到支線任務區）
  if (notes.todos && notes.todos.trim()) {
    const todoFile = path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md');
    try {
      let md = fs.readFileSync(todoFile, 'utf8');
      const newItems = notes.todos.trim().split('\n')
        .filter(line => line.trim())
        .map(line => `- [ ] ${line.trim()}`)
        .join('\n');

      // 在「支線任務」區塊末尾加入
      const marker = '## 🔵 支線任務（空檔推進）';
      const idx = md.indexOf(marker);
      if (idx !== -1) {
        const nextSection = md.indexOf('\n## ', idx + marker.length);
        const insertPos = nextSection !== -1 ? nextSection : md.length;
        md = md.slice(0, insertPos) + '\n' + newItems + '\n' + md.slice(insertPos);
      } else {
        md += `\n\n${marker}\n\n${newItems}\n`;
      }
      fs.writeFileSync(todoFile, md);
      console.log(`✅ 待辦已寫回玩家待辦任務.md`);
    } catch (err) {
      console.error('❌ 寫入待辦失敗：', err.message);
    }
  }
});

// ── 啟動 ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ JANJAN FlowGPS 日報儀表板：http://localhost:${PORT}`);
});
