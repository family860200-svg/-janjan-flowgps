---
name: flow-journal
description: Use when user wants to review, organize, or update their Bullet Journal entries. Triggers on phrases like "journal review", "檢視 journal", "整理 journal", "記錄到 journal", "標記完成", "遷移項目", "flow-journal", "/flow-journal", or at the end of a conversation when items need to be logged.

triggers:
  - "flow-journal"
  - "flow-journal"
---

# flow-journal Skill v1.5

Bullet Journal 日常維護 + 引導式回顧工具

## 🎯 設計理念

**prompt-only Skill**：
- 不需要 Python 腳本
- 完全由 Claude 通過 prompt.md 執行
- 使用 Claude 的 Read/Edit 工具直接操作 玩家日誌.md

## 🚀 使用方式

### 快速記錄項目
用戶：記錄到 journal：建立 XX 的人脈檔案
Claude：（自動觸發 flow-journal）
  → 加入到 玩家日誌.md
  → 自動加時間戳 [首次：1/22]

### 標記完成
用戶：標記完成：XX 項目
Claude：（自動觸發 flow-journal）
  → 變更 - [ ] → - [x]
  → 加入 [完成：1/22 19:30]

### 遷移項目
用戶：將 XX 項目遷移到 F/todo
Claude：（自動觸發 flow-journal）
  → 標記 →
  → 加入到 F/todo.md
  → 更新 wikilinks

## 📋 核心功能

### 1. 時間戳管理
- ✅ 自動加入 [首次：M/D]
- ✅ 自動更新 [最後：M/D]
- ✅ 完成時加入 [完成：M/D HH:MM]

### 2. 符號遷移
- ✅ • → ×（完成）
- ✅ • → →（遷移）
- ✅ • → <（排程）

### 3. Frontmatter 更新
- ✅ 自動更新 modified 時間
- ✅ 保持其他欄位不變

## 🔄 與 flow-funnel-review 的協作

| 工具 | 頻率 | 用途 |
|------|------|------|
| **flow-journal** | 每天多次 | 快速記錄、符號管理 |
| **flow-funnel-review** | 每週一次 | 深度分流、健檢報告 |

**典型流程**：
Day 1-6: 使用 flow-journal 快速記錄（累積項目）
Day 7（週日）: 執行 flow-funnel-review 完整健檢與分流

## 💡 使用範例

### 範例 1：對話中快速記錄
Cassie：這個想法不錯，記錄一下：研究 Remotion 視頻工具
Claude：✅ 已記錄到 journal（L345）

### 範例 2：批次標記完成
Cassie：這 3 個項目都完成了：
  - 建立 Inbox 子資料夾
  - 創建 flow-journal Skill
  - 測試 flow-funnel-review

Claude：✅ 已標記 3 項完成
  - 建立 Inbox 子資料夾 [完成：1/22 18:46]
  - 創建 flow-journal Skill [完成：1/22 19:20]
  - 測試 flow-funnel-review [完成：1/22 19:15]

### 範例 3：月底整理
Cassie：執行月底 journal 整理
Claude：（執行 Monthly Migration）
  1. 掃描所有 × 完成項目 → 移至「歷史記錄」
  2. 掃描所有 → 遷移項目 → 確認已移動
  3. 更新月度統計
  4. 生成下月 journal 模板（可選）

---

## 🤖 CLAUDE.md 整合

### 對話結束工作流整合

**更新 CLAUDE.md 第 3 步**：
```markdown
3️⃣ **🚨 MANDATORY: 將未完成項目和下一步行動加入 journal**
   - 使用 flow-journal Skill 自動記錄
   - 格式：[首次：M/D] [來源：對話總結]
```

**自動化流程**：
對話結束
  ↓
生成對話總結（包含「❌ 未完成項目」和「📍 下一步行動」）
  ↓
自動觸發 flow-journal
  ↓
批次加入到 journal「⚡ 今日快速待辦」
  ↓
更新 frontmatter
  ↓
Git commit

---

## 📊 Frontmatter 更新邏輯

```yaml
---
modified: {當前時間}  # ⭐ 每次記錄都更新
tags: [..., 快速收集]  # 自動加入相關標籤（如有新類型）
related: [...]         # 自動加入新的 wikilinks（如有提及）
status: active         # 保持 active
---
```

---

## 🎯 Phase 1 功能範圍（MVP）

### ✅ 包含
- Quick Add（快速記錄）
- Mark Complete（標記完成）
- Auto Timestamp（自動時間戳）
- Frontmatter Update（自動更新）

### ❌ 不包含（Phase 2）
- Monthly Migration（月度整理）
- Index Update（索引更新）
- Weekly Review（週度檢視）

---

## 🔧 技術實現

**Pure Prompt Skill**：
- 不需要 Python 腳本
- 使用 Claude 的 Read + Edit 工具
- 簡單、快速、可靠

**關鍵工具**：
Read 工具 → 讀取 玩家日誌.md
Edit 工具 → 精確字串替換
  - old_string: "- [ ] 項目 [首次：1/22]"
  - new_string: "- [x] 項目 [首次：1/22] [完成：1/22 19:30]"

---

## ⚠️ 注意事項

### 模糊匹配邏輯
用戶可能只說部分項目名稱：
- 用戶說：「標記完成：Pan 人脈」
- 實際項目：「建立 Pan 的人脈檔案」
- Claude 需要模糊匹配找到正確項目

### 多項目處理
如果找到多個匹配項：
- 列出所有匹配項
- 請用戶確認是哪一個
- 或者全部標記（如用戶明確要求「全部完成」）

### 時區處理
- 使用系統本地時間
- 格式：M/D HH:MM（24 小時制）

---

## Core Workflow

### Workflow 0: Journal Review（引導式回顧與改寫）⭐⭐⭐⭐⭐

**定位**：BuJo Mental Inventory + Intentionality 核心流程

#### Step 1: 執行掃描並生成數據
```bash
python3 ~/.claude/skills/flow-journal/flow_journal.py scan --output-json /tmp/journal_data.json --check-diary
```

#### Step 2: 讀取並分析
```python
# 使用 Read 工具
data = Read(/tmp/journal_data.json)

# 提取統計
total_items = data['stats']['total']
overdue_warning = data['stats']['overdue_warning']
overdue_critical = data['stats']['overdue_critical']
```

#### Step 3: 逐區塊引導回顧

**重點區塊（按優先級）**：
1. ⚡ 今日快速待辦（警告級項目最多）⭐⭐⭐⭐⭐
2. 📋 F 層待內化項目清單 ⭐⭐⭐⭐
3. 💬 人脈互動 ⭐⭐⭐
4. 🔗 連結 / 資源收集 ⭐⭐

**對每個區塊執行**：

1. **顯示統計**
   ```markdown
   ## 📋 回顧：⚡ 今日快速待辦

   **統計**：
   - 總項目：15 項
   - 警告級（3-6天）：5 項
   - 無日期標記：3 項
   ```

2. **引導問題**（針對警告級項目）
   ```markdown
   ### 🟡 需要你決定的項目（5 項）

   #### 項目 1
   **內容**：[ ] ⭐ 重要 觀看 YouTube 影片
   **首次**：1/19 | **已過**：3 天

   💭 **Ryder Carroll 的核心問題**：
   > 這還值得我的生命精力嗎？（Is this still worth my life energy?）

   💭 **Peter Drucker 的提醒**：
   > 沒有什麼比高效率地做根本不該做的事更無用的了。

   🤔 **Cassie，你的決定是**：
   1. ✅ 重要，今天就做（保留並提升優先級）
   2. → 需要評估，但不急（遷移到 Inbox 或 F/todo）
   3. × 不重要了，放手（刪除）
   4. ⏸️  暫時保留（等待時機）

   請告訴我：「項目 1 選擇 X」
   ```

3. **執行批次動作**
   - 根據 Cassie 的選擇
   - 使用 Edit 工具批次更新
   - 生成動作摘要

#### Step 4: 生成改寫計劃

```markdown
## 📊 Journal 改寫建議

基於你的回顧決策，建議的改寫動作：

### 刪除（5 項）
- × 項目 A（不重要）
- × 項目 B（已完成但忘記打勾）

### 遷移（8 項）
- → 項目 C → Inbox/🔗｜連結/
- → 項目 D → Inbox/📚｜學習/

### 保留（7 項）
- ⭐ 高優先級項目
- 本週新增項目

### 預期效果
- 原 journal：130 項待辦
- 新 journal：約 40-50 項（清爽 60%）
- 清晰度：⭐⭐⭐⭐⭐
```

#### Step 5: 執行改寫（需確認）

**選項 A**：Claude 自動執行
- 批次標記 × 和 →
- 更新所有項目
- 生成改寫後的 journal

**選項 B**：生成改寫腳本
- Cassie 親自執行（保持控制權）

---

## 引導問題範本庫

### 針對過期項目（3-7天）
💭 這個項目為什麼一直沒做？
- 不重要（可刪除）
- 被阻擋（需要先做其他事）
- 需要更多時間（遷移評估）
- 時機未到（保持現狀）

### 針對無日期項目
💭 這是什麼類型的項目？
- Checklist（不需要日期）
- 遺漏的待辦（加日期）
- 已完成但忘記打勾（標記完成）

### 針對重複項目
💭 這些是同一件事嗎？
- 是 → 合併
- 不是 → 區分清楚

---

## BuJo 符號系統（完整）

| 符號 | 意義 | 使用時機 | 範例 |
|------|------|---------|------|
| • | 任務 | 待辦事項 | • 完成報告 |
| ○ | 事件 | 會議、活動 | ○ 3pm 會議 |
| - | 筆記 | 資訊、想法 | - 學到新概念 |
| × | 完成 | 任務完成 | × 完成報告 |
| → | 遷移 | 移至其他位置 | → 移至專案 todo |
| < | 排程 | 加入日曆 | < 下週處理 |
| ⭐ | 優先 | 高優先級 | ⭐ 今天必做 |

---

## Important Notes

### Intentionality（意圖性）原則

**BuJo 哲學核心**：
> Friction（摩擦力）就是過濾機制。重寫的不便迫使你暫停並思考。

**應用到 flow-journal**：
- ✅ 引導問題（而非自動決策）
- ✅ 親自選擇（保持控制權）
- ✅ 摩擦力保留（Migration 不能完全自動化）

### 80/90 規則檢視

**定義**：
> 大多數人 80% 的時間在「目前」清單上，其中 90% 是服務別人的優先事項。
> = 72% 的生命精力花在別人的目標上

**journal review 時問**：
- 這個項目支持**我的願景**（W 層）嗎？
- 還是在服務別人的優先事項？

---

**Skill Version**: 1.5.0（Journal Review 核心工作流）
**Last Updated**: 2026-01-22 20:50
**Philosophy**: "Intentionality over Automation"
