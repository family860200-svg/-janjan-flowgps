---
name: skill-lookup
description: Use when user says "找 skill", "推薦 skill", "有沒有 skill", "我需要一個 skill 來...", "skill marketplace", "skillsmp", "skills.sh", "npx skills", or wants to search, install, list, update, or manage agent skills.

triggers:
  - "skill-lookup"
  - "npx skills"
  - "skills.sh CLI"
---

# skill-lookup

**三數據源 Skill 搜尋／安裝／管理系統**

## 📊 三數據源整合

- **`npx skills` CLI**（Skills.sh 官方 CLI）⭐ **主要**：find / add / ls / update / remove（真實 Installs 排行）
- **SkillsMP API**（備用）：91,908 skills，AI 語義搜尋
- **Skills.sh Web**（備用）：Firecrawl 抓取 trending / hot / categories（CLI 未覆蓋時）

## When to Use This Skill

激活條件（任一符合即可）：

- 用戶提到「找 skill」、「推薦 skill」、「有沒有 skill」
- 用戶說「我需要一個 skill 來...」
- 用戶問「有什麼 skill 可以幫我...」
- 用戶說「幫我找可以做 XX 的 skill」
- 用戶說「有沒有 skill 可以...」、「有 skill 能...嗎」
- 用戶提到「skill marketplace」、「skillsmp」、「skills.sh」
- 用戶想要安裝新的 agent skill
- 用戶想知道某個功能是否有現成的 skill
- 用戶問「最熱門的 skills」、「trending skills」、「熱門排行榜」

## What This Skill Does

### SkillsMP 功能（91,908 skills）

1. **✅ 檢查已安裝工具**：搜尋前先掃描你已安裝的 skills，提醒相關的工具
2. **AI 語義搜尋**：使用 SkillsMP 的 AI 搜尋 API 找到最相關的 skills
3. **關鍵字搜尋**：使用傳統關鍵字搜尋
4. **Stars 排行榜**：按 GitHub stars 排序
5. **結果分析**：評估 skills 的品質（stars、更新時間、描述）
6. **安裝指引**：提供清晰的安裝步驟

### Skills.sh 功能（20,598 skills）

1. **真實 Installs 排行榜**：All Time Top（按真實下載量）
2. **24h Trending**：過去 24 小時最熱門的 skills
3. **Hot Skills**：當前熱門 skills
4. **npx 一鍵安裝**：`npx skills add owner/repo`

## 品質篩選標準（每次推薦前必過三關）

找到結果後，**推薦前必須先套品質篩選**，在每個 skill 旁自動標注：

| 標籤 | 條件 | 說明 |
|------|------|------|
| ✅ 官方優質 | 安裝量 ≥ 1K **且** 來源是知名組織 | 直接推薦 |
| ⚠️ 謹慎評估 | 安裝量 < 1K，或來源非知名組織 | 推薦但加警示 |
| ❌ 不推薦 | 安裝量 < 100 **或** GitHub stars < 100 | 列出但說明風險 |

**知名官方來源**（✅ 免審直接信任）：`vercel-labs` / `anthropics` / `microsoft` / `ComposioHQ` / `remotion-dev`

**標注格式**（每條結果後面加一行）：
```
✅ 官方優質（393.5K installs，anthropics 官方）
⚠️ 謹慎評估（520 installs，來源未知）
❌ 不推薦（42 installs，stars < 100）
```

---

## How to Use

### 方法 0：`npx skills` CLI（**首選**）⭐⭐

官方 CLI，無需 API key，直接查 Skills.sh + 一鍵安裝。

```bash
npx skills find <query>              # 搜尋（範例：npx skills find react）
npx skills add <owner/repo>@<skill>  # 安裝
npx skills ls                        # 列出已安裝
npx skills update                    # 升級到最新版
npx skills remove <skill>            # 移除
npx skills init <name>               # 建立新 skill 框架（本地開發）
```

**輸出特徵**：真實 Installs 數據（例如 `341.2K installs`）+ skills.sh URL。

**什麼時候用**：
- ✅ 「找 skill」「有沒有 skill」— `find` 最快
- ✅ 要裝／升級／列 skills — `add` / `update` / `ls` 一行搞定
- ❌ 需要 AI 語義搜尋模糊需求 → 方法 1 SkillsMP
- ❌ 需要 trending/hot/分類排行 → 方法 4 Firecrawl（CLI 未覆蓋）

### 方法 1：AI 語義搜尋（SkillsMP 備用）

```bash
python .claude/skills/skill-lookup/skill-lookup.py ai "你的需求描述"
```

**範例**：
```bash
python .claude/skills/skill-lookup/skill-lookup.py ai "幫我分析 GitHub commits 和貢獻者"
```

### 方法 2：關鍵字搜尋

```bash
python .claude/skills/skill-lookup/skill-lookup.py search "關鍵字" --limit 10
```

**範例**：
```bash
python .claude/skills/skill-lookup/skill-lookup.py search "productivity" --limit 5
```

### 方法 3：熱門排行榜

```bash
python .claude/skills/skill-lookup/skill-lookup.py top --limit 20 --sort stars
```

**範例**：
```bash
# 全站 Top 10（按 stars）
python .claude/skills/skill-lookup/skill-lookup.py top --limit 10 --sort stars

# 特定分類 Top 20
python .claude/skills/skill-lookup/skill-lookup.py top --category development --sort stars
```

### 方法 4：Skills.sh 排行榜（真實 Installs）

**在 Claude 對話中使用**（推薦）：

```
你：「給我看 Skills.sh 最熱門的 skills」
或：「Skills.sh trending 排行榜」
或：「哪些 skills 最多人下載？」

Claude 會自動：
1. 使用 Firecrawl 抓取 Skills.sh
2. 解析並顯示 Top skills（按真實 Installs）
```

**直接命令列**（需手動提供 Markdown 檔案）：

```bash
python .claude/skills/skill-lookup/skill-lookup.py top-installs --markdown-file /tmp/skills.md --limit 20
```

### 方法 5：瀏覽分類

```bash
python .claude/skills/skill-lookup/skill-lookup.py categories
```

## API 配置

API Key 儲存在：`.claude/secrets/.env`

```env
SKILLSMP_API_KEY=sk_live_skillsmp_...
```

去 https://skillsmp.com 免費申請。

## Installation

安裝到專案層級：
```bash
git clone https://github.com/your-repo/skill-lookup
cp -r skill-lookup/.claude/skills/skill-lookup .claude/skills/
```

## Output Format

搜尋結果格式（含品質標注）：

```markdown
## 🔍 找到 5 個相關 Skills

### 1. [skill-name] ⭐ 1234
**來源**：owner/repo
**描述**：簡短描述...
**更新**：2026-01-23
**品質**：✅ 官方優質（1.2K installs，vercel-labs 官方）
**安裝**：npx skills add owner/repo@skill-name

---

### 2. [another-skill] ⭐ 567
...
**品質**：⚠️ 謹慎評估（520 installs，來源非主流組織）
```

## 搜尋無結果時的引導（找不到不代表沒辦法做）

當搜尋結果為零時，**必須**按以下順序引導：

**步驟 1 — 告知沒找到**
> 我在 SkillsMP / Skills.sh 搜尋了「[關鍵字]」，目前沒有符合需求的現成 skill。

**步驟 2 — 主動提供直接協助**
> 不過我還是可以直接幫你做這件事！要繼續嗎？

**步驟 3 — 建議自建 skill（如果是高頻需求）**
> 如果這是你常常要做的事，可以把它包成自己的 skill：
> ```bash
> npx skills init [skill-name]
> ```
> 之後就能一句話觸發，也可以發布到 skills.sh 讓其他人用。

## Examples

### 範例 1：找 productivity skills
```
用戶：「有沒有 skill 可以幫我管理待辦事項？」

AI 執行：
python .claude/skills/skill-lookup/skill-lookup.py ai "task management todo list productivity"

結果：返回前 5 個最相關的 task management skills（含品質標注）
```

### 範例 2：找 GitHub 相關 skills
```
用戶：「我想要自動化 GitHub PR 流程」

AI 執行：
python .claude/skills/skill-lookup/skill-lookup.py ai "automate GitHub pull request workflow"

結果：返回 GitHub automation、PR review、git workflow 等相關 skills
```

### 範例 3：查看 Skills.sh 真實 Installs 排行榜
```
用戶：「給我看 Skills.sh 最熱門的 skills（按下載量）」

AI 執行：
1. 使用 Firecrawl 抓取 https://skills.sh/
2. 解析 Markdown 提取 Top skills
3. 顯示結果（包含真實 Installs 數據）
```

## Important Notes

1. **API Rate Limit**：SkillsMP API 可能有 rate limit，避免短時間內大量請求
2. **安全性**：所有安裝的 skills 都應該先 review 代碼再使用
3. **自動激活**：當用戶提到 skill 相關需求時，Claude 會自動使用此 skill

## Metadata

- **Created**: 2026-01-24
- **Version**: 1.1.0（加品質篩選標準 + 無結果引導）
- **Category**: Tools
- **Status**: ✅ 可用

## Related Skills

- `solution-scout`：動工前四源齊查（含本 skill 作為子工具）
- `find-skills`：vercel-labs 官方版（skills.sh 單源）
