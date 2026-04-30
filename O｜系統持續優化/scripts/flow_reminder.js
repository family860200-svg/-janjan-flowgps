const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const CONFIG_PATH = path.join(__dirname, 'config.json');

// 顯示巨大通知視窗
function showHugePopup(title, timeStr) {
  const psScript = `
    Add-Type -AssemblyName PresentationFramework
    [xml]$xaml = @"
    <Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" Title="FlowGPS 強力提醒" Width="800" Height="400" Topmost="True" WindowStartupLocation="CenterScreen" Background="#FFD32F2F" WindowStyle="ToolWindow">
        <Grid>
            <TextBlock Name="MsgText" Text="🚨 ${timeStr} 🚨\`n\`n${title}" FontSize="42" FontWeight="Bold" Foreground="White" HorizontalAlignment="Center" Margin="20,40,20,0" TextAlignment="Center" TextWrapping="Wrap"/>
            <Button Name="BtnClose" Content="我知道了，馬上去辦！" Width="320" Height="80" FontSize="28" FontWeight="Bold" Background="#FFFFFFFF" Foreground="#FFD32F2F" VerticalAlignment="Bottom" Margin="0,0,0,40"/>
        </Grid>
    </Window>
"@
    $reader = (New-Object System.Xml.XmlNodeReader($xaml))
    $win = [Windows.Markup.XamlReader]::Load($reader)
    $btn = $win.FindName("BtnClose")
    $btn.add_Click({$win.Close()})
    $win.ShowDialog() | Out-Null
  `;
  
  exec(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, '')}"`);
}

function fetchIcs(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve('');
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function parseIcsDate(dateStr) {
  if (!dateStr) return null;
  // 格式如 20260430T100000Z 或 20260430T100000
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
  if (!match) return null;
  const [_, y, m, d, h, mn, s, z] = match;
  let date = new Date(Date.UTC(y, m - 1, d, h, mn, s));
  if (!z) { // 沒有Z表示本地時間
    date = new Date(y, m - 1, d, h, mn, s);
  } else {
    // 如果是Z，轉為本地時間（自動處理時區）
  }
  return date;
}

async function getTodayEvents() {
  const events = [];
  const now = new Date();
  
  // 1. 解析 Markdown
  const todoMdPath = path.join(ROOT, 'F｜行動聚焦漏斗', '玩家待辦任務.md');
  if (fs.existsSync(todoMdPath)) {
    const todoMd = fs.readFileSync(todoMdPath, 'utf8');
    for (const line of todoMd.split('\n')) {
      if (line.match(/- \[( |x)\]/)) {
        const timeMatch = line.match(/@(\d{1,2}):(\d{2})/);
        // 只提醒尚未打勾的任務
        if (timeMatch && !line.includes('[x]')) {
          const h = parseInt(timeMatch[1], 10);
          const mn = parseInt(timeMatch[2], 10);
          const title = line.replace(/- \[( |x)\]/, '').trim();
          const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mn, 0);
          events.push({ title, time: eventTime, source: 'Markdown' });
        }
      }
    }
  }

  // 2. 解析 Google Calendar (簡易版解析)
  let config = {};
  if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  
  if (config.google_calendar_ical_url && config.google_calendar_ical_url.startsWith('http')) {
    const icsData = await fetchIcs(config.google_calendar_ical_url);
    const lines = icsData.split(/\r?\n/);
    let inEvent = false;
    let currentEvent = {};
    
    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        if (currentEvent.start && currentEvent.title) {
          // 只篩選今天的行程
          if (currentEvent.start.getDate() === now.getDate() && currentEvent.start.getMonth() === now.getMonth()) {
            events.push({ title: currentEvent.title, time: currentEvent.start, source: 'Calendar' });
          }
        }
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) currentEvent.title = line.substring(8);
        else if (line.startsWith('DTSTART')) {
          const dateStr = line.split(':')[1];
          currentEvent.start = parseIcsDate(dateStr);
        }
      }
    }
  }

  return events;
}

// 記錄已經提醒過的事件 (避免每分鐘重複彈出)
const alertedEvents = new Set();

async function checkAndAlert() {
  const events = await getTodayEvents();
  const now = new Date();
  
  for (const ev of events) {
    const diffMs = ev.time.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    const eventKey = `${ev.title}_${ev.time.getTime()}`;
    
    if (diffMins === 30 && !alertedEvents.has(`${eventKey}_30`)) {
      showHugePopup(`即將在 30 分鐘後開始：\n${ev.title}`, `預備提醒 (${ev.time.getHours().toString().padStart(2, '0')}:${ev.time.getMinutes().toString().padStart(2, '0')})`);
      alertedEvents.add(`${eventKey}_30`);
    }
    else if (diffMins === 5 && !alertedEvents.has(`${eventKey}_5`)) {
      showHugePopup(`🔥 只剩 5 分鐘了！🔥\n請立刻放下手邊工作：\n${ev.title}`, `最後通牒 (${ev.time.getHours().toString().padStart(2, '0')}:${ev.time.getMinutes().toString().padStart(2, '0')})`);
      alertedEvents.add(`${eventKey}_5`);
    }
  }
}

console.log("🕒 FlowGPS 提醒防呆系統已啟動，背景輪詢中...");
// 啟動時先檢查一次
checkAndAlert();
// 每 1 分鐘輪詢一次
setInterval(checkAndAlert, 60000);
