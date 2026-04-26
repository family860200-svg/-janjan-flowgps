# claude-config-backup Skill

> 備份 `~/.claude/` 到 iCloud Drive。由清簡負責執行，每週一次或有新 Skill/設定更動時。

---

## 觸發方式

- 清簡定期執行（每週）
- JANJAN 說「備份 Claude 設定」

---

## 執行步驟

### Step 1：確認時間與來源

```bash
date "+%Y-%m-%d %H:%M"
du -sh ~/.claude/
```

### Step 2：確認備份目標路徑

```bash
BACKUP_ROOT=~/Library/Mobile\ Documents/com~apple~CloudDocs/FlowGPS備份/Claude設定
mkdir -p "$BACKUP_ROOT"
```

### Step 3：執行備份（rsync，保留時間戳，排除快取）

```bash
TIMESTAMP=$(date "+%Y%m%d_%H%M")
DEST="$BACKUP_ROOT/claude_${TIMESTAMP}"

rsync -a --exclude='*.log' --exclude='__pycache__' \
  ~/.claude/ "$DEST/"

echo "備份完成：$DEST"
du -sh "$DEST"
```

### Step 4：清理舊備份（保留最新 4 份）

```bash
ls -dt "$BACKUP_ROOT"/claude_* | tail -n +5 | xargs rm -rf
echo "保留備份數：$(ls "$BACKUP_ROOT" | wc -l | tr -d ' ')"
```

### Step 5：更新清簡 MEMORY.md

在 `L｜資源放大槓桿/AI團隊/admin-assistant/MEMORY.md` 的備份執行記錄表格中，
更新「Claude 設定備份」的「最後執行」欄位為今日日期，狀態改為「✅ 成功」。

### Step 6：回報

```
✅ Claude 設定備份 完成
   路徑：~/Library/Mobile Documents/com~apple~CloudDocs/FlowGPS備份/Claude設定/claude_YYYYMMDD_HHMM
   大小：[du 輸出]
   時間：[date 輸出]
```

---

## 錯誤處理

| 情況 | 處理 |
|------|------|
| iCloud 路徑不存在 | `mkdir -p` 建立，繼續執行 |
| rsync 失敗 | 回報 ❌ + 錯誤訊息，建議手動確認 iCloud 同步狀態 |
| 空間不足 | 回報 ❌ + 目前磁碟空間，建議清舊備份 |

---

## 備份策略

- **保留最新 4 份**（約一個月，每週一份）
- **排除**：`*.log`、`__pycache__`
- **包含**：所有 Skills、Hooks、settings.json、memory/
