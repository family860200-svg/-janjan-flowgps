#!/bin/zsh
# 讀取祕鑰並啟動 Claude Code
export ANTHROPIC_AUTH_TOKEN="sk-IiUx3FTmdzc2zgHufl6KfVCQnEzSdKfM33hWdafw8PcZ8lb5"
export ANTHROPIC_BASE_URL="https://cc.580ai.net"

echo "⚡ 正在喚醒 Claude..."
# 嘗試啟動 claude，如果失敗則提示
if command -v claude >/dev/null 2>&1; then
    claude
else
    echo "❌ 找不到 'claude' 指令，請確認是否已安裝 Claude Code。"
fi
