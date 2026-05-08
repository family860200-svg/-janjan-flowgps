# skill-lookup — AI Skill 搜尋工具

整合 SkillsMP（91,908 個 Skills）+ Skills.sh（真實安裝排行榜），用 AI 語意搜尋找到最適合的工具。

---

## 安裝方式

把以下指令複製貼給你的 Claude Code：

```
我剛下載了 skill-lookup.md 到 Downloads 資料夾，
幫我安裝這個 Skill：
把 ~/Downloads/skill-lookup.md 複製到 .claude/skills/skill-lookup/SKILL.md，
裝完之後確認 SKILL.md 檔案有在 .claude/skills/skill-lookup/ 裡面，跟我說裝好了沒有。
```

裝好後，還需要設定 SkillsMP API Key（免費）：

```
幫我把 SKILLSMP_API_KEY=你的key 加到 ~/.claude/secrets/.env
```

前往 [skillsmp.com](https://skillsmp.com) 免費註冊取得 API Key。

---

## 使用方式

```
有沒有 skill 可以幫我做 [任務描述]？
```

Claude 會自動搜尋 SkillsMP + Skills.sh，回傳最相關的 Skills 和安裝指令。