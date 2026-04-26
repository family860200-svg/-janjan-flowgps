module.exports = {
  // ─────────────────────────────────────────────────
  // 監控股票清單（台灣上市 TSE；上櫃改 market:'otc'）
  // ─────────────────────────────────────────────────
  watchList: [
    { code: '2330', name: '台積電',   market: 'tse' },
    { code: '2317', name: '鴻海',     market: 'tse' },
    { code: '2454', name: '聯發科',   market: 'tse' },
    { code: '0050', name: '元大T50',  market: 'tse' },
    { code: '2881', name: '富邦金',   market: 'tse' },
  ],

  // 模擬帳戶初始資金（新台幣）
  // 台積電1張≈85萬，建議最低3M起
  initialCapital: 3_000_000,

  // ─────────────────────────────────────────────────
  // 策略參數
  // ─────────────────────────────────────────────────
  strategy: {
    ma:   { short: 5, long: 20 },          // 均線週期
    rsi:  { period: 14, oversold: 30, overbought: 70 },
    stopLoss:         0.05,   // 5%  停損
    takeProfit:       0.15,   // 15% 停利
    maxPositionRatio: 0.25,   // 單一持倉上限（佔現金比）
    lotsPerTrade:     1,      // 每次買進張數
  },

  // ─────────────────────────────────────────────────
  // 排程
  // ─────────────────────────────────────────────────
  schedule: {
    checkIntervalMinutes: 5,
  },
};
