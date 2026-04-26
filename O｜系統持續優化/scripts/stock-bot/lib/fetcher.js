const axios = require('axios');

const REALTIME = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp';
const HISTORY  = 'https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function withRetry(fn, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries) throw err;
      await sleep(2000 * (i + 1));
    }
  }
}

async function fetchRealtimePrice(stocks) {
  const exCh = stocks.map(s => `${s.market}_${s.code}.tw`).join('|');
  return withRetry(async () => {
    const { data } = await axios.get(REALTIME, {
      params:  { ex_ch: exCh },
      headers: { Referer: 'https://mis.twse.com.tw/', 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000,
    });
    if (!data?.msgArray) return [];
    return data.msgArray
      .filter(item => item.z && item.z !== '-' && item.z !== '0')
      .map(item => ({
        code:      item.ch?.split('.')[0] || '',
        name:      item.n  || '',
        price:     parseFloat(item.z),
        open:      parseFloat(item.o) || null,
        high:      parseFloat(item.h) || null,
        low:       parseFloat(item.l) || null,
        prevClose: parseFloat(item.y) || null,
        volume:    parseInt((item.v || '0').replace(/,/g, '')),
        time:      item.t || '',
      }));
  });
}

function rocToIso(rocDate) {
  const [y, m, d] = rocDate.split('/');
  return `${parseInt(y) + 1911}-${m}-${d}`;
}

async function fetchMonthlyHistory(code, yyyymmdd) {
  return withRetry(async () => {
    const { data } = await axios.get(HISTORY, {
      params:  { date: yyyymmdd, stockNo: code, response: 'json' },
      timeout: 15000,
    });
    if (!data?.data) return [];
    return data.data.map(row => ({
      date:   rocToIso(row[0]),
      open:   parseFloat(row[3].replace(/,/g, '')) || 0,
      high:   parseFloat(row[4].replace(/,/g, '')) || 0,
      low:    parseFloat(row[5].replace(/,/g, '')) || 0,
      close:  parseFloat(row[6].replace(/,/g, '')) || 0,
      volume: parseInt(row[1].replace(/,/g, ''))   || 0,
    }));
  });
}

async function fetchHistoricalData(code, monthsBack = 3) {
  const all = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}01`;
    try {
      const rows = await fetchMonthlyHistory(code, yyyymmdd);
      all.push(...rows);
    } catch {}
    await sleep(600);
  }
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = { fetchRealtimePrice, fetchHistoricalData };
