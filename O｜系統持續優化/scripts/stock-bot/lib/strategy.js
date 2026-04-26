const { calcMA, calcRSI, calcMACD } = require('./indicators');

function generateSignal(historicalData, config) {
  const { ma, rsi } = config;
  const closes = historicalData.map(d => d.close).filter(Boolean);

  if (closes.length < ma.long + 1) {
    return { signal: 'WAIT', reason: '歷史資料不足', indicators: {} };
  }

  const ma5      = calcMA(closes, ma.short);
  const ma20     = calcMA(closes, ma.long);
  const rsiVal   = calcRSI(closes, rsi.period);
  const macdData = calcMACD(closes);

  const prev    = closes.slice(0, -1);
  const prevMa5  = calcMA(prev, ma.short);
  const prevMa20 = calcMA(prev, ma.long);

  let signal = 'HOLD';
  const reasons = [];

  // MA 交叉
  if (ma5 && ma20 && prevMa5 && prevMa20) {
    if (prevMa5 < prevMa20 && ma5 >= ma20) {
      signal = 'BUY';
      reasons.push(`MA${ma.short} 黃金交叉 MA${ma.long}`);
    } else if (prevMa5 > prevMa20 && ma5 <= ma20) {
      signal = 'SELL';
      reasons.push(`MA${ma.short} 死亡交叉 MA${ma.long}`);
    }
  }

  // RSI 極值覆蓋
  if (rsiVal !== null) {
    if (rsiVal < rsi.oversold && signal !== 'BUY') {
      signal = 'BUY';
      reasons.push(`RSI 超賣 (${rsiVal.toFixed(1)})`);
    } else if (rsiVal > rsi.overbought && signal !== 'SELL') {
      signal = 'SELL';
      reasons.push(`RSI 超買 (${rsiVal.toFixed(1)})`);
    }
  }

  return {
    signal,
    reason: reasons.join(' + ') || '無明顯訊號',
    indicators: {
      ma5:  ma5?.toFixed(2)          || '-',
      ma20: ma20?.toFixed(2)         || '-',
      rsi:  rsiVal?.toFixed(1)       || '-',
      macd: macdData?.macd?.toFixed(2) || '-',
    },
    currentPrice: closes[closes.length - 1],
  };
}

module.exports = { generateSignal };
