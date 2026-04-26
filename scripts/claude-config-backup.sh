#!/bin/bash
# 清簡｜每日備份 ~/.claude/ 到 iCloud Drive
# 由 launchd 每天 05:00 觸發

set -euo pipefail

PROJECT_DIR="/Users/user/-janjan-flowgps"
BACKUP_ROOT="$HOME/Library/Mobile Documents/com~apple~CloudDocs/FlowGPS備份/Claude設定"
MEMORY_FILE="$PROJECT_DIR/L｜資源放大槓桿/AI團隊/admin-assistant/MEMORY.md"
LOG_FILE="$HOME/Library/Logs/janjan-claude-config-backup.log"

TIMESTAMP=$(date "+%Y%m%d_%H%M")
DATE_DISPLAY=$(date "+%Y-%m-%d %H:%M")

log() {
  echo "[$DATE_DISPLAY] $1" | tee -a "$LOG_FILE"
}

log "=== claude-config-backup 開始 ==="

# 確認備份目標路徑
mkdir -p "$BACKUP_ROOT"

# 執行備份
DEST="$BACKUP_ROOT/claude_${TIMESTAMP}"
log "來源：$HOME/.claude/"
log "目標：$DEST"

rsync -a --exclude='*.log' --exclude='__pycache__' --exclude='*.pyc' \
  "$HOME/.claude/" "$DEST/"

SIZE=$(du -sh "$DEST" | cut -f1)
log "✅ 備份完成，大小：$SIZE"

# 保留最新 4 份，清理舊的
ls -dt "$BACKUP_ROOT"/claude_* 2>/dev/null | tail -n +5 | while read -r old; do
  rm -rf "$old"
  log "🗑 清除舊備份：$(basename "$old")"
done

KEPT=$(ls "$BACKUP_ROOT" | wc -l | tr -d ' ')
log "保留備份數：$KEPT"

# 更新清簡 MEMORY.md
if [ -f "$MEMORY_FILE" ]; then
  # 用 sed 更新 StreamDeck 備份那行下面的 Claude 設定備份記錄
  TODAY=$(date "+260%m%d")
  sed -i '' "s/| Claude 設定備份 | .* | .* | .*/| Claude 設定備份 | $TODAY | ✅ 成功 | 大小 $SIZE |/" "$MEMORY_FILE" 2>/dev/null || true

  # git commit
  cd "$PROJECT_DIR"
  git add "$MEMORY_FILE" 2>/dev/null || true
  git diff --cached --quiet || git commit -m "${TODAY} 清簡自動備份：Claude 設定 ${SIZE}" 2>/dev/null || true
  git push 2>/dev/null || true
  log "📝 MEMORY.md 已更新並 push"
fi

log "=== claude-config-backup 結束 ==="
