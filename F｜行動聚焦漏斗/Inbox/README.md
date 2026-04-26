# JANJAN x FlowGPS

FlowGPS 是 JANJAN 的日常管理與工具整合專案：包含每日任務、對話摘要、工作儀表板與配抄相關工具。

## Quick Start

1. 安裝依賴（若尚未安裝）
   - `npm install`
2. 啟動本機儀表板
   - `npm start`
3. 開啟
   - `http://localhost:3737`

## 主要目錄（先看這裡）

- `F｜行動聚焦漏斗/`
  - 每日任務、對話摘要、flow journal、manual notes
- `L｜資源放大槓桿/`
  - 工具沉澱、知識資源、AI 團隊素材
- `O｜系統持續優化/`
  - 流程與系統優化紀錄
- `W｜八大財富積累/`
  - 週報、成果與反思
- `scripts/`
  - 儀表板前後端檔案（`dashboard-server.js`、`dashboard.html`）

## 核心資料檔

- `daily-data.json`：每日任務儀表板資料
- `work-okr.json`：工作 OKR 與近期指標
- `F｜行動聚焦漏斗/玩家待辦任務.md`：待辦主清單
- `F｜行動聚焦漏斗/manual_notes.json`：隨手筆記

## 工具索引（重點）

### 儀表板與主工具

- `tools/dashboard/工具儀表板.html`
- `tools/complaint/客訴處理機器人.html`
- `tools/marking/嘜頭資料產生器.html`
- `tools/container/貨櫃裝載模擬.html`

### 配抄工具（集中）

- `配抄工具/PM1配抄工具_MM.html`
- `配抄工具/PM2配抄工具_MM.html`
- `配抄工具/捲筒裝載模擬.html`
- `配抄工具/平版束數查詢.html`
- `配抄工具/paper_order_calculator.html`

## 維護建議（最小版本）

- 新增工具時，優先放在 `配抄工具/` 或對應主題資料夾，避免根目錄持續堆疊。
- 每週至少一次整理 `F｜行動聚焦漏斗/對話摘要/` 與 `Inbox`。
- 若調整儀表板 API，請同步更新本 README 的「Quick Start」與工具索引。
