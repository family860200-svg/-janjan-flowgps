#!/usr/bin/env node
'use strict';

const config    = require('./config');
const fetcher   = require('./lib/fetcher');
const strategy  = require('./lib/strategy');
const portfolio = require('./lib/portfolio');
const logger    = require('./lib/logger');
const { C }     = logger;

// ─── CLI args ──────────────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const mode  = args.find(a => a.startsWith('--mode='))?.split('=')[1] || 'paper';
const doReset = args.includes('--reset');

// ─── State ─────────────────────────────────────────────────────────────────
const historyCache = {};  // code → daily bars[]
const priceMap     = {};  // code → latest price
let   state;              // portfolio state

// ─── Helpers ───────────────────────────────────────────────────────────────
function isTaiwanMarketOpen() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  const mins  = parseInt(parts.hour) * 60 + parseInt(parts.minute);
  const isWeekday = ['Mon','Tue','Wed','Thu','Fri'].includes(parts.weekday);
  return isWeekday && mins >= 540 && mins <= 810; // 09:00–13:30
}

function fmt$   (n) { return (Math.round(n) || 0).toLocaleString('zh-TW'); }
function fmtPnl (n) {
  if (n > 0) return `${C.green}+${fmt$(n)}${C.reset}`;
  if (n < 0) return `${C.red}${fmt$(n)}${C.reset}`;
  return '0';
}
function signalTag(sig) {
  if (sig === 'BUY')  return `${C.green}🟢 買進${C.reset}`;
  if (sig === 'SELL') return `${C.red}🔴 賣出${C.reset}`;
  if (sig === 'WAIT') return `${C.gray}⏳ 等待${C.reset}`;
  return `${C.yellow}🟡 觀望${C.reset}`;
}

// ─── Display ───────────────────────────────────────────────────────────────
function printBanner() {
  const now   = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  const label = mode === 'paper' ? '📈 模擬交易' : '🔍 訊號偵測';
  console.log(`${C.bold}${C.cyan}`);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║            阿淇哥股市機器人  v1.0  🤖                  ║');
  console.log(`║  ${now.slice(0,19).padEnd(22)} |  ${label}        ║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(C.reset);
}

function printStatus(signals) {
  console.clear();
  printBanner();

  const summary = portfolio.getSummary(state, priceMap);
  const totalPnl    = summary.totalAssets - config.initialCapital;
  const totalPnlPct = ((totalPnl / config.initialCapital) * 100).toFixed(2);

  console.log(`${C.bold}💰 帳戶總覽${C.reset}`);
  console.log(`   現金: ${C.cyan}$${fmt$(summary.cash)}${C.reset}   持倉市值: $${fmt$(summary.positionValue)}`);
  console.log(`   總資產: ${C.bold}$${fmt$(summary.totalAssets)}${C.reset}   損益: ${fmtPnl(totalPnl)} (${totalPnl >= 0 ? '+' : ''}${totalPnlPct}%)\n`);

  console.log(`${C.bold}📊 即時行情與訊號${C.reset}`);
  const hdr = `  代號    名稱       現價         漲跌         MA5     MA20    RSI     訊號`;
  console.log(`${C.gray}${hdr}${C.reset}`);
  console.log(`${C.gray}${'─'.repeat(hdr.length)}${C.reset}`);

  for (const s of signals) {
    if (!s.price) continue;
    const chg    = s.prevClose ? s.price - s.prevClose : 0;
    const chgPct = s.prevClose ? (chg / s.prevClose * 100).toFixed(2) : '0.00';
    const chgStr = chg >= 0
      ? `${C.green}+${chg.toFixed(2)}(+${chgPct}%)${C.reset}`
      : `${C.red}${chg.toFixed(2)}(${chgPct}%)${C.reset}`;

    const row = [
      `  ${s.code}`,
      s.name.padEnd(8),
      s.price.toFixed(2).padStart(8),
      chgStr.padEnd(28),
      (s.indicators.ma5  || '-').padStart(7),
      (s.indicators.ma20 || '-').padStart(7),
      (s.indicators.rsi  || '-').padStart(6),
      signalTag(s.signal),
    ];
    console.log(row.join('  '));

    if (s.signal === 'BUY' || s.signal === 'SELL') {
      console.log(`${C.gray}          → ${s.reason}${C.reset}`);
    }
  }

  if (summary.positions.length > 0) {
    console.log(`\n${C.bold}📁 持倉明細${C.reset}`);
    for (const pos of summary.positions) {
      const sign = pos.unrealizedPnlPct >= 0 ? '+' : '';
      console.log(
        `   ${pos.name}(${pos.code})  ${pos.lots}張 @ ${pos.avgPrice.toFixed(2)}均價` +
        `  →  現值 $${fmt$(pos.marketValue)}` +
        `  未實現: ${fmtPnl(pos.unrealizedPnl)} (${sign}${pos.unrealizedPnlPct.toFixed(2)}%)`
      );
    }
  }

  const next = new Date(Date.now() + config.schedule.checkIntervalMinutes * 60000)
    .toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' });
  console.log(`\n${C.gray}更新時間: ${new Date().toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei' })}  |  下次更新: ${next}  |  按 Ctrl+C 停止${C.reset}`);
}

// ─── Core loop ─────────────────────────────────────────────────────────────
async function runCheck() {
  try {
    let realtime = [];
    if (isTaiwanMarketOpen()) {
      logger.info('抓取即時報價…');
      realtime = await fetcher.fetchRealtimePrice(config.watchList);
    } else {
      logger.info('非交易時段，使用歷史收盤價');
    }

    const signals = [];

    for (const stock of config.watchList) {
      const hist = historyCache[stock.code] || [];
      const rt   = realtime.find(p => p.code === stock.code);

      // Build working dataset: history + today's real-time bar (if available)
      const workData = rt?.price
        ? [...hist, {
            date: new Date().toISOString().split('T')[0],
            open: rt.open || rt.price, high: rt.high || rt.price,
            low: rt.low || rt.price,  close: rt.price, volume: rt.volume || 0,
          }]
        : hist;

      if (rt?.price) priceMap[stock.code] = rt.price;

      const result = strategy.generateSignal(workData, config.strategy);
      const price  = rt?.price || hist[hist.length - 1]?.close || 0;
      const prev   = rt?.prevClose || hist[hist.length - 2]?.close || 0;

      signals.push({
        code: stock.code, name: stock.name,
        price, prevClose: prev,
        signal: result.signal, reason: result.reason,
        indicators: result.indicators,
      });

      if (mode !== 'paper') continue;

      // ── Auto-trade ──────────────────────────────────────────────────────
      if (result.signal === 'BUY' && !state.positions[stock.code] && price) {
        const r = portfolio.buy(state, stock.code, stock.name, price, config.strategy.lotsPerTrade, config.strategy);
        if (r.success) {
          logger.trade(`買入 ${stock.name}(${stock.code}) ${r.trade.lots}張 @ $${price}  原因: ${result.reason}`);
        }
      } else if (result.signal === 'SELL' && state.positions[stock.code] && price) {
        const pos = state.positions[stock.code];
        const r   = portfolio.sell(state, stock.code, price, pos.lots);
        if (r.success) {
          logger.trade(`賣出 ${stock.name}(${stock.code}) ${r.trade.lots}張 @ $${price}  損益: ${fmtPnl(r.trade.pnl)}  原因: ${result.reason}`);
        }
      }

      // ── Stop-loss / Take-profit ──────────────────────────────────────────
      const stillHeld = state.positions[stock.code];
      if (stillHeld && price) {
        const action = portfolio.checkStopLossTakeProfit(state, stock.code, price, config.strategy);
        if (action) {
          const label = action === 'STOP_LOSS' ? '⛔ 停損' : '🎯 停利';
          const r = portfolio.sell(state, stock.code, price, stillHeld.lots);
          if (r.success) {
            logger.trade(`${label} ${stock.name}(${stock.code}) ${r.trade.lots}張 @ $${price}  損益: ${fmtPnl(r.trade.pnl)}`);
          }
        }
      }
    }

    printStatus(signals);

  } catch (err) {
    logger.error(`執行錯誤: ${err.message}`);
  }
}

async function loadHistory() {
  logger.info('載入歷史資料（近 3 個月）…');
  for (const stock of config.watchList) {
    logger.info(`  ${stock.name} (${stock.code})`);
    try {
      historyCache[stock.code] = await fetcher.fetchHistoricalData(stock.code, 3);
      logger.success(`    取得 ${historyCache[stock.code].length} 筆`);
    } catch (err) {
      logger.warn(`    ${stock.code} 歷史資料失敗: ${err.message}`);
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (doReset) {
    state = portfolio.reset(config.initialCapital);
    logger.success('帳戶已重置');
    return;
  }

  state = portfolio.load(config.initialCapital);

  printBanner();
  console.log(`模式: ${C.bold}${mode === 'paper' ? '📈 模擬交易' : '🔍 訊號偵測'}${C.reset}`);
  console.log(`初始資金: $${fmt$(config.initialCapital)}  現有交易紀錄: ${state.trades.length} 筆\n`);

  await loadHistory();
  await runCheck();

  const intervalMs = config.schedule.checkIntervalMinutes * 60 * 1000;
  setInterval(runCheck, intervalMs);

  process.on('SIGINT', () => {
    console.log('\n');
    logger.info('機器人停止，儲存狀態…');
    portfolio.save(state);
    process.exit(0);
  });
}

main().catch(err => {
  logger.error(`啟動失敗: ${err.message}`);
  process.exit(1);
});
