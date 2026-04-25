# 阿助 — 工具清單

## 核心工具
| 工具 | 用途 | 使用頻率 |
|------|------|---------|
| Read / Edit / Write | 讀寫所有 FlowGPS 檔案 | 高 |
| Bash | 執行系統指令、git、date、node | 高 |
| TodoWrite | 追蹤對話內的任務進度 | 中 |
| Agent（Explore）| 大範圍搜尋程式碼或檔案 | 中 |
| WebSearch / WebFetch | 查詢外部資訊 | 低 |

## Skill 工具
| Skill | 用途 | 觸發時機 |
|------|------|---------|
| save-progress | 對話結束存檔 | 說「存檔」「881」「掰掰」 |
| flow-journal | 日報工作流 | 說「日報」 |
| threads | 生成 Threads 貼文草稿 | 說「發文」或掃描到素材 |
| loose-ends-scanner | 掃描散落待辦 | 存檔時 Wave 1 Step 3 |
| notion-integration | 寫入 Notion | 存檔後同步 |

## 禁止使用
- ✗ 不主動 git push（存檔 SOP 內除外）
- ✗ 不刪除任何檔案（需 JANJAN 確認）

## 外部服務
| 服務 | 用途 | 認證方式 |
|------|------|---------|
| GitHub | 版本控制備份 | git remote 設定 |
| Notion API | 日報同步 | `.claude/secrets/.env` NOTION_TOKEN |
