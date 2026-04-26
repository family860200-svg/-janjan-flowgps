---
created: 260426
modified: 260426
flow_stage: L
tags: [agent, admin-assistant]
---

# 清簡的工具箱

> 行政助理使用的工具總覽。系統備份 + Inbox 分流。
> updated: 260426

---

## ⚡ 快速參考（被調度時先看這裡）

| 任務場景 | 使用工具 | 類型 |
|---------|---------|------|
| 備份 StreamDeck 設定 | `streamdeck-backup` | Skill（待建）|
| 備份 Claude 設定（~/.claude）| `claude-config-backup` | Skill（待建）|
| 確認備份時間戳、檔案大小 | Bash（`date` / `ls -la` / `du -sh`）| CLI |
| Skills 認領巡檢（每週）| 比對 `.claude/skills/` vs 各 agent TOOLS.md | SOP |

---

## 🧠 Skills（Claude Code 技能）

| Skill | 觸發時機 | 說明 |
|-------|---------|------|
| `streamdeck-backup` | 需要備份 StreamDeck 設定 | Stream Deck+ 設定自動備份到 iCloud Drive（待建）|
| `claude-config-backup` | 需要備份 Claude 設定 | ~/.claude 整個設定目錄備份到 iCloud Drive（待建）|

---

## 💻 CLI 工具

| 指令 | 用途 |
|------|------|
| `date "+%Y-%m-%d %H:%M"` | 每次操作前確認系統時間（紀錄備份時間戳）|
| `ls -la [備份目錄]` | 確認備份檔案存在與大小 |
| `du -sh [目錄]` | 確認備份資料夾總大小 |

---

## 📋 使用原則

1. **執行前確認路徑**：備份目標路徑存在再執行，不假設
2. **執行後回報狀態**：成功 / 失敗 + 檔案大小 + 存放路徑
3. **不刪原始資料**：備份是複製，不是移動
4. **時間戳必記**：每次備份在 MEMORY.md 記錄最後執行時間
