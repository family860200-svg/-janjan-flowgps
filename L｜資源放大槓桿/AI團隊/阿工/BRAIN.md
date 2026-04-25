# 阿工 — 知識庫

## 系統架構
- **主機**：MacBook，`/Users/user/-janjan-flowgps`
- **Node.js**：透過 nvm 管理（`source ~/.nvm/nvm.sh`）
- **Python**：python3，用於 Notion 同步腳本
- **Git 遠端**：GitHub `family860200-svg/-janjan-flowgps`
- **Port 3737**：FlowGPS 日報伺服器

## 已建置工具清單
| 工具 | 路徑 | 狀態 |
|------|------|------|
| FlowGPS 日報伺服器 | `scripts/dashboard-server.js` | ✅ 運作中 |
| Notion 日報同步 | `scripts/notion_daily_sync.py` | ✅ 已修復（260425）|
| 配抄工具 PM1（四單位）| `tools/` | ✅ v2 完成 |
| 配抄工具 PM2（四單位）| `tools/` | ✅ v2 完成 |
| 嘜頭資料產生器 | `tools/` | ✅ v2（34客戶模板）|
| 紙張訂單計算工具 | `tools/` | ✅ 四版本完成 |
| 貨櫃裝載模擬工具 | `tools/` | ✅ 完成 |
| 平版束數查詢工具 | `tools/` | ✅ 完成 |

## 常見問題 / 防踩雷
| 情況 | 正確做法 | 錯誤做法 |
|------|---------|---------|
| 啟動日報伺服器 | 先 kill port 3737，再 node | 直接 node（port 衝突）|
| Notion 同步失敗 | 先 source .env，確認 TOKEN | 直接 push 空值 |
| git push 失敗 | git pull --rebase 後重試 | force push |
| 修改工具邏輯 | 先確認影響哪些版本 | 直接改共用函式 |

## 待公司驗證
- 嘜頭產生器 v2：TECKWAH G106 版面位置確認
- 紙張訂單計算工具：四版本實際訂單測試
- 平版束數查詢工具：350gsm E277 聯盈驗證
- 捲筒配抄工具：G106 KY-3400 訂單測試
