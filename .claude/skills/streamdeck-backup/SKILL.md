# streamdeck-backup Skill

> 備份 Stream Deck+ 按鍵設定到 iCloud Drive。由清簡負責執行，有調整按鍵配置後執行。

---

## 觸發方式

- 清簡在 JANJAN 調整 StreamDeck 後執行
- JANJAN 說「備份 StreamDeck」

---

## 執行步驟

### Step 1：確認 StreamDeck 是否安裝

```bash
STREAMDECK_PATH=~/Library/Application\ Support/com.elgato.StreamDeck
if [ ! -d "$STREAMDECK_PATH" ]; then
  echo "⚠️ StreamDeck 設定資料夾不存在：$STREAMDECK_PATH"
  echo "可能原因：StreamDeck 尚未安裝，或路徑不同。"
  echo "請確認後再執行。"
  exit 0
fi
du -sh "$STREAMDECK_PATH"
```

### Step 2：確認備份目標路徑

```bash
BACKUP_ROOT=~/Library/Mobile\ Documents/com~apple~CloudDocs/FlowGPS備份/StreamDeck
mkdir -p "$BACKUP_ROOT"
```

### Step 3：執行備份

```bash
TIMESTAMP=$(date "+%Y%m%d_%H%M")
DEST="$BACKUP_ROOT/streamdeck_${TIMESTAMP}"

rsync -a "$STREAMDECK_PATH/" "$DEST/"

echo "備份完成：$DEST"
du -sh "$DEST"
```

### Step 4：清理舊備份（保留最新 5 份）

```bash
ls -dt "$BACKUP_ROOT"/streamdeck_* | tail -n +6 | xargs rm -rf
echo "保留備份數：$(ls "$BACKUP_ROOT" | wc -l | tr -d ' ')"
```

### Step 5：更新清簡 MEMORY.md

在 `L｜資源放大槓桿/AI團隊/admin-assistant/MEMORY.md` 的備份執行記錄表格中，
更新「StreamDeck 備份」的「最後執行」欄位為今日日期，狀態改為「✅ 成功」。

### Step 6：回報

```
✅ StreamDeck 備份 完成
   路徑：~/Library/Mobile Documents/com~apple~CloudDocs/FlowGPS備份/StreamDeck/streamdeck_YYYYMMDD_HHMM
   大小：[du 輸出]
   時間：[date 輸出]
```

---

## 錯誤處理

| 情況 | 處理 |
|------|------|
| StreamDeck 未安裝 | 回報 ⚠️ 提示，不報錯，等安裝後再執行 |
| iCloud 路徑不存在 | `mkdir -p` 建立，繼續執行 |
| rsync 失敗 | 回報 ❌ + 錯誤訊息 |

---

## 備份策略

- **保留最新 5 份**
- **包含**：ProfilesV2（按鍵配置）、plugins（插件設定）
- StreamDeck 設定路徑：`~/Library/Application Support/com.elgato.StreamDeck/`
