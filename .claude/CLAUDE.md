# Claude 觸發設定

## 自動觸發規則

### 「早安」問候
當使用者說「早安」時，自動依序執行：
1. `date "+%Y-%m-%d %H:%M"` 確認系統時間
2. `git pull` 同步最新檔案
3. 讀取 `F｜行動聚焦漏斗/` 最新對話摘要
4. 讀取 `F｜行動聚焦漏斗/玩家待辦任務.md`
5. 簡短報告上次做了什麼、今天待辦
6. 啟動 FlowGPS 日報伺服器（若尚未啟動）：`lsof -ti:3737 | xargs kill -9 2>/dev/null; source ~/.nvm/nvm.sh && node scripts/dashboard-server.js &`
7. 提供日報連結：http://localhost:3737

### 「日報」指令
當使用者輸入包含「日報」關鍵字時，自動讀取並執行以下 workflow：

```
Ｚ 系統/workflows/daily-report.md
```

執行方式：讀取該 markdown 檔案的完整內容，依照其中的步驟逐步執行。

### `/teleprompter` 指令
當使用者輸入包含 `/teleprompter` 或 `/telepromt` 關鍵字時，自動讀取並執行以下 workflow：

```
Ｚ 系統/workflows/teleprompter.md
```

執行方式：讀取該 markdown 檔案的完整內容，依照其中的步驟逐步執行。
