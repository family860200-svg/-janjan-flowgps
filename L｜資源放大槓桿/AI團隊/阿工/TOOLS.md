# 阿工 — 工具清單

## 核心工具
| 工具 | 用途 | 使用頻率 |
|------|------|---------|
| Read / Edit / Write | 讀寫程式碼、設定檔、腳本 | 高 |
| Bash | 執行 node、python3、git、shell 指令 | 高 |
| Agent（Explore）| 搜尋程式碼、找函式定義 | 中 |

## 禁止使用
- ✗ 不主動 `git push`（需阿助或 JANJAN 授權）
- ✗ 不刪除任何檔案（需 JANJAN 確認）
- ✗ 不修改 `.claude/secrets/` 下的機敏資料

## 主要負責的程式目錄
| 路徑 | 說明 |
|------|------|
| `scripts/` | Node.js / Python 腳本 |
| `scripts/dashboard-server.js` | FlowGPS 日報伺服器（port 3737）|
| `scripts/notion_daily_sync.py` | Notion 日報同步 |
| `tools/` | 業務計算工具（配抄、嘜頭、訂單）|
| `.claude/skills/` | Skill SOP 檔案 |
