---
name: solution-scout
description: Use BEFORE building anything new. Triggers when user says "solution-scout", "先查現成", "有沒有現成", "動工前查一下", "有沒有 n8n 模板", "有沒有現成的 skill", "有沒有 GitHub 專案", or when about to start building a feature/tool. Searches SkillsMP skills + repoinside GitHub projects + n8n templates + local template library in parallel, then recommends build vs. reuse.

triggers:
  - "solution-scout"
  - "先查現成"
  - "動工前查一下"
---

# solution-scout

**動工前四源齊查，省掉重造輪子的時間**

## 用途

在開始建任何新功能或工具之前，同時查四個來源，確認有沒有現成方案可以直接用或參考：

1. **SkillsMP** — 有沒有現成的 Claude Skill
2. **repoinside / GitHub** — 有沒有開源專案
3. **n8n 模板庫** — 有沒有現成的 n8n 自動化流程
4. **本機模板庫**（選配）— 自己收集的模板備份，中文 B2C 電商／行銷／SEO 場景優先查

**預計節省時間**：從「不知道有沒有現成的，先從頭做」→「10 分鐘內確認四個來源，決定策略」

---

## 觸發時機

任一符合即可激活：

- 用戶說「solution-scout」
- 用戶說「先查現成」「動工前查一下」「有沒有現成的」
- 用戶說「有沒有 n8n 模板」「n8n 有沒有相關流程」
- 用戶說「有沒有 skill 可以做 XX」
- 用戶說「GitHub 有沒有現成的 XX 專案」
- 用戶說「本機庫有沒有」「我的備份有沒有」
- **即將開始一個新功能開發** — AI 自動判斷是否應先 scout

---

## 執行流程

### 輸入

用戶提供一句話描述想做的事：
```
例：「多平台社群發布：LinkedIn / Facebook / Instagram / Threads / 電子報」
例：「Discord 自動發公告根據 Google Calendar 行程」
例：「Stripe 付款後自動寄 email 並更新 Notion」
```

### Step 1：四源並行搜尋

**來源 1 — SkillsMP（Claude Skills）**
```bash
python3 .claude/skills/skill-lookup/skill-lookup.py ai "[描述]" --limit 5
```

**來源 2 — repoinside（GitHub 開源專案）**
```
Firecrawl 抓取：https://repoinside.com
搜尋關鍵字：[英文描述]
```

**來源 3 — n8n 模板庫**
```
Firecrawl 或 WebSearch：https://n8n.io/workflows
關鍵字：[英文描述] site:n8n.io/workflows
```

**來源 4 — 本機模板庫（選配）**

如果你有自己下載的模板庫備份（如 OpenClaw、其他課程模板），可用以下方式掃描：

```bash
# 請將此路徑改為你自己的本機備份路徑
LOCAL_TEMPLATE_BASE="~/your-local-template-backup"

# 搜尋資料夾名稱
ls "$LOCAL_TEMPLATE_BASE/skills/" | grep -i "[關鍵字]"

# grep 模板內文
grep -ril "[關鍵字]" "$LOCAL_TEMPLATE_BASE/skills/" 2>/dev/null | head -10
```

**沒有本機模板庫？** 直接跑前三源即可，效果已很完整。

### Step 2：整合分析，給出建議

根據四源結果，輸出「建構策略建議」：

| 狀況 | 建議 |
|------|------|
| 四源都有現成 | 直接用，優先順序：本機模板（中文場景對位）> n8n（自動化）> Skill（Claude）> 開源 GitHub |
| 只有部分相符 | 組合現成 + 少量自製 |
| 四源都沒有 | 確認從頭建，並說明預估工時 |

---

## 輸出格式

```markdown
## 🔍 solution-scout 結果：[主題]

### 1️⃣ Claude Skills（SkillsMP）
[找到 / 未找到]
- **[skill-name]** ⭐[stars]：[一句話說明是否符合需求]
- 安裝：`npx skills add owner/repo`

### 2️⃣ GitHub 開源專案（repoinside）
[找到 / 未找到]
- **[專案名]**：[一句話說明架構 + 適用程度]
- Repo：[連結]

### 3️⃣ n8n 模板
[找到 / 未找到]
- **[模板名]**：[一句話說明流程]
- 模板連結：[連結]

### 4️⃣ 本機模板庫
[找到 / 未找到 / 未設定（跳過）]
- **[模板編號 + 名稱]**：[一句話說明 + 適用程度]

---

### 🎯 建議策略

**[直接用 / 組合 / 從頭建]**

[1-2 句說明理由 + 建議下一步]

優先順序提示：
- 中文 B2C 電商／行銷／SEO → 本機模板庫優先參考
- 自動化串接（多 SaaS）→ n8n 模板優先
- Claude Code 工作流 → SkillsMP 優先
- 全新架構需求 → repoinside / GitHub 找參考實作

預估節省：[X 小時，如果有現成方案]
```

---

## 使用範例

### 範例 1：多平台發布

```
用戶：「多平台社群發布 LinkedIn FB IG Threads 電子報」

Claude 執行：
- SkillsMP：搜尋 "multi-platform social media publisher"
- repoinside：搜尋 social media automation dashboard
- n8n：搜尋 "social media post schedule"

輸出：找到 n8n 3 個模板（FB+IG+Threads），建議先用 n8n 接通，
      admin UI 只做 trigger + history 即可，省 8 小時開發時間
```

### 範例 2：自動化通知

```
用戶：「Stripe 付款成功後自動發 Discord 通知」

Claude 執行三源並行 → 找到 n8n Stripe webhook 模板 → 建議直接用 n8n
```

### 範例 3：找不到現成

```
用戶：「遊戲化排行榜 Discord 同步」

Claude 執行三源並行 → 三源都沒有符合 → 確認從頭建，預估 4 小時
```

---

## 依賴工具

- `skill-lookup` skill：搜尋 SkillsMP
- Firecrawl MCP：抓取 n8n 模板頁面
- WebSearch：補充搜尋（Firecrawl 失敗時 fallback）
- 本機模板庫（選配）：自行準備，用 `grep` / `ls` 掃描

---

## 注意事項

1. **四源並行** — 同時搜四個來源，不要依序，節省時間
2. **給結論，不給清單** — 不只是列結果，要說明「要不要用」「為什麼」
3. **n8n 模板優先（自動化串接）** — 如果 n8n 有現成流程，通常比自製省時間
4. **skill 版本確認** — 找到的 skill 要確認最後更新時間，太舊的要備注

---

## Metadata

- **Created**: 2026-04-03
- **Version**: 1.1.0
- **Category**: Research & Discovery
- **Status**: ✅ 可用

## Related Skills

- `skill-lookup`：只搜 SkillsMP
- `n8n-workflow-patterns`：n8n 架構設計
