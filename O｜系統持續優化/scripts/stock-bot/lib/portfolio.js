const fs   = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/portfolio.json');

function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load(initialCapital) {
  ensureDir();
  if (fs.existsSync(DATA_FILE)) {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch {}
  }
  return {
    cash:      initialCapital,
    positions: {},
    trades:    [],
    createdAt: new Date().toISOString(),
  };
}

function save(state) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
}

function reset(initialCapital) {
  const fresh = { cash: initialCapital, positions: {}, trades: [], createdAt: new Date().toISOString() };
  save(fresh);
  return fresh;
}

// 1 張 = 1,000 股；price 單位：元/股
function buy(state, code, name, price, lotsRequested, config) {
  const lotCost = price * 1000;
  if (lotCost > state.cash) return { success: false, reason: '現金不足以買入 1 張' };

  // 配置上限：若比例算出來是 0，仍允許最少 1 張（高價股保護）
  const ratioCap = Math.floor((state.cash * config.maxPositionRatio) / lotCost);
  const maxLots  = Math.max(ratioCap, 1);
  const lots     = Math.min(lotsRequested, maxLots);

  if (lots <= 0) return { success: false, reason: '資金不足或超過持倉限制' };

  const totalCost = lotCost * lots;
  state.cash -= totalCost;

  if (!state.positions[code]) {
    state.positions[code] = { name, lots: 0, avgPrice: 0, totalCost: 0 };
  }
  const pos      = state.positions[code];
  pos.totalCost += totalCost;
  pos.lots      += lots;
  pos.avgPrice   = pos.totalCost / pos.lots / 1000;

  const trade = { type: 'BUY', code, name, price, lots, cost: totalCost, at: new Date().toISOString() };
  state.trades.push(trade);
  save(state);
  return { success: true, trade };
}

function sell(state, code, price, lots) {
  const pos = state.positions[code];
  if (!pos || pos.lots < lots) return { success: false, reason: '持股不足' };

  const { name, avgPrice } = pos;
  const proceeds  = price * lots * 1000;
  const costBasis = avgPrice * lots * 1000;
  const pnl       = proceeds - costBasis;

  state.cash    += proceeds;
  pos.lots      -= lots;
  pos.totalCost -= costBasis;

  if (pos.lots <= 0) delete state.positions[code];

  const trade = { type: 'SELL', code, name, price, lots, proceeds, pnl, at: new Date().toISOString() };
  state.trades.push(trade);
  save(state);
  return { success: true, trade };
}

function checkStopLossTakeProfit(state, code, currentPrice, config) {
  const pos = state.positions[code];
  if (!pos) return null;
  const pnlPct = (currentPrice - pos.avgPrice) / pos.avgPrice;
  if (pnlPct <= -config.stopLoss)  return 'STOP_LOSS';
  if (pnlPct >= config.takeProfit) return 'TAKE_PROFIT';
  return null;
}

function getSummary(state, currentPrices = {}) {
  let positionValue = 0;
  const positions = [];

  for (const [code, pos] of Object.entries(state.positions)) {
    const price   = currentPrices[code] || pos.avgPrice;
    const mktVal  = price * pos.lots * 1000;
    const cost    = pos.avgPrice * pos.lots * 1000;
    const upnl    = mktVal - cost;
    const upnlPct = cost > 0 ? (upnl / cost * 100) : 0;
    positionValue += mktVal;
    positions.push({ code, ...pos, currentPrice: price, marketValue: mktVal, unrealizedPnl: upnl, unrealizedPnlPct: upnlPct });
  }

  return {
    cash: state.cash,
    positionValue,
    totalAssets: state.cash + positionValue,
    positions,
    tradeCount: state.trades.length,
  };
}

module.exports = { load, save, reset, buy, sell, checkStopLossTakeProfit, getSummary };
