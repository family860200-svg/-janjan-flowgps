# Loose Ends Scanner — 對話散落待辦掃描器

> 負責人：小流（Chief of Staff）
> 用途：對話結束前或中途，掃描叉出去但沒收尾的行動項目

---

## 觸發條件

- Cassie 說「有沒有漏掉什麼」「叉出去的」「散落待辦」「loose ends」
- save-progress 前主動執行（建議但非強制）
- 對話超過 1 小時且話題切換 3 次以上

---

## 掃描方法

### Step 1：回溯對話，找出所有「行動訊號」

逐段掃描對話內容，標記以下訊號：

| 訊號類型 | 範例 | 權重 |
|---------|------|------|
| **Cassie 提出但沒執行** | 「這個要改」「之後再處理」「先放著」 | 🔴 高 |
| **AI 宣稱完成但無工具記錄** | AI 輸出「✅ 已更新」「已完成」，但 conversation 裡找不到對應的 Edit/Write/Bash 工具呼叫 | 🔴 高 |
| **AI 建議但 Cassie 沒回應** | 「要不要我也...」「還是要...」然後話題切換 | 🟡 中 |
| **做到一半被打斷** | 開始做 A，Cassie 說了 B，A 沒收尾 | 🔴 高 |
| **提到但沒展開** | 「對了 X 也要處理」然後繼續原話題 | 🟡 中 |
| **等外部回覆** | 「等 XX 回覆」「XX 確認後再...」 | 🟢 低（記錄即可） |
| **條件觸發** | 「如果 XX 就要做 YY」 | 🟢 低（記錄即可） |

### Step 2：比對已知系統，排除已處理的

排除清單（不重複加入）：
- 已在 `F｜🕹️｜玩家行動中心.md` 的項目
- 已在本次對話總結「📍 下一步行動」的項目
- 已在 `game-progress.md` P0/P1/P2 的項目
- 本次對話中已標記 ✅ 完成的項目

### Step 3：分類 + 展示

```markdown
🔍 **散落待辦掃描結果**（共 X 項）

**🔴 做到一半 / Cassie 明確提到要做：**
1. [描述] — 對話中哪段提到的
2. [描述] — 對話中哪段提到的

**🟡 AI 建議但沒回應 / 提到但沒展開：**
3. [描述] — 對話中哪段提到的
4. [描述] — 對話中哪段提到的

**🟢 等回覆 / 條件觸發（記錄即可）：**
5. [描述] — 觸發條件是什麼

**已排除**（已在行動中心或對話總結）：
- [項目] ← 已在 [位置]

❓ 要怎麼處理？**回答數字即可**：
**1️⃣ 全加** — 所有項目寫入玩家行動中心
**2️⃣ 選擇** — 你指定編號加入
**3️⃣ 跳過** — 本次不處理
**4️⃣ 馬上執行全部** ⚡ — 平行 dispatch workers 立即執行
**5️⃣ 加到相關文檔** 📄 — 只寫入對應文檔（知識/課綱/skill）
**6️⃣ 加到相關文檔並加到行動中心** 📄+📋 — 雙寫（先文檔 + 再行動中心）
```

**六個選項說明**（Cassie 也可回答數字 1-6 或關鍵詞）：
- **1 / 全加** — 所有項目寫入玩家行動中心（預設行為）
- **2 / 選擇** — Cassie 指定編號加入
- **3 / 跳過** — 本次不處理
- **4 / 馬上執行全部** ⚡ — **平行 dispatch workers 立即執行**（不只是記錄）
- **5 / 加到相關文檔** 📄 — **只寫入對應的知識/課綱/skill 檔案**（見 Step 4c），不重複寫行動中心
- **6 / 加到相關文檔並加到行動中心** 📄+📋 — **雙寫**：先更新相關文檔，再把「實作此功能」當任務加入行動中心

### Step 4：寫入玩家行動中心（全加 / 選擇）

Cassie 選「全加」或「選擇」時，寫入 `F｜行動聚焦漏斗/🕹️｜玩家行動中心.md`：

```markdown
- [ ] [描述] [首次：M/D] [來源：對話 #N loose-ends]
```

分類規則：
- 🔴 高權重 → P0 或 P1（看急迫程度）
- 🟡 中權重 → P1 或 P2
- 🟢 低權重 → 學員服務 / Parking 等對應區塊

### Step 4c：加到相關文檔（📄 / 📄+📋）

Cassie 選「加到相關文檔」或「加到相關文檔並加到行動中心」時，**每個 loose end 先判斷「該進哪個文檔」**，再決定是否併寫行動中心。

**文檔映射邏輯**（AI 自動判斷）：

| Loose end 性質 | 對應文檔 | 範例 |
|---------------|---------|------|
| 課程內容 / 教學素材 | Boss 班課綱 / FlowGPS 課程 MDX | Kanban 功能 → 單元 4 AI 員工協作 |
| Skill 優化 / 新規則 | 對應 `.claude/skills/[name]/skill.md` | threads-writer 新公式 → skill.md Mode G |
| Agent 知識更新 | `L｜🤖｜AI 團隊/[agent]/BRAIN.md` 或 MEMORY.md | 小文新審查規則 → copywriting-reviewer skill |
| 系統架構 / 規則 | CLAUDE.md / MEMORY.md / `rules/*.md` | 新 MANDATORY 行為 → CLAUDE.md Quick Start |
| 人脈互動 | `L｜👤｜人脈/[名稱].md` | JC 新對話結論 → 人脈檔 |
| 知識卡片 | `L｜🏷️｜知識卡片/[領域]/YYMMDD_主題.md` | 新工具評估 → 知識卡片 |
| POSTMORTEM | `flow.ceo/POSTMORTEM.md` 或等效 | bug 復發模式 → 高復發率表格 |

**展示給 Cassie 看**（執行前確認）：

```markdown
📄 **文檔更新計畫**

1. [loose end] → 寫入 `[文檔路徑]`（新增/更新 [章節]）
2. [loose end] → 寫入 `[文檔路徑]`（新增/更新 [章節]）
...

確認更新？（更新 / 調整路徑 / 取消）
```

Cassie 確認後執行更新。

**「加到相關文檔並加到行動中心」特別規則**：
- 先跑 Step 4c 寫入文檔
- 再跑 Step 4 把「**實作此功能**」本身當任務加入行動中心（不是把 loose end 原文再寫一次）
- 範例：
  - loose end：「Dashboard 每個員工 Kanban view」
  - 文檔更新：Boss 班課綱單元 4 加 Kanban 視覺化段落
  - 行動中心：「**實作** Dashboard Kanban UI + API」（派小繪+小碼）

**排除**（不進行動中心）：
- 純知識性更新（如新增一篇知識卡片）
- 純 skill 優化（如調整 threads-writer Mode G）
- 已有對應任務在行動中心（只更新文檔，不再開新項）

### Step 4b：馬上執行全部（⚡ 立即 dispatch workers）

Cassie 說「馬上執行全部」「全部執行 dispatch workers」「全執行」時，**不只記錄，直接派 workers 平行處理**。

**派單原則**：

1. **分類邏輯**（按工作類型分組）：
   - 🔧 **Code 修改 / commit** → 小碼（founding-engineer）
   - 🎨 **UI / BRAIN 更新** → 小繪（uiux-designer）
   - ✍️ **文案 / 草稿** → 小文（copy-reviewer）
   - 🧠 **系統 / POSTMORTEM / 架構** → 小恆（system-architect）
   - 🔍 **驗證 / 探索 / 讀檔** → general-purpose 或 Explore

2. **合併原則**（避免 worker 爆炸）：
   - 同一 agent 的多個小任務 → **合併為一個 worker**（prompt 列清單）
   - 跨 repo 任務 → 每個 repo 獨立 worker（避免 path confusion）
   - 彼此依賴的任務 → 串行（先做 A 再做 B），不平行

3. **派單規則**（每個 worker 都必須遵守）：
   - ✅ 首輪給足 context（目標 + 背景 + 路徑 + 驗收標準）
   - ✅ 改完 code **不 push**（只 commit 或留 working tree）
   - ✅ 每個 worker 回報字數限制（≤ 400 字）
   - ✅ `run_in_background: true`（除非任務 < 1 分鐘）
   - ❌ 不派相同 agent 做相同檔案（避免 race condition）

4. **BLOCKED 項目處理**：
   - 需要外部操作（如 `lpass login`）→ **加入行動中心 P0，不派 worker**
   - 需要 Cassie 決策（破壞性 / 方向選擇）→ **加入行動中心，不派 worker**
   - 只有「可立即執行的項目」才派 worker

5. **展示給 Cassie 看（派單前）**：

```markdown
⚡ **Dispatch 派單計畫**

**可立即派（N workers 平行）**：
- W[X] [小碼/小繪/小文/小恆/general]：[任務摘要]
- W[Y] ...

**需你決定，不派（加入行動中心）**：
- [項目] — 原因：[破壞性 / BLOCKED / 需文案方向]

確認派單？（派 / 調整 / 取消）
```

Cassie 確認後才真的派（或直接派，看 Cassie 明確度）。

**派單完成後**：標註預期 worker 完成時間（通常 5-10 分鐘），告訴 Cassie 等通知。

---

## 使用場景

### 場景 1：對話結束前快速掃
```
Cassie：有沒有漏掉什麼？
小流：🔍 掃描中... [輸出結果]
```

### 場景 2：save-progress Step 1 加強版
save-progress Step 1 是掃描檔案系統的待辦，loose-ends-scanner 是掃描**對話內容**的待辦。兩者互補。

### 場景 3：長對話中途檢查
```
Cassie：等等我們剛剛叉出去很多東西
小流：🔍 掃描中... [輸出結果]
```

---

## 與 save-progress 的關係

| 工具 | 掃描對象 | 時機 |
|------|---------|------|
| **save-progress Step 1** | 檔案系統（Inbox / 專案 / 升級練等） | 對話結束 |
| **save-progress Step 4e** | 對話總結的下一步行動 | 對話結束 |
| **loose-ends-scanner** | **對話內容本身** | 隨時可用 |

loose-ends-scanner 補的是 save-progress 沒覆蓋到的盲區：**對話中提到但沒被正式記錄的散落行動**。

---

## BLOCKED 定義（具體標準）

以下情況標記為 BLOCKED，加入行動中心但**不派 worker**：

| 類型 | 判斷標準 | 範例 |
|------|---------|------|
| 需外部登入 / 手動操作 | 指令需互動式 terminal | `lpass login`、瀏覽器 2FA |
| 需 Cassie 決策 | 涉及方向選擇 / 有取捨 | 「用 A 方案還是 B 方案」 |
| 破壞性操作 | 刪資料 / reset / force push | `drop table`、清空 bucket |
| 有未解依賴 | A 完成才能做 B | 「等 XX 回覆再決定」 |
| 需外部確認 | 等第三方 / 等 Cassie 核准 | 「等丁丁回覆」「等 Stripe 審核」 |

---

## Error Handling

| 情況 | 處理方式 |
|------|---------|
| Step 1 掃描無結果（對話純技術/很短）| 輸出「✅ 無散落待辦，對話整潔」，不強制找項目 |
| Cassie 沒有回應（等 > 1 分鐘）| 預設選項 1（全加），備註「等待超時，預設全加」 |
| Step 4b worker 派出後 silent fail | 標記為 BLOCKED，加入行動中心，告知 Cassie |
| 無法判斷某 loose end 是否已處理 | 標記「？待確認」，展示給 Cassie 決定 |

---

## 安全規則

- ❌ 不自動寫入，一定先展示讓 Cassie 確認
- ✅ 排除已存在的項目，避免重複
- ✅ 標記來源（對話 #N loose-ends），方便追溯
