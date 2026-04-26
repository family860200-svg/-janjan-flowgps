const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

function ts() {
  return new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
}

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

const info    = msg => console.log(`${C.cyan}[${ts()}]${C.reset} ${msg}`);
const success = msg => console.log(`${C.green}[${ts()}] ✅ ${msg}${C.reset}`);
const warn    = msg => console.log(`${C.yellow}[${ts()}] ⚠️  ${msg}${C.reset}`);
const error   = msg => console.error(`${C.red}[${ts()}] ❌ ${msg}${C.reset}`);

function trade(msg) {
  ensureLogDir();
  const line = `[${ts()}] ${msg}`;
  console.log(`${C.bold}${C.green}${line}${C.reset}`);
  fs.appendFileSync(path.join(LOG_DIR, 'trades.log'), line + '\n');
}

module.exports = { info, success, warn, error, trade, C };
